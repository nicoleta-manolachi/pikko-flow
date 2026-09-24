import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack'] as const;
export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Unit = (typeof UNITS)[number];
export type Priority = (typeof PRIORITIES)[number];

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
});

export const stores = sqliteTable('stores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
});

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  imageUri: text('image_uri'),
  quantity: real('quantity').notNull().default(1),
  unit: text('unit', { enum: UNITS }).notNull().default('pcs'),
  priority: text('priority', { enum: PRIORITIES }).notNull().default('medium'),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  storeId: integer('store_id').references(() => stores.id, { onDelete: 'set null' }),
  avgConsumeDays: integer('avg_consume_days'),
  lastPurchasedAt: integer('last_purchased_at', { mode: 'timestamp_ms' }),
  toBuy: integer('to_buy', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Store = typeof stores.$inferSelect;
