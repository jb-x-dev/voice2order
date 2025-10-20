import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  voiceOrders,
  InsertVoiceOrder,
  VoiceOrder,
  orderItems,
  InsertOrderItem,
  OrderItem,
  articleHistory,
  InsertArticleHistory,
  ArticleHistory,
  jbxSettings,
  InsertJbxSettings,
  JbxSettings
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

// Voice Orders
export async function createVoiceOrder(order: InsertVoiceOrder): Promise<VoiceOrder> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(voiceOrders).values(order);
  const result = await db.select().from(voiceOrders).where(eq(voiceOrders.id, order.id!)).limit(1);
  return result[0];
}

export async function getVoiceOrder(id: string): Promise<VoiceOrder | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(voiceOrders).where(eq(voiceOrders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserVoiceOrders(userId: string): Promise<VoiceOrder[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(voiceOrders)
    .where(eq(voiceOrders.userId, userId))
    .orderBy(desc(voiceOrders.createdAt))
    .limit(50);
}

export async function updateVoiceOrderStatus(id: string, status: VoiceOrder['status'], transcription?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (transcription !== undefined) {
    updateData.transcription = transcription;
  }
  
  await db.update(voiceOrders)
    .set(updateData)
    .where(eq(voiceOrders.id, id));
}

// Order Items
export async function createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(orderItems).values(item);
  const result = await db.select().from(orderItems).where(eq(orderItems.id, item.id!)).limit(1);
  return result[0];
}

export async function getOrderItems(voiceOrderId: string): Promise<OrderItem[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orderItems).where(eq(orderItems.voiceOrderId, voiceOrderId));
}

export async function updateOrderItem(id: string, updates: Partial<OrderItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orderItems).set(updates).where(eq(orderItems.id, id));
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

// jb-x Settings
export async function getJbxSettings(userId: string): Promise<JbxSettings | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(jbxSettings).where(eq(jbxSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertJbxSettings(settings: InsertJbxSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(jbxSettings).values(settings).onDuplicateKeyUpdate({
    set: {
      jbxUsername: settings.jbxUsername,
      jbxPassword: settings.jbxPassword,
      jbxOrganization: settings.jbxOrganization,
      defaultCostCenter: settings.defaultCostCenter,
      updatedAt: new Date(),
    }
  });
}

