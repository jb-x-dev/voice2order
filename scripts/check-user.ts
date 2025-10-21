import { getDb } from "../server/db";
import { users } from "../drizzle/schema";

const db = await getDb();
if (!db) {
  console.log("❌ Database not available");
  process.exit(1);
}

const allUsers = await db.select().from(users);
console.log(`Found ${allUsers.length} users:`);
allUsers.forEach(u => {
  console.log(`  - ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
});

process.exit(0);
