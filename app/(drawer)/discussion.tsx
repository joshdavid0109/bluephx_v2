import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiscussionScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>
          Peer Review and Discussion
        </Text>
        <Text style={styles.subtitle}>
          Community discussions and peer reviews will be available soon.
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
    fontSize: 20,
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 8,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#64748B",
  },
});
