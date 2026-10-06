import EmptyState from "@/components/layouts/EmptyState";
import { useItems, useStores } from "@/db/hooks";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { deleteStore, ItemRow } from "@/db/queries";
import { deleteImageFile } from "@/utils/images";
import type { Store } from "@/db/schema";
import Animated from "react-native-reanimated";
import {
  useCollapsibleHeaderScrollHandler,
  useResetHeaderOnFocus,
} from "@/hooks/useCollapsibleHeader";
import AnimatedGradientFab from "@/components/animation/AnimatedGradientFab";
import StoreDetailsSheet from "@/components/detail/StoreDetailsSheet";
import StoreCard from "@/components/cards/StoreCard";

export default function Stores() {
  const router = useRouter();
  const stores = useStores();
  const { items } = useItems();
  const [detailsStore, setDetailsStore] = useState<Store | null>(null);

  const scrollHandler = useCollapsibleHeaderScrollHandler();
  useResetHeaderOnFocus();

  const storeItems = useMemo(() => {
    const result = new Map<number, typeof items>();

    for (const item of items) {
      for (const store of item.stores) {
        const itemsForStore = result.get(store.id) ?? [];
        itemsForStore.push(item);
        result.set(store.id, itemsForStore);
      }
    }

    return result;
  }, [items]);

  const guard = (fn: () => Promise<unknown>) =>
    fn().catch(() => Alert.alert("Something went wrong", "Please try again."));

  async function handleDelete(store: Store) {
    await guard(() => deleteStore(store.id));
    deleteImageFile(store.imageUri);
  }

  const c = useColors();
  return (
    <View style={{ flex: 1 }}>
      <Animated.FlatList
        data={stores}
        keyExtractor={(s) => String(s.id)}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ padding: 12, gap: 10, flexGrow: 1 }}
        renderItem={({ item: store }) => (
          <StoreCard
            store={store}
            itemsCount={storeItems.get(store.id)?.length ?? 0}
            onSwipeEdit={() =>
              router.push({
                pathname: "/store",
                params: { id: String(store.id) },
              })
            }
            onPress={() => setDetailsStore(store)}
            onDelete={() => handleDelete(store)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="storefront-outline"
            title="No stores yet"
            subtitle="Add the places you usually shop, so you can filter and group your list by store."
            actionLabel="Add your first store"
            accentColor={c.lemon}
            accentTint={c.beetroot}
            onAction={() => router.push("/store")}
          />
        }
      />

      {detailsStore ? (
        <StoreDetailsSheet
          visible={detailsStore !== null}
          item={detailsStore}
          itemsCount={storeItems.get(detailsStore.id)?.length ?? 0}
          storeItems={storeItems.get(detailsStore.id) ?? []}
          onClose={() => setDetailsStore(null)}
          onEdit={() => {
            if (!detailsStore) return;
            const id = detailsStore.id;
            setDetailsStore(null);
            router.push({ pathname: "/store", params: { id: String(id) } });
          }}
        />
      ) : null}

      {stores.length > 0 ? (
        <AnimatedGradientFab
          onPress={() => router.push("/store")}
          colors={[c.beetroot, c.pumpkin, c.lemon]}
          style={s.fab}
          accessibilityLabel="Add store"
        >
          <Ionicons name="add" size={30} color={c.beetroot200} />
        </AnimatedGradientFab>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    elevation: 6,
  },
});
