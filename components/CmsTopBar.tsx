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

  // 1️⃣ Load codals
  useEffect(() => {
    supabase
      .from("codals")
      .select("codal_id, codal_title")
      .order("codal_title")
      .then(({ data }) => {
        setCodals(data ?? []);
      });
  }, []);

  // 2️⃣ Load subtopics when codal changes
  useEffect(() => {
    if (!selectedCodal) {
      setSubtopics([]);
      setChapters([]);
      onSubtopicChange(null);
      onChapterChange(null);
      return;
    }

    supabase
      .from("subtopics")
      .select("id, name")
      .eq("codal_id", selectedCodal)
      .order("name")
      .then(({ data }) => {
        setSubtopics(data ?? []);
      });
  }, [selectedCodal]);

  // 3️⃣ Load chapters when subtopic changes
  useEffect(() => {
    if (!selectedSubtopic) {
      setChapters([]);
      onChapterChange(null);
      return;
    }

    supabase
      .from("chapters")
      .select("id, title")
      .eq("subtopic_id", selectedSubtopic)
      .order("chapter_order")
      .then(({ data }) => {
        setChapters(data ?? []);
      });
  }, [selectedSubtopic]);

  return (
    <div
      style={{
        height: 56,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
      }}
    >
      {/* CODAL */}
      <select
        value={selectedCodal ?? ""}
        onChange={(e) =>
          onCodalChange(
            e.target.value || null
          )
        }
      >
        <option value="">Select codal</option>
        {codals.map((c) => (
          <option key={c.codal_id} value={c.codal_id}>
            {c.codal_title}
          </option>
        ))}
      </select>

      {/* SUBTOPIC */}
      <select
        value={selectedSubtopic ?? ""}
        disabled={!selectedCodal}
        onChange={(e) =>
          onSubtopicChange(
            e.target.value || null
          )
        }
      >
        <option value="">Select subtopic</option>
        {subtopics.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* CHAPTER */}
      <select
        value={selectedChapter ?? ""}
        disabled={!selectedSubtopic}
        onChange={(e) =>
          onChapterChange(
            e.target.value || null
          )
        }
      >
        <option value="">Select chapter</option>
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </div>
  );
}
