  import { ChapterReader } from "@/components/ChapterReader";
import NotificationBell from "@/components/NotificationBell";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PANEL_COLLAPSED_Y = 120;
const SCROLL_THRESHOLD = 20;

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
  const [chapterTitle, setChapterTitle] = useState<string | null>(null);

  const panelTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const panelHidden = useRef(false);

  const [fontSize, setFontSize] = useState(15);
  const [lineHeight, setLineHeight] = useState(24);
  const [textAlign, setTextAlign] = useState<"left" | "justify">("left");

  const resolvedFontFamily = "Poppins_400Regular";

  useEffect(() => {
    fetchChapterAndSections();
  }, []);

  // ADD THIS: Update reading progress when chapter loads
  useEffect(() => {
    if (chapter?.id && chapter?.subtopics?.codal_id) {
      updateReadingProgress(chapter.id, chapter.subtopics.codal_id);
    }
  }, [chapter?.id, chapter?.subtopics?.codal_id]);

  // ADD THIS FUNCTION: Update reading progress
  const updateReadingProgress = async (chapterId: string, codalId: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from("user_reading_progress")
      .upsert(
        {
          user_id: user.id,
          codal_id: codalId,
          chapter_id: chapterId,
          section_number: 1,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,chapter_id",
        }
      );

    if (error) {
      console.error("Error updating reading progress:", error);
    } else {
      console.log("✅ Reading progress updated successfully");
    }
  } catch (error) {
    console.error("Exception updating reading progress:", error);
  }
};

  const fetchChapterAndSections = async () => {
    setLoading(true);
    try {
      const { data: chap } = await supabase
        .from("chapters")
        .select(
          `
          id,
          title,
          subtopic_id,
          subtopics (
            codal_id
          )
        `
        )
        .eq("id", chapterId)
        .single();

      setChapter(chap);
      setChapterTitle(chap?.title ?? null);

      const { data } = await supabase
        .from("chapter_sections")
        .select("id, section_number, content, type, image_url")
        .eq("chapter_id", chapterId)
        .order("section_number");

      setSections(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (event: any) => {
  const currentY = event.nativeEvent.contentOffset.y;
  const diff = currentY - lastScrollY.current;

  if (Math.abs(diff) > SCROLL_THRESHOLD) {
    Animated.timing(panelTranslateY, {
      // 🔥 FIX: reverse the logic
      toValue: diff < 0 ? PANEL_COLLAPSED_Y : 0,
      duration: 240,
      useNativeDriver: true,
    }).start();

    panelHidden.current = diff < 0;
  }

  lastScrollY.current = currentY;
};


  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={open}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>

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

      {/* PANEL */}
      <Animated.View
        style={[
          styles.panel,
          { transform: [{ translateY: panelTranslateY }] },
        ]}
      >
        {/* CONTROLS */}
        <View style={styles.readerControls}>
          <TouchableOpacity onPress={() => setFontSize((s) => Math.max(12, s - 1))}>
            <Text style={styles.controlBtn}>A−</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFontSize((s) => Math.min(24, s + 1))}>
            <Text style={styles.controlBtn}>A+</Text>
          </TouchableOpacity>

        </View>

        {/* TITLE */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#04183B" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {loading ? "Loading..." : chapterTitle}
          </Text>
        </View>

        {/* CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#04183B" />
          ) : (
          <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <ChapterReader
              chapterTitle={chapterTitle ?? undefined}
              sections={sections}
              fontSize={fontSize}
              lineHeight={lineHeight}
              textAlign={textAlign}
              fontFamily={resolvedFontFamily}
            />
          </View>
          )}

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

/* ================= STYLES ================= */
// ... rest of your styles remain the same
/* ================= STYLES ================= */

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

  pageTitle: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 22,
    fontFamily: "Poppins_800ExtraBold",
    color: "#FFFFFF",
  },

  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 140,
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

  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  saveBtn: {
    backgroundColor: "#2563EB",
  },

  refreshBtn: {
    backgroundColor: "#E5E7EB",
  },

  actionText: {
    marginLeft: 6,
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
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
