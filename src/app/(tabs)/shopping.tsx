import ItemCardShoppingList from "@/components/cards/ItemCardShoppingList";
import EmptyState from "@/components/EmptyState";
import FilterModal, { type FilterDraft } from "@/components/FilterModal";
import { useCategories, useItems, useStores } from "@/db/hooks";
import {
  markChecked,
  markUnchecked,
  setToBuy,
  deleteItem,
  type ItemRow,
} from "@/db/queries";
import type { Priority } from "@/db/schema";
import { deleteImageFile } from "@/utils/images";
import { applyView } from "@/utils/listing";
import { isRunningLow } from "@/utils/runout";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Shopping() {
  const c = useColors();
  const router = useRouter();
  const { items } = useItems();
  const stores = useStores();
  const categories = useCategories();

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount =
    (categoryId != null ? 1 : 0) + (storeId != null ? 1 : 0) + (priority != null ? 1 : 0);
  const filtering = activeFilterCount > 0;

  const guard = (fn: () => Promise<unknown>) =>
    fn().catch(() => Alert.alert("Something went wrong", "Please try again."));

  const sections = useMemo(() => {
    const filtered = applyView(
      items.filter((i) => i.toBuy),
      { search: "", categoryId, storeId, priority, sort: "store" },
    );
    const groups = new Map<string, ItemRow[]>();
    for (const it of filtered) {
      const key = it.storeName ?? "Any store";
      groups.set(key, [...(groups.get(key) ?? []), it]);
    }
    return [...groups].map(([title, data]) => ({
      title,
      data: [...data].sort((a, b) => {
        const aChecked = a.checkedAt ? 1 : 0;
        const bChecked = b.checkedAt ? 1 : 0;
        if (aChecked !== bChecked) return aChecked - bChecked;
        if (aChecked) return (a.checkedAt!.getTime() ?? 0) - (b.checkedAt!.getTime() ?? 0);
        return 0;
      }),
    }));
  }, [items, categoryId, storeId, priority]);

  const low = useMemo(() => items.filter((i) => !i.toBuy && isRunningLow(i)), [items]);

  async function handleDelete(item: ItemRow) {
    await guard(() => deleteItem(item.id));
    deleteImageFile(item.imageUri);
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 12, paddingTop: 10, flexDirection: "row", justifyContent: "flex-end" }}>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          style={[
            s.filterBtn,
            { backgroundColor: activeFilterCount > 0 ? c.farmGreen : c.card, borderColor: c.border },
          ]}
        >
          <Ionicons name="options-outline" size={18} color={activeFilterCount > 0 ? "#fff" : c.text} />
          <Text style={{ color: activeFilterCount > 0 ? "#fff" : c.text, fontWeight: "600", fontSize: 13 }}>
            Filters
          </Text>
          {activeFilterCount > 0 && (
            <View style={[s.badge, { backgroundColor: c.farmGreen300 }]}>
              <Text style={{ color: c.farmGreen, fontSize: 11, fontWeight: "700" }}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(i) => String(i.id)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ padding: 12, gap: 8, flexGrow: 1 }}
        ListHeaderComponent={
          low.length > 0 ? (
            <Pressable
              onPress={() => guard(() => Promise.all(low.map((i) => setToBuy(i.id, true))))}
              style={[s.suggest, { borderColor: c.warn, backgroundColor: c.card }]}
            >
              <Ionicons name="alert-circle" size={20} color={c.warn} />
              <Text style={{ color: c.text, flex: 1 }}>
                {low.length} item{low.length > 1 ? "s" : ""} running low. Tap to add to the list.
              </Text>
            </Pressable>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <View style={s.header}>
            <Ionicons name="storefront-outline" size={16} color={c.sub} />
            <Text style={{ color: c.sub, fontWeight: "700", textTransform: "uppercase", fontSize: 12 }}>
              {section.title} · {section.data.length}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ItemCardShoppingList
            item={item}
            checked={!!item.checkedAt}
            onPress={() => router.push({ pathname: "/item", params: { id: String(item.id) } })}
            onToggleChecked={() =>
              guard(() => (item.checkedAt ? markUnchecked(item.id) : markChecked(item.id)))
            }
            onRemoveFromList={() => guard(() => setToBuy(item.id, false))}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          items.filter((i) => i.toBuy).length === 0 ? (
            <EmptyState
              icon="cart-outline"
              title="Nothing to buy"
              subtitle="Tap the cart icon on a pantry item to add it here."
            />
          ) : filtering ? (
            <EmptyState
              icon="search-outline"
              title="No matches"
              subtitle="Try a different filter."
              actionLabel="Clear filters"
              onAction={() => {
                setCategoryId(null);
                setStoreId(null);
                setPriority(null);
              }}
            />
          ) : null
        }
      />

      <FilterModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={{ categoryId, storeId, priority }}
        onApply={(v: FilterDraft) => {
          setCategoryId(v.categoryId);
          setStoreId(v.storeId);
          setPriority(v.priority);
        }}
        categories={categories}
        stores={stores}
        accentColor={c.farmGreen}
        accentTint={c.lemonGreen400}
        showSort={false}
      />
    </View>
  );
}
const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, marginBottom: 2 },
  suggest: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1.5, marginBottom: 8 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  badge: { marginLeft: 2, minWidth: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
});