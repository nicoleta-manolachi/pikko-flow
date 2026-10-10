import EmptyState from "@/components/layouts/EmptyState";
import ItemCard from "@/components/cards/ItemCard";
import FilterModal, { type FilterDraft } from "@/components/filter/FilterModal";
import Snackbar from "@/components/Snackbar";
import { useCategories, useItems, useStores } from "@/db/hooks";
import { deleteItem, restoreItem, setToBuy, type ItemRow } from "@/db/queries";
import { type Item } from "@/db/schema";
import { useUiStore } from "@/store/uiStore";
import { deleteImageFile } from "@/utils/images";
import { applyView } from "@/utils/listing";
import { LIST_BOTTOM_PADDING, useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useCollapsibleHeaderScrollHandler,
  useResetHeaderOnFocus,
} from "@/hooks/useCollapsibleHeader";
import Animated from "react-native-reanimated";
import ItemDetailsSheet from "@/components/detail/ItemDetailsSheet";
import BottomFadeOverlay from "@/components/layouts/BottomFadeOverlay";
import Fab from "@/components/Fab";

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pending, setPending] = useState<{
    item: Item;
    storeIds: number[];
  } | null>(null);
  const [detailsItem, setDetailsItem] = useState<ItemRow | null>(null);

  const { storeId: storeIdParam, categoryId: categoryIdParam } =
    useLocalSearchParams<{ storeId?: string; categoryId?: string }>();

  useEffect(() => {
    if (storeIdParam) setStoreId(Number(storeIdParam));
  }, [storeIdParam]);

  useEffect(() => {
    if (categoryIdParam) setCategoryId(Number(categoryIdParam));
  }, [categoryIdParam]);

  const scrollHandler = useCollapsibleHeaderScrollHandler();
  useResetHeaderOnFocus();

  const visible = useMemo(
    () => applyView(items, { search, categoryId, storeId, priority, sort }),
    [items, search, categoryId, storeId, priority, sort],
  );
  const activeFilterCount =
    (categoryId != null ? 1 : 0) +
    (storeId != null ? 1 : 0) +
    (priority != null ? 1 : 0);
  const filtering = !!search || activeFilterCount > 0;

  const guard = (fn: () => Promise<unknown>) =>
    fn().catch(() => Alert.alert("Something went wrong", "Please try again."));
  const commit = (p: typeof pending) => p && deleteImageFile(p.item.imageUri);

  async function onDelete(row: ItemRow) {
    commit(pending);
    const { categoryName: _c, stores, ...item } = row;
    await guard(() => deleteItem(item.id));
    setPending({ item, storeIds: stores.map((s) => s.id) });
  }

  async function onUndo() {
    if (!pending) return;
    await guard(() => restoreItem(pending.item, pending.storeIds));
    setPending(null);
  }

  return (
    <View style={{ flex: 1 }}>
      {items.length !== 0 ? (
        <View style={{ padding: 12, gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View
              style={[
                s.search,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
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

            <Pressable
              onPress={() => setFiltersOpen(true)}
              style={[
                s.filterBtn,
                {
                  backgroundColor: activeFilterCount > 0 ? c.farmGreen : c.card,
                  borderColor: c.border,
                },
              ]}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={activeFilterCount > 0 ? "#fff" : c.text}
              />
              {activeFilterCount > 0 && (
                <View style={[s.badge, { backgroundColor: c.farmGreen300 }]}>
                  <Text
                    style={{
                      color: c.farmGreen,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={s.header}>
            <Ionicons name="list-outline" size={16} color={c.sub} />
            <Text
              style={{
                color: c.sub,
                fontWeight: "700",
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              Pantry list · {visible.length}
            </Text>
          </View>
        </View>
      ) : null}

      <Animated.FlatList
        data={visible}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: LIST_BOTTOM_PADDING,
          gap: 10,
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onSwipeEdit={() =>
              router.push({
                pathname: "/item",
                params: { id: String(item.id) },
              })
            }
            onPress={() => setDetailsItem(item)}
            onToggleBuy={() => guard(() => setToBuy(item.id, !item.toBuy))}
            onDelete={() => onDelete(item)}
            accentColor={c.farmGreen}
          />
        )}
        ListEmptyComponent={
          items.length === 0 ? (
            <EmptyState
              icon="basket-outline"
              title="Your pantry is empty"
              subtitle="Add your first grocery item to start tracking what you need."
              actionLabel="Add your first item"
              accentColor={c.farmGreen}
              accentTint={c.offwhite}
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

      {items.length !== 0 ? (
        <Fab
          onPress={() => router.push("/item")}
          backgroundColor={c.farmGreen}
          accessibilityLabel="Add item"
        />
      ) : null}

      <FilterModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={{ sort, categoryId, storeId, priority }}
        onApply={(v: FilterDraft) => {
          if (v.sort) setSort(v.sort); // guard against undefined
          setCategoryId(v.categoryId);
          setStoreId(v.storeId);
          setPriority(v.priority);
        }}
        categories={categories}
        stores={stores}
        accentColor={c.farmGreen}
        accentTint={c.lemonGreen400}
      />

      <ItemDetailsSheet
        visible={detailsItem !== null}
        item={detailsItem}
        onClose={() => setDetailsItem(null)}
        onEdit={() => {
          if (!detailsItem) return;
          const id = detailsItem.id;
          setDetailsItem(null);
          router.push({ pathname: "/item", params: { id: String(id) } });
        }}
      />

      <Snackbar
        visibleKey={pending?.item.id ?? null}
        message={`Deleted “${pending?.item.name ?? ""}”`}
        actionLabel="UNDO"
        onAction={onUndo}
        onTimeout={() => {
          commit(pending);
          setPending(null);
        }}
      />
      <BottomFadeOverlay />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 2,
  },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
});
