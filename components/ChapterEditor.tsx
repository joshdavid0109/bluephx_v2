import { useEffect, useRef } from "react";
import DocsToolbar from "../components/DocsToolBar";

type Props = {
  html: string;
  onChange: (html: string) => void;
};

export default function ChapterEditor({ html, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external HTML → editor
  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerHTML !== html
    ) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toolbar */}
      <DocsToolbar editorRef={editorRef} />

      {/* Editable document */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() =>
          onChange(editorRef.current?.innerHTML || "")
        }
        style={{
          flex: 1,
          padding: 32,
          outline: "none",
          fontSize: 15,
          lineHeight: 1.7,
        }}
      />
    </div>
  );
}
