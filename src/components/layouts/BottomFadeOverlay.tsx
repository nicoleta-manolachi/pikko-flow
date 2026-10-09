// components/layouts/BottomFadeOverlay.tsx
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { useColors } from "@/utils/theme";

type Props = {
  height?: number;
  bottomOffset?: number; // how far up from the screen's bottom edge the fade should sit
};

export default function BottomFadeOverlay({ height = 60, bottomOffset = 0 }: Props) {
  const c = useColors();
  return (
    <LinearGradient
      colors={[`${c.bg}00`, `${c.bg}CC`, c.bg]}
      locations={[0, 0.6, 1]}
      pointerEvents="none"
      style={[styles.fade, { height, bottom: bottomOffset }]}
    />
  );
}

const styles = StyleSheet.create({
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});