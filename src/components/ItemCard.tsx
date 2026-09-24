import type { ItemRow } from "@/db/queries";
import { daysLeft, isRunningLow, runOutLabel } from "@/utils/runout";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import PriorityBadge from "./PriorityBadge";

type Props = {
  item: ItemRow;
  onPress: () => void;
  onBought: () => void;
  onToggleBuy: () => void;
  onDelete: () => void;
};

export default function ItemCard({
  item,
  onPress,
  onBought,
  onToggleBuy,
  onDelete,
}: Props) {
  const c = useColors();
  const ref = useRef<SwipeableMethods>(null);
  const left = daysLeft(item);
  const low = isRunningLow(item);
  const overdue = left != null && left < 0;
  const alertColor = overdue ? c.danger : c.warn;

  return (
    <ReanimatedSwipeable
      ref={ref}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={(dir) => {
        ref.current?.close();
        if (dir === "left")
          onBought(); // left actions revealed = swiped right
        else onDelete();
      }}
      renderLeftActions={() => (
        <View
          style={[
            s.action,
            { backgroundColor: c.primary, alignItems: "flex-start" },
          ]}
        >
          <Ionicons name="checkmark-circle" size={28} color={c.onPrimary} />
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
      <Pressable
        onPress={onPress}
        style={[
          s.card,
          {
            backgroundColor: c.card,
            borderColor: low ? alertColor : c.border,
            borderWidth: low ? 1.5 : 1,
          },
        ]}
      >
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={s.thumb} />
        ) : (
          <View style={[s.thumb, s.placeholder, { backgroundColor: c.chip }]}>
            <Ionicons name="basket-outline" size={26} color={c.sub} />
          </View>
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[s.name, { color: c.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={{ gap: 10, flexDirection: "row" }}>
            <Text style={{ color: c.sub }}>
              {item.quantity} {item.unit}
            </Text>
            <Text style={{ color: c.sub }}>
              <Ionicons name="pricetags-outline" />{" "}
              {item.categoryName ? `${item.categoryName}` : ""}
            </Text>
            <Text style={{ color: c.sub }}>
              <Ionicons name="storefront-outline" />
              {item.storeName ? ` ${item.storeName}` : ""}
            </Text>
          </View>

          <View style={{ gap: 10, flexDirection: "row" }}>
            <View style={s.badgeRow}>
              <PriorityBadge priority={item.priority} />
              {left != null && low && (
                <Text
                  style={{ color: alertColor, fontSize: 12, fontWeight: "600" }}
                >
                  <Ionicons name="alert-circle" size={12} /> {runOutLabel(left)}
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <Pressable
            onPress={onToggleBuy}
            hitSlop={8}
            accessibilityLabel="Toggle shopping list"
          >
            <Ionicons
              name={item.toBuy ? "cart" : "cart-outline"}
              size={24}
              color={item.toBuy ? c.addedCart : c.sub}
            />
          </Pressable>
          <Pressable
            onPress={onBought}
            hitSlop={8}
            accessibilityLabel="Mark as bought"
          >
            <Ionicons
              name="checkmark-done-circle-outline"
              size={24}
              color={c.sub}
            />
          </Pressable>
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}
const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
  },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  placeholder: { alignItems: "center", justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "600" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  action: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    borderRadius: 14,
  },
});
