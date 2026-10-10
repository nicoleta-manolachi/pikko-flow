import { categoryIcon } from "@/utils/categoryIcons";
import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import type { Category } from "@/db/schema";

type Props = {
  category: Category;
  count: number;
  accentColor: string;
  onPress: () => void; // new
  onEdit: () => void;
  onDelete: () => void;
};

export default function CategoryCard({
  category,
  count,
  accentColor,
  onPress,
  onEdit,
  onDelete,
}: Props) {
  const c = useColors();
  const ref = useRef<SwipeableMethods>(null);
  const icon = category.icon ?? categoryIcon(category.name);

  function confirmDelete() {
    Alert.alert(
      "Delete category?",
      count > 0
        ? `“${category.name}” will be removed. ${count} item${count > 1 ? "s" : ""} will become uncategorized.`
        : `“${category.name}” will be removed.`,
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
        if (dir === "right") onEdit();
        else confirmDelete();
      }}
      renderLeftActions={() => (
        <View
          style={[
            s.action,
            { backgroundColor: accentColor, alignItems: "flex-start" },
          ]}
        >
          <Ionicons name="create-outline" size={26} color="#fff" />
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
        style={[s.row, { backgroundColor: c.card, borderColor: c.border }]}
      >
        <View style={s.icon}>
          <Ionicons name={icon as any} size={24} color={accentColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 16, fontWeight: "600" }}>
            {category.name}
          </Text>
          <Text style={{ color: c.sub, fontSize: 13 }}>
            {count} item{count === 1 ? "" : "s"}
          </Text>
        </View>
      </Pressable>
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
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  action: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    borderRadius: 14,
  },
});
