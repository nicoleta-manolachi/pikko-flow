import Chip from "@/components/Chip";
import EmptyState from "@/components/EmptyState";
import ItemCard from "@/components/cards/ItemCard";
import FilterModal, { type FilterDraft } from "@/components/FilterModal";
import Snackbar from "@/components/Snackbar";
import { useCategories, useItems, useStores } from "@/db/hooks";
import {
  deleteItem,
  markBought,
  restoreItem,
  setToBuy,
  type ItemRow,
} from "@/db/queries";
import { type Item } from "@/db/schema";
import { useUiStore } from "@/store/uiStore";
import { deleteImageFile } from "@/utils/images";
import { applyView } from "@/utils/listing";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Pantry() {
  const c = useColors();
  const router = useRouter();
  const { items } = useItems();
  const categories = useCategories();
  const stores = useStores();
  const {
    sort,
    search,
    categoryId,
    storeId,
    priority,
    setSort,
    setSearch,
    setCategoryId,
    setStoreId,
    setPriority,
    resetFilters,
  } = useUiStore();
  const [pending, setPending] = useState<Item | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const visible = useMemo(
    () => applyView(items, { search, categoryId, storeId, priority, sort }),
    [items, search, categoryId, storeId, priority, sort],
  );
  const activeFilterCount =
    (categoryId != null ? 1 : 0) + (storeId != null ? 1 : 0) + (priority != null ? 1 : 0);
  const filtering = !!search || activeFilterCount > 0;

  const guard = (fn: () => Promise<unknown>) =>
    fn().catch(() => Alert.alert("Something went wrong", "Please try again."));
  const commit = (it: Item | null) => it && deleteImageFile(it.imageUri);

  async function onDelete(row: ItemRow) {
    commit(pending);
    const { categoryName: _c, storeName: _s, ...item } = row as ItemRow;
    await guard(() => deleteItem(item.id));
    setPending(item);
  }

  async function onUndo() {
    if (!pending) return;
    await guard(() => restoreItem(pending));
    setPending(null);
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={[s.search, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="search" size={18} color={c.sub} />
            <TextInput
              style={{ flex: 1, color: c.text, fontSize: 16 }}
              value={search}
              onChangeText={setSearch}
              placeholder="Search items"
              placeholderTextColor={c.sub}
            />
            {!!search && (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={c.sub} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => setFiltersOpen(true)}
            style={[
              s.filterBtn,
              { backgroundColor: activeFilterCount > 0 ? c.farmGreen : c.card, borderColor: c.border },
            ]}
          >
            <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? "#fff" : c.text} />
            {activeFilterCount > 0 && (
              <View style={[s.badge, { backgroundColor: c.farmGreen300 }]}>
                <Text style={{ color: c.farmGreen, fontSize: 11, fontWeight: "700" }}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100, gap: 10 }}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push({ pathname: "/item", params: { id: String(item.id) } })}
            onToggleBuy={() => guard(() => setToBuy(item.id, !item.toBuy))}
            onDelete={() => onDelete(item)}
            accentColor={c.farmGreen}
            editIconColor={c.farmGreen300}
          />
        )}
        ListEmptyComponent={
          items.length === 0 ? (
            <EmptyState
              icon="basket-outline"
              title="Your pantry is empty"
              subtitle="Add your first grocery item to start tracking what you need."
              actionLabel="Add your first item"
              onAction={() => router.push("/item")}
            />
          ) : filtering ? (
            <EmptyState
              icon="search-outline"
              title="No matches"
              subtitle="Try a different search or clear the filters."
              actionLabel="Clear filters"
              onAction={() => {
                resetFilters();
                setSearch("");
              }}
            />
          ) : null
        }
      />

      <Pressable
        onPress={() => router.push("/item")}
        style={[s.fab, { backgroundColor: c.farmGreen }]}
        accessibilityLabel="Add item"
      >
        <Ionicons name="add" size={30} color={c.farmGreen300} />
      </Pressable>

      <FilterModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={{ sort, categoryId, storeId, priority }}
        onApply={(v: FilterDraft) => {
          setSort(v.sort);
          setCategoryId(v.categoryId);
          setStoreId(v.storeId);
          setPriority(v.priority);
        }}
        categories={categories}
        stores={stores}
        accentColor={c.farmGreen}
        accentTint={c.farmGreen300}
      />

      <Snackbar
        visibleKey={pending?.id ?? null}
        message={`Deleted “${pending?.name ?? ""}”`}
        actionLabel="UNDO"
        onAction={onUndo}
        onTimeout={() => {
          commit(pending);
          setPending(null);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  search: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  filterBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  fab: { position: "absolute", right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", elevation: 6 },
});