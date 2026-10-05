import { Pressable, StyleSheet, Text } from "react-native";
import { useColors } from "@/utils/theme";

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  activeBg?: string; // background when selected, defaults to c.primary
  activeText?: string; // text/icon color when selected, defaults to c.onPrimary
  inactiveBg?: string; // background when not selected, defaults to c.chip
};

export default function Chip({
  label,
  selected,
  onPress,
  activeBg,
  activeText,
  inactiveBg,
}: Props) {
  const c = useColors();
  const bg = selected ? (activeBg ?? c.beetroot) : (inactiveBg ?? c.chip);
  const text = selected ? (activeText ?? c.card) : c.text;

  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, { backgroundColor: bg }]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
    >
      <Text style={{ color: text, fontSize: 13, fontWeight: "500" }}>
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
