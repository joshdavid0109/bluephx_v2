import NotificationBell from "@/components/NotificationBell";
import { useSideNav } from "@/context/SideNavContext";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* Enable layout animation on Android */
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ---------- DATA ---------- */

const FAQS = [
  {
    q: "What is Blue Phoenix?",
    a: "Blue Phoenix is an educational platform that provides illustrated and structured legal codals to help students understand complex legal concepts more easily.",
  },
  {
    q: "Who can use this app?",
    a: "The app is designed for law students, reviewees, and anyone who wants a clearer and more practical approach to studying codals.",
  },
  {
    q: "Are the codals updated?",
    a: "Yes. Codals and materials are maintained and updated to reflect current laws and revisions whenever applicable.",
  },
  {
    q: "Can I continue where I left off?",
    a: "Yes. The app automatically saves your reading progress so you can continue from your last viewed chapter.",
  },
  {
    q: "Is an internet connection required?",
    a: "An internet connection is required to sync progress, access discussions, and load new content.",
  },
  {
    q: "What is Peer Review and Discussion?",
    a: "It is a community space where users can ask questions, share insights, and discuss legal topics with fellow learners.",
  },
];

/* ---------- SCREEN ---------- */

export default function FAQsScreen() {
  const { open } = useSideNav();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* LEFT */}
        <TouchableOpacity onPress={() => open()}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>

        {/* RIGHT GROUP */}
        <View style={styles.headerRight}>
          <NotificationBell />

          <Image
            source={{
              uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
            }}
            style={styles.headerLogo}
          />
        </View>
      </View>


      <Text style={styles.pageTitle}>FAQs</Text>

      {/* WHITE PANEL */}
      <View style={styles.panel}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {FAQS.map((item, index) => {
            const open = activeIndex === index;

            return (
              <View key={index} style={styles.card}>
                <TouchableOpacity
                  style={styles.questionRow}
                  onPress={() => toggle(index)}
                >
                  <Text style={styles.question}>{item.q}</Text>
                  <Feather
                    name={open ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#04183B"
                  />
                </TouchableOpacity>

                {open && (
                  <Text style={styles.answer}>{item.a}</Text>
                )}
              </View>
            );
          })}

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Feather name="globe" size={16} color="#63B3ED" />
              <Text style={styles.footerText}>www.bluephoenix.com</Text>
            </View>

            <View style={styles.footerRow}>
              <Feather name="facebook" size={16} color="#63B3ED" />
              <Text style={styles.footerText}>
                Blue Phoenix Illustrated Reviewers
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#04183B",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },


  headerLogo: {
    width: 48,
    height: 48,
  },

  logo: {
    width: 40,
    height: 40,
  },

  pageTitle: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 22,
    fontFamily: "Poppins_800ExtraBold",
    color: "#FFFFFF",
  },

  /* PANEL */
  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  /* FAQ CARD */
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  question: {
    flex: 1,
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#04183B",
    marginRight: 10,
  },

  answer: {
    marginTop: 10,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },

  /* FOOTER */
  footer: {
    marginTop: 24,
    alignItems: "center",
    paddingBottom: 16,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  footerText: {
    marginLeft: 6,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#04183B",
  },
});
