import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SubscriptionTermsScreen() {
  const router = useRouter();
  const { plan } = useLocalSearchParams<{ plan: string }>();

  const isYearly = plan === "yearly";

  const onAccept = () => {
    // Later: save plan, start billing, etc.
    router.replace("/(auth)"); // or next screen (auth / dashboard)
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Logo */}
        <View style={styles.logoContainer}>
        <Image
            source={{
            uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
            }}
            style={styles.logo}
            resizeMode="contain"
        />
        </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>
          {isYearly ? "Yearly Plan" : "Monthly Plan"}
        </Text>
        <Text style={styles.subtitle}>
          Review inclusions and terms before continuing
        </Text>

        {/* Inclusions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What’s Included</Text>

          <View style={styles.item}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>
              Full access to all Bar Exam subjects
            </Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>
              Unlimited practice questions & mock exams
            </Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>
              Regular updates aligned with Bar syllabus
            </Text>
          </View>

          {isYearly && (
            <View style={styles.item}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>
                Priority access to new features
              </Text>
            </View>
          )}
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>

          <Text style={styles.termText}>
            • Subscription renews automatically unless canceled at least
            24 hours before the end of the current period.
          </Text>

          <Text style={styles.termText}>
            • Payment will be charged to your account upon confirmation.
          </Text>

          <Text style={styles.termText}>
            • You can manage or cancel your subscription anytime in your
            account settings.
          </Text>

          <Text style={styles.termText}>
            • No refunds for unused portions of the subscription period.
          </Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <TouchableOpacity style={styles.primaryButton} onPress={onAccept}>
        <Text style={styles.primaryText}>
          Accept & Continue
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 28,
    fontFamily: "Poppins_800ExtraBold",
    color: "#0F172A",
    marginTop: 16,
  },

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

  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
    marginTop: 6,
    marginBottom: 24,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
    marginBottom: 12,
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  bullet: {
    fontSize: 18,
    lineHeight: 22,
    marginRight: 8,
    color: "#04183B",
  },

  itemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#334155",
  },

  termText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#475569",
    marginBottom: 10,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: "#04183B",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },

  primaryText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },
});
