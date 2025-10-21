import { getDb } from "../server/db";
import { articleHistory, weeklyOrderSuggestions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { writeFileSync } from "fs";

const db = await getDb();
if (!db) {
  console.log("❌ Database not available");
  process.exit(1);
}

const userId = "aTv8Rr9RUBidduJWt9BXdV";

const articles = await db.select().from(articleHistory).where(eq(articleHistory.userId, userId));
const suggestions = await db.select().from(weeklyOrderSuggestions).where(eq(weeklyOrderSuggestions.userId, userId));

const seedData = {
  articles: articles.map(a => ({
    ...a,
    lastOrderedAt: a.lastOrderedAt?.toISOString(),
    createdAt: a.createdAt?.toISOString(),
    updatedAt: a.updatedAt?.toISOString()
  })),
  suggestions: suggestions.map(s => ({
    ...s,
    weekStartDate: s.weekStartDate?.toISOString(),
    weekEndDate: s.weekEndDate?.toISOString(),
    createdAt: s.createdAt?.toISOString(),
    updatedAt: s.updatedAt?.toISOString(),
    approvedAt: s.approvedAt?.toISOString()
  }))
};

writeFileSync("server/seed-data.json", JSON.stringify(seedData, null, 2));
console.log(`✅ Exported ${articles.length} articles and ${suggestions.length} suggestions`);
process.exit(0);
