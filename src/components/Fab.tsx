import { TAB_BAR_CLEARANCE } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";

type Props = {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  backgroundColor: string;
  bottom?: number; // caller passes TAB_BAR_CLEARANCE so it never sits behind the floating tab bar
  accessibilityLabel: string;
  style?: ViewStyle;
};

export default function Fab({
  onPress,
  icon = "add",
  iconColor = "#fff",
  backgroundColor,
  bottom = TAB_BAR_CLEARANCE,
  accessibilityLabel,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.fab, { backgroundColor, bottom }, style]}
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={30} color={iconColor} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
});
