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
import * as ScreenCapture from "expo-screen-capture";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AppState, Platform, View } from "react-native";

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
  // ✅ hooks MUST be at the top
  const [blocked, setBlocked] = useState(false);

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

  // ✅ Screen protection logic
  useEffect(() => {
    // ANDROID — true Netflix behavior
    if (Platform.OS === "android") {
      ScreenCapture.preventScreenCaptureAsync();
    }

    // iOS — hide app in app switcher
    const appStateSub = AppState.addEventListener("change", (state) => {
      setBlocked(state !== "active");
    });

    // iOS — react to screenshots
    const screenshotSub =
      Platform.OS === "ios"
        ? ScreenCapture.addScreenshotListener(() => {
            setBlocked(true);
            setTimeout(() => setBlocked(false), 1000);
          })
        : null;

    return () => {
      if (Platform.OS === "android") {
        ScreenCapture.allowScreenCaptureAsync();
      }
      appStateSub.remove();
      screenshotSub?.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <NotificationProvider>
      <LoadingProvider>
        <SideNavProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
              animationDuration: 220,
            }}
          />

          <GlobalLoader />

          {/* 🔒 BLACK OVERLAY (Netflix-style) */}
          {blocked && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#000",
                zIndex: 9999,
              }}
            />
          )}
        </SideNavProvider>
      </LoadingProvider>
    </NotificationProvider>
  );
}
