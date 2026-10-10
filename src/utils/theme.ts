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
  beetroot900: "#A74987",
  beetroot800: "#B75D99",
  beetroot700: "#C476A9",
  beetroot600: "#CE8FB9",
  beetroot500: "#D9A9C8",
  beetroot400: "#E4C1D9",
  beetroot300: "#EFDBE7",
  beetroot200: "#FAF4F8",

  chilliPaper: "#bd1f42",
  chilliPaper900: "#DA244B",
  chilliPaper800: "#E04063",
  chilliPaper700: "#E55E7B",
  chilliPaper600: "#EA7B93",
  chilliPaper500: "#EE99AB",
  chilliPaper400: "#F3B7C4",
  chilliPaper300: "#F7D5DC",
  chilliPaper200: "#FCF2F4",

  pumpkin: "#f5943d",
  pumpkin900: "#F69F54",
  pumpkin800: "#F7AC6A",
  pumpkin700: "#F9B87F",
  pumpkin600: "#FAC598",
  pumpkin500: "#FAD1AD",
  pumpkin400: "#FAD1AD",
  pumpkin300: "#FDEADA",
  pumpkin200: "#FEF7F0",

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
  lightGreen900: "#E7ECA3",
  lightGreen800: "#EAEEAD",
  lightGreen700: "#ECF0B7",
  lightGreen600: "#EFF2C1",
  lightGreen500: "#F3F4CB",
  lightGreen400: "#F5F6D5",
  lightGreen300: "#F7F8DF",
  lightGreen200: "#F9FAE9",

  lemonGreen: "#aed143",
  lemonGreen900: "#B7D658",
  lemonGreen800: "#C1DC6D",
  lemonGreen700: "#C9E083",
  lemonGreen600: "#D2E698",
  lemonGreen500: "#DCEBAD",
  lemonGreen400: "#E5F0C3",
  lemonGreen300: "#EEF6D8",
  lemonGreen200: "#F8FBEE",

  lettuce: "#2aa049",
  lettuce900: "#33BE58",
  lettuce800: "#47CE6B",
  lettuce700: "#63D682",
  lettuce600: "#7FDD99",
  lettuce500: "#9CE5B0",
  lettuce400: "#B9ECC7",
  lettuce300: "#D5F4DD",
  lettuce200: "#F2FCF4",

  farmGreen: "#156048",
  farmGreen900: "#1F8765",
  farmGreen800: "#26AD82",
  farmGreen700: "#2FD2A0",
  farmGreen600: "#58DAB0",
  farmGreen500: "#7CE3C2",
  farmGreen400: "#A5EBD4",
  farmGreen300: "#CAF3E6",
  farmGreen200: "#F1FCF8",

  bg: "#F7F7F7",
  offwhite: "#F7F7F7",
  card: "#F7F7F7",
  text: "#19191FFF",
  sub: "#939C96",
  border: "#DEE1E6",
  danger: "#F06A6A",
  warn: "#F0A830",
  edit: "#8FA8D8",
  chip: "#636AE817",
};
const dark: typeof light = {
  // BeetrootBeetroot
  beetroot: "#8e3f74",
  beetroot900: "#A74987",
  beetroot800: "#B75D99",
  beetroot700: "#C476A9",
  beetroot600: "#CE8FB9",
  beetroot500: "#D9A9C8",
  beetroot400: "#E4C1D9",
  beetroot300: "#EFDBE7",
  beetroot200: "#FAF4F8",

  chilliPaper: "#bd1f42",
  chilliPaper900: "#DA244B",
  chilliPaper800: "#E04063",
  chilliPaper700: "#E55E7B",
  chilliPaper600: "#EA7B93",
  chilliPaper500: "#EE99AB",
  chilliPaper400: "#F3B7C4",
  chilliPaper300: "#F7D5DC",
  chilliPaper200: "#FCF2F4",

  pumpkin: "#f5943d",
  pumpkin900: "#F69F54",
  pumpkin800: "#F7AC6A",
  pumpkin700: "#F9B87F",
  pumpkin600: "#FAC598",
  pumpkin500: "#FAD1AD",
  pumpkin400: "#FAD1AD",
  pumpkin300: "#FDEADA",
  pumpkin200: "#FEF7F0",

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
  lightGreen900: "#E7ECA3",
  lightGreen800: "#EAEEAD",
  lightGreen700: "#ECF0B7",
  lightGreen600: "#EFF2C1",
  lightGreen500: "#F3F4CB",
  lightGreen400: "#F5F6D5",
  lightGreen300: "#F7F8DF",
  lightGreen200: "#F9FAE9",

  lemonGreen: "#aed143",
  lemonGreen900: "#B7D658",
  lemonGreen800: "#C1DC6D",
  lemonGreen700: "#C9E083",
  lemonGreen600: "#D2E698",
  lemonGreen500: "#DCEBAD",
  lemonGreen400: "#E5F0C3",
  lemonGreen300: "#EEF6D8",
  lemonGreen200: "#F8FBEE",

  lettuce: "#2aa049",
  lettuce900: "#33BE58",
  lettuce800: "#47CE6B",
  lettuce700: "#63D682",
  lettuce600: "#7FDD99",
  lettuce500: "#9CE5B0",
  lettuce400: "#B9ECC7",
  lettuce300: "#D5F4DD",
  lettuce200: "#F2FCF4",

  farmGreen: "#156048",
  farmGreen900: "#1F8765",
  farmGreen800: "#26AD82",
  farmGreen700: "#2FD2A0",
  farmGreen600: "#58DAB0",
  farmGreen500: "#7CE3C2",
  farmGreen400: "#A5EBD4",
  farmGreen300: "#CAF3E6",
  farmGreen200: "#F1FCF8",

  bg: "#F7F7F7",
  offwhite: "#F7F7F7",
  card: "#F7F7F7",
  text: "#19191FFF",
  sub: "#939C96",
  border: "#DEE1E6",
  danger: "#F06A6A",
  warn: "#F0A830",
  edit: "#8FA8D8",
  chip: "#636AE817",
};

export type Colors = typeof light;
export const useColors = (): Colors =>
  useColorScheme() === "dark" ? dark : light;

export const priorityColor: Record<Priority, string> = {
  Low: "#4C9F70",
  Medium: "#E0A100",
  High: "#D64545",
};

export const TAB_BAR_HEIGHT = 72;
export const TAB_BAR_MARGIN = 16;
export const EXTRA_CLEARANCE = 16;

export const TAB_BAR_CLEARANCE =
  TAB_BAR_HEIGHT + TAB_BAR_MARGIN + EXTRA_CLEARANCE * 2;

export const LIST_BOTTOM_PADDING = TAB_BAR_CLEARANCE + EXTRA_CLEARANCE * 2;
