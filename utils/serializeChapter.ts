import type { ChapterSection } from "@/types/chapter";

export function serializeChapter(sections: ChapterSection[]) {
  return sections
    .map((s) => {
      if (s.type === "image" && s.image_url) {
        return `
          <div
            data-section-id="${s.id}"
            data-type="image"
            contenteditable="false"
            style="margin:16px 0"
          >
            <img
              src="${s.image_url}"
              style="max-width:100%;border-radius:12px"
            />
          </div>
        `;
      }

      return `
        <div data-section-id="${s.id}" data-type="text">
          ${s.content || "<p><br /></p>"}
        </div>
      `;
    })
    .join("");
}
