import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function NewPostScreen() {
  const router = useRouter();
  const { open } = useSideNav();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

    const { error } = await supabase.from("forum_posts").insert({
      title: title.trim(),
      content: content.trim(),
      user_id: user.id,
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
        <TouchableOpacity onPress={open}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>

        <Image
          source={{
            uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
          }}
          style={styles.logo}
        />
      </View>

      {/* PANEL */}
      <View style={styles.panel}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

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
