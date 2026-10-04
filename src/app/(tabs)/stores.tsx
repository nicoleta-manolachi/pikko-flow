import EmptyState from "@/components/EmptyState";
import { useItems, useStores } from "@/db/hooks";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { deleteStore } from "@/db/queries";
import { deleteImageFile } from "@/utils/images";
import type { Store } from "@/db/schema";

function StoreRow({
  store,
  count,
  onPress,
  onDelete,
}: {
  store: Store;
  count: number;
  onPress: () => void;
  onDelete: () => void;
}) {
  const c = useColors();
  const ref = useRef<SwipeableMethods>(null);

  function confirmDelete() {
    Alert.alert(
      "Delete store?",
      count > 0
        ? `“${store.name}” will be removed. ${count} item${count > 1 ? "s" : ""} will become unassigned, but won't be deleted.`
        : `“${store.name}” will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
    );
  }

  return (
    <ReanimatedSwipeable
      ref={ref}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={(dir) => {
        ref.current?.close();
        if (dir === "right") onPress();
        else confirmDelete();
      }}
      renderLeftActions={() => (
        <View
          style={[
            s.action,
            { backgroundColor: c.beetroot700, alignItems: "flex-start" },
          ]}
        >
          <Ionicons name="create-outline" size={26} color={c.beetroot200} />
        </View>
      )}
      renderRightActions={() => (
        <View
          style={[
            s.action,
            { backgroundColor: c.danger, alignItems: "flex-end" },
          ]}
        >
          <Ionicons name="trash" size={26} color="#fff" />
        </View>
      )}
    >
      <View style={[s.row, { backgroundColor: c.card, borderColor: c.border }]}>
        {store.imageUri ? (
          <Image source={{ uri: store.imageUri }} style={s.thumb} />
        ) : (
          <View style={[s.thumb, s.placeholder, { backgroundColor: c.chip }]}>
            <Ionicons name="storefront-outline" size={24} color={c.sub} />
          </View>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{ color: c.text, fontSize: 16, fontWeight: "600" }}
            numberOfLines={1}
          >
            {store.name}
          </Text>
          {store.address ? (
            <Text style={{ color: c.sub, fontSize: 13 }} numberOfLines={1}>
              <Ionicons name="location-outline" size={12} /> {store.address}
            </Text>
          ) : null}
          <Text style={{ color: c.sub, fontSize: 12 }}>
            {count} item{count === 1 ? "" : "s"}
          </Text>
        </View>
      </View>
    </ReanimatedSwipeable>
  );
}

export default function Stores() {
  const router = useRouter();
  const stores = useStores();
  const { items } = useItems();

  const itemCount = useMemo(() => {
    const counts = new Map<number, number>();
    for (const it of items) {
      if (it.storeId != null)
        counts.set(it.storeId, (counts.get(it.storeId) ?? 0) + 1);
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
      <FlatList
        data={stores}
        keyExtractor={(s) => String(s.id)}
        contentContainerStyle={{ padding: 12, gap: 10, flexGrow: 1 }}
        renderItem={({ item: store }) => (
          <StoreRow
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
            onAction={() => router.push("/store")}
          />
        }
      />

      <Pressable
        onPress={() => router.push("/store")}
        style={[s.fab, { backgroundColor: c.beetroot }]}
        accessibilityLabel="Add store"
      >
        <Ionicons name="add" size={30} color={c.beetroot200} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  placeholder: { alignItems: "center", justifyContent: "center" },
  action: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    borderRadius: 14,
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
