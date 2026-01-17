import { normalizeHtml } from "@/utils/normalizeHtml";
import React from "react";
import {
  Image,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHTML, {
  HTMLContentModel,
  HTMLElementModel,
} from "react-native-render-html";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

type ChapterSection = {
  id: string;
  section_number: number;
  content: string | null;
  type: "text" | "image";
  image_url: string | null;
  image_width?: number | null;
  image_height?: number | null;
};

type Props = {
  sections: ChapterSection[];
  fontSize?: number;
};

/* ---------------------------------- */
/* Component                          */
/* ---------------------------------- */

export function ChapterReader({
  sections,
  fontSize = 15,
}: Props) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  /* ---------------------------------- */
  /* Custom HTML models                 */
  /* ---------------------------------- */

  const customHTMLElementModels = {
    bi: HTMLElementModel.fromCustomModel({
      tagName: "bi",
      contentModel: HTMLContentModel.textual,
    }),
  };

  /* ---------------------------------- */
  /* Helpers                            */
  /* ---------------------------------- */

  const maxContentWidth = width - 32;

  const resolveImageWidth = (w?: number | null) => {
    if (!w || isNaN(w)) return maxContentWidth;
    return Math.min(w, maxContentWidth);
  };

  const resolveImageHeight = (
    w?: number | null,
    h?: number | null
  ) => {
    if (!w || !h) return undefined;
    return h;
  };

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */

  return (
    <View style={{ padding: 16 }}>
      {sections.map((section) => (
        <View key={section.id}>
          {/* TEXT SECTION */}
          {section.type === "text" && section.content ? (
            <RenderHTML
              contentWidth={maxContentWidth}
              source={{ html: normalizeHtml(section.content) }}
              customHTMLElementModels={customHTMLElementModels}
              enableCSSInlineProcessing={true}
              ignoredStyles={[]}
              allowedStyles={[
                "fontSize",
                "textAlign",
                "lineHeight",
                "marginTop",
                "marginBottom",
                "marginLeft",
                "marginRight",
                "maxWidth",
                "display",
                "width",
                "height",
              ]}
              enableExperimentalMarginCollapsing={true}
              systemFonts={[
                "Poppins_400Regular",
                "Poppins_400Regular_Italic",
                "Poppins_700Bold",
                "Poppins_700Bold_Italic",
              ]}
              baseStyle={{
                fontSize,
                color: "#0F172A",
                fontFamily: "Poppins_400Regular",
                textAlign: "justify",
              }}
              tagsStyles={{
                img: {
                  marginVertical: 16,
                  borderRadius: 12,
                },
                p: {
                  marginBottom: 8,
                  textAlign: "justify",
                },
                h2: {
                  fontSize: fontSize + 6,
                  fontFamily: "Poppins_700Bold",
                  marginTop: 18,
                  marginBottom: 10,
                },
                h3: {
                  fontSize: fontSize + 4,
                  fontFamily: "Poppins_700Bold",
                  marginTop: 14,
                  marginBottom: 8,
                },
                b: { fontFamily: "Poppins_700Bold" },
                strong: { fontFamily: "Poppins_700Bold" },
                i: { fontFamily: "Poppins_400Regular_Italic" },
                em: { fontFamily: "Poppins_400Regular_Italic" },
                bi: { fontFamily: "Poppins_700Bold_Italic" },
                u: { textDecorationLine: "underline" },
                s: { textDecorationLine: "line-through" },
                ul: {
                  paddingLeft: 22,
                  marginBottom: 10,
                },
                ol: {
                  paddingLeft: 22,
                  marginBottom: 10,
                },
                li: {
                  marginBottom: 6,
                  paddingLeft: 2,
                  alignSelf: "flex-start",
                },
                blockquote: {
                  borderLeftWidth: 3,
                  borderLeftColor: "#CBD5E1",
                  paddingLeft: 12,
                  marginVertical: 12,
                },
                code: {
                  fontFamily: "monospace",
                  backgroundColor: "#F1F5F9",
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  borderRadius: 4,
                },
              }}
              /* 🔥 Custom image renderer (HTML images) */
              renderers={{
                img: ({ tnode }) => {
                  const src = tnode.attributes.src;
                  if (!src) return null;

                  const w = Number(tnode.attributes["data-width"]);
                  const h = Number(tnode.attributes["data-height"]);

                  return (
                    <View style={{ alignItems: "center", marginVertical: 16 }}>
                      <Image
                        source={{ uri: src }}
                        style={{
                          width: resolveImageWidth(w),
                          height: resolveImageHeight(w, h),
                          aspectRatio:
                            w && h ? w / h : undefined,
                          borderRadius: 12,
                          backgroundColor: "#F1F5F9",
                        }}
                        resizeMode="contain"
                        onError={(e) =>
                          console.log("❌ Image load error:", src, e.nativeEvent.error)
                        }
                        onLoad={() =>
                          console.log("✅ Image loaded:", src)
                        }
                      />
                    </View>
                  );
                },
              }}
            />
          ) : null}

          {/* STANDALONE IMAGE SECTION */}
          {section.type === "image" && section.image_url ? (
            <View style={{ alignItems: "center", marginVertical: 16 }}>
              <Image
                source={{ uri: section.image_url }}
                style={{
                  width: resolveImageWidth(section.image_width),
                  height: resolveImageHeight(
                    section.image_width,
                    section.image_height
                  ),
                  aspectRatio:
                    section.image_width && section.image_height
                      ? section.image_width / section.image_height
                      : undefined,
                  borderRadius: 12,
                  backgroundColor: "#F1F5F9",
                }}
                resizeMode="contain"
                onError={(e) =>
                  console.log(
                    "❌ Image load error:",
                    section.image_url,
                    e.nativeEvent.error
                  )
                }
                onLoad={() =>
                  console.log("✅ Image loaded:", section.image_url)
                }
              />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
