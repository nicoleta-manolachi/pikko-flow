import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { Store } from "@/db/schema";

type Props = {
  store: Store;
  count: number;
  onPress: () => void;
  onDelete: () => void;
};

export default function ItemStore({ store, count, onPress, onDelete }: Props) {
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
            { backgroundColor: c.edit, alignItems: "flex-start" },
          ]}
        >
          <Ionicons name="create-outline" size={26} color={c.offwhite} />
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
});
