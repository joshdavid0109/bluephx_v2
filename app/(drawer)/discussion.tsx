import { useSideNav } from "@/context/SideNavContext";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

/* ---------- TYPES ---------- */

type ForumPost = {
  id: string;
  title: string;
  author: string;
  date: string;
  replies: number;
};

/* ---------- SCREEN ---------- */

export default function PeerReviewScreen() {
  const { open } = useSideNav();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>([]);

  useEffect(() => {
    // TEMP: replace with Supabase fetch later
    setPosts([
      {
        id: "1",
        title: "Forum Post Title",
        author: "Author Name",
        date: "Jan 12, 2026",
        replies: 0,
      },
      {
        id: "2",
        title: "Forum Post Title",
        author: "Author Name",
        date: "Jan 11, 2026",
        replies: 2,
      },
      {
        id: "3",
        title: "Forum Post Title",
        author: "Author Name",
        date: "Jan 10, 2026",
        replies: 1,
      },
    ]);
  }, []);

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={open}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>

        <MaterialCommunityIcons
          name="phoenix-framework"
          size={28}
          color="#63B3ED"
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
          <Text style={styles.subHello}>
            Hope you are doing well!
          </Text>
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
        {/* TITLE + BUTTON */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <MaterialCommunityIcons
              name="scale-balance"
              size={20}
              color="#04183B"
            />
            <Text style={styles.title}>
              Peer Review and Discussion
            </Text>
          </View>
        </View>
        <TouchableOpacity
            style={styles.postBtn}
            onPress={() => router.push("/peer-review/new")}
          >
            <Text style={styles.postBtnText}>
              POST A QUESTION
            </Text>
          </TouchableOpacity>

        {/* POSTS */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.card}
              onPress={() =>
                router.push(`/peer-review/${post.id}`)
              }
            >
              <Text style={styles.cardTitle}>
                [{post.title}]
              </Text>

              <Text style={styles.cardMeta}>
                {post.author} · {post.date}
              </Text>

              <View style={styles.replyRow}>
                <Feather
                  name="message-square"
                  size={16}
                  color="#64748B"
                />
                <Text style={styles.replyCount}>
                  {post.replies}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
});
