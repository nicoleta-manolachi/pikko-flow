import { createContext, useContext } from "react";
import type { SharedValue } from "react-native-reanimated";

export const HeaderScrollContext = createContext<SharedValue<number> | null>(
  null,
);

export function useHeaderScrollY() {
  const ctx = useContext(HeaderScrollContext);
  if (!ctx)
    throw new Error(
      "useHeaderScrollY must be used within HeaderScrollContext.Provider",
    );
  return ctx;
}
