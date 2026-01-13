import { supabase } from "@/lib/supabase";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Mode = "login" | "register";

export default function AuthScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const toggleAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (next: Mode) => {
    setMode(next);
    Animated.timing(toggleAnim, {
      toValue: next === "login" ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  /* ---------- AUTH HANDLERS ---------- */

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.replace("/main");
    } catch (err: any) {
      Alert.alert("Login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert("Missing fields", "Please fill all fields");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      Alert.alert(
        "Account created",
        "Please check your email to verify your account"
      );

      switchMode("login");
    } catch (err: any) {
      Alert.alert("Registration failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    if (mode === "login") handleLogin();
    else handleRegister();
  };

  /* ---------- UI ---------- */

  const toggleBg = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#35AAD7", "#E4E4E4"],
  });

  const toggleBgRight = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E4E4E4", "#35AAD7"],
  });

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Email required",
        "Please enter your email address first."
      );
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          // 👇 IMPORTANT: this must exist in your app
          redirectTo: "bluephoenix://reset-password",
        }
      );

      if (error) throw error;

      Alert.alert(
        "Password reset sent",
        "Check your email for the password reset link."
      );
    } catch (err: any) {
      Alert.alert("Reset failed", err.message);
    } finally {
      setLoading(false);
    }
  };

    


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Logo */}
      <Image
        source={{
          uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
        }}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>
        {mode === "login" ? "Welcome Back" : "Registration"}
      </Text>
      <Text style={styles.subtitle}>
        {mode === "login"
          ? "Sign in to continue using the app"
          : "Create your account"}
      </Text>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <Animated.View style={[styles.toggleBtn, { backgroundColor: toggleBg }]}>
          <TouchableOpacity onPress={() => switchMode("login")}>
            <Text
              style={[
                styles.toggleText,
                mode === "login" && styles.toggleTextActive,
              ]}
            >
              LOGIN
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[styles.toggleBtn, { backgroundColor: toggleBgRight }]}
        >
          <TouchableOpacity onPress={() => switchMode("register")}>
            <Text
              style={[
                styles.toggleText,
                mode === "register" && styles.toggleTextActive,
              ]}
            >
              REGISTER
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputRow}>
          <MaterialIcons name="person-outline" size={18} color="#0F172A" />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.underline} />

        <View style={styles.inputRow}>
            <Feather name="lock" size={18} color="#0F172A" />

            <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#0F172A"
                />
            </TouchableOpacity>
        </View>

        <View style={styles.underline} />

            {mode === "register" && (
        <>
            <View style={styles.inputRow}>
            <Feather name="lock" size={18} color="#0F172A" />

            <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!showConfirm}
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
            />

            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Feather
                name={showConfirm ? "eye-off" : "eye"}
                size={18}
                color="#0F172A"
                />
            </TouchableOpacity>
            </View>

            <View style={styles.underline} />
        </>
        )}


        {mode === "login" && (
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.primaryText}>
          {loading ? "PLEASE WAIT..." : mode === "login" ? "LOGIN" : "REGISTER"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },

  /* Logo */
  logo: {
    width: 90,
    height: 90,
    marginBottom: 14,
  },

  /* Titles */
  title: {
    fontSize: 28,
    fontFamily: "Poppins_800ExtraBold",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#475569",
    textAlign: "center",
    marginBottom: 22,
  },

  /* Toggle */
  toggleRow: {
    flexDirection: "row",
    marginBottom: 28,
  },

  toggleBtn: {
    width: 140,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  toggleText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 13,
    letterSpacing: 1,
    color: "#0F172A",
  },

  toggleTextActive: {
    color: "#FFFFFF",
  },

  /* Form */
  form: {
    width: "85%",
    marginBottom: 22,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#0F172A",
  },

  underline: {
    height: 1,
    backgroundColor: "#CBD5E1",
    marginBottom: 4,
  },

  forgot: {
    marginTop: 8,
    textAlign: "right",
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#0F172A",
  },

  /* CTA */
  primaryButton: {
    width: "85%",
    backgroundColor: "#35AAD7",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 18,
    elevation: 2,
  },

  primaryText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    letterSpacing: 1,
    color: "#FFFFFF",
  },

  /* Social */
  orText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#0F172A",
    marginBottom: 14,
  },

  socialRow: {
    flexDirection: "row",
    gap: 18,
  },

  socialIcon: {
    width: 36,
    height: 36,
  },
});
