import { drizzle } from "drizzle-orm/mysql2";
import { articleHistory, weeklyOrderSuggestions } from "../drizzle/schema";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  console.log("Checking database...\n");
  
  // Check articles
  const articles = await db.select().from(articleHistory);
  console.log(`Articles in DB: ${articles.length}`);
  if (articles.length > 0) {
    console.log("Sample article:", articles[0]);
  }
  
  // Check suggestions
  const suggestions = await db.select().from(weeklyOrderSuggestions);
  console.log(`\nWeekly suggestions in DB: ${suggestions.length}`);
  if (suggestions.length > 0) {
    console.log("Sample suggestion:", suggestions[0]);
  }
  
  process.exit(0);
}

main().catch(console.error);
