import * as ScreenCapture from "expo-screen-capture";
import { useEffect } from "react";
import { Platform } from "react-native";

export function useAndroidScreenLock() {
  useEffect(() => {
    if (Platform.OS === "android") {
      ScreenCapture.preventScreenCaptureAsync();
    }

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);
}
