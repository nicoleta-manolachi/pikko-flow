import { useCallback } from "react";
import { useFocusEffect } from "expo-router/react-navigation";
import { useAnimatedScrollHandler, withTiming } from "react-native-reanimated";
import { useHeaderScrollY } from "@/context/headerScroll";

// Attach to a screen's list/scroll view: tracks scroll offset into the shared header value.
export function useCollapsibleHeaderScrollHandler() {
  const scrollY = useHeaderScrollY();
  return useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
}

// Call once per screen: snaps the header back open when that tab regains focus,
// so switching tabs doesn't leave a collapsed header from a different screen's scroll state.
export function useResetHeaderOnFocus() {
  const scrollY = useHeaderScrollY();
  useFocusEffect(
    useCallback(() => {
      scrollY.value = withTiming(0, { duration: 200 });
    }, [scrollY]),
  );
}
