import { create } from 'zustand';
import type { Priority } from '@/db/schema';

export type SortKey = 'name' | 'priority' | 'category' | 'store' | 'added' | 'runout';

type UiState = {
  sort: SortKey;
  search: string;
  categoryId: number | null;
  storeId: number | null;
  priority: Priority | null;
  setSort: (s: SortKey) => void;
  setSearch: (s: string) => void;
  setCategoryId: (id: number | null) => void;
  setStoreId: (id: number | null) => void;
  setPriority: (p: Priority | null) => void;
  resetFilters: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sort: 'runout',
  search: '',
  categoryId: null,
  storeId: null,
  priority: null,
  setSort: (sort) => set({ sort }),
  setSearch: (search) => set({ search }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setStoreId: (storeId) => set({ storeId }),
  setPriority: (priority) => set({ priority }),
  resetFilters: () => set({ search: '', categoryId: null, storeId: null, priority: null }),
}));
