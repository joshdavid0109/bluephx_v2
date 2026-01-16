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

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  const blocks = Array.from(
    wrapper.querySelectorAll("[data-section-id]")
  );

  // 1️⃣ Extract current section IDs that we're about to save
  const currentIds: string[] = [];
  
  // 2️⃣ Build upsert payload
  const payload = blocks
    .flatMap((block, index) => {
      const id = block.getAttribute("data-section-id");
      const type = block.getAttribute("data-type");

      if (!id || type !== "text") return [];

      currentIds.push(id);

      const editable = block.querySelector('[contenteditable="true"]');
      if (!editable) return [];

      const content = editable.innerHTML;
      const sections: any[] = [];

      // Parse the content for images
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      
      const images = Array.from(tempDiv.querySelectorAll("img"));
      
      if (images.length === 0) {
        // No images, just save the text section
        return [{
          id,
          chapter_id: selectedChapter,
          section_number: index,
          type: "text",
          content: content,
          image_url: null,
        }];
      }

      // Split content by images
      let textBeforeImage = "";
      let currentNode = tempDiv.firstChild;
      let sectionIndex = 0;

      while (currentNode) {
        if (currentNode.nodeName === "IMG") {
          const img = currentNode as HTMLImageElement;
          const imageUrl = img.src;

          // Save any text before this image
          if (textBeforeImage.trim()) {
            const textId = sectionIndex === 0 ? id : `${id}-text-${sectionIndex}`;
            currentIds.push(textId);
            sections.push({
              id: textId,
              chapter_id: selectedChapter,
              section_number: index + sectionIndex,
              type: "text",
              content: textBeforeImage,
              image_url: null,
            });
            sectionIndex++;
          }

          // Save the image section
          const imageId = `${id}-img-${sectionIndex}`;
          currentIds.push(imageId);
          sections.push({
            id: imageId,
            chapter_id: selectedChapter,
            section_number: index + sectionIndex,
            type: "image",
            content: null,
            image_url: imageUrl,
          });
          sectionIndex++;

          textBeforeImage = "";
        } else {
          // Accumulate text content
          const div = document.createElement("div");
          div.appendChild(currentNode.cloneNode(true));
          textBeforeImage += div.innerHTML;
        }

        currentNode = currentNode.nextSibling;
      }

      // Save any remaining text after last image
      if (textBeforeImage.trim()) {
        const textId = sectionIndex === 0 ? id : `${id}-text-${sectionIndex}`;
        currentIds.push(textId);
        sections.push({
          id: textId,
          chapter_id: selectedChapter,
          section_number: index + sectionIndex,
          type: "text",
          content: textBeforeImage,
          image_url: null,
        });
      }

      return sections;
    })
    .filter(Boolean);

  // 3️⃣ Delete removed sections
  if (currentIds.length > 0) {
    await supabase
      .from("chapter_sections")
      .delete()
      .eq("chapter_id", selectedChapter)
      .not("id", "in", `(${currentIds.join(",")})`);
  }

  // 4️⃣ Re-number all sections sequentially
  const numberedPayload = payload.map((section, idx) => ({
    ...section,
    section_number: idx,
  }));

  // 5️⃣ Upsert all sections
  await supabase
    .from("chapter_sections")
    .upsert(numberedPayload, { onConflict: "id" });
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
        gridTemplateColumns:
          window.innerWidth < 1100 ? "1fr" : "minmax(520px, 1.3fr) auto",
        columnGap: 24,
        background: "#F1F5F9",
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

      {/* /* RIGHT — MOBILE PREVIEW */ }
      <div style={{ paddingTop: 24, textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 12 }}>
          Mobile Preview
        </div>

        <div style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
          <div
            style={{
              width: 320,
              height: 680,
              borderRadius: 32,
              border: "10px solid #0F172A",
              overflow: "hidden",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Phone header - fixed */}
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

            {/* Scrollable content - like a real phone */}
            <div 
              style={{ 
                flex: 1, 
                overflowY: "auto",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch", // smooth scrolling on iOS
              }}
            >
              <ChapterReader sections={previewSections} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
