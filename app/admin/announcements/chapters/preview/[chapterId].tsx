import { ChapterReader } from "@/components/ChapterReader";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export default function ChapterPreview() {
  if (Platform.OS !== "web") return null;

  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();

  const [chapter, setChapter] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    if (!chapterId) return;

    async function load() {
      const { data: chap } = await supabase
        .from("chapters")
        .select("id, title")
        .eq("id", chapterId)
        .single();

      const { data: secs } = await supabase
        .from("chapter_sections")
        .select("id, section_number, content, type, image_url")
        .eq("chapter_id", chapterId)
        .order("section_number", { ascending: true });

        console.log(chap)

      setChapter(chap);
      setSections(secs || []);
    }

    load();
  }, [chapterId]);

  return (
    <div
      style={{
        width: 390,
        height: 844,
        margin: "auto",
        borderRadius: 40,
        border: "12px solid #111",
        overflow: "hidden",
        background: "white",
      }}
    >
      <ChapterReader
        chapterTitle={chapter?.title}
        sections={sections}
      />
    </div>
  );
}
