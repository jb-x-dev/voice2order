import { drizzle } from "drizzle-orm/mysql2";
import { articleHistory, users } from "../drizzle/schema";
import { sql } from "drizzle-orm";

async function fixUserId() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("🔍 Finding real user...\n");

  // Get all users
  const allUsers = await db.select().from(users);
  console.log(`Found ${allUsers.length} users:`);
  allUsers.forEach(u => console.log(`  - ${u.id} (${u.name || 'no name'})`));

  if (allUsers.length === 0) {
    console.log("\n⚠️ No users found!");
    process.exit(1);
  }

  // Use the first user (should be the logged in user)
  const realUserId = allUsers[0].id;
  console.log(`\n✅ Using user: ${realUserId} (${allUsers[0].name})`);

  // Update all articles to use the real user ID
  console.log("\n📝 Updating articles...");
  await db.execute(
    sql`UPDATE ${articleHistory} SET userId = ${realUserId} WHERE userId = 'sample-user-001'`
  );

  // Check result
  const updatedArticles = await db.select().from(articleHistory);
  console.log(`\n✅ Updated ${updatedArticles.length} articles to userId: ${realUserId}`);

  process.exit(0);
}

fixUserId();
