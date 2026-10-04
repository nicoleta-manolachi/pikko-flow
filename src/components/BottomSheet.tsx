import { useColors } from "@/utils/theme";
import { useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type DimensionValue,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: DimensionValue;
};

const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 800;

export default function BottomSheet({
  visible,
  onClose,
  children,
  maxHeight = "80%",
}: Props) {
  const c = useColors();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) translateY.value = 0;
  }, [visible]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        translateY.value = withTiming(800, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 18 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* required: Modal opens a separate native window on Android, so gesture-handler
          needs its own root here — the one in _layout.tsx doesn't reach inside the Modal */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <Animated.View
          style={[s.sheet, { backgroundColor: c.bg, maxHeight }, animatedStyle]}
        >
          <GestureDetector gesture={pan}>
            <View style={s.handleArea}>
              <View style={s.handle} />
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
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
    // shadowOffset: { width: 0, height: -4 },
    borderColor: "#DEE1E6",
  },
  handleArea: { paddingVertical: 14, alignItems: "center" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ccc" },
});
