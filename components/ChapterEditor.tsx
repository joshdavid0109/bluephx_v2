import { useEffect, useRef } from "react";
import DocsToolbar from "./DocsToolBar";

const MOBILE_WIDTH = 390;

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
  const hydratedRef = useRef(false);
  const lastHtmlRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const scheduleSave = () => {
    if (!editorRef.current) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      const html = editorRef.current!.innerHTML;
      lastHtmlRef.current = html;
      onChange(html);
    }, 600);
  };

  /* ---------------------------------- */
  /* Font size controls                 */
  /* ---------------------------------- */

  const applyFontSize = (delta: number) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement("span");

    let currentSize = 15;

    const parentEl =
      selection.anchorNode instanceof HTMLElement
        ? selection.anchorNode
        : selection.anchorNode?.parentElement;

    if (parentEl) {
      const computed = window.getComputedStyle(parentEl);
      const size = parseInt(computed.fontSize, 10);
      if (!isNaN(size)) currentSize = size;
    }

    const newSize = Math.max(10, Math.min(36, currentSize + delta));
    span.style.fontSize = `${newSize}px`;

    span.appendChild(range.extractContents());
    range.insertNode(span);

    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);

    scheduleSave();
  };

  const increaseFontSize = () => applyFontSize(2);
  const decreaseFontSize = () => applyFontSize(-2);

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

  /* ---------------------------------- */
  /* Image insertion                    */
  /* ---------------------------------- */

  const insertImageFromFile = async (file: File) => {
    const sectionId = getCurrentSectionId();
    if (!sectionId) {
      alert("Click inside a section before inserting an image.");
      return;
    }

    const publicUrl = await onImageUpload(file, sectionId);

    document.execCommand(
      "insertHTML",
      false,
      `<img src="${publicUrl}" style="max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0;" />`
    );
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((i) => i.type.startsWith("image"));
    if (!imageItem) return;

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) await insertImageFromFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image")) return;

    e.preventDefault();
    await insertImageFromFile(file);
  };

  /* ---------------------------------- */
  /* Section logic                      */
  /* ---------------------------------- */

  const insertNewSectionAfter = (afterId: string) => {
    if (!editorRef.current) return;

    const current = editorRef.current.querySelector(
      `[data-section-id="${afterId}"]`
    );
    if (!current) return;

    const newId = crypto.randomUUID();

    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-section-id", newId);
    wrapper.setAttribute("data-type", "text");

    const editable = document.createElement("div");
    editable.contentEditable = "true";
    editable.innerHTML = "<p><br /></p>";

    wrapper.appendChild(editable);
    current.insertAdjacentElement("afterend", wrapper);

    injectFloatingControls();

    lastHtmlRef.current = editorRef.current.innerHTML;
    onChange(lastHtmlRef.current);

    const range = document.createRange();
    range.selectNodeContents(editable);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const removeSection = (sectionId: string) => {
    if (!editorRef.current) return;

    const section = editorRef.current.querySelector(
      `[data-section-id="${sectionId}"]`
    );
    if (!section) return;

    const all = editorRef.current.querySelectorAll("[data-section-id]");
    if (all.length <= 1) return;

    section.remove();

    injectFloatingControls();

    lastHtmlRef.current = editorRef.current.innerHTML;
    onChange(lastHtmlRef.current);
  };

  /* ---------------------------------- */
  /* Floating controls injection        */
  /* ---------------------------------- */

  const injectFloatingControls = () => {
    if (!editorRef.current) return;

    editorRef.current
      .querySelectorAll("[data-floating-controls]")
      .forEach((el) => el.remove());

    const sections = editorRef.current.querySelectorAll<HTMLElement>(
      "[data-section-id]"
    );

    sections.forEach((section) => {
      const id = section.dataset.sectionId;
      if (!id) return;

      section.style.position = "relative";

      const controls = document.createElement("div");
      controls.setAttribute("data-floating-controls", "true");
      controls.contentEditable = "false";

      Object.assign(controls.style, {
        position: "absolute",
        left: "50%",
        bottom: "-16px",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "8px",
        opacity: "0",
        transition: "opacity 0.15s ease",
        zIndex: "10",
        pointerEvents: "none",
      });

      const addBtn = document.createElement("button");
      addBtn.textContent = "+";
      Object.assign(addBtn.style, {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        border: "1px solid #CBD5E1",
        background: "#FFFFFF",
        cursor: "pointer",
        fontSize: "18px",
        fontWeight: "600",
        pointerEvents: "auto",
      });
      addBtn.onclick = () => insertNewSectionAfter(id);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "X";
      Object.assign(removeBtn.style, {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        border: "1px solid #CBD5E1",
        background: "#FFFFFF",
        cursor: "pointer",
        fontSize: "14px",
        pointerEvents: "auto",
      });
      removeBtn.onclick = () => removeSection(id);

      controls.appendChild(addBtn);
      controls.appendChild(removeBtn);
      section.appendChild(controls);

      section.addEventListener("mouseenter", () => {
        controls.style.opacity = "1";
      });

      section.addEventListener("mouseleave", () => {
        controls.style.opacity = "0";
      });
    });
  };

  /* ---------------------------------- */
  /* Sync HTML                          */
  /* ---------------------------------- */

  useEffect(() => {
    if (!editorRef.current) return;

    if (html !== lastHtmlRef.current) {
      editorRef.current.innerHTML = html;
      injectFloatingControls();
      lastHtmlRef.current = html;
    }
  }, [html]);

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#F1F5F9",
      }}
    >
      <style>
        {`
          /* Image styling for editor */
          [data-section-id] img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin: 16px 0;
            display: block;
          }
        `}
      </style>

      <DocsToolbar editorRef={editorRef} />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: MOBILE_WIDTH,
            transform: `scale(${Math.min(
              window.innerWidth / (MOBILE_WIDTH + 600),
              1
            )})`,
            transformOrigin: "top center",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              ref={editorRef}
              onInput={scheduleSave}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{
                padding: 20,
                fontSize: 15,
                lineHeight: 1.7,
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}