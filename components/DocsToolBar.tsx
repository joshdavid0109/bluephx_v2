type Props = {
  editorRef: React.RefObject<HTMLDivElement>;
};

export default function DocsToolbar({ editorRef }: Props) {
  const focus = () => editorRef.current?.focus();

  const exec = (cmd: string, val?: string) => {
    focus();
    document.execCommand(cmd, false, val);
  };

  const changeFontSize = (delta: number) => {
  focus();

  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  // Detect current font size
  let currentSize = 15;
  const parent =
    selection.anchorNode instanceof HTMLElement
      ? selection.anchorNode
      : selection.anchorNode?.parentElement;

  if (parent) {
    const computed = window.getComputedStyle(parent);
    const size = parseInt(computed.fontSize, 10);
    if (!isNaN(size)) currentSize = size;
  }

  const newSize = Math.max(10, Math.min(36, currentSize + delta));

  document.execCommand(
    "insertHTML",
    false,
    `<span style="font-size:${newSize}px;">${selection.toString()}</span>`
  );
};


  const setStyle = (style: string, value: string) => {
    focus();
    document.execCommand(
      "insertHTML",
      false,
      `<span style="${style}:${value};">${document.getSelection()?.toString() || ""}</span>`
    );
  };

  const setBlockStyle = (style: string, value: string) => {
    focus();
    document.execCommand("formatBlock", false, "p");
    document.execCommand("insertHTML", false, `<p style="${style}:${value};"></p>`);
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
        flexWrap: "wrap",
      }}
    >
      {/* Text style */}
      <button onMouseDown={preventBlur} onClick={() => exec("bold")}>B</button>
      <button onMouseDown={preventBlur} onClick={() => exec("italic")}>I</button>
      <button onMouseDown={preventBlur} onClick={() => exec("underline")}>U</button>
      <button onMouseDown={preventBlur} onClick={() => exec("strikeThrough")}>S</button>

      {/* Font size */}
      <button
        onMouseDown={preventBlur}
        onClick={() => changeFontSize(-2)}
      >
        A−
      </button>

      <button
        onMouseDown={preventBlur}
        onClick={() => changeFontSize(2)}
      >
        A+
      </button>


      {/* Alignment */}
      <button onMouseDown={preventBlur} onClick={() => exec("justifyLeft")}>⬅</button>
      <button onMouseDown={preventBlur} onClick={() => exec("justifyCenter")}>⬍</button>
      <button onMouseDown={preventBlur} onClick={() => exec("justifyRight")}>➡</button>
      <button onMouseDown={preventBlur} onClick={() => exec("justifyFull")}>☰</button>

      {/* Lists */}
      <button onMouseDown={preventBlur} onClick={() => exec("insertUnorderedList")}>•</button>
      <button onMouseDown={preventBlur} onClick={() => exec("insertOrderedList")}>1.</button>

      {/* Indent */}
      <button onMouseDown={preventBlur} onClick={() => exec("outdent")}>⇤</button>
      <button onMouseDown={preventBlur} onClick={() => exec("indent")}>⇥</button>

      {/* Headings */}
      <select
        onMouseDown={preventBlur}
        onChange={(e) => exec("formatBlock", e.target.value)}
      >
        <option value="p">Normal</option>
        <option value="h2">Heading</option>
        <option value="h3">Subheading</option>
      </select>

      {/* Line height */}
      <select
        onMouseDown={preventBlur}
        onChange={(e) =>
          exec(
            "insertHTML",
            `<span style="line-height:${e.target.value}; display:inline-block; width:100%"></span>`
          )
        }
      >
        <option value="">Line Height</option>
        <option value="1">1</option>
        <option value="1.25">1.25</option>
        <option value="1.5">1.5</option>
        <option value="1.75">1.75</option>
        <option value="2">2</option>
      </select>

      {/* Paragraph spacing */}
      <select
        onMouseDown={preventBlur}
        onChange={(e) =>
          exec(
            "insertHTML",
            `<p style="margin-bottom:${e.target.value}px;"></p>`
          )
        }
      >
        <option value="">Spacing</option>
        <option value="4">4px</option>
        <option value="8">8px</option>
        <option value="12">12px</option>
        <option value="16">16px</option>
        <option value="24">24px</option>
      </select>

      {/* Blockquote */}
      <button onMouseDown={preventBlur} onClick={() => exec("formatBlock", "blockquote")}>
        ❝
      </button>

      {/* Code */}
      <button
        onMouseDown={preventBlur}
        onClick={() => exec("insertHTML", "<code></code>")}
      >
        {"</>"}
      </button>

      {/* Clear */}
      <button onMouseDown={preventBlur} onClick={() => exec("removeFormat")}>
        Clear
      </button>
    </div>
  );
}
