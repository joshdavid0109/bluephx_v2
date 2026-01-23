import { StyleSheet, View } from "react-native";
import { useScreenSecurity } from "./ScreenSecurityContext";

export function ScreenBlockOverlay() {
  const { blocked } = useScreenSecurity();

  if (!blocked) return null;

  return <View style={styles.overlay} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 9999,
  },
});
