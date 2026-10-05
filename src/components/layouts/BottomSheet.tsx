import { createContext, useContext, useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type DimensionValue,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useColors } from "@/utils/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: DimensionValue;
};

const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 800;

// Lets a scrollable child report whether it's currently scrolled to the top.
// The sheet only drags closed when there's no child scroll content, or that
// content is already at offset 0 — otherwise the drag is left to the ScrollView.
const ScrollTopContext = createContext<SharedValue<number> | null>(null);

export default function BottomSheet({
  visible,
  onClose,
  children,
  maxHeight = "80%",
}: Props) {
  const c = useColors();
  const translateY = useSharedValue(0);
  const childScrollY = useSharedValue(0); // 0 if no scrollable child reports in

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      childScrollY.value = 0;
    }
  }, [visible]);

  const pan = Gesture.Pan()
    .activeOffsetY(10)
    .failOffsetY([-10, 999])
    .onUpdate((e) => {
      if (e.translationY > 0 && childScrollY.value <= 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (
        translateY.value > 0 &&
        (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY)
      ) {
        translateY.value = withTiming(800, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withTiming(0, {
          duration: 220,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      backdropColor="transparent"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              s.sheet,
              { backgroundColor: c.bg, maxHeight },
              animatedStyle,
            ]}
          >
            <View style={s.handleArea}>
              <View style={s.handle} />
            </View>
            <ScrollTopContext.Provider value={childScrollY}>
              {children}
            </ScrollTopContext.Provider>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { backgroundColor: "#ccc" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderColor: "#DEE1E6",
  },
  handleArea: { paddingVertical: 14, alignItems: "center" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc" },
});
