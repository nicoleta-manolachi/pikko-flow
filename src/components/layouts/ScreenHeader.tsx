import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  subtitle?: string;
  backgroundColor: string;
  textColor?: string; // defaults to the app's normal text color
  onActionPress?: () => void;
};

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function ScreenHeader({
  title,
  subtitle,
  backgroundColor,
  textColor,
  onActionPress,
}: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const fg = textColor ?? c.beetroot200;

  return (
    <View
      style={[styles.wrap, { backgroundColor, paddingTop: insets.top + 16 }]}
    >
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text
            style={[styles.subtitle, { color: c.card, opacity: 0.9 }]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <Pressable
        onPress={onActionPress}
        style={[styles.bell, { backgroundColor: fg }]}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color={backgroundColor}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: { fontSize: 34, fontWeight: "800" },
  subtitle: { color: "#fff", fontSize: 18, marginTop: 6 },
  bell: {
    width: 48,
    height: 48,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
