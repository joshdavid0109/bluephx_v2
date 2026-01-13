import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* ---------- TYPES ---------- */

type Post = {
  title: string;
  content: string;
  user_id: string;
};

type Reply = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
};

type UserMap = Record<string, string>;

/* ---------- SCREEN ---------- */

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const { open } = useSideNav();

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [users, setUsers] = useState<UserMap>({});
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchPost(), fetchReplies()]);
    setLoading(false);
  };

  /* ---------- FETCH POST ---------- */
  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("forum_posts")
      .select("title, content, user_id")
      .eq("id", postId)
      .single();

    if (!error && data) {
      setPost(data);
      await fetchUsers([data.user_id]);
    }
  };

  /* ---------- FETCH REPLIES ---------- */
  const fetchReplies = async () => {
    const { data, error } = await supabase
      .from("forum_replies")
      .select("id, content, created_at, user_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setReplies(data);

      const userIds = Array.from(
        new Set(data.map((r) => r.user_id))
      );

      await fetchUsers(userIds);
    }
  };

  /* ---------- FETCH USERNAMES ---------- */
  const fetchUsers = async (ids: string[]) => {
    if (!ids.length) return;

    const { data } = await supabase
      .from("users")
      .select("id, username, first_name, last_name")
      .in("id", ids);

    if (data) {
      const map: UserMap = {};
      data.forEach((u) => {
        map[u.id] =
          u.username ||
          [u.first_name, u.last_name].filter(Boolean).join(" ") ||
          "User";
      });
      setUsers((prev) => ({ ...prev, ...map }));
    }
  };

  /* ---------- SUBMIT REPLY ---------- */
  const submitReply = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !reply.trim()) return;

    await supabase.from("forum_replies").insert({
      post_id: postId,
      content: reply.trim(),
      user_id: user.id,
    });

    setReply("");
    fetchReplies();
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

      {/* CONTENT */}
      <ScrollView style={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{post?.title}</Text>

        <Text style={styles.meta}>
          {post && users[post.user_id]}
        </Text>

        <Text style={styles.body}>{post?.content}</Text>

        <Text style={styles.replyHeader}>Replies</Text>

        {replies.map((r) => (
          <View key={r.id} style={styles.reply}>
            <Text style={styles.replyAuthor}>
              {users[r.user_id]}
            </Text>
            <Text style={styles.replyText}>{r.content}</Text>
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
          <Text style={styles.send}>Send</Text>
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

  content: {
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
    marginBottom: 4,
  },

  meta: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
    marginBottom: 14,
  },

  body: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
    color: "#0F172A",
    marginBottom: 24,
  },

  replyHeader: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginBottom: 12,
  },

  reply: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  replyAuthor: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#04183B",
    marginBottom: 4,
  },

  replyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  replyInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },

  send: {
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
    marginLeft: 12,
  },
});

