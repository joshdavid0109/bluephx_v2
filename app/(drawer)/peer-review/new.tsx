import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function NewPostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const onSubmit = async () => {
    if (!title || !content) return;

    // 🔜 Replace with Supabase insert
    console.log("New post:", { title, content });

    router.back();
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#04183B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Question</Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="Enter your question title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Explain your question in detail"
          value={content}
          onChangeText={setContent}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!title || !content) && { opacity: 0.5 },
          ]}
          onPress={onSubmit}
          disabled={!title || !content}
        >
          <Text style={styles.submitText}>POST QUESTION</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
  },

  form: {
    padding: 16,
  },

  label: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },

  textArea: {
    height: 120,
    textAlignVertical: "top",
  },

  submitBtn: {
    backgroundColor: "#04183B",
    paddingVertical: 14,
    borderRadius: 10,
  },

  submitText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
});
