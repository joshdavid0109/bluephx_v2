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
    onChange(html); // ONLY notify parent
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


  const attachImageResizeHandles = () => {
  editorRef.current
    ?.querySelectorAll(".img-wrapper")
    .forEach((wrapper) => {
      const img = wrapper.querySelector("img") as HTMLImageElement | null;
      const handle = wrapper.querySelector(".img-resize-handle") as HTMLDivElement | null;

      if (!img || !handle || handle.dataset.bound === "true") return;
      handle.dataset.bound = "true";

      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.body.style.userSelect = "none";
      };

      const onMouseMove = (e: MouseEvent) => {
        const newWidth = Math.max(120, startWidth + (e.clientX - startX));
        const newHeight = Math.max(80, startHeight + (e.clientY - startY));

        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;

        img.dataset.width = `${newWidth}`;
        img.dataset.height = `${newHeight}`;
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.userSelect = "auto";
        scheduleSave();
      };

      handle.addEventListener("mousedown", onMouseDown);
    });
};

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
      `
  <div
    class="img-wrapper"
    style="
      position: relative;
      display: inline-block;
      margin: 16px 0;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
    "
  >
  <img
    src="${publicUrl}"
    data-width="320"
    data-height="200"
    style="width:320px;height:200px;border-radius:12px;display:block;"
    draggable="false"
  />
  <div
    class="img-resize-handle"
    contenteditable="false"
    style="
      position:absolute;
      width:14px;
      height:14px;
      right:-6px;
      bottom:-6px;
      background:#2563EB;
      border-radius:50%;
      cursor:nwse-resize;
    "
  ></div>
</div>


      `
    );


    setTimeout(() => {
      editorRef.current
        ?.querySelectorAll("img")
        .forEach((img) => makeImageResizable(img as HTMLImageElement));
    });
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

  const makeImageResizable = (img: HTMLImageElement) => {
  if (img.dataset.resizable === "true") return;
  img.dataset.resizable = "true";

  img.draggable = false; // 🔥 IMPORTANT

  img.style.cursor = "nwse-resize";
  img.style.maxWidth = "100%";

  img.addEventListener("dragstart", (e) => {
    e.preventDefault();
  });


  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 🔥 THIS IS KEY

      
    startX = e.clientX;
    startY = e.clientY;
    startWidth = img.offsetWidth;
    startHeight = img.offsetHeight;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "none";
  };

  const onMouseMove = (e: MouseEvent) => {
    const newWidth = Math.max(120, startWidth + (e.clientX - startX));
    const newHeight = Math.max(80, startHeight + (e.clientY - startY));

    img.style.width = `${newWidth}px`;
    img.style.height = `${newHeight}px`;

    img.dataset.width = `${newWidth}`;
    img.dataset.height = `${newHeight}`;
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "auto";
    scheduleSave(); // 🔥 persist resize
  };

  img.addEventListener("mousedown", onMouseDown);
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

    const html = editorRef.current!.innerHTML;

    // 🔥 force parent to know a new section exists
    onChange(html);

    // DO NOT set lastHtmlRef here
    // DO NOT wait for input



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

    const html = editorRef.current!.innerHTML;

    // 🔥 force parent to know a new section exists
    onChange(html);
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
      attachImageResizeHandles();

      editorRef.current
        .querySelectorAll("img")
        .forEach((img) => makeImageResizable(img as HTMLImageElement));

      lastHtmlRef.current = html; // ✅ ONLY HERE
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
        background: "#ffffff",
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