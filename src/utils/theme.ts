import type { Priority } from "@/db/schema";
import { useColorScheme } from "react-native";

// Beetroot - #8e3f74
// Chilli paper - #bd1f42
// Pumpkin - #f5943d
// Lemon - #f7c914
// Light green - #e5ea98
// Lemon green - #aed143
// Lettuce - #2aa049
// Farm green - #156048

const light = {
  // Beetroot
  beetroot: "#8e3f74",
  beetroot100: "#f4ecf1",

  chilliPaper: "#bd1f42",
  chilliPaper100: "#f8e9ec",

  pumpkin: "#f5943d",
  pumpkin100: "#fdead8",

  lemon: "#f7c914",
  lemon900: "#F7CF2C",
  lemon800: "#F9D449",
  lemon700: "#F9DB61",
  lemon600: "#FAE17D",
  lemon500: "#FBE797",
  lemon400: "#FCEDB2",
  lemon300: "#FEF3CC",
  lemon200: "#FEF9E7",

  lightGreen: "#e5ea98",
  lightGreen100: "#fafbea",

  lemonGreen: "#aed143",
  lemonGreen100: "#eff6d9",

  lettuce: "#2aa049",
  lettuce100: "#d4ecdb",

  farmGreen: "#156048",
  farmGreen100: "#d0dfda",

  bg: "#F5F7F5",
  card: "#FFFFFF",
  text: "#1B1F1D",
  sub: "#6B736E",
  border: "#E1E5E2",
  primary: "#b81817",
  primaryBg: "#F2F2FDFF",
  onPrimary: "#FFFFFF",
  danger: "#D64545",
  warn: "#E08A00",
  chip: "#E9EEEA",
  addedCart: "#D64545",
};
const dark: typeof light = {
  // Beetroot
  beetroot: "#8e3f74",
  beetroot100: "#f4ecf1",

  chilliPaper: "#bd1f42",
  chilliPaper100: "#f8e9ec",

  pumpkin: "#f5943d",
  pumpkin100: "#fdead8",

  lemon: "#f7c914",
  lemon900: "#F7CF2C",
  lemon800: "#F9D449",
  lemon700: "#F9DB61",
  lemon600: "#FAE17D",
  lemon500: "#FBE797",
  lemon400: "#FCEDB2",
  lemon300: "#FEF3CC",
  lemon200: "#FEF9E7",

  lightGreen: "#e5ea98",
  lightGreen100: "#fafbea",

  lemonGreen: "#aed143",
  lemonGreen100: "#eff6d9",

  lettuce: "#2aa049",
  lettuce100: "#d4ecdb",

  farmGreen: "#156048",
  farmGreen100: "#d0dfda",

  bg: "#F7F7F7",
  card: "#F7F7F7",
  text: "#19191FFF",
  sub: "#939C96",
  border: "#DEE1E6",
  primary: "#636AE8",
  primaryBg: "#ebebf2",
  onPrimary: "#F7F7F7",
  danger: "#F06A6A",
  warn: "#F0A830",
  chip: "#636AE817",
  addedCart: "#636AE8",
};

export type Colors = typeof light;
export const useColors = (): Colors =>
  useColorScheme() === "dark" ? dark : light;

export const priorityColor: Record<Priority, string> = {
  low: "#4C9F70",
  medium: "#E0A100",
  high: "#D64545",
};
