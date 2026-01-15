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
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";


SplashScreen.preventAutoHideAsync();

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
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true, // ✅ REQUIRED
    shouldShowList: true,   // ✅ REQUIRED
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});



  if (!fontsLoaded) return null;

  return (
    <NotificationProvider>
      <LoadingProvider>
        <SideNavProvider>
          <Slot />
          <GlobalLoader />
        </SideNavProvider>
      </LoadingProvider>
    </NotificationProvider>
  );
}
