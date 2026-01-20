import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";

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

type SaveStatus = "idle" | "dirty" | "saving" | "saved";

/* ---------------------------------- */
/* Debounce Helper                    */
/* ---------------------------------- */

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

type PreviewDevice = "phone" | "tablet" | "ipad";

const PREVIEW_PRESETS: Record<
  PreviewDevice,
  { label: string; width: number; height: number; scale: number; radius: number }
> = {
  phone: {
    label: "Phone",
    width: 320,
    height: 680,
    scale: 0.85,
    radius: 32,
  },
  ipad: {
    label: "iPad",
    width: 768,
    height: 1024,
    scale: 0.55,
    radius: 18,
  },
  tablet: {
    label: "Tablet",
    width: 900,
    height: 1100,
    scale: 0.5,
    radius: 14,
  },
};


/* ---------------------------------- */
/* Page                               */
/* ---------------------------------- */

export default function CmsHome() {

  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("phone");
  const [leftWidth, setLeftWidth] = useState(640);
  const isDraggingRef = useRef(false);

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
  const [docHtml, setDocHtml] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  /* ---------------------------------- */
  /* Ensure first section exists        */
  /* ---------------------------------- */

  async function ensureInitialSection(chapterId: string) {
    const { data: existing } = await supabase
      .from("chapter_sections")
      .select("id")
      .eq("chapter_id", chapterId)
      .limit(1);

    if (existing && existing.length > 0) return;

    await supabase.from("chapter_sections").insert({
      id: crypto.randomUUID(),
      chapter_id: chapterId,
      section_number: 0,
      type: "text",
      content: "<p><br /></p>",
    });
  }

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

      await ensureInitialSection(selectedChapter);

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

  useEffect(() => {
  function onMouseMove(e: MouseEvent) {
    if (!isDraggingRef.current) return;

    const min = 420;
    const max = window.innerWidth - 360;

    setLeftWidth(Math.min(Math.max(e.clientX, min), max));
  }

  function onMouseUp() {
    isDraggingRef.current = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
}, []);


  /* ---------------------------------- */
  /* Preview sections                   */
  /* ---------------------------------- */

  const previewSections: ChapterSection[] = docHtml
    ? [
        {
          id: "preview",
          section_number: 0,
          type: "text",
          content: docHtml,
          image_url: null,
        },
      ]
    : sections;

  /* ---------------------------------- */
  /* Save pipeline (UPSERT)             */
  /* ---------------------------------- */

async function persistHtml(html: string) {
  if (!selectedChapter) return;

  const root = document.createElement("div");
  root.innerHTML = html;

  const blocks = Array.from(
    root.querySelectorAll<HTMLElement>("[data-section-id]")
  );

  const currentIds: string[] = [];
  const payload: any[] = [];

  blocks.forEach((block, index) => {
    const id = block.getAttribute("data-section-id");
    if (!id) return;

    const editable = block.querySelector<HTMLElement>(
      '[contenteditable="true"]'
    );
    if (!editable) return;

    currentIds.push(id);

    payload.push({
      id,
      chapter_id: selectedChapter,
      section_number: index,
      type: "text",
      content: editable.innerHTML?.trim() || "<p><br /></p>",
      image_url: null,
    });
  });

  // delete removed sections
  if (currentIds.length > 0) {
    await supabase
      .from("chapter_sections")
      .delete()
      .eq("chapter_id", selectedChapter)
      .not("id", "in", `(${currentIds.map(id => `"${id}"`).join(",")})`);
  }

  await supabase
    .from("chapter_sections")
    .upsert(payload, { onConflict: "id" });
}

  const saveChapter = debounce(async (html: string) => {
    setSaveStatus("saving");
    await persistHtml(html);
    setSaveStatus("saved");
  }, 1200);

  const saveChapterNow = async () => {
    if (!docHtml) return;

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      await persistHtml(docHtml);
      setSaveStatus("saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save chapter");
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------------------------- */
  /* Image upload                       */
  /* ---------------------------------- */

  async function uploadSectionImage(file: File, sectionId: string): Promise<string> {
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
        gridTemplateColumns: `${leftWidth}px 6px 1fr`,
        background: "#ffffff",
        paddingBottom: 80,
      }}
    >

      {/* LEFT — EDITOR */}
      <div
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E5E7EB",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
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

        {!selectedChapter ? (
          <div style={{ padding: 24, color: "#64748B" }}>
            Select a chapter to start editing
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ChapterEditor
              html={docHtml}
              onChange={(html) => {
                setDocHtml(html);
                setSaveStatus("dirty");
                saveChapter(html);
              }}
              onImageUpload={uploadSectionImage}
            />
          </div>
        )}

        {/* Bottom bar */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 16px",
            borderTop: "1px solid #E5E7EB",
            background: "#FFFFFF",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {saveStatus === "saving" && "Saving…"}
            {saveStatus === "saved" && "All changes saved"}
            {saveStatus === "dirty" && "Unsaved changes"}
          </div>

          <button
            onClick={saveChapterNow}
            disabled={isSaving}
            style={{
              padding: "10px 18px",
              background: isSaving ? "#94A3B8" : "#2563EB",
              color: "#FFFFFF",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      </div>

{/* DRAGGABLE DIVIDER */}
<div
  onMouseDown={() => {
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }}
  style={{
    width: 6,
    cursor: "col-resize",
    background: "#E5E7EB",
    position: "relative",
  }}
>
  {/* Visual handle */}
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 2,
      height: 32,
      borderRadius: 2,
      background: "#94A3B8",
    }}
  />
</div>

      {/* RIGHT — LIVE PREVIEW */}
<div style={{ paddingTop: 24, textAlign: "center" }}>
  {/* Header + selector */}
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    }}
  >
    {Object.entries(PREVIEW_PRESETS).map(([key, cfg]) => (
      <button
        key={key}
        onClick={() => setPreviewDevice(key as PreviewDevice)}
        style={{
          padding: "6px 12px",
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 6,
          border: "1px solid #E5E7EB",
          background:
            previewDevice === key ? "#2563EB" : "#FFFFFF",
          color:
            previewDevice === key ? "#FFFFFF" : "#334155",
          cursor: "pointer",
        }}
      >
        {cfg.label}
      </button>
    ))}
  </div>

  {/* Device frame */}
  {(() => {
    const cfg = PREVIEW_PRESETS[previewDevice];

    return (
      <div
        style={{
          transform: `scale(${cfg.scale})`,
          transformOrigin: "top center",
        }}
      >
        <div
          style={{
            width: cfg.width,
            height: cfg.height,
            borderRadius: cfg.radius,
            border: "10px solid #0F172A",
            overflow: "hidden",
            background: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #E5E7EB",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {chapterTitle || "Untitled Chapter"}
          </div>

          {/* Scrollable content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
              <ChapterReader sections={previewSections} />
            </View>
          </div>
        </div>
      </div>
    );
  })()}
</div>

    </div>
  );
}
