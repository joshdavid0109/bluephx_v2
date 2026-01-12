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

export default function HomeScreen() {
  const [codals, setCodals] = useState<Codal[]>([]);
  const [loading, setLoading] = useState(true);
  const { open } = useSideNav(); // ✅ CORRECT
  const router = useRouter();


  useEffect(() => {
    fetchCodals();
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


  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => open()}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>


        <Image
          source={{
            uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
          }}
          style={styles.headerLogo}
        />
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
      <TouchableOpacity style={styles.continueBtn}>
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
          <View style={styles.announcement} />

          {/* Search */}
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#64748B" />
            <TextInput
              placeholder="Find"
              style={styles.searchInput}
            />
          </View>

          {/* GRID */}
          {loading ? (
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
    height: 180,
    backgroundColor: "#D1D5DB",
    borderRadius: 14,
    marginBottom: 14,
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
});