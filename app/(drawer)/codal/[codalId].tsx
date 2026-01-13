import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Subtopic = {
  id: string;
  title: string;
};

export default function CodalDetailScreen() {
  const { codalId } = useLocalSearchParams<{ codalId: string }>();
  const router = useRouter();
  const { open } = useSideNav();

  const [codalTitle, setCodalTitle] = useState("");
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCodalAndSubtopics();
  }, []);

 const fetchCodalAndSubtopics = async () => {
  try {
    console.log("codalId:", codalId);

    // 1️⃣ Fetch codal
    const {
      data: codal,
      error: codalError,
    } = await supabase
      .from("codals")
      .select("codal_id, codal_title")
      .eq("codal_id", codalId)
      .single();

    if (codalError) {
      console.error("Codal error:", codalError);
      return;
    }

    setCodalTitle(codal.codal_title);

    // 2️⃣ Fetch subtopics (FIXED)
    const {
      data: subs,
      error: subError,
    } = await supabase
      .from("subtopics")
      .select("id, name, codal_id")
      .eq("codal_id", codalId);

    if (subError) {
      console.error("Subtopics error:", subError);
      setSubtopics([]);
      return;
    }

    console.log("Subtopics:", subs);
    const mappedSubtopics = (subs ?? []).map((sub: any) => ({
      id: sub.id,
      title: sub.name,
    }));
    setSubtopics(mappedSubtopics);
  } catch (e) {
    console.error("Fetch failed:", e);
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={open}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>

        <Image
          source={{
            uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
          }}
          style={styles.logo}
        />
      </View>

      {/* TITLE */}
      <Text style={styles.pageTitle}>Illustrated Codals</Text>

      {/* CONTINUE */}
      <TouchableOpacity style={styles.continueBtn}>
        <Text style={styles.continueText}>
          CONTINUE PREVIOUS SESSION
        </Text>
      </TouchableOpacity>

      {/* WHITE PANEL */}
      <View style={styles.panel}>
        {/* BACK + CODAL NAME */}
        <View style={styles.codalHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#04183B" />
          </TouchableOpacity>

          <Text style={styles.codalTitle}>
            {loading ? "Loading..." : codalTitle}
          </Text>
        </View>

        {/* SUBTOPICS */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="small" color="#04183B" />
          ) : (
            subtopics.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.subtopicBtn}
                onPress={() =>
                  router.push(`/subtopic/${item.id}`)
                }
              >
                <Text style={styles.subtopicText}>
                  {item.title.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))
          )}

          {/* FOOTER */}
          <View style={styles.links}>
            <View style={styles.linkRow}>
              <Feather name="globe" size={16} color="#63B3ED" />
              <Text style={styles.linkText}>
                www.bluephoenix.com
              </Text>
            </View>

            <View style={styles.linkRow}>
              <Feather name="facebook" size={16} color="#63B3ED" />
              <Text style={styles.linkText}>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
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

  continueBtn: {
    marginTop: 14,
    alignSelf: "center",
    backgroundColor: "#63B3ED",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 24,
  },

  continueText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    color: "#04183B",
    letterSpacing: 1,
  },

  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  codalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  codalTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
  },

  subtopicBtn: {
    backgroundColor: "#5FAED8",
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: "center",
  },

  subtopicText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },

  footer: {
    marginTop: 24,
    alignItems: "center",
  },

  footerLink: {
    fontSize: 12,
    color: "#5FAED8",
    marginVertical: 4,
  },
  links: {
    marginVertical: 20,
    alignItems: "center",
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  linkText: {
    marginLeft: 6,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#04183B",
  },
});
