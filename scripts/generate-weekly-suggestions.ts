import { drizzle } from "drizzle-orm/mysql2";
import { weeklyOrderSuggestions, articleHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import { nanoid } from "nanoid";

const USER_ID = "joachim.braun";

interface WeeklySuggestion {
  weekNumber: number;
  year: number;
  weekStartDate: Date;
  weekEndDate: Date;
  items: Array<{
    articleId: string;
    articleName: string;
    supplier: string;
    unit: string;
    quantity: number;
    price: number;
    confidence: number;
  }>;
  totalAmount: number;
  confidence: number;
}

function getWeekNumber(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
}

function getWeekDates(year: number, week: number): { start: Date; end: Date } {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  const ISOweekEnd = new Date(ISOweekStart);
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
  return { start: ISOweekStart, end: ISOweekEnd };
}

async function generateWeeklySuggestions(): Promise<WeeklySuggestion[]> {
  // Read processed order data
  const orderData = JSON.parse(
    fs.readFileSync("/home/ubuntu/voice2order/scripts/platzl_orders_processed.json", "utf-8")
  );
  
  // Group orders by week
  const weeklyOrders: Record<string, any[]> = {};
  
  for (const article of orderData) {
    for (const order of article.orders) {
      const orderDate = new Date(order.date);
      const { week, year } = getWeekNumber(orderDate);
      const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
      
      if (!weeklyOrders[weekKey]) {
        weeklyOrders[weekKey] = [];
      }
      
      weeklyOrders[weekKey].push({
        articleId: article.articleId,
        articleName: article.articleName,
        supplier: article.supplier,
        unit: article.unit,
        quantity: order.quantity,
        price: order.price,
      });
    }
  }
  
  // Generate suggestions for next 4 weeks
  const suggestions: WeeklySuggestion[] = [];
  const today = new Date();
  
  for (let i = 0; i < 4; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (i * 7));
    const { week, year } = getWeekNumber(targetDate);
    const { start, end } = getWeekDates(year, week);
    
    // Find similar weeks from history (same week number)
    const historicalWeeks = Object.entries(weeklyOrders)
      .filter(([key]) => key.endsWith(`-W${week.toString().padStart(2, '0')}`))
      .map(([_, orders]) => orders);
    
    if (historicalWeeks.length === 0) {
      // Use average of all weeks if no matching week found
      const allOrders = Object.values(weeklyOrders).flat();
      const articleQuantities: Record<string, { total: number; count: number; article: any }> = {};
      
      for (const order of allOrders) {
        const key = order.articleId;
        if (!articleQuantities[key]) {
          articleQuantities[key] = { total: 0, count: 0, article: order };
        }
        articleQuantities[key].total += order.quantity;
        articleQuantities[key].count += 1;
      }
      
      // Take top 20 most frequently ordered items
      const items = Object.values(articleQuantities)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map(({ total, count, article }) => ({
          articleId: article.articleId,
          articleName: article.articleName,
          supplier: article.supplier,
          unit: article.unit,
          quantity: Math.round(total / count),
          price: article.price,
          confidence: Math.min(95, 50 + count * 5),
        }));
      
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      suggestions.push({
        weekNumber: week,
        year,
        weekStartDate: start,
        weekEndDate: end,
        items,
        totalAmount,
        confidence: 60,
      });
    } else {
      // Calculate average quantities from historical weeks
      const articleQuantities: Record<string, { total: number; count: number; article: any }> = {};
      
      for (const weekOrders of historicalWeeks) {
        for (const order of weekOrders) {
          const key = order.articleId;
          if (!articleQuantities[key]) {
            articleQuantities[key] = { total: 0, count: 0, article: order };
          }
          articleQuantities[key].total += order.quantity;
          articleQuantities[key].count += 1;
        }
      }
      
      // Create suggestion items
      const items = Object.values(articleQuantities)
        .sort((a, b) => b.count - a.count)
        .slice(0, 30)
        .map(({ total, count, article }) => ({
          articleId: article.articleId,
          articleName: article.articleName,
          supplier: article.supplier,
          unit: article.unit,
          quantity: Math.round(total / historicalWeeks.length),
          price: article.price,
          confidence: Math.min(95, 60 + count * 5),
        }));
      
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      suggestions.push({
        weekNumber: week,
        year,
        weekStartDate: start,
        weekEndDate: end,
        items,
        totalAmount,
        confidence: Math.min(90, 70 + historicalWeeks.length * 5),
      });
    }
  }
  
  return suggestions;
}

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  console.log("Generating weekly order suggestions...");
  const suggestions = await generateWeeklySuggestions();
  
  console.log(`Generated ${suggestions.length} weekly suggestions`);
  
  // Clear existing suggestions
  await db.delete(weeklyOrderSuggestions).where(eq(weeklyOrderSuggestions.userId, USER_ID));
  
  // Insert new suggestions
  for (const suggestion of suggestions) {
    await db.insert(weeklyOrderSuggestions).values({
      id: nanoid(),
      userId: USER_ID,
      weekNumber: suggestion.weekNumber,
      year: suggestion.year,
      weekStartDate: suggestion.weekStartDate,
      weekEndDate: suggestion.weekEndDate,
      items: JSON.stringify(suggestion.items),
      totalAmount: suggestion.totalAmount,
      confidence: suggestion.confidence,
      isApproved: false,
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`Week ${suggestion.weekNumber}/${suggestion.year}: ${suggestion.items.length} items, ${(suggestion.totalAmount / 100).toFixed(2)} EUR (${suggestion.confidence}% confidence)`);
  }
  
  console.log("\nWeekly suggestions created successfully!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to generate suggestions:", error);
  process.exit(1);
});

