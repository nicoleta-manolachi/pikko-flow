import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedGradientLayer = Animated.createAnimatedComponent(LinearGradient);
const DURATION = 2000;

type Props = {
  onPress: (e: GestureResponderEvent) => void;
  colors: readonly [string, string, ...string[]];
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  children: React.ReactNode;
};

export default function AnimatedGradientFab({
  onPress,
  colors,
  style,
  accessibilityLabel,
  children,
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: DURATION, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const layerBStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <AnimatedGradientLayer
          colors={colors}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, layerBStyle]}
        />
      </View>
      <View style={s.content}>{children}</View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
});
