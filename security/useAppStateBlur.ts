import { useEffect } from "react";
import { AppState } from "react-native";
import { useScreenSecurity } from "./ScreenSecurityContext";

export function useAppStateBlur() {
  const { setBlocked } = useScreenSecurity();

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setBlocked(state !== "active");
    });

    return () => sub.remove();
  }, []);
}
