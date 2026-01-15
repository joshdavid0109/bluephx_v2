import NotificationBell from "@/components/NotificationBell";
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
  communities?: {
    slug: string;
    name: string;
  } | null;
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
      .select(`
        title,
        content,
        user_id,
        communities (
          slug,
          name
        )
      `)
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
  const formatDateTime = (value: string) => {
    const d = new Date(value);
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
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

      {/* CONTENT */}
      <ScrollView style={styles.content}
    contentContainerStyle={{ paddingBottom: 120 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        {post?.communities && (
          <View style={styles.communityRow}>
            <Text style={styles.communityTag}>
              r/{post.communities.slug}
            </Text>
          </View>
        )}

        <Text style={styles.title}>{post?.title}</Text>

        <Text style={styles.meta}>
          {post && users[post.user_id]}
        </Text>

        <Text style={styles.body}>{post?.content}</Text>

        <Text style={styles.replyHeader}>Replies</Text>

        {replies.map((r) => (
          <View key={r.id} style={styles.reply}>
            <View style={styles.replyHeaderRow}>
                <Text style={styles.replyAuthor}>
                {users[r.user_id]}
                </Text>
                <Text style={styles.replyDate}>
                {formatDateTime(r.created_at)}
                </Text>
            </View>

            <Text style={styles.replyText}>{r.content}</Text>
        </View>
        ))}

         {/* FOOTER */}
        <View style={styles.links}>
            <View style={styles.linkRow}>
              <Feather name="globe" size={16} color="#63B3ED" />
              <Text style={styles.linkText}>
                www.bluephoenix.com
              </Text>
            </View>

            <View style={styles.linkRow}>
              <Feather name="facebook" size={16} color="#63B3ED" />
              <Text style={styles.linkText}>
                Blue Phoenix Illustrated Reviewers
              </Text>
            </View>
        </View>
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
  /* ROOT */
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

  /* CONTENT */
  content: {
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

  communityRow: {
    marginBottom: 6,
  },

  communityTag: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: "#0369A1",
    marginBottom: 6,
  },


  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
    marginBottom: 4,
  },

  meta: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
    marginBottom: 16,
  },

  body: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
    color: "#0F172A",
    marginBottom: 24,
  },

  /* REPLIES */
  replyHeader: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
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

  replyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#334155",
    lineHeight: 20,
  },
  replyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
   },

  replyDate: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#94A3B8",
  },


  /* REPLY INPUT */
  replyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },

  replyInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#04183B",
  },

  send: {
    fontFamily: "Poppins_700Bold",
    color: "#63B3ED",
    marginLeft: 12,
    fontSize: 14,
  },
  links: {
    marginVertical: 20,
    alignItems: "center",
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  linkText: {
    marginLeft: 6,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#04183B",
  },
});
