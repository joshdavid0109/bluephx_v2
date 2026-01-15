type Props = {
  editorRef: React.RefObject<HTMLDivElement>;
};

export default function DocsToolbar({ editorRef }: Props) {
  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const preventBlur = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: 8,
        borderBottom: "1px solid #E5E7EB",
        background: "#F8FAFC",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <button onMouseDown={preventBlur} onClick={() => exec("bold")}>B</button>
      <button onMouseDown={preventBlur} onClick={() => exec("italic")}>I</button>
      <button onMouseDown={preventBlur} onClick={() => exec("underline")}>U</button>

      <button onMouseDown={preventBlur} onClick={() => exec("insertUnorderedList")}>•</button>
      <button onMouseDown={preventBlur} onClick={() => exec("insertOrderedList")}>1.</button>
      <button onMouseDown={preventBlur} onClick={() => exec("underline")}>U</button>

<button onMouseDown={preventBlur} onClick={() => exec("strikeThrough")}>S</button>

<button onMouseDown={preventBlur} onClick={() => exec("formatBlock", "blockquote")}>
  ❝
</button>

<button onMouseDown={preventBlur} onClick={() => exec("insertHTML", "<code></code>")}>
  {"</>"}
</button>

<button onMouseDown={preventBlur} onClick={() => exec("removeFormat")}>
  Clear
</button>


      <select
        onMouseDown={preventBlur}
        onChange={(e) => exec("formatBlock", e.target.value)}
      >
        <option value="p">Normal</option>
        <option value="h2">Heading</option>
        <option value="h3">Subheading</option>
      </select>
    </div>
  );
}
