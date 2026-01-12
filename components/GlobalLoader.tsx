import { useLoading } from "@/context/LoadingContext";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function GlobalLoader() {
  const { isLoading, message } = useLoading();

  if (!isLoading) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  text: {
    marginTop: 12,
    color: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },
});
