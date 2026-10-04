import type { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const MAP: Record<string, IconName> = {
  produce: "nutrition-outline",
  vegetables: "nutrition-outline",
  veggies: "leaf-outline",
  fruit: "nutrition-outline",
  fruits: "nutrition-outline",
  organic: "leaf-outline",
  dairy: "water-outline",
  eggs: "egg-outline",
  cheese: "water-outline",
  meat: "restaurant-outline",
  beef: "restaurant-outline",
  poultry: "restaurant-outline",
  seafood: "fish-outline",
  fish: "fish-outline",
  bakery: "cafe-outline",
  bread: "cafe-outline",
  grains: "nutrition-outline",
  pantry: "file-tray-full-outline",
  spices: "flask-outline",
  condiments: "flask-outline",
  snacks: "fast-food-outline",
  sweets: "ice-cream-outline",
  dessert: "ice-cream-outline",
  candy: "ice-cream-outline",
  frozen: "snow-outline",
  drinks: "wine-outline",
  beverages: "wine-outline",
  alcohol: "beer-outline",
  coffee: "cafe-outline",
  household: "home-outline",
  cleaning: "sparkles-outline",
  laundry: "shirt-outline",
  bedding: "bed-outline",
  health: "medkit-outline",
  pharmacy: "medkit-outline",
  personalcare: "fitness-outline",
  baby: "happy-outline",
  pets: "paw-outline",
  petfood: "paw-outline",
};

export function categoryIcon(name: string): IconName {
  return MAP[name.trim().toLowerCase()] ?? "pricetag-outline";
}

// Grouped for the icon picker, so related icons sit together.
export const CATEGORY_ICON_GROUPS: { label: string; icons: IconName[] }[] = [
  {
    label: "Fruits & Vegetables",
    icons: [
      "nutrition-outline",
      "leaf-outline",
      "flower-outline",
      "rose-outline",
    ],
  },
  {
    label: "Meat & Seafood",
    icons: ["restaurant-outline", "fish-outline", "flame-outline"],
  },
  {
    label: "Dairy & Eggs",
    icons: ["water-outline", "egg-outline", "ice-cream-outline"],
  },
  {
    label: "Bakery & Pantry",
    icons: [
      "cafe-outline",
      "file-tray-full-outline",
      "flask-outline",
      "cube-outline",
      "basket-outline",
    ],
  },
  {
    label: "Snacks & Sweets",
    icons: [
      "fast-food-outline",
      "pizza-outline",
      "ice-cream-outline",
      "gift-outline",
    ],
  },
  {
    label: "Frozen",
    icons: ["snow-outline", "thermometer-outline"],
  },
  {
    label: "Drinks",
    icons: ["wine-outline", "beer-outline", "cafe-outline", "water-outline"],
  },
  {
    label: "Household",
    icons: [
      "home-outline",
      "sparkles-outline",
      "trash-outline",
      "shirt-outline",
      "bed-outline",
      "flash-outline",
    ],
  },
  {
    label: "Health & Care",
    icons: [
      "medkit-outline",
      "bandage-outline",
      "fitness-outline",
      "heart-outline",
    ],
  },
  {
    label: "Baby & Pets",
    icons: ["happy-outline", "paw-outline"],
  },
  {
    label: "Other",
    icons: [
      "pricetag-outline",
      "pricetags-outline",
      "star-outline",
      "cart-outline",
      "bag-outline",
    ],
  },
];

// Flat list, kept for anything that still imports the old export name.
export const CATEGORY_ICON_CHOICES: IconName[] = CATEGORY_ICON_GROUPS.flatMap(
  (g) => g.icons,
);
