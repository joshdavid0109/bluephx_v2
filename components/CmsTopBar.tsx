import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Codal = {
  codal_id: string;
  codal_title: string;
};

type Subtopic = {
  id: string;
  name: string;
};

type Chapter = {
  id: string;
  title: string;
};

type Props = {
  selectedCodal: string | null;
  selectedSubtopic: string | null;
  selectedChapter: string | null;
  onCodalChange: (codal_id: string | null) => void;
  onSubtopicChange: (id: string | null) => void;
  onChapterChange: (id: string | null) => void;
};

export default function CmsTopBar({
  selectedCodal,
  selectedSubtopic,
  selectedChapter,
  onCodalChange,
  onSubtopicChange,
  onChapterChange,
}: Props) {
  const [codals, setCodals] = useState<Codal[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createType, setCreateType] =
    useState<"codal" | "subtopic" | "chapter">("codal");
  const [titleInput, setTitleInput] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- LOADERS ---------------- */

  const loadCodals = async () => {
    const { data } = await supabase
      .from("codals")
      .select("codal_id, codal_title")
      .order("codal_title");

    setCodals(data ?? []);
  };

  const loadSubtopics = async (codalId: string | null) => {
    if (!codalId) {
      setSubtopics([]);
      return;
    }

    const { data } = await supabase
      .from("subtopics")
      .select("id, name")
      .eq("codal_id", codalId)
      .order("name");

    setSubtopics(data ?? []);
  };

  const loadChapters = async (subtopicId: string | null) => {
    if (!subtopicId) {
      setChapters([]);
      return;
    }

    const { data } = await supabase
      .from("chapters")
      .select("id, title")
      .eq("subtopic_id", subtopicId)
      .order("chapter_order");

    setChapters(data ?? []);
  };

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    loadCodals();
  }, []);

  useEffect(() => {
    loadSubtopics(selectedCodal);
    onSubtopicChange(null);
    onChapterChange(null);
  }, [selectedCodal]);

  useEffect(() => {
    loadChapters(selectedSubtopic);
    onChapterChange(null);
  }, [selectedSubtopic]);

  /* ---------------- CREATE ---------------- */

  const handleCreate = async () => {
    if (!titleInput.trim()) return;
    setLoading(true);

    if (createType === "codal") {
      await supabase.from("codals").insert({
        codal_title: titleInput,
      });

      await loadCodals();
    }

    if (createType === "subtopic" && selectedCodal) {
      await supabase.from("subtopics").insert({
        name: titleInput,
        codal_id: selectedCodal,
      });

      await loadSubtopics(selectedCodal);
    }

    if (createType === "chapter" && selectedSubtopic) {
      await supabase.from("chapters").insert({
        title: titleInput,
        subtopic_id: selectedSubtopic,
      });

      await loadChapters(selectedSubtopic);
    }

    setLoading(false);
    setTitleInput("");
    setIsModalOpen(false);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (type: "codal" | "subtopic" | "chapter") => {
    if (!window.confirm(`Delete this ${type}? This cannot be undone.`)) return;

    if (type === "chapter" && selectedChapter) {
      await supabase.from("chapters").delete().eq("id", selectedChapter);
      onChapterChange(null);
      await loadChapters(selectedSubtopic);
    }

    if (type === "subtopic" && selectedSubtopic) {
      await supabase.from("chapters").delete().eq("subtopic_id", selectedSubtopic);
      await supabase.from("subtopics").delete().eq("id", selectedSubtopic);

      onSubtopicChange(null);
      onChapterChange(null);
      await loadSubtopics(selectedCodal);
      setChapters([]);
    }

    if (type === "codal" && selectedCodal) {
      const { data } = await supabase
        .from("subtopics")
        .select("id")
        .eq("codal_id", selectedCodal);

      const subIds = data?.map((s) => s.id) ?? [];

      if (subIds.length) {
        await supabase.from("chapters").delete().in("subtopic_id", subIds);
        await supabase.from("subtopics").delete().in("id", subIds);
      }

      await supabase.from("codals").delete().eq("codal_id", selectedCodal);

      onCodalChange(null);
      onSubtopicChange(null);
      onChapterChange(null);

      await loadCodals();
      setSubtopics([]);
      setChapters([]);
    }
  };

  /* ---------------- UI STYLES ---------------- */

  const selectStyle: React.CSSProperties = {
    height: 42,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    fontSize: 14,
    minWidth: 220,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const deleteBtn: React.CSSProperties = {
    height: 42,
    width: 42,
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "#fff",
    color: "#DC2626",
    cursor: "pointer",
    fontSize: 16,
  };

  /* ---------------- RENDER ---------------- */

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "14px 18px",
          borderBottom: "1px solid #E5E7EB",
          background: "#fff",
          flexWrap: "wrap",
        }}
      >
        {/* CODAL */}
        <div style={rowStyle}>
          <select
            value={selectedCodal ?? ""}
            style={selectStyle}
            onChange={(e) => {
              if (e.target.value === "__add__") {
                setCreateType("codal");
                setIsModalOpen(true);
                return;
              }
              onCodalChange(e.target.value || null);
            }}
          >
            <option value="">Codal</option>
            {codals.map((c) => (
              <option key={c.codal_id} value={c.codal_id}>
                {c.codal_title}
              </option>
            ))}
            <option value="__add__">➕ Add codal</option>
          </select>
          {selectedCodal && (
            <button style={deleteBtn} onClick={() => handleDelete("codal")}>
              ✕
            </button>
          )}
        </div>

        {/* SUBTOPIC */}
        <div style={rowStyle}>
          <select
            disabled={!selectedCodal}
            value={selectedSubtopic ?? ""}
            style={selectStyle}
            onChange={(e) => {
              if (e.target.value === "__add__") {
                setCreateType("subtopic");
                setIsModalOpen(true);
                return;
              }
              onSubtopicChange(e.target.value || null);
            }}
          >
            <option value="">Subtopic</option>
            {subtopics.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            <option value="__add__">➕ Add subtopic</option>
          </select>
          {selectedSubtopic && (
            <button style={deleteBtn} onClick={() => handleDelete("subtopic")}>
              ✕
            </button>
          )}
        </div>

        {/* CHAPTER */}
        <div style={rowStyle}>
          <select
            disabled={!selectedSubtopic}
            value={selectedChapter ?? ""}
            style={{ ...selectStyle, minWidth: 260 }}
            onChange={(e) => {
              if (e.target.value === "__add__") {
                setCreateType("chapter");
                setIsModalOpen(true);
                return;
              }
              onChapterChange(e.target.value || null);
            }}
          >
            <option value="">Chapter</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
            <option value="__add__">➕ Add chapter</option>
          </select>
          {selectedChapter && (
            <button style={deleteBtn} onClick={() => handleDelete("chapter")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 22,
              borderRadius: 16,
              width: 440,
            }}
          >
            <h3>Create {createType}</h3>

            <input
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder={`Enter ${createType} title`}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                padding: "0 14px",
                marginBottom: 16,
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button onClick={handleCreate} disabled={loading}>
                {loading ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
