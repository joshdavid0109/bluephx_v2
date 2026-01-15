import { normalizeHtml } from "@/utils/normalizeHtml";
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

  /** 🔥 REQUIRED FOR INLINE STYLES */
  allowedStyles={[
    "textAlign",
    "lineHeight",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight",
  ]}


  enableExperimentalMarginCollapsing={true}

  systemFonts={[
    "Poppins_400Regular",
    "Poppins_400Regular_Italic",
    "Poppins_700Bold",
    "Poppins_700Bold_Italic",
  ]}

  /** ❌ DO NOT override alignment or lineHeight here */
  baseStyle={{
    fontSize,
    color: "#0F172A",
    fontFamily: "Poppins_400Regular",
  }}

  tagsStyles={{
    /* PARAGRAPH — allow renderer to respect inline styles */
    p: {
      marginBottom: 8,          // fallback only
      textAlign: "auto",        // REQUIRED for Android justify
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
    /* LETTERED LIST FIX */
    "ol[type='a']": {
      paddingLeft: 22,
    },
    li: {
      marginBottom: 6,
      paddingLeft: 2, // 🔥 fixes text shift
      alignSelf: "flex-start", // 🔥 prevents marker stretching
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
/>

          ) : null}

          {/* IMAGE SECTION */}
{section.type === "image" && section.image_url ? (
  isWeb ? (
    /* CMS / WEB — keep EXACT behavior */
    <Image
      source={{ uri: section.image_url }}
      style={{
        width: "100%",
        height: 220,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        marginVertical: 16,
      }}
      resizeMode="contain"
    />
  ) : (
    /* MOBILE — render via HTML for parity */
    <RenderHTML
      contentWidth={width - 32}
      source={{
        html: `<img src="${section.image_url}" />`,
      }}
      renderersProps={{
        img: {
          enableExperimentalPercentWidth: true,
        },
      }}
      imagesStyles={{
        img: {
          width: "100%",
          height: "auto",
          borderRadius: 12,
          marginVertical: 16,
        },
      }}
    />
  )
) : null}

        </View>
      ))}
    </View>
  );
}
