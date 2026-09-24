import { count, eq } from "drizzle-orm";
import { db } from "./client";
import { categories, items, stores, type Item, type NewItem } from "./schema";

export type ItemRow = Item & {
  categoryName: string | null;
  storeName: string | null;
};

export const itemRowsQuery = () =>
  db
    .select({
      item: items,
      categoryName: categories.name,
      storeName: stores.name,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(stores, eq(items.storeId, stores.id));

export const categoriesQuery = () =>
  db.select().from(categories).orderBy(categories.name);
export const storesQuery = () => db.select().from(stores).orderBy(stores.name);

export async function getItem(id: number): Promise<Item | undefined> {
  const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return rows[0];
}

export async function createItem(
  values: Omit<NewItem, "id" | "createdAt" | "updatedAt">,
) {
  const now = new Date();
  const res = await db
    .insert(items)
    .values({ ...values, createdAt: now, updatedAt: now });
  return res.lastInsertRowId;
}

export async function updateItem(id: number, values: Partial<NewItem>) {
  await db
    .update(items)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(items.id, id));
}

export async function deleteItem(id: number) {
  await db.delete(items).where(eq(items.id, id));
}

/** Used by "undo delete": re-inserts the exact row, id included. */
export async function restoreItem(item: Item) {
  await db.insert(items).values(item);
}

export async function markBought(id: number) {
  await updateItem(id, { lastPurchasedAt: new Date(), toBuy: false });
}

export async function setToBuy(id: number, toBuy: boolean) {
  await updateItem(id, { toBuy });
}

export async function addCategory(name: string): Promise<number> {
  const clean = name.trim();
  await db.insert(categories).values({ name: clean }).onConflictDoNothing();
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.name, clean))
    .limit(1);
  return rows[0].id;
}

export async function addStore(name: string): Promise<number> {
  const clean = name.trim();
  await db.insert(stores).values({ name: clean }).onConflictDoNothing();
  const rows = await db
    .select()
    .from(stores)
    .where(eq(stores.name, clean))
    .limit(1);
  return rows[0].id;
}

const DEFAULT_CATEGORIES = [
  "Dairy",
  "Vegetables",
  "Fruit",
  "Meat",
  "Bakery",
  "Snacks",
  "Drinks",
  "Household",
];

export async function seedCategories() {
  const [{ value }] = await db.select({ value: count() }).from(categories);
  if (value === 0)
    await db
      .insert(categories)
      .values(DEFAULT_CATEGORIES.map((name) => ({ name })));
}
