import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const UNITS = ["pcs", "kg", "g", "L", "ml", "pack"] as const;
export const PRIORITIES = ["Low", "Medium", "High"] as const;
export type Unit = (typeof UNITS)[number];
export type Priority = (typeof PRIORITIES)[number];

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  icon: text("icon"), // an Ionicons name the user picked; null falls back to a name-based guess
});

// db/schema.ts
export const stores = sqliteTable("stores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  imageUri: text("image_uri"),
  address: text("address"),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  imageUri: text("image_uri"),
  quantity: real("quantity").notNull().default(1),
  unit: text("unit", { enum: UNITS }).notNull().default("pcs"),
  priority: text("priority", { enum: PRIORITIES }).notNull().default("Medium"),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  // storeId removed — see itemStores below
  avgConsumeDays: integer("avg_consume_days"),
  lastPurchasedAt: integer("last_purchased_at", { mode: "timestamp_ms" }),
  checkedAt: integer("checked_at", { mode: "timestamp_ms" }),
  onHold: integer("on_hold", { mode: "boolean" }).notNull().default(false),
  toBuy: integer("to_buy", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const itemStores = sqliteTable(
  "item_stores",
  {
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.itemId, t.storeId] }) }),
);

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Store = typeof stores.$inferSelect;
