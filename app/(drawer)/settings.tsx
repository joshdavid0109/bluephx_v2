import NotificationBell from "@/components/NotificationBell";
import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { open } = useSideNav(); // ✅ SAME AS HOME
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("id", user.id)
      .single();

    if (data?.username) {
      setUsername(data.username);
    }
  };

  /* ======================
     ACCOUNT
  ====================== */
  const saveUsername = async () => {
    if (!username.trim()) {
      Alert.alert("Username is required");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({ username })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Username updated");
    }
  };

  /* ======================
     PASSWORD
  ====================== */
  const changePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER — SAME PATTERN AS PEER REVIEW */}
    <View style={styles.header}>
    <TouchableOpacity onPress={open} style={styles.menu}>
        <Feather name="menu" size={26} color="#63B3ED" />
    </TouchableOpacity>

    <View style={{ flexDirection: "row", alignItems: "center" }}>
        <NotificationBell />

        <Image
        source={{
            uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
        }}
        style={styles.headerLogo}
        />
    </View>
    </View>


      {/* WHITE PANEL */}
      <View style={styles.panel}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ACCOUNT */}
          <Text style={styles.sectionTitle}>Account</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholder="Username"
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={saveUsername}>
            <Text style={styles.primaryText}>
              {loading ? "Saving..." : "Save Username"}
            </Text>
          </TouchableOpacity>

          {/* SECURITY */}
          <Text style={styles.sectionTitle}>Security</Text>

          <TextInput
            placeholder="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
          />

          <TextInput
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={changePassword}>
            <Text style={styles.primaryText}>Change Password</Text>
          </TouchableOpacity>

          {/* BILLING */}
          <Text style={styles.sectionTitle}>Billing & Subscription</Text>

          <View style={styles.card}>
            <Text style={styles.smallLabel}>Plan</Text>
            <Text style={styles.value}>Premium (Monthly)</Text>

            <Text style={styles.smallLabel}>Status</Text>
            <Text style={styles.value}>Active</Text>

            <Text style={styles.smallLabel}>Next Billing</Text>
            <Text style={styles.value}>Feb 21, 2026</Text>
          </View>

          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Manage Payment</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ======================
   STYLES (MATCH HOME)
====================== */
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
  },
  menu: {
    marginTop: 10,
  },

    headerLogo: {
    width: 48,
    height: 48,
    },


  headerRight: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 20,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  primaryBtn: {
    backgroundColor: "#04183B",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  smallLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#04183B",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },

  secondaryText: {
    color: "#04183B",
    fontWeight: "600",
  },
});
