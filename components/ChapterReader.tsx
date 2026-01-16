import { normalizeHtml } from "@/utils/normalizeHtml";
import React from "react";
import { Image, Platform, useWindowDimensions, View } from "react-native";
import RenderHTML, {
  HTMLContentModel,
  HTMLElementModel,
} from "react-native-render-html";

type ChapterSection = {
  id: string;
  section_number: number;
  content: string | null;
  type: "text" | "image";
  image_url: string | null;
};

type Props = {
  sections: ChapterSection[];
  fontSize?: number;
};

export function ChapterReader({
  sections,
  fontSize = 15,
}: Props) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const customHTMLElementModels = {
    bi: HTMLElementModel.fromCustomModel({
      tagName: "bi",
      contentModel: HTMLContentModel.textual,
    }),
  };

  return (
    <View style={{ padding: 16 }}>
      {sections.map((section) => (
        <View key={section.id}>
          {section.type === "text" && section.content ? (
            <RenderHTML
              contentWidth={width - 32}
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
                "borderRadius",
                "margin",
                "display",
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
                /* IMAGES - Respect inline styles */
                img: {
                  marginVertical: 16,
                  borderRadius: 12,
                },
                
                /* PARAGRAPHS */
                p: {
                  marginBottom: 8,
                  textAlign: "justify",
                },

                /* HEADINGS */
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

                /* TEXT */
                b: { fontFamily: "Poppins_700Bold" },
                strong: { fontFamily: "Poppins_700Bold" },
                i: { fontFamily: "Poppins_400Regular_Italic" },
                em: { fontFamily: "Poppins_400Regular_Italic" },
                bi: { fontFamily: "Poppins_700Bold_Italic" },
                u: { textDecorationLine: "underline" },
                s: { textDecorationLine: "line-through" },

                /* LISTS */
                ul: {
                  paddingLeft: 22,
                  marginBottom: 10,
                },
                ol: {
                  paddingLeft: 22,
                  marginBottom: 10,
                },
                "ol[type='a']": {
                  paddingLeft: 22,
                },
                li: {
                  marginBottom: 6,
                  paddingLeft: 2,
                  alignSelf: "flex-start",
                },

                /* BLOCKQUOTE */
                blockquote: {
                  borderLeftWidth: 3,
                  borderLeftColor: "#CBD5E1",
                  paddingLeft: 12,
                  marginVertical: 12,
                },

                /* CODE */
                code: {
                  fontFamily: "monospace",
                  backgroundColor: "#F1F5F9",
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  borderRadius: 4,
                },
              }}

              /* 🔥 CRITICAL: Custom renderer for images */
              renderers={{
                img: ({ tnode }) => {
                  const src = tnode.attributes.src;
                  if (!src) return null;

                  return (
                    <View style={{ alignItems: "center", marginVertical: 16 }}>
                      <Image
                        source={{ uri: src }}
                        style={{
                          width: width - 64,
                          maxWidth: "100%",
                          height: 200,
                          borderRadius: 12,
                          backgroundColor: "#F1F5F9",
                        }}
                        resizeMode="cover"
                        onError={(error) => {
                          console.log("❌ Image load error:", src, error.nativeEvent.error);
                        }}
                        onLoad={() => {
                          console.log("✅ Image loaded successfully:", src);
                        }}
                      />
                    </View>
                  );
                },
              }}
            />
          ) : null}

          {/* STANDALONE IMAGE SECTION (for backward compatibility) */}
          {section.type === "image" && section.image_url ? (
            <View style={{ alignItems: "center", marginVertical: 16 }}>
              <Image
                source={{ uri: section.image_url }}
                style={{
                  width: width - 64,
                  maxWidth: "100%",
                  height: 200,
                  borderRadius: 12,
                  backgroundColor: "#F1F5F9",
                }}
                resizeMode="cover"
                onError={(error) => {
                  console.log("❌ Image load error:", section.image_url, error.nativeEvent.error);
                }}
                onLoad={() => {
                  console.log("✅ Image loaded successfully:", section.image_url);
                }}
              />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}