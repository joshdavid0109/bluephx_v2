export function normalizeHtml(html: string) {
  if (!html) return html;

  // 1️⃣ Remove Quill junk
  html = html.replace(/<span[^>]*class="ql-ui"[^>]*><\/span>/g, "");

  // 2️⃣ Normalize bold+italic (any order)
  html = html
    .replace(/<(b|strong)>\s*<(i|em)>(.*?)<\/\2>\s*<\/\1>/gi, "<bi>$3</bi>")
    .replace(/<(i|em)>\s*<(b|strong)>(.*?)<\/\2>\s*<\/\1>/gi, "<bi>$3</bi>");

  return html;
}
