"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextType {
  selectedTab: Tab | null;
  setSelectedTab: (tab: Tab | null) => void;
  activeFeed: string;
  setActiveFeed: (feed: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [activeFeed, setActiveFeed] = useState<string>("explore");

  return (
    <NavigationContext.Provider
      value={{
        selectedTab,
        setSelectedTab,
        activeFeed,
        setActiveFeed,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
