import { drizzle } from "drizzle-orm/mysql2";
import { articleHistory } from "../drizzle/schema";
import * as fs from "fs";
import { nanoid } from "nanoid";

const USER_ID = "joachim.braun"; // Owner ID from env

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Read processed JSON
  const data = JSON.parse(
    fs.readFileSync("/home/ubuntu/voice2order/scripts/platzl_orders_processed.json", "utf-8")
  );
  
  console.log(`Importing ${data.length} articles...`);
  
  // Clear existing data for this user
  console.log("Clearing existing article history...");
  await db.delete(articleHistory);
  
  // Import articles
  let imported = 0;
  for (const article of data) {
    try {
      await db.insert(articleHistory).values({
        id: nanoid(),
        userId: USER_ID,
        articleId: article.articleId,
        articleName: article.articleName,
        supplier: article.supplier,
        ean: null, // Not available in jb-x export
        unit: article.unit,
        lastPrice: article.lastPrice,
        orderCount: article.orderCount,
        lastOrderedAt: new Date(article.lastOrderDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`Imported ${imported}/${data.length} articles...`);
      }
    } catch (error) {
      console.error(`Error importing article ${article.articleId}:`, error);
    }
  }
  
  console.log(`\nSuccessfully imported ${imported} articles!`);
  
  // Print statistics
  const totalOrders = data.reduce((sum: number, a: any) => sum + a.orderCount, 0);
  const avgOrdersPerArticle = (totalOrders / data.length).toFixed(1);
  
  console.log(`\nStatistics:`);
  console.log(`- Total articles: ${data.length}`);
  console.log(`- Total orders: ${totalOrders}`);
  console.log(`- Avg orders per article: ${avgOrdersPerArticle}`);
  console.log(`- Date range: ${data[0]?.firstOrderDate} to ${data[0]?.lastOrderDate}`);
  
  process.exit(0);
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});

