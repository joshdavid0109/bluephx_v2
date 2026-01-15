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
  communities: {
    id: string;
    slug: string;
    name: string;
    description: string;
  };
  users: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
};


type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

/* ---------- SCREEN ---------- */

export default function PeerReviewScreen() {
  const { open } = useSideNav();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myPostIds, setMyPostIds] = useState<string[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ForumPost | null>(null);


  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    setIsAdmin(!!data?.is_admin);
  };

  checkAdmin();
}, []);


  useEffect(() => {
    fetchPosts();
    fetchMyPosts();
  }, []);



useEffect(() => {
  if (!currentUserId) return;

  const replyChannel = supabase
    .channel("forum-replies")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "forum_replies",
      },
      async (payload) => {
        const replyId = payload.new.id;
        const postId = payload.new.post_id;

        // 1️⃣ Fetch reply author
        const { data: reply } = await supabase
          .from("forum_replies")
          .select("user_id")
          .eq("id", replyId)
          .single();

        if (!reply) return;

        // ❌ Ignore my own replies
        if (reply.user_id === currentUserId) return;

        // 2️⃣ Check if I own the post
        const { data: post } = await supabase
          .from("forum_posts")
          .select("id")
          .eq("id", postId)
          .eq("user_id", currentUserId)
          .single();

        if (!post) return; // not my post → no notify

        // ✅ Notify
        setUnreadCount((prev) => prev + 1);

        setNotifications((prev) => {
          if (prev.some((n) => n.id === replyId)) return prev;

          return [
            {
              id: replyId,
              post_id: postId,
              created_at: payload.new.created_at,
            },
            ...prev,
          ];
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(replyChannel);
  };
}, [currentUserId]);

useEffect(() => {
  const notifChannel = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
        setUnreadCount((c) => c + 1);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(notifChannel);
  };
}, []);




  useEffect(() => {
    const postChannel = supabase
      .channel("forum-posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "forum_posts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
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
        community_id,
        communities (
          id,
          slug,
          name,
          description
        ),
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


  const fetchMyPosts = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("forum_posts")
    .select("id")
    .eq("user_id", user.id);

  setMyPostIds(data?.map((p) => p.id) ?? []);
};
const confirmDeletePost = async () => {
  if (!deleteTarget) return;

  await supabase
    .from("forum_posts")
    .delete()
    .eq("id", deleteTarget.id);

  // Optimistic UI update
  setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));

  setDeleteTarget(null);
};


const fetchNotifications = async () => {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  setNotifications(data ?? []);
  setUnreadCount(data?.filter((n) => !n.is_read).length ?? 0);
};

useEffect(() => {
  fetchNotifications();
}, []);




  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const getAuthorName = (user: ForumPost["users"]) => {
    if (!user?.username) return "Unknown";
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

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* NOTIFICATION BELL */}
        <TouchableOpacity
          style={{ marginRight: 14 }}
         onPress={async () => {
            setNotifOpen((v) => !v);
            setUnreadCount(0);

            await supabase
              .from("notifications")
              .update({ is_read: true })
              .eq("is_read", false);
          }}
        >
          <Feather name="bell" size={22} color="#63B3ED" />

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>


        <Image
          source={{
            uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
          }}
          style={styles.headerLogo}
        />
      </View>
    </View>

    {notifOpen && (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setNotifOpen(false)}
        style={styles.notifOverlay}
      >
        <View style={styles.notifDropdown}>
          <Text style={styles.notifTitle}>Notifications</Text>

          {notifications.length === 0 ? (
            <Text style={styles.notifEmpty}>No new replies</Text>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <TouchableOpacity
                key={n.id}
                style={styles.notifItem}
                onPress={() => {
                  setNotifOpen(false);
                  router.push(`/peer-review/${n.post_id}`);
                }}
              >
                <Feather name="message-circle" size={16} color="#04183B" />
                <Text style={styles.notifText}>
                  New reply on your post
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </TouchableOpacity>
    )}


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


      {selectedCommunity && (
        <View style={styles.communityHeader}>
          <Text style={styles.communityName}>
            r/{selectedCommunity.slug}
          </Text>
          <Text style={styles.communityDesc}>
            {selectedCommunity.description}
          </Text>
        </View>
      )}


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
              console.log(post),
              <TouchableOpacity
                key={post.id}
                style={styles.card}
                onPress={() => router.push(`/peer-review/${post.id}`)}
              >
                {/* LEFT META (REPLIES) */}
                <View style={styles.cardLeft}>
                  <Feather name="message-square" size={18} color="#64748B" />
                  <Text style={styles.replyCountBig}>
                    {post.reply_count ?? 0}
                  </Text>
                </View>

                {/* MAIN CONTENT */}
                <View style={styles.cardBody}>
                  <View style={styles.postHeader}>
                    {post.communities && (
                      <Text style={styles.communityTag}>
                        bp/{post.communities.slug}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.cardTitle}>{post.title}</Text>

                  <Text style={styles.cardMeta}>
                    <Text style={styles.username}> {post.users?.username } </Text>
                     {" | "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </Text>
                </View>
                 {/* ADMIN DELETE */}
                {isAdmin && (
                  <TouchableOpacity
                    onPress={() => setDeleteTarget(post)}
                    style={styles.deleteBtn}
                  >
                    <Feather name="trash-2" size={18} color="#DC2626" />
                  </TouchableOpacity>
                )}
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
      {deleteTarget && (
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            Delete this post?
          </Text>

          <Text style={styles.modalText}>
            This action cannot be undone.
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => setDeleteTarget(null)}
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmDeletePost}
              style={styles.modalDelete}
            >
              <Text style={styles.modalDeleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}

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

  badge: {
  position: "absolute",
  top: -6,
  right: -6,
  backgroundColor: "#EF4444",
  borderRadius: 10,
  minWidth: 18,
  height: 18,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 4,
},

badgeText: {
  color: "#FFFFFF",
  fontSize: 10,
  fontFamily: "Poppins_700Bold",
},

notifOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 50,
},

notifDropdown: {
  position: "absolute",
  top: 60,
  right: 16,
  width: 260,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 12,
  elevation: 6,
},

notifTitle: {
  fontSize: 14,
  fontFamily: "Poppins_700Bold",
  color: "#04183B",
  marginBottom: 8,
},

notifEmpty: {
  fontSize: 12,
  color: "#64748B",
  textAlign: "center",
  paddingVertical: 12,
},

notifItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
},

notifText: {
  marginLeft: 8,
  fontSize: 12,
  fontFamily: "Poppins_400Regular",
  color: "#04183B",
},


  /* GREETING */
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
  },

  postHeader: {
    marginBottom: 6,
  },

  communityTag: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: "#0369A1",
    marginBottom: 4,
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

  breadcrumbs: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  cardLeft: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    marginRight: 12,
  },

  replyCountBig: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
  },

  cardBody: {
    flex: 1,
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

  deleteBtn: {
  padding: 6,
},

modalOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 100,
},

modal: {
  width: "80%",
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  padding: 20,
},

modalTitle: {
  fontSize: 16,
  fontFamily: "Poppins_700Bold",
  color: "#04183B",
  marginBottom: 6,
},

modalText: {
  fontSize: 13,
  fontFamily: "Poppins_400Regular",
  color: "#64748B",
  marginBottom: 16,
},

modalActions: {
  flexDirection: "row",
  justifyContent: "flex-end",
},

modalCancel: {
  marginRight: 12,
},

modalCancelText: {
  fontFamily: "Poppins_600SemiBold",
  color: "#64748B",
},

modalDelete: {
  backgroundColor: "#DC2626",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 8,
},

modalDeleteText: {
  color: "#FFFFFF",
  fontFamily: "Poppins_700Bold",
},


  username: {
    fontFamily: "Poppins_700Bold",
  },

  communityHeader: {
    marginBottom: 16,
  },

  communityName: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
  },

  communityDesc: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
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
    backgroundColor: "#63B3ED",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    justifyContent: "center",
  },

  postBtnText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
    letterSpacing: 1,
    textAlign: "center"

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
