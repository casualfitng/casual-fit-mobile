import { createContext, useContext, type ReactNode } from "react";

export type TabBarLayoutMode = "native" | "floating";

const TabBarLayoutContext = createContext<TabBarLayoutMode>("floating");

export function TabBarLayoutProvider({
  mode,
  children,
}: {
  mode: TabBarLayoutMode;
  children: ReactNode;
}) {
  return <TabBarLayoutContext.Provider value={mode}>{children}</TabBarLayoutContext.Provider>;
}

export function useTabBarLayoutMode() {
  return useContext(TabBarLayoutContext);
}
