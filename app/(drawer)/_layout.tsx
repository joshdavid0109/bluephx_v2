import SideNav from "@/components/SideNav";
import { useSideNav } from "@/context/SideNavContext";
import { Stack } from "expo-router";
import { Animated, Dimensions, TouchableOpacity, View } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

export default function DrawerLayout() {
  const { isOpen, translateX, close } = useSideNav();

  return (
    <View style={{ flex: 1 }}>
      {/* Main Content */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Animated Drawer Overlay */}
      {isOpen && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99,
          }}
          onPress={close}
          activeOpacity={1}
        />
      )}

      {/* Animated Drawer */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: "#0B1E3A",
          zIndex: 100,
          transform: [{ translateX }],
        }}
      >
        <SideNav />
      </Animated.View>
    </View>
  );
}
