import type { ItemRow } from '@/db/queries';
import type { Priority } from '@/db/schema';
import type { SortKey } from '@/store/uiStore';
import { runOutAt } from './runout';

const RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const cmp = (a: number | string, b: number | string) => (a < b ? -1 : a > b ? 1 : 0);

export type View = { search: string; categoryId: number | null; storeId: number | null; priority: Priority | null; sort: SortKey };

export function applyView(items: ItemRow[], v: View): ItemRow[] {
  const q = v.search.trim().toLowerCase();
  const out = items.filter(
    (i) =>
      (!q || i.name.toLowerCase().includes(q)) &&
      (v.categoryId == null || i.categoryId === v.categoryId) &&
      (v.storeId == null || i.storeId === v.storeId) &&
      (!v.priority || i.priority === v.priority),
  );
  const byName = (a: ItemRow, b: ItemRow) => a.name.localeCompare(b.name);
  const sorters: Record<SortKey, (a: ItemRow, b: ItemRow) => number> = {
    name: byName,
    priority: (a, b) => cmp(RANK[a.priority], RANK[b.priority]) || byName(a, b),
    category: (a, b) => (a.categoryName ?? '~').localeCompare(b.categoryName ?? '~') || byName(a, b),
    store: (a, b) => (a.storeName ?? '~').localeCompare(b.storeName ?? '~') || byName(a, b),
    added: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    runout: (a, b) => cmp(runOutAt(a) ?? Infinity, runOutAt(b) ?? Infinity) || byName(a, b),
  };
  return out.sort(sorters[v.sort]);
}
