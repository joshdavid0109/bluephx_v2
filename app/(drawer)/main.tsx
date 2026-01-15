import NotificationBell from "@/components/NotificationBell";
import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import {
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



type Codal = {
  codal_id: string;
  codal_title: string;
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
};

type SearchResult = {
  chapter_id: string;
  chapter_title: string;
  codal_title: string;
  subtopic_name: string;
  match_type: "title" | "content" | "subtopic";
};


export default function HomeScreen() {
  const [codals, setCodals] = useState<Codal[]>([]);
  const [loading, setLoading] = useState(true);
  const { open } = useSideNav(); // ✅ CORRECT
  const router = useRouter();
  const [lastSession, setLastSession] = useState<{
    codal_id: string;
    chapter_id: string;
  } | null>(null);

  const [announcement, setAnnouncement] = useState<{
    id: string;
    title: string;
    body: string;
  } | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);


  const [isAdmin, setIsAdmin] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] =
    useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchCodals();
    fetchLastSession();
    fetchAnnouncement();
    checkAdminStatus();
    fetchAnnouncements();
  }, []);

  const fetchCodals = async () => {
    const { data, error } = await supabase
      .from("codals")
      .select("codal_id, codal_title");

    console.log("Codals fetch data:", data);
    console.log("Codals fetch error:", error);

    if (!error && data) {
      setCodals(data);
    }

    setLoading(false);
  };

  const fetchLastSession = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("user_reading_progress")
      .select("codal_id, chapter_id")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setLastSession(data);
    }
  };
  const checkAdminStatus = async () => {
  const admin = await checkAdmin();
  setIsAdmin(admin);
};

const fetchAnnouncement = async () => {
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!error && data) {
    setAnnouncement(data);
  }
};

const fetchAnnouncements = async () => {
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, image_url")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!error && data) {
    setAnnouncements(data);
  }
};



  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    return !!data?.is_admin;
  };


  const deleteAnnouncement = async (id: string) => {
  const confirm = await new Promise<boolean>((resolve) => {
    resolve(true); // replace with Alert.confirm if you want
  });

  if (!confirm) return;

  await supabase
    .from("announcements")
    .update({ is_active: false })
    .eq("id", id);

  fetchAnnouncements();
};


  const handleSearch = (text: string) => {
    setQuery(text);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (!text.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      runSearch(text.trim());
    }, 300);

    setDebounceTimer(timer);
  };


  const runSearch = async (text: string) => {
  setSearching(true);

  const { data: titleMatches } = await supabase
    .from("chapters")
    .select(`
      id,
      title,
      subtopics (
        name,
        codals (
          codal_title
        )
      )
    `)
    .ilike("title", `%${text}%`)
    .limit(20);

  const titleResults: SearchResult[] =
    titleMatches?.map((c: any) => ({
      chapter_id: c.id,
      chapter_title: c.title,
      subtopic_name: c.subtopics.name,
      codal_title: c.subtopics.codals.codal_title,
      match_type: "title",
    })) ?? [];

      const { data: contentMatches } = await supabase
    .from("chapter_sections")
    .select(`
      chapter_id,
      content,
      chapters (
        title,
        subtopics (
          name,
          codals (
            codal_title
          )
        )
      )
    `)
    .ilike("content", `%${text}%`)
    .limit(20);

    const { data: subtopicMatches } = await supabase
  .from("chapters")
  .select(`
    id,
    title,
    subtopics!inner (
      name,
      codals (
        codal_title
      )
    )
  `)
  .ilike("subtopics.name", `%${text}%`)
  .limit(20);

  const subtopicResults: SearchResult[] =
    subtopicMatches?.map((c: any) => ({
      chapter_id: c.id,
      chapter_title: c.title,
      subtopic_name: c.subtopics.name,
      codal_title: c.subtopics.codals.codal_title,
      match_type: "subtopic",
    })) ?? [];


  const contentResults: SearchResult[] =
    contentMatches?.map((s: any) => ({
      chapter_id: s.chapter_id,
      chapter_title: s.chapters.title,
      subtopic_name: s.chapters.subtopics.name,
      codal_title: s.chapters.subtopics.codals.codal_title,
      match_type: "content",
    })) ?? [];

  const merged = [...titleResults];

  [...contentResults, ...subtopicResults].forEach((item) => {
    if (!merged.some((m) => m.chapter_id === item.chapter_id)) {
      merged.push(item);
    }
  });

  setResults(merged);
  setSearching(false);


  contentResults.forEach((item) => {
    if (!merged.some((m) => m.chapter_id === item.chapter_id)) {
      merged.push(item);
    }
  });

  setResults(merged);
  setSearching(false);
};


  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
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


      {/* USER INFO */}
      <View style={styles.userRow}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />

        <View style={{ marginLeft: 14 }}>
          <Text style={styles.hello}>Hello,</Text>
          <Text style={styles.subHello}>Hope you are doing well!</Text>
        </View>
      </View>

      {/* CONTINUE BUTTON */}
      <TouchableOpacity
        style={[
          styles.continueBtn,
          !lastSession && { opacity: 0.5 },
        ]}
        disabled={!lastSession}
        onPress={() => {
          if (!lastSession) return;

          router.push(
            `/chapter/${lastSession.chapter_id}`
          );
        }}
      >
        <Text style={styles.continueText}>
          CONTINUE PREVIOUS SESSION
        </Text>
      </TouchableOpacity>


      {/* WHITE CONTENT PANEL */}
      <View style={styles.panel}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Illustrated Codals */}
          <View style={styles.sectionTitle}>
            <MaterialCommunityIcons
              name="scale-balance"
              size={20}
              color="#0F172A"
            />
            <Text style={styles.sectionText}>
              Illustrated Codals
            </Text>
          </View>

          {/* Announcement */}
          <View style={styles.announcementContainer}>
            {announcements.length === 0 ? (
              <Text style={styles.announcementEmpty}>
                No announcements yet.
              </Text>
            ) : (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
              >
                {announcements.map((a) => (
                  <View key={a.id} style={styles.announcementCard}>
                    {a.image_url && (
                      <Image
                        source={{ uri: a.image_url }}
                        style={styles.announcementImage}
                      />
                    )}

                    <Text style={styles.announcementTitle}>
                      {a.title}
                    </Text>

                    <Text style={styles.announcementBody}>
                      {a.body}
                    </Text>

                    {isAdmin && (
                      <View style={styles.adminActions}>
                        <TouchableOpacity
                          style={styles.adminBtn}
                          onPress={() =>
                            router.push(`/admin/announcements/edit/${a.id}`)
                          }
                        >
                          <Feather name="edit-3" size={14} color="#FFF" />
                          <Text style={styles.adminBtnText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.adminBtn, styles.deleteBtn]}
                          onPress={() => deleteAnnouncement(a.id)}
                        >
                          <Feather name="trash-2" size={14} color="#FFF" />
                          <Text style={styles.adminBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            {isAdmin && (
              <TouchableOpacity
                style={styles.addAnnouncementBtn}
                onPress={() => router.push("/admin/announcements/new")}
              >
                <Feather name="plus" size={16} color="#FFF" />
                <Text style={styles.addAnnouncementText}>
                  Add Announcement
                </Text>
              </TouchableOpacity>
            )}
          </View>


          {/* Search */}
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#64748B" />
            <TextInput
              placeholder="Find"
              value={query}
              onChangeText={handleSearch}
              style={styles.searchInput}
            />
         </View>

         {query.length > 0 && (
          <View>
            {searching ? (
              <ActivityIndicator size="small" color="#04183B" />
            ) : results.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#64748B" }}>
                No results found
              </Text>
            ) : (
              results.map((r) => (
                <TouchableOpacity
                  key={r.chapter_id}
                  style={styles.articleCard}
                  onPress={() => {
                    setQuery("");
                    setResults([]);
                    router.push(`/chapter/${r.chapter_id}`);
                  }}
                >
                  <Text style={styles.articleTitle}>
                    {r.chapter_title}
                  </Text>

                  <Text style={styles.articleSub}>
                    {r.codal_title} › {r.subtopic_name}
                  </Text>

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {r.match_type === "title"
                        ? "Title Match"
                        : r.match_type === "subtopic"
                        ? "Subtopic Match"
                        : "Content Match"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}




          {/* GRID */}
          {query.length === 0 && 

          (loading ? (
            <ActivityIndicator size="small" color="#04183B" />
          ) : (
            <View style={styles.grid}>
              {codals.map((codal) => {
                const code = codal.codal_title
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 5)
                  .toUpperCase();

                return (
                  <TouchableOpacity
                    key={codal.codal_id}
                    style={styles.gridItem}
                    onPress={() => {
                      router.push(`/codal/${codal.codal_id}`);
                    }}
                  >
                    <View style={styles.gridBox}>
                      <Text style={styles.gridCode}>
                        {code}
                      </Text>
                    </View>
                    <Text style={styles.gridLabel}>
                      {codal.codal_title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )
        )}

          {/* LINKS */}
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

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 18,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#CBD5E1",
  },

  hello: {
    fontFamily: "Poppins_800ExtraBold",
    fontSize: 20,
    color: "#FFFFFF",
  },

  subHello: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#63B3ED",
  },

  continueBtn: {
    marginTop: 14,
    alignSelf: "center",
    backgroundColor: "#63B3ED",
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
  },

  continueText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 11,
    color: "#04183B",
    letterSpacing: 1,
  },

  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
  },

  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionText: {
    marginLeft: 8,
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#0F172A",
  },

  announcement: {
    backgroundColor: "#E5EEF6",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  announcementTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#04183B",
    marginBottom: 6,
  },

  announcementBody: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },

  announcementEmpty: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#64748B",
  },

  announcementBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 10,
    backgroundColor: "#04183B",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  announcementBtnText: {
    marginLeft: 6,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },


  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Poppins_400Regular",
  },

  articleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    marginBottom: 16,
  },

  articleTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
  },

  articleSub: {
    fontFamily: "Poppins_400Regular",
    color: "#64748B",
    marginTop: 2,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#334155",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },

  badgeText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#FFFFFF",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridItem: {
    width: "30%",
    marginBottom: 16,
    alignItems: "center",
  },

  gridBox: {
    width: "100%",
    height: 80,
    backgroundColor: "#04183B",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  gridCode: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: "#63B3ED",
  },

  gridLabel: {
    marginTop: 6,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#04183B",
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
  announcementContainer: {
  marginBottom: 14,
},

announcementCard: {
  width: 300,
  backgroundColor: "#E5EEF6",
  borderRadius: 14,
  padding: 16,
  marginRight: 12,
},

announcementImage: {
  width: "100%",
  height: 140,
  borderRadius: 12,
  marginBottom: 10,
},

adminActions: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 10,
},

adminBtn: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#04183B",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 8,
  marginLeft: 8,
},

deleteBtn: {
  backgroundColor: "#DC2626",
},

adminBtnText: {
  marginLeft: 6,
  fontFamily: "Poppins_600SemiBold",
  fontSize: 12,
  color: "#FFFFFF",
},

addAnnouncementBtn: {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-end",
  marginTop: 10,
  backgroundColor: "#04183B",
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 10,
},

addAnnouncementText: {
  marginLeft: 6,
  fontFamily: "Poppins_600SemiBold",
  fontSize: 12,
  color: "#FFFFFF",
},

});
