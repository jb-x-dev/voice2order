import { getDb } from "./db";
import { articleHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";
import { nanoid } from "nanoid";

// Auto-seed data for joachim.braun@jb-x.com on first access
export async function autoSeedForUser(userId: string) {
  // Only auto-seed for joachim.braun@jb-x.com
  if (userId !== "joachim.braun@jb-x.com") {
    return { autoSeeded: false };
  }

  const db = await getDb();
  if (!db) {
    console.warn("[AutoSeed] Database not available");
    return { autoSeeded: false };
  }

  try {
    // Check if data already exists
    const existing = await db.select().from(articleHistory).where(eq(articleHistory.userId, userId)).limit(1);
    if (existing.length > 0) {
      return { autoSeeded: false, reason: "already_exists" };
    }

    // Read the pre-processed data
    const dataPath = join(process.cwd(), "server", "platzl-data.json");
    const fileContent = readFileSync(dataPath, "utf-8");
    const data = JSON.parse(fileContent);

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
      for (let i = 0; i < articlesToInsert.length; i += 100) {
        const batch = articlesToInsert.slice(i, i + 100);
        await db.insert(articleHistory).values(batch);
      }
    }

    // Import weekly suggestions
    const { weeklyOrderSuggestions } = await import("../drizzle/schema");
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

    console.log(`[AutoSeed] Successfully seeded ${articlesToInsert.length} articles and ${suggestionsToInsert.length} suggestions for ${userId}`);
    
    return {
      autoSeeded: true,
      articles: articlesToInsert.length,
      suggestions: suggestionsToInsert.length
    };
  } catch (error) {
    console.error("[AutoSeed] Failed to auto-seed data:", error);
    return { autoSeeded: false, error: String(error) };
  }
}

