export function normalizeHtml(html: string) {
  if (!html) return html;

  /* 1️⃣ Remove Quill UI junk */
  html = html.replace(
    /<span\s+class="ql-ui"[^>]*>\s*<\/span>/gi,
    ""
  );

  /* 2️⃣ Normalize bold + italic → <bi> */
  html = html
    .replace(
      /<(b|strong)>\s*<(i|em)>(.*?)<\/\2>\s*<\/\1>/gi,
      "<bi>$3</bi>"
    )
    .replace(
      /<(i|em)>\s*<(b|strong)>(.*?)<\/\2>\s*<\/\1>/gi,
      "<bi>$3</bi>"
    );

  /* 3️⃣ Convert Quill size classes → inline font-size */
  html = html
    .replace(/class="([^"]*?)ql-size-small([^"]*?)"/gi, 'style="font-size:12px"')
    .replace(/class="([^"]*?)ql-size-large([^"]*?)"/gi, 'style="font-size:20px"')
    .replace(/class="([^"]*?)ql-size-huge([^"]*?)"/gi, 'style="font-size:26px"')
    .replace(/class="([^"]*?)ql-size-normal([^"]*?)"/gi, "");

  /* 4️⃣ Normalize all font-size → px */
  html = html.replace(
    /font-size\s*:\s*([\d.]+)(px|pt|em|rem)?/gi,
    (_, value) => {
      const size = Math.round(parseFloat(value));
      return size >= 8 ? `font-size:${size}px` : "";
    }
  );

  /* 🔥 5️⃣ CRITICAL FIX: Remove ALL font-size from spans when paragraph has font-size */
  html = html.replace(
    /<p([^>]*style="[^"]*font-size\s*:\s*\d+px[^"]*"[^>]*)>(.*?)<\/p>/gis,
    (fullMatch, pAttrs, content) => {
      // Remove font-size from ALL spans inside this paragraph
      const cleanedContent = content.replace(
        /<span([^>]*)style="([^"]*)"([^>]*)>/gi,
        (spanMatch, before, styleContent, after) => {
          // Remove font-size from the style
          const newStyle = styleContent
            .replace(/font-size\s*:\s*\d+px;?/gi, '')
            .trim()
            .replace(/;+/g, ';') // clean up multiple semicolons
            .replace(/^;|;$/g, ''); // remove leading/trailing semicolons
          
          if (newStyle) {
            return `<span${before}style="${newStyle}"${after}>`;
          } else {
            // No other styles, remove span entirely
            return '';
          }
        }
      );
      
      // Close any open spans that we removed opening tags for
      const finalContent = cleanedContent.replace(/<\/span>/gi, '');
      
      return `<p${pAttrs}>${finalContent}</p>`;
    }
  );

  /* 6️⃣ If NO paragraph font-size, lift it from span */
  html = html.replace(
    /<p(?![^>]*style="[^"]*font-size)([^>]*)>(.*?)<\/p>/gis,
    (fullMatch, pAttrs, content) => {
      // Find span with font-size
      const spanMatch = content.match(/<span[^>]*style="[^"]*font-size\s*:\s*(\d+)px[^"]*"[^>]*>(.*?)<\/span>/i);
      
      if (spanMatch) {
        const fontSize = spanMatch[1];
        const spanContent = spanMatch[2];
        
        // Check if the span wraps all the text content
        const textInP = content.replace(/<[^>]+>/g, '').trim();
        const textInSpan = spanContent.replace(/<[^>]+>/g, '').trim();
        
        if (textInP === textInSpan) {
          // Lift font-size to paragraph and remove span
          if (/style="/i.test(pAttrs)) {
            const newPAttrs = pAttrs.replace(/style="([^"]*)"/i, `style="font-size:${fontSize}px;$1"`);
            return `<p${newPAttrs}>${spanContent}</p>`;
          } else {
            return `<p style="font-size:${fontSize}px"${pAttrs}>${spanContent}</p>`;
          }
        }
      }
      
      return fullMatch;
    }
  );

  /* 7️⃣ Cleanup empty tags */
  html = html.replace(/<p[^>]*>\s*<\/p>/gi, "");
  html = html.replace(/<span[^>]*>\s*<\/span>/gi, "");

/* 8️⃣ Fix image sizing – FORCE white background, no gray bleed */
html = html.replace(
  /<img([^>]*)>/gi,
  (match, attrs) => {
    let cleanAttrs = attrs.replace(/\s*style="[^"]*"/gi, '');

    return `
      <div style="
        background-color: #ffffff;
        border-radius: 12px;
        margin: 16px auto;
        padding: 0;
        overflow: hidden;
        width: 100%;
      ">
        <img${cleanAttrs} style="
          width: 100%;
          height: 200px;
          object-fit: contain;
          display: block;
          background-color: #ffffff;
        ">
      </div>
    `;
  }
);



  return html;
}