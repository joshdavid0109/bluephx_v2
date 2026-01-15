import { normalizeHtml } from "@/utils/normalizeHtml";
import {
    Image,
    Platform,
    useWindowDimensions,
    View
} from "react-native";
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
  lineHeight?: number;
  textAlign?: "left" | "justify";
};

export function ChapterReader({
  sections,
  fontSize = 15,
  lineHeight = 24,
  textAlign = "left",
}: Props) {
  const { width } = useWindowDimensions();

  const customHTMLElementModels = {
  bi: HTMLElementModel.fromCustomModel({
    tagName: "bi",
    contentModel: HTMLContentModel.textual,
  }),
};


  return (
    <View style={{ padding: 16 }}>
      {sections.map((section) => (
        <View key={section.id} style={{ marginBottom: 18 }}>
          {section.type === "text" && section.content ? (
            Platform.OS === "web" ? (
              <div
                style={{
                  fontSize,
                  lineHeight,
                  textAlign,
                  fontFamily: "Poppins_400Regular",
                  color: "#0F172A",
                }}
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            ) : (
              <RenderHTML
  contentWidth={width - 32}
  source={{ html: normalizeHtml(section.content) }}

    customHTMLElementModels={customHTMLElementModels}


  systemFonts={[
    "Poppins_400Regular",
    "Poppins_400Regular_Italic",
    "Poppins_700Bold",
    "Poppins_700Bold_Italic",
  ]}

  ignoredDomTags={["span"]}

  baseStyle={{
    fontSize,
    lineHeight,
    color: "#0F172A",
    textAlign,
    fontFamily: "Poppins_400Regular",
  }}

  tagsStyles={{
    p: { marginBottom: 12 },

    b: { fontFamily: "Poppins_700Bold" },
    strong: { fontFamily: "Poppins_700Bold" },

    i: { fontFamily: "Poppins_400Regular_Italic" },
    em: { fontFamily: "Poppins_400Regular_Italic" },

    /* 🔥 ONE TAG = ONE FONT */
    bi: { fontFamily: "Poppins_700Bold_Italic" },

    u: { textDecorationLine: "underline" },
    s: { textDecorationLine: "line-through" },

    li: { marginBottom: 6 },
    ol: { paddingLeft: 20 },
    ul: { paddingLeft: 20 },

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
/>

            )
          ) : null}

          {section.type === "image" && section.image_url ? (
            <Image
              source={{ uri: section.image_url }}
              style={{
                width: "100%",
                height: 220,
                borderRadius: 12,
                backgroundColor: "#F1F5F9",
              }}
              resizeMode="contain"
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}
