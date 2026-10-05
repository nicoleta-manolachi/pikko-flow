import ItemCardShoppingList from "@/components/cards/ItemCardShoppingList";
import EmptyState from "@/components/layouts/EmptyState";
import FilterModal, { type FilterDraft } from "@/components/filter/FilterModal";
import ItemDetailsSheet from "@/components/detail/ItemDetailsSheet";
import { useCategories, useItems, useStores } from "@/db/hooks";
import {
  markChecked,
  markUnchecked,
  setToBuy,
  setOnHold,
  type ItemRow,
} from "@/db/queries";
import type { Priority } from "@/db/schema";
import {
  useCollapsibleHeaderScrollHandler,
  useResetHeaderOnFocus,
} from "@/hooks/useCollapsibleHeader";
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
import Animated from "react-native-reanimated";

type ShoppingSection = { title: string; data: ItemRow[] };
const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList<ItemRow, ShoppingSection>,
);

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
  const [detailsItem, setDetailsItem] = useState<ItemRow | null>(null);

  const scrollHandler = useCollapsibleHeaderScrollHandler();
  useResetHeaderOnFocus();

  const activeFilterCount =
    (categoryId != null ? 1 : 0) +
    (storeId != null ? 1 : 0) +
    (priority != null ? 1 : 0);
  const filtering = activeFilterCount > 0;

  const guard = (fn: () => Promise<unknown>) =>
    fn().catch(() => Alert.alert("Something went wrong", "Please try again."));

  const toBuyItems = useMemo(() => items.filter((i) => i.toBuy), [items]);

  const checkedItems = useMemo(
    () => toBuyItems.filter((i) => i.checkedAt && !i.onHold),
    [toBuyItems],
  );

  const sections: ShoppingSection[] = useMemo(() => {
    const filtered = applyView(toBuyItems, {
      search: "",
      categoryId,
      storeId,
      priority,
      sort: "name",
    });

    const active = filtered
      .filter((i) => !i.onHold)
      .sort((a, b) => {
        const aChecked = a.checkedAt ? 1 : 0;
        const bChecked = b.checkedAt ? 1 : 0;
        if (aChecked !== bChecked) return aChecked - bChecked;
        if (aChecked)
          return (a.checkedAt!.getTime() ?? 0) - (b.checkedAt!.getTime() ?? 0);
        return 0;
      });

    const held = filtered.filter((i) => i.onHold);

    const result: ShoppingSection[] = [];
    if (active.length > 0)
      result.push({ title: "Shopping list", data: active });
    if (held.length > 0) result.push({ title: "Set aside", data: held });
    return result;
  }, [toBuyItems, categoryId, storeId, priority]);

  const low = useMemo(
    () => items.filter((i) => !i.toBuy && isRunningLow(i)),
    [items],
  );

  function confirmClearList() {
    Alert.alert(
      "Clear shopping list?",
      `${toBuyItems.length} item${toBuyItems.length > 1 ? "s" : ""} will be removed from the list. Items stay in your pantry.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () =>
            guard(() =>
              Promise.all(toBuyItems.map((i) => setToBuy(i.id, false))),
            ),
        },
      ],
    );
  }

  function confirmClearBought() {
    Alert.alert(
      "Clear bought items?",
      `${checkedItems.length} bought item${checkedItems.length > 1 ? "s" : ""} will be removed from the list. Items on hold are not affected.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () =>
            guard(() =>
              Promise.all(checkedItems.map((i) => setToBuy(i.id, false))),
            ),
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {toBuyItems.length !== 0 ? (
        <View
          style={{
            paddingHorizontal: 12,
            paddingTop: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
              size={18}
              color={activeFilterCount > 0 ? "#fff" : c.text}
            />
            <Text
              style={{
                color: activeFilterCount > 0 ? "#fff" : c.text,
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              Filters
            </Text>
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

          <View style={{ flexDirection: "row", gap: 8 }}>
            {checkedItems.length > 0 && (
              <Pressable
                onPress={confirmClearBought}
                style={[
                  s.actionPill,
                  {
                    backgroundColor: c.lemonGreen400,
                    borderColor: c.lemonGreen400,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={14}
                  color={c.farmGreen}
                />
                <Text
                  style={{
                    color: c.farmGreen,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  Bought ({checkedItems.length})
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={confirmClearList}
              style={[
                s.actionPill,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Ionicons name="trash-outline" size={14} color={c.danger} />
              <Text
                style={{ color: c.danger, fontWeight: "700", fontSize: 12 }}
              >
                Clear
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <AnimatedSectionList
        sections={sections}
        keyExtractor={(i) => String(i.id)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ padding: 12, gap: 8, flexGrow: 1 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={
          low.length > 0 ? (
            <Pressable
              onPress={() =>
                guard(() => Promise.all(low.map((i) => setToBuy(i.id, true))))
              }
              style={[
                s.suggest,
                { borderColor: c.warn, backgroundColor: c.card },
              ]}
            >
              <Ionicons name="alert-circle" size={20} color={c.warn} />
              <Text style={{ color: c.text, flex: 1 }}>
                {low.length} item{low.length > 1 ? "s" : ""} running low. Tap to
                add to the list.
              </Text>
            </Pressable>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <View style={s.header}>
            <Ionicons
              name={
                section.title === "Set aside"
                  ? "pause-circle-outline"
                  : "list-outline"
              }
              size={16}
              color={c.sub}
            />
            <Text
              style={{
                color: c.sub,
                fontWeight: "700",
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              {section.title} · {section.data.length}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ItemCardShoppingList
            item={item}
            checked={!!item.checkedAt}
            held={!!item.onHold}
            onPress={() => setDetailsItem(item)}
            onToggleChecked={() =>
              guard(() =>
                item.checkedAt ? markUnchecked(item.id) : markChecked(item.id),
              )
            }
            onToggleHold={() => guard(() => setOnHold(item.id, !item.onHold))}
            onRemoveFromList={() => guard(() => setToBuy(item.id, false))}
          />
        )}
        ListEmptyComponent={
          toBuyItems.length === 0 ? (
            <EmptyState
              icon="basket-outline"
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
  suggest: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  clearLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  badge: {
    marginLeft: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
});
