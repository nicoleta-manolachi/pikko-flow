import { useColors } from "@/utils/theme";
import { Pressable, StyleSheet, Text } from "react-native";

export default function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, { backgroundColor: selected ? c.primary : c.chip }]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
    >
      <Text
        style={{
          color: selected ? c.onPrimary : c.text,
          fontSize: 13,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
  },
});
