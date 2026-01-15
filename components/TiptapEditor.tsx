import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function TipTapEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div>
      {/* TOOLBAR */}
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>
      </div>

      {/* EDITOR */}
      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: 12,
          minHeight: 200,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
