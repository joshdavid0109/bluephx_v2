import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

type Reply = {
  id: string;
  author: string;
  content: string;
  date: string;
};

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();

  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState<Reply[]>([
    {
      id: "1",
      author: "Reviewer A",
      content: "This is a helpful response.",
      date: "Jan 13, 2026",
    },
  ]);

  const submitReply = () => {
    if (!reply) return;

    setReplies((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        author: "You",
        content: reply,
        date: "Just now",
      },
    ]);

    setReply("");
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#04183B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content}>
        <Text style={styles.postTitle}>[Forum Post Title]</Text>
        <Text style={styles.postMeta}>
          Author Name · Jan 12, 2026
        </Text>

        <Text style={styles.postBody}>
          This is the main content of the forum post.
        </Text>

        {/* REPLIES */}
        <Text style={styles.replyHeader}>Replies</Text>

        {replies.map((r) => (
          <View key={r.id} style={styles.replyCard}>
            <Text style={styles.replyAuthor}>{r.author}</Text>
            <Text style={styles.replyText}>{r.content}</Text>
            <Text style={styles.replyDate}>{r.date}</Text>
          </View>
        ))}
      </ScrollView>

      {/* REPLY BOX */}
      <View style={styles.replyBox}>
        <TextInput
          placeholder="Write a reply..."
          value={reply}
          onChangeText={setReply}
          style={styles.replyInput}
        />
        <TouchableOpacity onPress={submitReply}>
          <Feather name="send" size={22} color="#04183B" />
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

  content: {
    padding: 16,
  },

  postTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },

  postMeta: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },

  postBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: "Poppins_400Regular",
  },

  replyHeader: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginBottom: 12,
  },

  replyCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  replyAuthor: {
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
  },

  replyText: {
    fontFamily: "Poppins_400Regular",
  },

  replyDate: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
  },

  replyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },

  replyInput: {
    flex: 1,
    marginRight: 8,
    fontFamily: "Poppins_400Regular",
  },
});
