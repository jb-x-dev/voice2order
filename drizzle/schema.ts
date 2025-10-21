import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, datetime } from "drizzle-orm/mysql-core";

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
 * Article history - tracks previously ordered articles
 */
export const articleHistory = mysqlTable("articleHistory", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  articleId: varchar("articleId", { length: 128 }).notNull(),
  articleName: text("articleName").notNull(),
  supplier: varchar("supplier", { length: 256 }),
  ean: varchar("ean", { length: 64 }),
  unit: varchar("unit", { length: 32 }),
  lastPrice: int("lastPrice"), // in cents
  orderCount: int("orderCount").default(0),
  lastOrderedAt: datetime("lastOrderedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ArticleHistory = typeof articleHistory.$inferSelect;
export type InsertArticleHistory = typeof articleHistory.$inferInsert;

/**
 * Orders table - stores voice orders and their processing status
 */
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  transcription: text("transcription"),
  audioUrl: text("audioUrl"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  items: text("items"), // JSON array of order items
  totalAmount: int("totalAmount"), // in cents
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Weekly order suggestions - AI-generated order proposals based on historical patterns
 */
export const weeklyOrderSuggestions = mysqlTable("weeklyOrderSuggestions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  weekNumber: int("weekNumber").notNull(), // ISO week number (1-53)
  year: int("year").notNull(),
  weekStartDate: datetime("weekStartDate").notNull(),
  weekEndDate: datetime("weekEndDate").notNull(),
  items: text("items").notNull(), // JSON array of suggested items with quantities
  totalAmount: int("totalAmount"), // in cents
  confidence: int("confidence").default(0), // 0-100
  isApproved: boolean("isApproved").default(false),
  approvedAt: datetime("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type WeeklyOrderSuggestion = typeof weeklyOrderSuggestions.$inferSelect;
export type InsertWeeklyOrderSuggestion = typeof weeklyOrderSuggestions.$inferInsert;

