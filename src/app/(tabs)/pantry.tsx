import Chip from "@/components/Chip";
import EmptyState from "@/components/EmptyState";
import ItemCard from "@/components/ItemCard";
import Snackbar from "@/components/Snackbar";
import SortMenu from "@/components/SortMenu";
import { useCategories, useItems, useStores } from "@/db/hooks";
import {
  deleteItem,
  markBought,
  restoreItem,
  setToBuy,
  type ItemRow,
} from "@/db/queries";
import { PRIORITIES, type Item } from "@/db/schema";
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
  ScrollView,
  StyleSheet,
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
  const [pending, setPending] = useState<Item | null>(null); // last deleted item (for undo)

  const visible = useMemo(
    () => applyView(items, { search, categoryId, storeId, priority, sort }),
    [items, search, categoryId, storeId, priority, sort],
  );
  const filtering =
    !!search || categoryId != null || storeId != null || priority != null;

  const guard = (fn: () => Promise<unknown>) =>
    fn().catch(() => Alert.alert("Something went wrong", "Please try again."));
  const commit = (it: Item | null) => it && deleteImageFile(it.imageUri); // permanently drop image after undo window

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
        <View
          style={[s.search, { backgroundColor: c.card, borderColor: c.border }]}
        >
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SortMenu value={sort} onChange={setSort} />
          {PRIORITIES.map((p) => (
            <Chip
              key={p}
              label={p}
              selected={priority === p}
              onPress={() => setPriority(priority === p ? null : p)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              selected={categoryId === cat.id}
              onPress={() =>
                setCategoryId(categoryId === cat.id ? null : cat.id)
              }
            />
          ))}
        </ScrollView>
        {stores.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stores.map((st) => (
              <Chip
                key={st.id}
                label={`🛒 ${st.name}`}
                selected={storeId === st.id}
                onPress={() => setStoreId(storeId === st.id ? null : st.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 100,
          gap: 10,
        }}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() =>
              router.push({
                pathname: "/item",
                params: { id: String(item.id) },
              })
            }
            onBought={() => guard(() => markBought(item.id))}
            onToggleBuy={() => guard(() => setToBuy(item.id, !item.toBuy))}
            onDelete={() => onDelete(item)}
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
              onAction={resetFilters}
            />
          ) : null
        }
      />

      <Pressable
        onPress={() => router.push("/item")}
        style={[s.fab, { backgroundColor: c.primary }]}
        accessibilityLabel="Add item"
      >
        <Ionicons name="add" size={30} color={c.onPrimary} />
      </Pressable>

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
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
