import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PANEL_COLLAPSED_Y = 120; // how much to push DOWN
const SCROLL_THRESHOLD = 16;


type Chapter = {
  id: string;
  title: string;
  subtopic_id: string;
  subtopics?: {
    codal_id: string;
  };
};


type ChapterSection = {
  id: string;
  section_number: number;
  content: string | null;
  type: "text" | "image";
  image_url: string | null;
};

export default function ChapterSectionsScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const router = useRouter();
  const { open } = useSideNav();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [sections, setSections] = useState<ChapterSection[]>([]);
  const [loading, setLoading] = useState(true);

  const panelTranslateY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const panelHidden = useRef(false);


  const [fontSize, setFontSize] = useState(15);
  const [lineHeight, setLineHeight] = useState(24);
  const [fontFamily, setFontFamily] = useState<
    "sans" | "serif"
    >("sans");

    const [lineSpacing, setLineSpacing] = useState(1.6);
    const [textAlign, setTextAlign] = useState<
    "left" | "justify"
    >("left");

    const lastSavedSection = useRef<number | null>(null);





  useEffect(() => {
    fetchChapterAndSections();
  }, []);

  const fetchChapterAndSections = async () => {
    try {
      // 1️⃣ Chapter title
      const { data: chap, error } = await supabase
        .from("chapters")
        .select(`
          id,
          title,
          subtopic_id,
          subtopics (
            codal_id
          )
        `)
        .eq("id", chapterId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setChapter(chap);


      // 2️⃣ Sections (ORDER IS CRITICAL)
      const { data } = await supabase
        .from("chapter_sections")
        .select(
          "id, section_number, content, type, image_url"
        )
        .eq("chapter_id", chapterId)
        .order("section_number", { ascending: true });

      if (error) {
        console.error("Sections error:", error);
        setSections([]);
        return;
      }

      setSections(data ?? []);
    } catch (e) {
      console.error("Failed to load chapter sections:", e);
    } finally {
      setLoading(false);
    }
  };

    const SCROLL_THRESHOLD = 20;
    const PANEL_HIDE_Y = -120;

    const onScroll = (event: any) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const diff = currentY - lastScrollY.current;

      // --- PANEL ANIMATION (unchanged) ---
      if (Math.abs(diff) > SCROLL_THRESHOLD) {
        if (diff > 0 && !panelHidden.current) {
          panelHidden.current = true;
          Animated.timing(panelTranslateY, {
            toValue: PANEL_COLLAPSED_Y,
            duration: 240,
            useNativeDriver: true,
          }).start();
        }

        if (diff < 0 && panelHidden.current) {
          panelHidden.current = false;
          Animated.timing(panelTranslateY, {
            toValue: 0,
            duration: 240,
            useNativeDriver: true,
          }).start();
        }
      }

      // --- PROGRESS TRACKING ---
      const estimatedSection = Math.floor(currentY / 300) + 1;

      if (estimatedSection !== lastSavedSection.current) {
        lastSavedSection.current = estimatedSection;
        saveProgress(estimatedSection);
      }

      lastScrollY.current = currentY;
    };


    const resolvedFontFamily = (() => {
        switch (fontFamily) {
            case "serif":
            return "Poppins_400Regular"; // replace later if you add serif font
            case "sans":
            default:
            return "Poppins_400Regular";
        }
    })();

    const saveProgress = async (sectionNumber = 1) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !chapter) return;

      await supabase
        .from("user_reading_progress")
        .upsert(
          {
            user_id: user.id,
            codal_id: chapter.subtopics?.codal_id ?? null,
            chapter_id: chapter.id,
            subtopic_id: chapter.subtopic_id,
            section_number: sectionNumber,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" } // important
        );
    };

    useEffect(() => {
      if (!loading && chapter) {
        saveProgress(1);
      }
    }, [loading, chapter]);





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

      <Text style={styles.pageTitle}>Illustrated Codals</Text>

      <TouchableOpacity style={styles.continueBtn}>
        <Text style={styles.continueText}>
          CONTINUE PREVIOUS SESSION
        </Text>
      </TouchableOpacity>


      {/* WHITE PANEL */}
      <Animated.View style={[styles.panel, { transform: [{ translateY: panelTranslateY }] }]}>
        <View style={styles.readerControls}>
            {/* Font Size */}
            <TouchableOpacity onPress={() => setFontSize((s) => Math.max(12, s - 1))}>
                <Text style={styles.controlBtn}>A−</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setFontSize((s) => Math.min(24, s + 1))}>
                <Text style={styles.controlBtn}>A+</Text>
            </TouchableOpacity>

            {/* Font Family */}
            <TouchableOpacity
                onPress={() =>
                setFontFamily((f) => (f === "sans" ? "serif" : "sans"))
                }
            >
                <Text style={styles.controlBtn}>
                {fontFamily === "sans" ? "Serif" : "Sans"}
                </Text>
            </TouchableOpacity>

            {/* Alignment */}
            <TouchableOpacity
                onPress={() =>
                setTextAlign((a) => (a === "left" ? "justify" : "left"))
                }
            >
                <Text style={styles.controlBtn}>
                {textAlign === "left" ? "Justify" : "Left"}
                </Text>
            </TouchableOpacity>
            </View>
        {/* BACK + CHAPTER TITLE */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#04183B" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {loading ? "Loading..." : chapter?.title}
          </Text>
        </View>

        {/* CONTENT */}
        <ScrollView showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
          {loading ? (
            <ActivityIndicator size="small" color="#04183B" />
          ) : (
            sections.map((section) => (
              <View key={section.id} style={styles.section}>
                {/* TEXT SECTION */}
                {section.type === "text" && section.content && (
                    section.content
                        .split(/\n\s*\n/) // split on blank lines
                        .map((para, index) => (
                        <Text
                            key={index}
                            style={[
                            styles.sectionText,
                            {
                                fontSize,
                                lineHeight: fontSize * lineSpacing,
                                textAlign,
                                fontFamily: resolvedFontFamily,
                                marginBottom: 12,
                            },
                            ]}
                        >
                            {para.trim()}
                        </Text>
                        ))
                    )}

                {/* IMAGE SECTION */}
                {section.type === "image" &&
                  section.image_url && (
                    <Image
                      source={{ uri: section.image_url }}
                      style={styles.sectionImage}
                      resizeMode="contain"
                    />
                  )}
              </View>
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
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ROOT */
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

  animatedHeader: {
    zIndex: 10,
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

  /* PANEL */
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,                 // 🔒 anchor to bottom
    top: 140,                  // max expanded height
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    },


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

  /* SECTIONS */
  section: {
    marginBottom: 18,
  },

  sectionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    lineHeight: 24,
    color: "#0F172A",
  },

  sectionImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  /* FOOTER */
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
  readerControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },

    controlBtn: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
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
