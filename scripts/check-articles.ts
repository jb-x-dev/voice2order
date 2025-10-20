import { drizzle } from "drizzle-orm/mysql2";
import { articleHistory } from "../drizzle/schema";

async function checkArticles() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("🔍 Checking articles in database...\n");

  const articles = await db.select().from(articleHistory);

  console.log(`Found ${articles.length} articles\n`);

  if (articles.length > 0) {
    console.log("First 5 articles:");
    articles.slice(0, 5).forEach((article, i) => {
      console.log(`${i + 1}. ${article.articleName} - ${article.supplier} - ${(article.lastPrice / 100).toFixed(2)} EUR`);
    });
  } else {
    console.log("⚠️ No articles found in database!");
  }

  process.exit(0);
}

checkArticles();
