import { useColors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { PlatformPressable } from "expo-router/react-navigation";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader, { greeting } from "@/components/layouts/ScreenHeader";
import type { Colors } from "@/utils/theme";
import { useSharedValue } from "react-native-reanimated";
import { HeaderScrollContext } from "@/context/headerScroll";

const BAR_HEIGHT = 72;
const SIDE_MARGIN = 16; // increase for a narrower bar
const BOTTOM_MARGIN = 16;
const INNER_PADDING = 6; // keeps the active pill off the bar's edges

const SUBTITLES: Record<string, string> = {
  index: "Ready for your grocery shopping?",
  pantry: "Ready for your grocery shopping?",
  stores: "Where are you shopping today?",
  categories: "Organize your groceries",
  shopping: "Your list for the store",
};

type ColorKey = keyof Colors;

type RouteHeaderColors = { route: string; bg: ColorKey; text: ColorKey };
type RouteNavColors = { route: string; base: ColorKey; bg100: ColorKey };

// header background + text/icon color, per screen
const HEADER_COLORS: RouteHeaderColors[] = [
  { route: "index", bg: "beetroot", text: "lemon" },
  { route: "pantry", bg: "farmGreen", text: "lemonGreen" },
  { route: "stores", bg: "lemon", text: "beetroot" },
  { route: "categories", bg: "pumpkin", text: "beetroot" },
  { route: "shopping", bg: "lemonGreen", text: "farmGreen" },
];

// floating tab bar: active color + its 100-shade pill background, per screen
const NAV_COLORS: RouteNavColors[] = [
  { route: "index", base: "beetroot", bg100: "beetroot300" },
  { route: "pantry", base: "farmGreen", bg100: "farmGreen300" },
  { route: "stores", base: "beetroot", bg100: "lemon400" },
  { route: "categories", base: "beetroot", bg100: "pumpkin400" },
  { route: "shopping", base: "lemonGreen", bg100: "lemonGreen300" },
];

function findHeaderColors(c: Colors, routeName: string) {
  const entry = HEADER_COLORS.find((r) => r.route === routeName);
  return { bg: c[entry?.bg ?? "beetroot"], text: c[entry?.text ?? "card"] };
}

function findNavColors(c: Colors, routeName: string) {
  const entry = NAV_COLORS.find((r) => r.route === routeName);
  return {
    base: c[entry?.base ?? "beetroot"],
    bg100: c[entry?.bg100 ?? "chip"],
  };
}

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          left: SIDE_MARGIN,
          right: SIDE_MARGIN,
          bottom: insets.bottom + BOTTOM_MARGIN,
        },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: c.card }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const { base, bg100 } = findNavColors(c, route.name);
          const color = focused ? base : c.sub;
          const label =
            typeof options.title === "string" ? options.title : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <PlatformPressable
              key={route.key}
              onPress={onPress}
              pressColor="transparent"
              pressOpacity={1}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={label}
              style={[styles.item, focused && { backgroundColor: bg100 }]}
            >
              {options.tabBarIcon?.({ focused, color, size: 20 })}
              <Text
                numberOfLines={1}
                style={{
                  color,
                  fontSize: 11,
                  marginTop: 2,
                  fontWeight: focused ? "700" : "400",
                }}
              >
                {label}
              </Text>
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const headerScrollY = useSharedValue(0); // one shared value, read by ScreenHeader, written by each screen's list

  return (
    <HeaderScrollContext.Provider value={headerScrollY}>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          tabBarStyle: { position: "absolute" },
          sceneStyle: {
            backgroundColor: c.bg,
            paddingBottom: BAR_HEIGHT + insets.bottom + BOTTOM_MARGIN,
          },
          headerStyle: { backgroundColor: c.card },
          headerTintColor: c.text,
          headerTitleAlign: "center",
          headerShadowVisible: true,
          headerShown: true,
          header: ({ route, options }) => {
            const { bg, text } = findHeaderColors(c, route.name);
            return (
              <ScreenHeader
                title={
                  route.name === "index"
                    ? greeting()
                    : typeof options.title === "string"
                      ? options.title
                      : route.name
                }
                subtitle={SUBTITLES[route.name]}
                backgroundColor={bg}
                textColor={text}
                scrollY={headerScrollY}
              />
            );
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: "Pantry",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="file-tray-full-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: "Stores",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: "List",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="basket-outline" color={color} size={size} />
          ),
        }}
      />
      </Tabs>
    </HeaderScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute" },
  bar: {
    flexDirection: "row",
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    padding: INNER_PADDING,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: (BAR_HEIGHT - INNER_PADDING * 2) / 2,
  },
});
