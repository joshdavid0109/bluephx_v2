import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function NewPostScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submitPost = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("forum_posts")
      .insert({
        title,
        content,
        user_id: user.id,
      });

    setLoading(false);

    if (!error) router.back();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.form}>
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
          style={styles.btn}
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
    backgroundColor: "#FFFFFF",
  },

  form: {
    padding: 16,
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
