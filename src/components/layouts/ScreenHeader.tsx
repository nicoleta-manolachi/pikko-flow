import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

type Props = {
  title: string;
  subtitle?: string;
  backgroundColor: string;
  textColor?: string;
  onActionPress?: () => void;
  scrollY: SharedValue<number>;
};

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

const COLLAPSE_RANGE = 80; // px scrolled over which the header fully collapses

export default function ScreenHeader({
  title,
  subtitle,
  backgroundColor,
  textColor,
  onActionPress,
  scrollY,
}: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const fg = textColor ?? c.beetroot200;

  const containerStyle = useAnimatedStyle(() => ({
    paddingTop:
      insets.top +
      interpolate(
        scrollY.value,
        [0, COLLAPSE_RANGE],
        [16, 10],
        Extrapolation.CLAMP,
      ),
    paddingBottom: interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [28, 14],
      Extrapolation.CLAMP,
    ),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [34, 20],
      Extrapolation.CLAMP,
    ),
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    height: interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [22, 0],
      Extrapolation.CLAMP,
    ),
    marginTop: interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [6, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const bellStyle = useAnimatedStyle(() => {
    const size = interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [56, 40],
      Extrapolation.CLAMP,
    );
    return { width: size, height: size, borderRadius: size / 2 };
  });

  return (
    <Animated.View style={[styles.wrap, { backgroundColor }, containerStyle]}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <Animated.Text
          style={[styles.title, { color: fg }, titleStyle]}
          numberOfLines={1}
        >
          {title}
        </Animated.Text>
        {!!subtitle && (
          <Animated.Text
            style={[styles.subtitle, { color: c.card }, subtitleStyle]}
            numberOfLines={1}
          >
            {subtitle}
          </Animated.Text>
        )}
      </View>
      <Animated.View style={bellStyle}>
        <Pressable
          onPress={onActionPress}
          style={[styles.bell, { backgroundColor: fg }]}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={backgroundColor}
          />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: { fontWeight: "800" },
  subtitle: { fontSize: 15, overflow: "hidden" },
  bell: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
