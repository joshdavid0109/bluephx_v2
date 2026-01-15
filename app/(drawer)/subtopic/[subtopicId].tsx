import NotificationBell from "@/components/NotificationBell";
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
  name: string;
};

type Chapter = {
  id: string;
  title: string;
  chapter_order: number;
};
type Codal = {
  codal_id: string;
  codal_title: string;
};

export default function SubtopicScreen() {
  const { subtopicId } = useLocalSearchParams<{ subtopicId: string }>();
  const router = useRouter();
  const { open } = useSideNav();

  const [subtopic, setSubtopic] = useState<Subtopic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [codals, setCodals] = useState<Codal[]>([]);

  useEffect(() => {
    fetchSubtopicAndChapters();
  }, []);

    useEffect(() => {
    fetchCodals();
  }, []);

  const fetchSubtopicAndChapters = async () => {
    try {
      // 1️⃣ Fetch subtopic title
      const { data: sub, error: subError } = await supabase
        .from("subtopics")
        .select("id, name")
        .eq("id", subtopicId)
        .single();

      if (!subError && sub) {
        setSubtopic(sub);
      }

      // 2️⃣ Fetch chapters (FIXED TO YOUR SCHEMA)
      const { data: chaps, error: chapError } = await supabase
        .from("chapters")
        .select("id, title, chapter_order")
        .eq("subtopic_id", subtopicId)
        .order("chapter_order", { ascending: true });

      if (chapError) {
        console.error("Chapters error:", chapError);
        setChapters([]);
        return;
      }

      setChapters(chaps ?? []);
    } catch (e) {
      console.error("Failed to load chapters:", e);
    } finally {
      setLoading(false);
    }
  };

    const fetchCodals = async () => {
      const { data, error } = await supabase
        .from("codals")
        .select("codal_id, codal_title");
  
      console.log("Codals fetch data:", data);
      console.log("Codals fetch error:", error);
  
      if (!error && data) {
        setCodals(data);
      }
  
      setLoading(false);
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


      <Text style={styles.pageTitle}>Illustrated Codals</Text>

      <TouchableOpacity style={styles.continueBtn}>
        <Text style={styles.continueText}>
          CONTINUE PREVIOUS SESSION
        </Text>
      </TouchableOpacity>

      {/* WHITE PANEL */}
      <View style={styles.panel}>
        {/* BACK + SUBTOPIC NAME */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#04183B" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {loading ? "Loading..." : subtopic?.name}
          </Text>
        </View>

        {/* CHAPTERS */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="small" color="#04183B" />
          ) : (
            chapters.map((chapter) => (
              <TouchableOpacity
                key={chapter.id}
                style={styles.chapterBtn}
                onPress={() =>
                  router.push(`/chapter/${chapter.id}`)
                }
              >
                <Text style={styles.chapterText}>
                  {chapter.chapter_order}. {chapter.title}
                </Text>
              </TouchableOpacity>
            ))
          )}

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerLink}>
              🌐 www.bluephoenixreview.com
            </Text>
            <Text style={styles.footerLink}>
              📘 Blue Phoenix Illustrated Reviewers
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ================= ROOT ================= */
  root: {
    flex: 1,
    backgroundColor: "#04183B",
  },

  /* ================= HEADER ================= */
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

  /* ================= PANEL ================= */
  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  /* ================= SUBTOPIC HEADER ================= */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    marginLeft: 10,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
  },

  /* ================= CHAPTER BUTTON ================= */
  chapterBtn: {
    backgroundColor: "#5FAED8",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },

  chapterText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  /* ================= FOOTER ================= */
  footer: {
    marginTop: 24,
    alignItems: "center",
    paddingBottom: 16,
  },

  footerLink: {
    fontSize: 12,
    color: "#5FAED8",
    marginVertical: 4,
    fontFamily: "Poppins_400Regular",
  },

  /* ================= STATES ================= */
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#64748B",
    fontFamily: "Poppins_400Regular",
  },
});
