import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

type Post = {
  id: string;
  title: string;
  created_at: string;
  users: { username: string | null };
  reply_count: number;
};

export default function PeerReviewScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("forum_posts")
      .select(`
        id,
        title,
        created_at,
        users(username),
        forum_replies(count)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(
        data.map((p: any) => ({
          ...p,
          reply_count: p.forum_replies[0]?.count ?? 0,
        }))
      );
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView>
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => router.push("/peer-review/new")}
        >
          <Text style={styles.postBtnText}>POST A QUESTION</Text>
        </TouchableOpacity>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.card}
              onPress={() =>
                router.push(`/peer-review/${post.id}`)
              }
            >
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.meta}>
                {post.users?.username ?? "User"} ·{" "}
                {new Date(post.created_at).toDateString()}
              </Text>
              <Text style={styles.replies}>
                💬 {post.reply_count}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },

  postBtn: {
    backgroundColor: "#04183B",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },

  postBtnText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  title: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
  },

  meta: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
  },

  replies: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#04183B",
  },
});
