import { count, eq } from "drizzle-orm";
import { db } from "./client";
import { categories, items, Store, stores, type Item, type NewItem } from "./schema";
import { categoryIcon } from "@/utils/categoryIcons";

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
  // used on the Pantry tab: fully done with it, leaves the shopping list
  await updateItem(id, {
    lastPurchasedAt: new Date(),
    toBuy: false,
    checkedAt: null,
  });
}

export async function setToBuy(id: number, toBuy: boolean) {
  // entering or leaving the list always resets the checked state
  await updateItem(id, { toBuy, checkedAt: null });
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

export async function markChecked(id: number) {
  // stays on the list, just moves to the bottom and updates "last purchased"
  await updateItem(id, { checkedAt: new Date(), lastPurchasedAt: new Date() });
}

export async function markUnchecked(id: number) {
  await updateItem(id, { checkedAt: null });
}

export async function updateStore(
  id: number,
  values: Partial<{
    name: string;
    imageUri: string | null;
    address: string | null;
  }>,
) {
  await db.update(stores).set(values).where(eq(stores.id, id));
}

export async function deleteStore(id: number) {
  await db.delete(stores).where(eq(stores.id, id));
}

// keep your existing addStore(name) as-is — ItemForm's inline "new store" still uses it

export async function createStore(values: {
  name: string;
  imageUri: string | null;
  address: string | null;
}) {
  const res = await db.insert(stores).values(values);
  return res.lastInsertRowId;
}

export async function getStore(id: number): Promise<Store | undefined> {
  const rows = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
  return rows[0];
}


export async function createCategory(values: { name: string; icon: string | null }) {
  const res = await db.insert(categories).values(values);
  return res.lastInsertRowId;
}

export async function updateCategory(id: number, values: Partial<{ name: string; icon: string | null }>) {
  await db.update(categories).set(values).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
}

// keep addCategory(name) if anything else still references it, now seeding a guessed icon:
export async function addCategory(name: string): Promise<number> {
  const clean = name.trim();
  await db
    .insert(categories)
    .values({ name: clean, icon: categoryIcon(clean) })
    .onConflictDoNothing();
  const rows = await db.select().from(categories).where(eq(categories.name, clean)).limit(1);
  return rows[0].id;
}

const DEFAULT_CATEGORIES = ["Dairy", "Vegetables", "Fruit", "Meat", "Bakery", "Snacks", "Drinks", "Household"];

export async function seedCategories() {
  const [{ value }] = await db.select({ value: count() }).from(categories);
  if (value === 0) {
    await db
      .insert(categories)
      .values(DEFAULT_CATEGORIES.map((name) => ({ name, icon: categoryIcon(name) })));
  }
}