import NotificationBell from "@/components/NotificationBell";
import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function NewPostScreen() {
  const router = useRouter();
  const { open } = useSideNav();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [communityQuery, setCommunityQuery] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any | null>(null);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);

  const searchCommunities = async (text: string) => {
    setCommunityQuery(text);

    if (!text.trim()) {
      setCommunities([]);
      return;
    }

    const { data } = await supabase
      .from("communities")
      .select("id, name, slug, description")
      .ilike("name", `%${text}%`)
      .limit(5);

    setCommunities(data ?? []);
    setShowCommunityDropdown(true);
  };

  const createCommunity = async () => {
    if (!communityQuery.trim()) return;

    const slug = communityQuery
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const { data, error } = await supabase
      .from("communities")
      .insert({
        name: communityQuery.trim(),
        slug,
        description: "",
      })
      .select()
      .single();

    if (!error && data) {
      setSelectedCommunity(data);
      setCommunityQuery(data.name);
      setShowCommunityDropdown(false);
    }
  };


  const submitPost = async () => {
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and content are required.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("You must be logged in to post.");
      setLoading(false);
      return;
    }

    if (!selectedCommunity) {
    setErrorMsg("Please select or create a community.");
    setLoading(false);
    return;
  }

  const { error } = await supabase.from("forum_posts").insert({
    title: title.trim(),
    content: content.trim(),
    user_id: user.id,
    community_id: selectedCommunity.id,
  });


    setLoading(false);

    if (error) {
      setErrorMsg("Failed to post. Please try again.");
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER (CONSISTENT WITH OTHERS) */}
      <View style={styles.header}>
        {/* LEFT */}
        <TouchableOpacity onPress={() => open()}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>

        {/* RIGHT GROUP */}
        <View style={styles.headerRight}>
          <NotificationBell />

          <Image
            source={{
              uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
            }}
            style={styles.headerLogo}
          />
        </View>
      </View>


      {/* PANEL */}
      <View style={styles.panel}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        {/* COMMUNITY SELECT */}
        <View style={{ marginBottom: 14 }}>
          <TextInput
            placeholder="Select or create a community"
            value={communityQuery}
            onChangeText={searchCommunities}
            onFocus={() => setShowCommunityDropdown(true)}
            style={styles.input}
          />

          {showCommunityDropdown && (
            <View style={styles.dropdown}>
              {communities.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCommunity(c);
                    setCommunityQuery(c.name);
                    setShowCommunityDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownTitle}>{c.name}</Text>
                  <Text style={styles.dropdownSub}>bp/{c.slug}</Text>
                </TouchableOpacity>
              ))}

              {communities.length === 0 && communityQuery.trim() !== "" && (
                <TouchableOpacity
                  style={styles.createCommunity}
                  onPress={createCommunity}
                >
                  <Text style={styles.createText}>
                    ➕ Create “{communityQuery}”
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>


        <Text style={styles.title}>Post a Question</Text>

        {errorMsg && (
          <Text style={styles.error}>{errorMsg}</Text>
        )}

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Describe your question"
          value={content}
          onChangeText={setContent}
          multiline
          style={[styles.input, styles.textArea]}
        />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={submitPost}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Posting..." : "POST"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#04183B",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },


  headerLogo: {
    width: 48,
    height: 48,
  },

  logo: {
    width: 40,
    height: 40,
  },

  /* PANEL */
  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  back: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#63B3ED",
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
    marginBottom: 12,
  },

  error: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#DC2626",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },

  dropdown: {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#CBD5E1",
  marginTop: -8,
  marginBottom: 12,
  overflow: "hidden",
},

dropdownItem: {
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#E5E7EB",
},

dropdownTitle: {
  fontSize: 14,
  fontFamily: "Poppins_600SemiBold",
  color: "#04183B",
},

dropdownSub: {
  fontSize: 11,
  fontFamily: "Poppins_400Regular",
  color: "#64748B",
},

createCommunity: {
  padding: 12,
  alignItems: "center",
},

createText: {
  fontSize: 13,
  fontFamily: "Poppins_600SemiBold",
  color: "#63B3ED",
},


  textArea: {
    height: 140,
    textAlignVertical: "top",
  },

  btn: {
    backgroundColor: "#04183B",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },

  btnText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },
});
