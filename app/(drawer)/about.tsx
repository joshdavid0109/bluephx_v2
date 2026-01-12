import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.subtitle}>
          Blue Phoenix provides illustrated legal codals designed to make
          learning efficient, modern, and accessible.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#04183B",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 24,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 8,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
});
