import type { Priority } from "@/db/schema";
import { useColorScheme } from "react-native";
// #78966A
const light = {
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
