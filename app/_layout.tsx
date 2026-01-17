import { GlobalLoader } from "@/components/GlobalLoader";
import { LoadingProvider } from "@/context/LoadingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { SideNavProvider } from "@/context/SideNavContext";
import { requestNotificationPermission } from "@/lib/notification";
import {
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_700Bold_Italic,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

/* ---------------- NOTIFICATIONS ---------------- */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/* ---------------- ROOT LAYOUT ---------------- */

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_400Regular_Italic,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_700Bold_Italic,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <NotificationProvider>
      <LoadingProvider>
        <SideNavProvider>
          {/* 🔥 GLOBAL STACK CONTROLS ALL TRANSITIONS */}
          <Stack
            screenOptions={{
              headerShown: false,

              // ✅ FIXED TRANSITION FOR ALL SCREENS
              animation:
                Platform.OS === "ios"
                  ? "slide_from_right"
                  : "fade",

              animationDuration: 220,
            }}
          />

          <GlobalLoader />
        </SideNavProvider>
      </LoadingProvider>
    </NotificationProvider>
  );
}
