import { useEffect, useRef } from "react";
import DocsToolbar from "./DocsToolBar";

type Props = {
  html: string;
  onChange: (html: string) => void;
  onImageUpload: (file: File, sectionId: string) => Promise<string>;
};

export default function ChapterEditor({
  html,
  onChange,
  onImageUpload,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------- */
  /* Helpers                            */
  /* ---------------------------------- */

  const getCurrentSectionId = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    let node = sel.anchorNode as HTMLElement | null;

    while (node && node !== editorRef.current) {
      if (node instanceof HTMLElement && node.dataset.sectionId) {
        return node.dataset.sectionId;
      }
      node = node.parentElement;
    }

    return null;
  };

  const insertImageFromFile = async (file: File) => {
    const sectionId = getCurrentSectionId();
    if (!sectionId) {
      alert("Click inside a section before inserting an image.");
      return;
    }

    // 🔴 UPLOAD FIRST
    const publicUrl = await onImageUpload(file, sectionId);

    // ✅ INSERT ONLY AFTER UPLOAD
    document.execCommand(
      "insertHTML",
      false,
      `<img src="${publicUrl}" />`
    );
  };

  /* ---------------------------------- */
  /* PASTE HANDLER (CRITICAL FIX)       */
  /* ---------------------------------- */

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.clipboardData.items);

    const imageItem = items.find((i) => i.type.startsWith("image"));
    if (!imageItem) return;

    // 🔴 STOP browser from inserting blob image
    e.preventDefault();

    const file = imageItem.getAsFile();
    if (file) {
      await insertImageFromFile(file);
    }
  };

  /* ---------------------------------- */
  /* DROP HANDLER (CRITICAL FIX)        */
  /* ---------------------------------- */

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image")) return;

    // 🔴 STOP browser auto insert
    e.preventDefault();

    await insertImageFromFile(file);
  };

  /* ---------------------------------- */
  /* SYNC HTML → EDITOR                */
  /* ---------------------------------- */

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

 return (
  <div
    style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: "#F1F5F9", // 🧠 app background
    }}
  >
    {/* Toolbar */}
    <DocsToolbar editorRef={editorRef} />

    {/* Scrollable viewport */}
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        display: "flex",
        justifyContent: "center",
        padding: "24px 16px", // 🧠 breathing room
      }}
    >
      {/* Page / Phone canvas */}
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#FFFFFF",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          minHeight: "100%",
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => onChange(editorRef.current?.innerHTML || "")}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            padding: "clamp(20px, 4vw, 36px)",
            outline: "none",
            fontSize: "clamp(14px, 1.1vw, 15px)",
            lineHeight: 1.7,
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  </div>
);


}
