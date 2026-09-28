import type { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const MAP: Record<string, IconName> = {
  produce: "nutrition-outline",
  vegetables: "nutrition-outline",
  fruit: "nutrition-outline",
  fruits: "nutrition-outline",
  dairy: "water-outline",
  meat: "restaurant-outline",
  beef: "restaurant-outline",
  bakery: "cafe-outline",
  pantry: "file-tray-full-outline",
  snacks: "fast-food-outline",
  drinks: "wine-outline",
  household: "home-outline",
};

export function categoryIcon(name: string): IconName {
  return MAP[name.trim().toLowerCase()] ?? "pricetag-outline";
}
