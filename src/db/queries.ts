import { count, desc, eq } from "drizzle-orm";
import { db } from "./client";
import {
  categories,
  items,
  Store,
  stores,
  type Item,
  type NewItem,
  itemStores,
} from "./schema";
import { categoryIcon } from "@/utils/categoryIcons";
import { ItemStoreRef } from "./hooks";

export type ItemRow = Item & {
  categoryName: string | null;
  stores: ItemStoreRef[];
};

export const itemStoresQuery = () =>
  db
    .select({
      itemId: itemStores.itemId,
      storeId: itemStores.storeId,
      storeName: stores.name,
    })
    .from(itemStores)
    .leftJoin(stores, eq(itemStores.storeId, stores.id));

export async function getItemStoreIds(itemId: number): Promise<number[]> {
  const rows = await db
    .select({ storeId: itemStores.storeId })
    .from(itemStores)
    .where(eq(itemStores.itemId, itemId));
  return rows.map((r) => r.storeId);
}

export async function createItem(
  values: Omit<NewItem, "id" | "createdAt" | "updatedAt"> & {
    storeIds?: number[];
  },
) {
  const { storeIds, ...rest } = values;
  const now = new Date();
  const res = await db
    .insert(items)
    .values({ ...rest, createdAt: now, updatedAt: now });
  const itemId = res.lastInsertRowId;
  if (storeIds?.length)
    await db
      .insert(itemStores)
      .values(storeIds.map((storeId) => ({ itemId, storeId })));
  return itemId;
}

export async function updateItem(
  id: number,
  values: Partial<NewItem> & { storeIds?: number[] },
) {
  const { storeIds, ...rest } = values;
  await db
    .update(items)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(items.id, id));
  if (storeIds !== undefined) {
    await db.delete(itemStores).where(eq(itemStores.itemId, id));
    if (storeIds.length)
      await db
        .insert(itemStores)
        .values(storeIds.map((storeId) => ({ itemId: id, storeId })));
  }
}

// undo-delete now also needs to restore the store links
export async function restoreItem(item: Item, storeIds: number[] = []) {
  await db.insert(items).values(item);
  if (storeIds.length)
    await db
      .insert(itemStores)
      .values(storeIds.map((storeId) => ({ itemId: item.id, storeId })));
}

export const itemRowsQuery = () =>
  db
    .select({
      item: items,
      categoryName: categories.name,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id));

export async function setOnHold(id: number, onHold: boolean) {
  await updateItem(id, { onHold });
}

// entering/leaving the list should also clear hold, so an item doesn't
// come back "to buy" still hidden from the main list
export async function setToBuy(id: number, toBuy: boolean) {
  await updateItem(id, { toBuy, checkedAt: null, onHold: false });
}

export const categoriesQuery = () =>
  db.select().from(categories).orderBy(desc(categories.id));

export const storesQuery = () => db.select().from(stores).orderBy(desc(stores.id));

export async function getItem(id: number): Promise<Item | undefined> {
  const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return rows[0];
}

export async function deleteItem(id: number) {
  await db.delete(items).where(eq(items.id, id));
}

export async function markBought(id: number) {
  // used on the Pantry tab: fully done with it, leaves the shopping list
  await updateItem(id, {
    lastPurchasedAt: new Date(),
    toBuy: false,
    checkedAt: null,
  });
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

export async function createCategory(values: {
  name: string;
  icon: string | null;
}) {
  const res = await db.insert(categories).values(values);
  return res.lastInsertRowId;
}

export async function updateCategory(
  id: number,
  values: Partial<{ name: string; icon: string | null }>,
) {
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
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.name, clean))
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
  if (value === 0) {
    await db
      .insert(categories)
      .values(
        DEFAULT_CATEGORIES.map((name) => ({ name, icon: categoryIcon(name) })),
      );
  }
}
