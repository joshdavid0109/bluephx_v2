import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SubscriptionScreen() {
  const router = useRouter();

  const onSelectMonthly = () => {
    router.push({
      pathname: "/(subscription)/terms",
      params: { plan: "monthly" },
    });
  };

  const onSelectYearly = () => {
    router.push({
      pathname: "/(subscription)/terms",
      params: { plan: "yearly" },
    });
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={{
            uri: "https://firebasestorage.googleapis.com/v0/b/bluephx-3ee80.firebasestorage.app/o/Blue%20Modern%20Digital%20Marketing%20Agency%20Facebook%20Post%20(1).png?alt=media&token=e4733e47-16bc-43d6-b6a2-f54653512c2e",
          }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Go Premium</Text>
        <Text style={styles.subtitle}>
          Unlock full access to Bar Exam Reviewer
        </Text>
      </View>

      {/* Yearly (Recommended) */}
      <View style={[styles.card, styles.recommendedCard]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BEST VALUE</Text>
        </View>

        <Text style={styles.planName}>Yearly Plan</Text>

        <View style={styles.priceRow}>
          <Text style={styles.currency}>₱</Text>
          <Text style={styles.price}>2,999</Text>
        </View>

        <Text style={styles.period}>per year · save 17%</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onSelectYearly}
        >
          <Text style={styles.primaryText}>Continue Yearly</Text>
        </TouchableOpacity>
      </View>

      {/* Monthly */}
      <View style={styles.card}>
        <Text style={styles.planName}>Monthly Plan</Text>

        <View style={styles.priceRow}>
          <Text style={styles.currencyMuted}>₱</Text>
          <Text style={styles.priceMuted}>299</Text>
        </View>

        <Text style={styles.period}>per month</Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onSelectMonthly}
        >
          <Text style={styles.secondaryText}>Continue Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Cancel anytime · Secure payment
      </Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    paddingHorizontal: 20,
  },

  /* Logo */
  logoContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },

  /* Header */
  header: {
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 32,
    fontFamily: "Poppins_800ExtraBold",
    color: "#04183B",
  },

  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
  },

  /* Cards */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },

  recommendedCard: {
    borderWidth: 2,
    borderColor: "#04183B",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#04183B",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },

  badgeText: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },

  planName: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 10,
  },

  currency: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#04183B",
    marginBottom: 6,
    marginRight: 2,
  },

  price: {
    fontSize: 42,
    fontFamily: "Poppins_800ExtraBold",
    color: "#04183B",
  },

  currencyMuted: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#94A3B8",
    marginBottom: 6,
    marginRight: 2,
  },

  priceMuted: {
    fontSize: 36,
    fontFamily: "Poppins_800ExtraBold",
    color: "#334155",
  },

  period: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
    marginTop: 4,
    marginBottom: 18,
  },

  /* Buttons */
  primaryButton: {
    backgroundColor: "#35AAD7",
    borderRadius: 16,
    paddingVertical: 14,
  },

  primaryText: {
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },

  secondaryButton: {
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    paddingVertical: 14,
  },

  secondaryText: {
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
  },

  /* Footer */
  footer: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#94A3B8",
    marginTop: 8,
  },
});
