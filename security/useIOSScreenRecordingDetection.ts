import { useEffect } from "react";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import { useScreenSecurity } from "./ScreenSecurityContext";

export function useIOSScreenRecordingDetection() {
  const { setBlocked } = useScreenSecurity();

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    const emitter = new NativeEventEmitter(NativeModules.ScreenCapture);
    const sub = emitter.addListener(
      "UIScreenCapturedDidChange",
      (isCaptured: boolean) => {
        setBlocked(isCaptured);
      }
    );

    return () => sub.remove();
  }, []);
}
