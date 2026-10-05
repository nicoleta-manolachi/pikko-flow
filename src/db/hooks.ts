import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";
import {
  categoriesQuery,
  itemRowsQuery,
  itemStoresQuery,
  storesQuery,
  type ItemRow,
} from "./queries";

export type ItemStoreRef = { id: number; name: string };

export function useItems() {
  const { data: itemData, error } = useLiveQuery(itemRowsQuery());
  const { data: storeLinks } = useLiveQuery(itemStoresQuery());

  if (error) console.error("itemRowsQuery error:", error); // temporary

  const items: ItemRow[] = useMemo(() => {
    const byItem = new Map<number, ItemStoreRef[]>();
    for (const link of storeLinks ?? []) {
      const list = byItem.get(link.itemId) ?? [];
      list.push({ id: link.storeId, name: link.storeName ?? "" });
      byItem.set(link.itemId, list);
    }
    return (itemData ?? []).map((r) => ({
      ...r.item,
      categoryName: r.categoryName,
      stores: byItem.get(r.item.id) ?? [],
    }));
  }, [itemData, storeLinks]);

  return { items };
}

export function useCategories() {
  const { data } = useLiveQuery(categoriesQuery());
  return data ?? [];
}

export function useStores() {
  const { data } = useLiveQuery(storesQuery());
  return data ?? [];
}
