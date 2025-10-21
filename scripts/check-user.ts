import { drizzle } from "drizzle-orm/mysql2";
import { users, articleHistory, weeklyOrderSuggestions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  console.log("Checking users...\n");
  
  const allUsers = await db.select().from(users);
  console.log(`Total users: ${allUsers.length}`);
  allUsers.forEach(u => console.log(`- ${u.id} (${u.name})`));
  
  console.log("\nChecking articles for joachim.braun...");
  const articles = await db.select().from(articleHistory).where(eq(articleHistory.userId, "joachim.braun"));
  console.log(`Articles: ${articles.length}`);
  
  console.log("\nChecking suggestions for joachim.braun...");
  const suggestions = await db.select().from(weeklyOrderSuggestions).where(eq(weeklyOrderSuggestions.userId, "joachim.braun"));
  console.log(`Suggestions: ${suggestions.length}`);
  
  process.exit(0);
}

main().catch(console.error);
