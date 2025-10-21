import { drizzle } from "drizzle-orm/mysql2";
import { articleHistory, weeklyOrderSuggestions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  const correctUserId = "aTv8Rr9RUBidduJWt9BXdV";
  
  console.log("Updating articleHistory...");
  const articlesResult = await db.update(articleHistory)
    .set({ userId: correctUserId })
    .where(eq(articleHistory.userId, "joachim.braun"));
  console.log("Articles updated");
  
  console.log("\nUpdating weeklyOrderSuggestions...");
  const suggestionsResult = await db.update(weeklyOrderSuggestions)
    .set({ userId: correctUserId })
    .where(eq(weeklyOrderSuggestions.userId, "joachim.braun"));
  console.log("Suggestions updated");
  
  console.log("\nVerifying...");
  const articles = await db.select().from(articleHistory).where(eq(articleHistory.userId, correctUserId));
  const suggestions = await db.select().from(weeklyOrderSuggestions).where(eq(weeklyOrderSuggestions.userId, correctUserId));
  
  console.log(`✓ Articles for ${correctUserId}: ${articles.length}`);
  console.log(`✓ Suggestions for ${correctUserId}: ${suggestions.length}`);
  
  process.exit(0);
}

main().catch(console.error);
