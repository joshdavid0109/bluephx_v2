import * as ScreenCapture from "expo-screen-capture";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useScreenSecurity } from "./ScreenSecurityContext";

export function useIOSScreenshotDetection() {
  const { setBlocked } = useScreenSecurity();

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    const sub = ScreenCapture.addScreenshotListener(() => {
      setBlocked(true);
      setTimeout(() => setBlocked(false), 1200);
    });

    return () => sub.remove();
  }, []);
}
