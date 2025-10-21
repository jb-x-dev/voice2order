import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  articleHistory,
  InsertArticleHistory,
  ArticleHistory,
  orders,
  InsertOrder,
  Order,
  weeklyOrderSuggestions,
  InsertWeeklyOrderSuggestion,
  WeeklyOrderSuggestion
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Orders
export async function createOrder(order: InsertOrder): Promise<Order> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(orders).values(order);
  const result = await db.select().from(orders).where(eq(orders.id, order.id!)).limit(1);
  return result[0];
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(50);
}

export async function updateOrderStatus(id: string, status: Order['status'], transcription?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status, updatedAt: new Date() };
  if (transcription !== undefined) {
    updateData.transcription = transcription;
  }
  
  await db.update(orders)
    .set(updateData)
    .where(eq(orders.id, id));
}

// Article History
export async function upsertArticleHistory(article: InsertArticleHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(articleHistory).values(article).onDuplicateKeyUpdate({
    set: {
      orderCount: article.orderCount,
      lastPrice: article.lastPrice,
      lastOrderedAt: article.lastOrderedAt,
    }
  });
}

export async function getUserArticleHistory(userId: string): Promise<ArticleHistory[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(articleHistory)
    .where(eq(articleHistory.userId, userId))
    .orderBy(desc(articleHistory.lastOrderedAt))
    .limit(100);
}

export async function searchArticleHistory(userId: string, query: string): Promise<ArticleHistory[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Simple search - in production would use full-text search
  const allArticles = await getUserArticleHistory(userId);
  return allArticles.filter(a => 
    a.articleName.toLowerCase().includes(query.toLowerCase())
  );
}

// Weekly Order Suggestions
export async function getWeeklyOrderSuggestions(userId: string): Promise<WeeklyOrderSuggestion[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(weeklyOrderSuggestions)
    .where(eq(weeklyOrderSuggestions.userId, userId))
    .orderBy(desc(weeklyOrderSuggestions.weekStartDate))
    .limit(20);
}

export async function createWeeklyOrderSuggestion(suggestion: InsertWeeklyOrderSuggestion): Promise<WeeklyOrderSuggestion> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(weeklyOrderSuggestions).values(suggestion);
  const result = await db.select().from(weeklyOrderSuggestions).where(eq(weeklyOrderSuggestions.id, suggestion.id!)).limit(1);
  return result[0];
}

