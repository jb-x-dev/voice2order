import { getDb } from "../server/db";
import { articleHistory, weeklyOrderSuggestions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const db = await getDb();
if (!db) {
  console.log("❌ Database not available");
  process.exit(1);
}

const userId = "aTv8Rr9RUBidduJWt9BXdV";

const articles = await db.select().from(articleHistory).where(eq(articleHistory.userId, userId));
const suggestions = await db.select().from(weeklyOrderSuggestions).where(eq(weeklyOrderSuggestions.userId, userId));

console.log(`✅ Articles: ${articles.length}`);
console.log(`✅ Weekly suggestions: ${suggestions.length}`);

if (articles.length > 0) {
  console.log(`\nSample articles:`);
  articles.slice(0, 3).forEach(a => {
    console.log(`  - ${a.articleName} (${a.supplier})`);
  });
}

process.exit(0);
