import EmptyState from "@/components/layouts/EmptyState";
import { useItems, useStores } from "@/db/hooks";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { deleteStore } from "@/db/queries";
import { deleteImageFile } from "@/utils/images";
import type { Store } from "@/db/schema";
import Animated from "react-native-reanimated";
import {
  useCollapsibleHeaderScrollHandler,
  useResetHeaderOnFocus,
} from "@/hooks/useCollapsibleHeader";
import ItemStore from "@/components/cards/ItemStore";
import AnimatedGradientFab from "@/components/animation/AnimatedGradientFab";

export default function Stores() {
  const router = useRouter();
  const stores = useStores();
  const { items } = useItems();

  const scrollHandler = useCollapsibleHeaderScrollHandler();
  useResetHeaderOnFocus();

  const itemCount = useMemo(() => {
    const counts = new Map<number, number>();
    for (const it of items) {
      for (const st of it.stores) {
        counts.set(st.id, (counts.get(st.id) ?? 0) + 1);
      }
    }
    return counts;
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
          <ItemStore
            store={store}
            count={itemCount.get(store.id) ?? 0}
            onPress={() =>
              router.push({
                pathname: "/store",
                params: { id: String(store.id) },
              })
            }
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

      <AnimatedGradientFab
        onPress={() => router.push("/store")}
        colors={[c.beetroot, c.pumpkin, c.lemon]}
        style={s.fab}
        accessibilityLabel="Add store"
      >
        <Ionicons name="add" size={30} color={c.beetroot200} />
      </AnimatedGradientFab>
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
