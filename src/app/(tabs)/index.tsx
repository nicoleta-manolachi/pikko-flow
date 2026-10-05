import EmptyState from "@/components/layouts/EmptyState";
import ItemCard from "@/components/cards/ItemCard";
import { useCategories, useItems, useStores } from "@/db/hooks";
import { deleteItem, ItemRow, markBought, setToBuy } from "@/db/queries";
import { useColors } from "@/utils/theme";
import { categoryIcon } from "@/utils/categoryIcons";
import { applyView } from "@/utils/listing";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import {
  useCollapsibleHeaderScrollHandler,
  useResetHeaderOnFocus,
} from "@/hooks/useCollapsibleHeader";
import ItemDetailsSheet from "@/components/detail/ItemDetailsSheet";

const PREVIEW_CATEGORIES = 5;
const PREVIEW_STORES = 5;
const PREVIEW_ITEMS = 3;

export default function Home() {
  const c = useColors();
  const router = useRouter();
  const { items } = useItems();
  const categories = useCategories();
  const stores = useStores();

  const [detailsItem, setDetailsItem] = useState<ItemRow | null>(null);

  const scrollHandler = useCollapsibleHeaderScrollHandler();
  useResetHeaderOnFocus();

  const guard = (fn: () => Promise<unknown>) =>
    fn().catch(() => Alert.alert("Something went wrong", "Please try again."));

  const topItems = useMemo(
    () =>
      applyView(items, {
        search: "",
        categoryId: null,
        storeId: null,
        priority: null,
        sort: "runout",
      }).slice(0, PREVIEW_ITEMS),
    [items],
  );

  const storeItemCount = useMemo(() => {
    const counts = new Map<number, number>();
    for (const it of items) {
      for (const st of it.stores) {
        counts.set(st.id, (counts.get(st.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [items]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{ paddingBottom: 24 }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {/* Top Categories */}
      <Section
        title="Top Categories"
        subtitle="Organize your groceries by type."
        onSeeAll={() => router.push("/categories")}
        empty={categories.length === 0}
        emptyLabel="No categories yet. Add one from the Categories tab."
      >
        <View style={s.wrapRow}>
          {categories.slice(0, PREVIEW_CATEGORIES).map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => router.push("/categories")}
              style={[s.pill, { backgroundColor: c.lemon500 }]}
            >
              <Ionicons
                name={(cat.icon ?? categoryIcon(cat.name)) as any}
                size={16}
                color={c.beetroot}
              />
              <Text style={[s.pillText, { color: c.beetroot }]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
          {categories.length > 0 && (
            <Pressable
              onPress={() => router.push("/categories")}
              style={[s.pill, { backgroundColor: c.lemon300 }]}
            >
              <Ionicons name="add" size={16} color={c.beetroot} />
              <Text style={[s.pillText, { color: c.beetroot }]}>See all</Text>
            </Pressable>
          )}
        </View>
      </Section>

      {/* Stores */}
      <Section
        title="Stores"
        subtitle="Manage where you shop."
        onSeeAll={() => router.push("/stores")}
        empty={stores.length === 0}
        emptyComponent={
          <EmptyState
            icon="storefront-outline"
            title="No stores added yet"
            subtitle="No stores yet. Add one from the Stores tab."
          />
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {stores.slice(0, PREVIEW_STORES).map((st) => {
            const count = storeItemCount.get(st.id) ?? 0;
            return (
              <Pressable
                key={st.id}
                onPress={() => router.push("/stores")}
                style={[
                  s.storeCard,
                  { backgroundColor: c.card, borderColor: c.border },
                ]}
              >
                <View style={[s.storeImage, { backgroundColor: c.chip }]}>
                  {st.imageUri ? (
                    <Image
                      source={{ uri: st.imageUri }}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : (
                    <Ionicons name="image-outline" size={28} color={c.sub} />
                  )}
                </View>
                <Text
                  style={[s.storeName, { color: c.beetroot }]}
                  numberOfLines={1}
                >
                  {st.name}
                </Text>
                <View style={s.storeMetaRow}>
                  <Ionicons name="basket-outline" size={13} color={c.sub} />
                  <Text style={{ color: c.sub, fontSize: 12 }}>
                    {count} item{count === 1 ? "" : "s"}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </Section>

      {/* Items */}
      <Section
        title="Items"
        subtitle="Keep track of everything."
        onSeeAll={() => router.push("/pantry")}
        empty={items.length === 0}
        emptyComponent={
          <EmptyState
            icon="basket-outline"
            title="Your pantry is empty"
            subtitle="Add your first grocery item to start tracking what you need."
            actionLabel="Add your first item"
            onAction={() => router.push("/item")}
          />
        }
      >
        <View style={{ gap: 10 }}>
          {topItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onPress={() => setDetailsItem(item)}
              onToggleBuy={() => guard(() => setToBuy(item.id, !item.toBuy))}
              onDelete={() => guard(() => deleteItem(item.id))}
            />
          ))}
        </View>
      </Section>

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
    </Animated.ScrollView>
  );
}

function Section({
  title,
  subtitle,
  onSeeAll,
  empty,
  emptyLabel,
  emptyComponent,
  children,
}: {
  title: string;
  subtitle: string;
  onSeeAll: () => void;
  empty: boolean;
  emptyLabel?: string;
  emptyComponent?: React.ReactNode;
  children: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[s.sectionTitle, { color: c.beetroot }]}>{title}</Text>
          <Text style={{ color: c.sub, marginTop: 2 }}>{subtitle}</Text>
        </View>
      </View>
      {empty
        ? (emptyComponent ?? (
            <Text style={{ color: c.sub, paddingHorizontal: 20 }}>
              {emptyLabel}
            </Text>
          ))
        : children}
    </View>
  );
}

const s = StyleSheet.create({
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 22, fontWeight: "800" },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  pillText: { fontSize: 14, fontWeight: "600" },
  storeCard: {
    width: 150,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 10,
  },
  storeImage: {
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  storeName: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginHorizontal: 10,
  },
  storeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    marginHorizontal: 10,
  },
});
