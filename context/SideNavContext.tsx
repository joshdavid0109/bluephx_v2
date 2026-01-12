import React, { createContext, useContext, useRef, useState } from "react";
import { Animated, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

type SideNavContextType = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
  translateX: Animated.Value;
};

const SideNavContext = createContext<SideNavContextType | null>(null);

export function SideNavProvider({ children }: { children: React.ReactNode }) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(translateX, {
      toValue: -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setIsOpen(false));
  };

  console.log("SideNavContext file loaded");


  return (
    <SideNavContext.Provider
      value={{ open, close, isOpen, translateX }}
    >
      {children}
    </SideNavContext.Provider>
  );
}

export function useSideNav() {
  const ctx = useContext(SideNavContext);
  if (!ctx) {
    throw new Error("useSideNav must be used inside SideNavProvider");
  }
  return ctx;
}
