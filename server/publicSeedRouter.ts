import { router, publicProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { articleHistory, weeklyOrderSuggestions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

// Import Platzl order data from JSON file
async function importPlatzlData(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if data already exists
  const existing = await db.select().from(articleHistory).where(eq(articleHistory.userId, userId)).limit(1);
  if (existing.length > 0) {
    return { message: "Data already imported", skipped: true, articles: 0, suggestions: 0 };
  }

  // Read the pre-processed data
  const dataPath = join(process.cwd(), "server", "platzl-data.json");
  let data: any;
  
  try {
    const fileContent = readFileSync(dataPath, "utf-8");
    data = JSON.parse(fileContent);
  } catch (error) {
    throw new Error("Platzl data file not found. Please ensure the data file exists.");
  }

  // Import articles
  const articlesToInsert = data.articles.map((a: any) => ({
    ...a,
    userId,
    id: nanoid(),
    createdAt: new Date(a.createdAt || Date.now()),
    updatedAt: new Date(a.updatedAt || Date.now()),
    lastOrderedAt: a.lastOrderedAt ? new Date(a.lastOrderedAt) : null
  }));

  if (articlesToInsert.length > 0) {
    // Insert in batches of 100
    for (let i = 0; i < articlesToInsert.length; i += 100) {
      const batch = articlesToInsert.slice(i, i + 100);
      await db.insert(articleHistory).values(batch);
    }
  }

  // Import weekly suggestions
  const suggestionsToInsert = data.suggestions.map((s: any) => ({
    ...s,
    userId,
    id: nanoid(),
    createdAt: new Date(s.createdAt || Date.now()),
    updatedAt: new Date(s.updatedAt || Date.now()),
    weekStartDate: new Date(s.weekStartDate),
    weekEndDate: new Date(s.weekEndDate),
    approvedAt: s.approvedAt ? new Date(s.approvedAt) : null
  }));

  if (suggestionsToInsert.length > 0) {
    await db.insert(weeklyOrderSuggestions).values(suggestionsToInsert);
  }

  return {
    message: "Data imported successfully",
    articles: articlesToInsert.length,
    suggestions: suggestionsToInsert.length,
    skipped: false
  };
}

export const publicSeedRouter = router({
  // Public endpoint for initial data seeding
  // This is a one-time operation that imports the Platzl order data
  seedPlatzlData: publicProcedure
    .input(z.object({
      userId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Use provided userId, authenticated user, or default to joachim.braun@jb-x.com
      const targetUserId = input.userId || ctx.user?.id || "joachim.braun@jb-x.com";
      
      if (!targetUserId) {
        throw new Error("User ID required. Please log in first.");
      }

      try {
        const result = await importPlatzlData(targetUserId);
        return result;
      } catch (error: any) {
        throw new Error(`Failed to import data: ${error.message}`);
      }
    }),
});

