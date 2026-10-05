import type { ItemRow } from "@/db/queries";
import { daysLeft, isRunningLow, runOutLabel } from "@/utils/runout";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import PriorityBadge from "./PriorityBadge";

type Props = {
  item: ItemRow;
  checked: boolean;
  held: boolean;
  onPress: () => void;
  onToggleChecked: () => void;
  onToggleHold: () => void;
  onRemoveFromList: () => void;
};

export default function ItemCardShoppingList({
  item,
  checked,
  held,
  onPress,
  onToggleChecked,
  onToggleHold,
  onRemoveFromList,
}: Props) {
  const c = useColors();
  const ref = useRef<SwipeableMethods>(null);
  const left = daysLeft(item);
  const low = isRunningLow(item);
  const overdue = left != null && left < 0;
  const alertColor = overdue ? c.danger : c.warn;

  function confirmRemoveFromList() {
    Alert.alert(
      "Remove from shopping list?",
      `“${item.name}” will be taken off your shopping list.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: onRemoveFromList },
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
        if (dir === "right") confirmRemoveFromList();
        else onToggleHold();
      }}
      renderLeftActions={() => (
        <View
          style={[
            s.action,
            { backgroundColor: c.danger, alignItems: "flex-start" },
          ]}
        >
          <Ionicons name="basket-outline" size={26} color="#fff" />
        </View>
      )}
      renderRightActions={() => (
        <View
          style={[
            s.action,
            { backgroundColor: c.warn, alignItems: "flex-end" },
          ]}
        >
          <Ionicons
            name={held ? "play-circle" : "pause-circle"}
            size={26}
            color="#fff"
          />
        </View>
      )}
    >
      <Pressable
        onPress={onPress}
        style={[
          s.card,
          {
            backgroundColor: c.card,
            borderColor: held ? c.sub : low && !checked ? alertColor : c.border,
            borderWidth: held ? 1.5 : low && !checked ? 1.5 : 1,
            borderStyle: held ? "dashed" : "solid",
            opacity: checked || held ? 0.6 : 1,
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
        <View style={{ flex: 1, gap: 4, overflow: "hidden" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={[
                s.name,
                {
                  color: c.text,
                  textDecorationLine: checked ? "line-through" : "none",
                },
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {held && (
              <View style={[s.holdBadge, { backgroundColor: c.chip }]}>
                <Text style={{ color: c.sub, fontSize: 11, fontWeight: "700" }}>
                  ON HOLD
                </Text>
              </View>
            )}
          </View>
          <View style={{ gap: 10, flexDirection: "row" }}>
            <Text style={{ color: c.sub }}>
              {item.quantity} {item.unit}
            </Text>
            {item.categoryName ? (
              <Text style={{ color: c.sub }}>
                <Ionicons name="pricetags-outline" /> {item.categoryName}
              </Text>
            ) : null}
            {item.stores.length > 0 ? (
              <Text style={{ color: c.sub }}>
                <Ionicons name="storefront-outline" />{" "}
                {item.stores
                  .slice(0, 2)
                  .map((s) => s.name)
                  .join(", ")}
              </Text>
            ) : null}
          </View>

          {!checked && !held && (
            <View style={{ gap: 10, flexDirection: "row" }}>
              <View style={s.badgeRow}>
                <PriorityBadge priority={item.priority} />
                {left != null && low && (
                  <Text
                    style={{
                      color: alertColor,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    <Ionicons name="alert-circle" size={12} />{" "}
                    {runOutLabel(left)}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
        <View style={{ gap: 14 }}>
          <Pressable
            onPress={onToggleChecked}
            hitSlop={8}
            accessibilityLabel={
              checked ? "Mark as not bought" : "Mark as bought"
            }
          >
            <Ionicons
              name={
                checked
                  ? "checkmark-done-circle"
                  : "checkmark-done-circle-outline"
              }
              size={24}
              color={checked ? c.lettuce : c.sub}
            />
          </Pressable>
          <Pressable
            onPress={confirmRemoveFromList}
            hitSlop={8}
            accessibilityLabel="Remove from shopping list"
          >
            <Ionicons name="basket" size={24} color={c.farmGreen} />
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
  holdBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  action: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    borderRadius: 14,
  },
});
