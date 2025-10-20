import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Voice orders - stores transcribed voice recordings
 */
export const voiceOrders = mysqlTable("voice_orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  audioUrl: text("audioUrl"),
  transcription: text("transcription"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "error"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type VoiceOrder = typeof voiceOrders.$inferSelect;
export type InsertVoiceOrder = typeof voiceOrders.$inferInsert;

/**
 * Parsed order items from voice transcription
 */
export const orderItems = mysqlTable("order_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  voiceOrderId: varchar("voiceOrderId", { length: 64 }).notNull(),
  articleName: varchar("articleName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }),
  matchedArticleId: varchar("matchedArticleId", { length: 64 }),
  matchedArticleName: text("matchedArticleName"),
  matchedSupplier: varchar("matchedSupplier", { length: 255 }),
  matchedPrice: int("matchedPrice"), // in cents
  confidence: int("confidence"), // 0-100
  confirmed: boolean("confirmed").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Article history - learns from past orders
 */
export const articleHistory = mysqlTable("article_history", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  articleId: varchar("articleId", { length: 64 }).notNull(),
  articleName: varchar("articleName", { length: 255 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  ean: varchar("ean", { length: 20 }),
  unit: varchar("unit", { length: 50 }),
  lastPrice: int("lastPrice"), // in cents
  orderCount: int("orderCount").default(1),
  lastOrderedAt: timestamp("lastOrderedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ArticleHistory = typeof articleHistory.$inferSelect;
export type InsertArticleHistory = typeof articleHistory.$inferInsert;

/**
 * jb-x integration settings per user/organization
 */
export const jbxSettings = mysqlTable("jbx_settings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  jbxUsername: varchar("jbxUsername", { length: 255 }),
  jbxPassword: text("jbxPassword"), // encrypted
  jbxOrganization: varchar("jbxOrganization", { length: 255 }),
  defaultCostCenter: varchar("defaultCostCenter", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type JbxSettings = typeof jbxSettings.$inferSelect;
export type InsertJbxSettings = typeof jbxSettings.$inferInsert;

