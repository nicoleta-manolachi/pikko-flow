import { useColors } from "@/utils/theme";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visibleKey: number | null;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onTimeout: () => void;
};

export default function Snackbar({
  visibleKey,
  message,
  actionLabel,
  onAction,
  onTimeout,
}: Props) {
  const c = useColors();
  const timeoutRef = useRef(onTimeout);
  timeoutRef.current = onTimeout;

  useEffect(() => {
    if (visibleKey == null) return;
    const t = setTimeout(() => timeoutRef.current(), 5000);
    return () => clearTimeout(t);
  }, [visibleKey]);

  if (visibleKey == null) return null;
  return (
    <View style={[s.bar, { backgroundColor: c.text }]}>
      <Text style={{ color: c.bg, flex: 1 }} numberOfLines={1}>
        {message}
      </Text>
      <Pressable onPress={onAction} hitSlop={10}>
        <Text style={{ color: c.primary, fontWeight: "700" }}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: "row",
    padding: 14,
    borderRadius: 10,
    elevation: 6,
    gap: 12,
  },
});
