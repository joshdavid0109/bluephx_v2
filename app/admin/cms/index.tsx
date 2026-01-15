import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import ChapterEditor from "@/components/ChapterEditor";
import { ChapterReader } from "@/components/ChapterReader";
import CmsTopBar from "@/components/CmsTopBar";

import { supabase } from "@/lib/supabase";
import { serializeChapter } from "@/utils/serializeChapter";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

type ChapterSection = {
  id: string;
  section_number: number;
  content: string | null;
  type: "text" | "image";
  image_url: string | null;
};



/* ---------------------------------- */
/* Debounce Helper                    */
/* ---------------------------------- */

function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let timer: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ---------------------------------- */
/* Page                               */
/* ---------------------------------- */

export default function CmsHome() {
  /* ---------------------------------- */
  /* Web only                           */
  /* ---------------------------------- */
  if (Platform.OS !== "web") {
    return <Redirect href="/" />;
  }

  /* ---------------------------------- */
  /* Selection state                    */
  /* ---------------------------------- */
  const [selectedCodal, setSelectedCodal] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  /* ---------------------------------- */
  /* Chapter data                       */
  /* ---------------------------------- */
  const [chapterTitle, setChapterTitle] = useState<string | null>(null);
  const [sections, setSections] = useState<ChapterSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);


  /* ---------------------------------- */
  /* Editor document                    */
  /* ---------------------------------- */
  const [docHtml, setDocHtml] = useState("");

  /* ---------------------------------- */
  /* Load chapter + sections            */
  /* ---------------------------------- */
  useEffect(() => {
    if (!selectedChapter) return;

    async function loadChapter() {
      const { data: chapter } = await supabase
        .from("chapters")
        .select("title")
        .eq("id", selectedChapter)
        .single();

      const { data: secs } = await supabase
        .from("chapter_sections")
        .select("*")
        .eq("chapter_id", selectedChapter)
        .order("section_number");

      setChapterTitle(chapter?.title ?? null);
      setSections(secs ?? []);
    }

    loadChapter();
  }, [selectedChapter]);

  /* ---------------------------------- */
  /* Convert sections → document        */
  /* ---------------------------------- */
  useEffect(() => {
    if (sections.length) {
      setDocHtml(serializeChapter(sections));
    } else {
      setDocHtml("");
    }
  }, [sections]);

  /* ---------------------------------- */
  /* Auto-save logic                    */
  /* ---------------------------------- */
  const saveChapter = debounce(async (html: string) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const blocks = wrapper.querySelectorAll("[data-section-id]");

    for (const block of Array.from(blocks)) {
      const id = block.getAttribute("data-section-id");
      const type = block.getAttribute("data-type");

      if (!id) continue;

      if (type === "text") {
        await supabase
          .from("chapter_sections")
          .update({ content: block.innerHTML })
          .eq("id", id);
      }
    }
  }, 1200);

  const saveChapterNow = async () => {
  if (!docHtml || !selectedChapter) return;

  setIsSaving(true);

  try {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = docHtml;

    const blocks = wrapper.querySelectorAll("[data-section-id]");

    for (const block of Array.from(blocks)) {
      const id = block.getAttribute("data-section-id");
      const type = block.getAttribute("data-type");

      if (!id) continue;

      if (type === "text") {
        await supabase
          .from("chapter_sections")
          .update({
            content: block.innerHTML,
          })
          .eq("id", id);
      }
    }

    alert("Chapter saved successfully");
  } catch (err) {
    console.error(err);
    alert("Failed to save chapter");
  } finally {
    setIsSaving(false);
  }
};


async function uploadSectionImage(
  file: File,
  sectionId: string
): Promise<string> {
  if (!selectedCodal || !selectedSubtopic || !selectedChapter) {
    throw new Error("Missing codal / subtopic / chapter");
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}.${ext}`;

  const filePath = [
    selectedCodal,
    selectedSubtopic,
    selectedChapter,
    `section-${sectionId}`,
    fileName,
  ]
    .map((p) => p.replace(/\s+/g, "_"))
    .join("/");

  const { error } = await supabase.storage
    .from("chapter-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("chapter-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

  /* ---------------------------------- */
  /* Layout                             */
  /* ---------------------------------- */

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
       gridTemplateColumns:
        window.innerWidth < 1100
          ? "1fr"
          : "minmax(520px, 1.3fr) auto",
      columnGap: 24,
        background: "#F1F5F9",
        paddingBottom: 80,
      }}
    >
      {/* ================================== */}
      {/* LEFT — GOOGLE DOCS EDITOR          */}
      {/* ================================== */}
      <div
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E5E7EB",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden", // 🔥 IMPORTANT
        }}
      >

        {/* Top CMS selector */}
        <div style={{ padding: 16, borderBottom: "1px solid #E5E7EB" }}>
          <CmsTopBar
            selectedCodal={selectedCodal}
            selectedSubtopic={selectedSubtopic}
            selectedChapter={selectedChapter}
            onCodalChange={setSelectedCodal}
            onSubtopicChange={setSelectedSubtopic}
            onChapterChange={setSelectedChapter}
          />
        </div>

        {/* Editor */}
        {!selectedChapter ? (
          <div style={{ padding: 24, color: "#64748B" }}>
            Select a chapter to start editing
          </div>
        ) : (
       <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <ChapterEditor
            html={docHtml}
            onChange={(html) => {
              setDocHtml(html);
              saveChapter(html);
            }}
            onImageUpload={uploadSectionImage}
          />
        </div>



        )}

        <div
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 20,
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 16px",
            borderTop: "1px solid #E5E7EB",
            background: "#FFFFFF",
          }}
        >
        <button
          onClick={saveChapterNow}
          disabled={isSaving}
          style={{
            padding: "10px 18px",
            background: isSaving ? "#94A3B8" : "#2563EB",
            color: "#FFFFFF",
            borderRadius: 8,
            fontWeight: 600,
            cursor: isSaving ? "not-allowed" : "pointer",
          }}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>

      </div>

      {/* RIGHT — MOBILE PREVIEW             */}
      {/* ================================== */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 24,
          gap: 12,
        }}
      >
        {/* Preview label (optional, CMS-only) */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#64748B",
            letterSpacing: 0.5,
          }}
        >
          Mobile Preview
        </div>

        {/* Phone frame */}
        <div
          style={{
            width: 390,
            height: 844,
            borderRadius: 40,
            border: "12px solid #111",
            overflow: "hidden",
            background: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ===== Mobile Header (PREVIEW ONLY) ===== */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #E5E7EB",
              fontSize: 16,
              fontWeight: 600,
              textAlign: "center",
              background: "#FFFFFF",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            {chapterTitle || "Untitled Chapter"}
          </div>

          {/* ===== Mobile Content ===== */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ChapterReader sections={sections} />
          </div>
        </div>
      </div>
    </div>
  );
}
