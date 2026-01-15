import NotificationBell from "@/components/NotificationBell";
import { useSideNav } from "@/context/SideNavContext";
import { Feather } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  const { open } = useSideNav();

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


      <Text style={styles.pageTitle}>About Us</Text>

      {/* WHITE PANEL */}
      <View style={styles.panel}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* INTRO */}
          <Text style={styles.sectionTitle}>Who We Are</Text>
          <Text style={styles.paragraph}>
            Blue Phoenix is an educational platform designed to help law students
            and reviewees understand complex legal codals through clear,
            illustrated, and structured content.
          </Text>

          {/* WHAT WE DO */}
          <Text style={styles.sectionTitle}>What We Do</Text>
          <Text style={styles.paragraph}>
            We transform dense legal provisions into easy-to-follow chapters,
            illustrations, and discussions — making learning more efficient,
            engaging, and practical.
          </Text>

          {/* WHY */}
          <Text style={styles.sectionTitle}>Why Blue Phoenix</Text>
          <Text style={styles.paragraph}>
            Studying law should not feel overwhelming. Blue Phoenix was built to
            support smarter preparation, better retention, and confident exam
            performance.
          </Text>

          {/* MISSION */}
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            To empower learners with accessible, well-structured legal knowledge
            that supports both academic success and real-world application.
          </Text>

          {/* VISION */}
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.paragraph}>
            To become a trusted digital companion for legal education — where
            understanding comes first.
          </Text>

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

  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#04183B",
    marginTop: 12,
    marginBottom: 6,
  },

  paragraph: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 10,
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
