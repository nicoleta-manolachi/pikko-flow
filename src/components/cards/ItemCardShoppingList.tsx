import type { ItemRow } from "@/db/queries";
import { daysLeft, isRunningLow, runOutLabel } from "@/utils/runout";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import PriorityBadge from "../PriorityBadge";

type Props = {
  item: ItemRow;
  checked: boolean;
  onPress: () => void;
  onToggleChecked: () => void;
  onRemoveFromList: () => void;
  onDelete: () => void;
};

export default function ItemCardShoppingList({
  item,
  checked,
  onPress,
  onToggleChecked,
  onRemoveFromList,
  onDelete,
}: Props) {
  const c = useColors();
  const ref = useRef<SwipeableMethods>(null);
  const left = daysLeft(item);
  const low = isRunningLow(item);
  const overdue = left != null && left < 0;
  const alertColor = overdue ? c.danger : c.warn;

  function confirmDelete() {
    Alert.alert(
      "Delete item?",
      `“${item.name}” will be removed from your pantry.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
    );
  }
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
      <View
        style={[
          s.card,
          {
            backgroundColor: c.card,
            borderColor: low && !checked ? alertColor : c.border,
            borderWidth: low && !checked ? 1.5 : 1,
            opacity: checked ? 0.55 : 1,
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
          <View style={{ gap: 10, flexDirection: "row" }}>
            <Text style={{ color: c.sub }}>
              {item.quantity} {item.unit}
            </Text>
            {item.categoryName ? (
              <Text style={{ color: c.sub }}>
                <Ionicons name="pricetags-outline" /> {item.categoryName}
              </Text>
            ) : null}
            {item.storeName ? (
              <Text style={{ color: c.sub }}>
                <Ionicons name="storefront-outline" /> {item.storeName}
              </Text>
            ) : null}
          </View>

          {!checked && (
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
        <View style={{ gap: 10 }}>
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
            <Ionicons name="remove-circle-outline" size={24} color={c.sub} />
          </Pressable>
        </View>
      </View>
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
