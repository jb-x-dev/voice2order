import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { articleHistory, weeklyOrderSuggestions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// Excel import logic (expects parsed data)
async function importExcelData(userId: string, data: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const articlesMap = new Map<string, any>();
  
  // Process each row
  for (const row of data) {
    const articleId = String(row["Artikelnr"] || row["artikelnr"] || "");
    if (!articleId) continue;

    const supplier = String(row["Lieferant"] || row["lieferant"] || "");
    const articleName = String(row["Artikelbezeichnung"] || row["artikelbezeichnung"] || "");
    const price = parseFloat(String(row["Ø Einzelpreis"] || row["preis"] || "0"));
    const unit = String(row["Einheit"] || row["einheit"] || "ST");
    const orderDate = row["Bestelldatum"] || row["bestelldatum"];

    if (!articlesMap.has(articleId)) {
      articlesMap.set(articleId, {
        articleId,
        articleName,
        supplier,
        unit,
        orderCount: 0,
        prices: [],
        lastOrderedAt: null
      });
    }

    const article = articlesMap.get(articleId)!;
    article.orderCount++;
    article.prices.push(price);
    
    if (orderDate) {
      const date = new Date(orderDate);
      if (!article.lastOrderedAt || date > article.lastOrderedAt) {
        article.lastOrderedAt = date;
      }
    }
  }

  // Convert to insert format
  const articlesToInsert = Array.from(articlesMap.values()).map(a => ({
    id: nanoid(),
    userId,
    articleId: a.articleId,
    articleName: a.articleName,
    supplier: a.supplier,
    ean: null,
    unit: a.unit,
    lastPrice: Math.round((a.prices.reduce((sum: number, p: number) => sum + p, 0) / a.prices.length) * 100),
    orderCount: a.orderCount,
    lastOrderedAt: a.lastOrderedAt,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  // Delete existing articles for this user
  try {
    await db.delete(articleHistory).where(eq(articleHistory.userId, userId)).execute();
  } catch (e) {
    // Ignore if no records to delete
  }

  // Insert new articles in batches
  if (articlesToInsert.length > 0) {
    for (let i = 0; i < articlesToInsert.length; i += 100) {
      const batch = articlesToInsert.slice(i, i + 100);
      await db.insert(articleHistory).values(batch);
    }
  }

  // Generate new weekly suggestions based on top articles
  const topArticles = articlesToInsert
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 25);

  try {
    await db.delete(weeklyOrderSuggestions).where(eq(weeklyOrderSuggestions.userId, userId)).execute();
  } catch (e) {
    // Ignore if no records to delete
  }

  const suggestions = [];
  for (let week = 43; week <= 46; week++) {
    suggestions.push({
      id: nanoid(),
      userId,
      weekNumber: week,
      year: 2025,
      items: JSON.stringify(topArticles.map(a => ({
        articleId: a.articleId,
        articleName: a.articleName,
        supplier: a.supplier,
        quantity: 1,
        price: a.lastPrice,
        unit: a.unit
      }))),
      totalAmount: topArticles.reduce((sum, a) => sum + a.lastPrice, 0),
      confidence: 80.0,
      weekStartDate: new Date(`2025-10-${20 + (week - 43) * 7}`),
      weekEndDate: new Date(`2025-10-${26 + (week - 43) * 7}`),
      isApproved: false,
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  if (suggestions.length > 0) {
    await db.insert(weeklyOrderSuggestions).values(suggestions);
  }

  return {
    articles: articlesToInsert.length,
    suggestions: suggestions.length,
    orders: data.length
  };
}

export const importRouter = router({
  // Import from parsed Excel data
  importExcel: protectedProcedure
    .input(z.object({
      data: z.array(z.record(z.any()))
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await importExcelData(ctx.user.id, input.data);
        return result;
      } catch (error: any) {
        throw new Error(`Import failed: ${error.message}`);
      }
    }),
});

