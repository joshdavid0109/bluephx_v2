import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

type UserProfile = {
  username: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

export default function SideNav() {
  const { translateX, close } = useSideNav();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("username, first_name, last_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    profile?.username ||
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") ||
    "User";

  return (
    <>
      {/* OVERLAY */}
      <Pressable style={styles.overlay} onPress={close} />

      {/* DRAWER */}
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX }] },
        ]}
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#2C5C8A", "#8FD3F4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Image
            source={{
              uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
            }}
            style={styles.logo}
          />

          <Text style={styles.username}>
            {loading ? "Loading..." : displayName}
          </Text>
        </LinearGradient>

        {/* MENU */}
        <View style={styles.menu}>
          <MenuItem icon="home" label="Home" onPress={async () => {
            close();
            router.push("/(drawer)/main"); 
        }}
        />
          <MenuItem icon="calendar" label="Calendar" onPress={
            async () => {
              close();
              router.push("/(drawer)/calendar");
            }
          }/>
          <MenuItem icon="message-text-outline" label="Peer Review and" onPress={
            async () => {
              close();
              router.push("/(drawer)/discussion");
            }
          }/>

          <Text style={styles.section}>Communicate</Text>

          <MenuItem icon="account-group" label="About Us" />
          <MenuItem icon="help-circle-outline" label="FAQs" />
        </View>

        {/* LOGOUT */}
        <View style={styles.footer}>
          <MenuItem
            icon="log-out"
            label="Log out"
            danger
            onPress={async () => {
              await supabase.auth.signOut();
              router.push("/(welcome)");
            }}
          />
        </View>
      </Animated.View>
    </>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onPress,
}: {
  icon: any;
  label: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      {icon === "log-out" ? (
        <Feather
          name="log-out"
          size={20}
          color="#1E90D6"
        />
      ) : (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color="#1E90D6"
        />
      )}

      <Text
        style={[
          styles.itemText,
          danger && { fontWeight: "600" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 40,
  },

  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#FFF",
    elevation: 10,
    zIndex: 50,
  },

  header: {
    height: 160,
    padding: 20,
    justifyContent: "flex-end",
  },

  logo: {
    width: 52,
    height: 52,
    marginBottom: 8,
  },

  username: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  menu: {
    paddingVertical: 12,
  },

  section: {
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 20,
    fontSize: 14,
    color: "#B0B0B0",
    fontWeight: "600",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  itemText: {
    marginLeft: 16,
    fontSize: 15,
    color: "#111",
  },

  footer: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderColor: "#EEE",
  },
});
