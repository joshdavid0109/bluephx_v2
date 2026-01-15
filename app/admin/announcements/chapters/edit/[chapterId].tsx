import { ChapterReader } from "@/components/ChapterReader";
import { supabase } from "@/lib/supabase";
import { Redirect, useLocalSearchParams } from "expo-router";
import "quill/dist/quill.bubble.css";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useQuill } from "react-quilljs";

type ChapterSection = {
  id: string;
  section_number: number;
  content: string | null;
  type: "text" | "image";
  image_url: string | null;
};

/* ---------------- TEXT SECTION EDITOR ---------------- */

function TextSectionEditor({
  section,
  onChange,
}: {
  section: ChapterSection;
  onChange: (id: string, content: string) => void;
}) {
  const { quill, quillRef } = useQuill({
    theme: "bubble",
  });

  // Load initial content + listen for edits
  useEffect(() => {
    if (!quill) return;

    quill.root.innerHTML = section.content || "";

    const handler = () => {
      onChange(section.id, quill.root.innerHTML);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [quill, section.id]);

  return (
    <div
      ref={quillRef}
      style={{
        minHeight: 120,
        fontSize: 16,
      }}
    />
  );
}

/* ---------------- MAIN PAGE ---------------- */

export default function ChapterEditorWithPreview() {
  const isWeb = Platform.OS === "web";
  if (!isWeb) return <Redirect href="/" />;

  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();

  const [sections, setSections] = useState<ChapterSection[]>([]);
  const [chapterTitle, setChapterTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    if (!chapterId) return;

    async function load() {
      // 1️⃣ Load ONE section to get chapter_id
      const { data: seed, error } = await supabase
        .from("chapter_sections")
        .select("chapter_id")
        .eq("id", chapterId)
        .single();

      if (error || !seed) {
        console.error("Failed to resolve chapter_id", error);
        return;
      }

      // 2️⃣ Load ALL sections for that chapter
      const { data: allSections } = await supabase
        .from("chapter_sections")
        .select("id, section_number, content, type, image_url")
        .eq("chapter_id", seed.chapter_id)
        .order("section_number", { ascending: true });

      // 3️⃣ Load chapter title
      const { data: chapter } = await supabase
        .from("chapters")
        .select("title")
        .eq("id", seed.chapter_id)
        .single();

      setSections(allSections ?? []);
      setChapterTitle(chapter?.title ?? null);
      setLoading(false);
    }

    load();
  }, [chapterId]);

  /* ---------------- UPDATE + AUTOSAVE ---------------- */

  const updateSection = (id: string, content: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, content } : s
      )
    );

    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(async () => {
      await supabase
        .from("chapter_sections")
        .update({ content })
        .eq("id", id);
    }, 600);
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Loading editor…</div>;
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        height: "100vh",
      }}
    >
      {/* LEFT — EDITOR */}
      <div
        style={{
          padding: 24,
          overflowY: "auto",
          borderRight: "1px solid #E5E7EB",
        }}
      >
        <h2 style={{ marginBottom: 24 }}>
          Editing: {chapterTitle}
        </h2>

        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              marginBottom: 36,
              paddingBottom: 24,
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            {section.type === "text" ? (
              <TextSectionEditor
                section={section}
                onChange={updateSection}
              />
            ) : (
              <div>
                <p style={{ marginBottom: 8 }}>
                  Image section
                </p>
                {section.image_url && (
                  <img
                    src={section.image_url}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT — LIVE MOBILE PREVIEW */}
      <div
        style={{
          padding: 24,
          background: "#F8FAFC",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 390,
            height: 844,
            borderRadius: 40,
            border: "12px solid #111",
            overflow: "hidden",
            background: "white",
          }}
        >
          <ChapterReader
            chapterTitle={chapterTitle ?? undefined}
            sections={sections}
          />
        </div>
      </div>
    </div>
  );
}
