import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ---------- TYPES ---------- */

type ForumPost = {
  id: string;
  title: string;
  created_at: string;
  reply_count: number;
  user: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

/* ---------- SCREEN ---------- */

export default function PeerReviewScreen() {
  const { open } = useSideNav();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("forum-posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_posts",
        },
        () => {
          fetchPosts(); // ✅ now reliable
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);




  const fetchPosts = async () => {
    setLoading(true);

    const { data: posts, error } = await supabase
      .from("forum_posts")
      .select(`
        id,
        title,
        created_at,
        users (
          username,
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !posts) {
      console.error(error);
      setPosts([]);
      setLoading(false);
      return;
    }

    // 🔹 Fetch reply counts separately
    const { data: counts } = await supabase
      .from("forum_replies")
      .select("post_id", { count: "exact", head: false });

    const countMap =
      counts?.reduce((acc: any, r: any) => {
        acc[r.post_id] = (acc[r.post_id] || 0) + 1;
        return acc;
      }, {}) ?? {};

    const mapped = posts.map((p: any) => ({
      ...p,
      reply_count: countMap[p.id] ?? 0,
    }));

    setPosts(mapped);
    setLoading(false);
  };


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };



  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const getAuthorName = (user: ForumPost["user"]) => {
    if (!user) return "Unknown";
    if (user.username) return user.username;
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || "User";
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={open}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>

         <Image
            source={{
              uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
            }}
            style={styles.headerLogo}
          />
      </View>

      {/* GREETING */}
      <View style={styles.greetingRow}>
        <MaterialCommunityIcons
          name="account-circle"
          size={42}
          color="#FFFFFF"
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.hello}>Hello,</Text>
          <Text style={styles.subHello}>Hope you are doing well!</Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Feather name="search" size={16} color="#64748B" />
        <TextInput
          placeholder="Find"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {/* PANEL */}
      <View style={styles.panel}>
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <MaterialCommunityIcons
              name="scale-balance"
              size={20}
              color="#04183B"
            />
            <Text style={styles.title}>Peer Review and Discussion</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => router.push("/peer-review/new")}
        >
          <Text style={styles.postBtnText}>POST A QUESTION</Text>
        </TouchableOpacity>

        {/* POSTS */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#04183B"
            />
          }
        >
          {loading ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Loading...
            </Text>
          ) : (
            filteredPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.card}
                onPress={() => router.push(`/peer-review/${post.id}`)}
              >
                <Text style={styles.cardTitle}>[{post.title}]</Text>

                <Text style={styles.cardMeta}>
                  {getAuthorName(post.user)} ·{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </Text>

                <View style={styles.replyRow}>
                  <Feather
                    name="message-square"
                    size={16}
                    color="#64748B"
                  />
                  <Text style={styles.replyCount}>
                    {post.reply_count ?? 0}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}

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
  },

  /* GREETING */
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
  },

  hello: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },

   headerLogo: {
    width: 48,
    height: 48,
  },

  subHello: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#63B3ED",
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 10,
    paddingHorizontal: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Poppins_400Regular",
  },

  /* PANEL */
  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    marginLeft: 8,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
  },

  postBtn: {
    backgroundColor: "#04183B",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  postBtnText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },

  /* CARD */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
    marginBottom: 4,
  },

  cardMeta: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
  },

  replyRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    right: 14,
    bottom: 14,
  },

  replyCount: {
    marginLeft: 6,
    fontSize: 12,
    color: "#64748B",
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
