import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function QuillEditor({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
      },
    });

    quill.root.innerHTML = value;

    quill.on("text-change", () => {
      onChange(quill.root.innerHTML);
    });

    quillRef.current = quill;
  }, []);

  // Sync external changes
  useEffect(() => {
    if (
      quillRef.current &&
      quillRef.current.root.innerHTML !== value
    ) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return <div ref={containerRef} />;
}
