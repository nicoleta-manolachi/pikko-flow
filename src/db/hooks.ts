import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { categoriesQuery, itemRowsQuery, storesQuery, type ItemRow } from './queries';

export function useItems() {
  const { data, error } = useLiveQuery(itemRowsQuery());
  const items: ItemRow[] = useMemo(
    () => (data ?? []).map((r) => ({ ...r.item, categoryName: r.categoryName, storeName: r.storeName })),
    [data],
  );
  return { items, error };
}

export function useCategories() {
  const { data } = useLiveQuery(categoriesQuery());
  return data ?? [];
}

export function useStores() {
  const { data } = useLiveQuery(storesQuery());
  return data ?? [];
}
