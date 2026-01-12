import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const MIN_SPLASH_TIME = 1200; // ms (try 1000–1500)


export default function WelcomeScreen() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);

  // Bottom card animation
  const cardTranslateY = useRef(new Animated.Value(400)).current;
  const loadingOpacity = useRef(new Animated.Value(1)).current;
  

  useEffect(() => {
    const checkSessionWithDelay = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();

        const delayPromise = new Promise((resolve) =>
          setTimeout(resolve, MIN_SPLASH_TIME)
        );

        const [
          { data: { session } },
        ] = await Promise.all([
          sessionPromise,
          delayPromise,
        ]);

        if (session) {
          // ✅ Logged in → skip welcome
          router.replace("/main"); // adjust if needed
          return;
        }

        // ❌ Not logged in → show welcome UI
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setCheckingSession(false);

          Animated.spring(cardTranslateY, {
            toValue: 0,
            friction: 8,
            tension: 70,
            useNativeDriver: true,
          }).start();
        });
      } catch (e) {
        console.error("Session check failed:", e);
        setCheckingSession(false);
      }
    };

    checkSessionWithDelay();
  }, []);



  const onGetStarted = () => {
    router.push("/subscription");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Static Logo (NO animation) */}
      <Image
        source={{
          uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Brand */}
      <View style={styles.brandRow}>
        <Text style={styles.brandBlue}>BLUE</Text>
        <Text style={styles.brandWhite}>PHOENIX</Text>
      </View>

      {/* Loading */}
      {checkingSession && (
        <Animated.View style={[styles.loader, { opacity: loadingOpacity }]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading</Text>
        </Animated.View>
      )}

      {/* Bottom Card */}
      {!checkingSession && (
        <Animated.View
          style={[
            styles.bottomCard,
            { transform: [{ translateY: cardTranslateY }] },
          ]}
        >
          <View style={styles.handle} />

          <Text style={styles.welcome}>WELCOME</Text>

          <View style={styles.pager}>
            <Text style={styles.pagerText}>
              Prepare smarter. Pass with confidence.
            </Text>
          </View>

          <View style={styles.dots}>
            <View style={styles.dotInactive} />
            <View style={styles.dotActive} />
            <View style={styles.dotInactive} />
          </View>

          <TouchableOpacity style={styles.button} onPress={onGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}



import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#04183B",
    alignItems: "center",
  },

  logo: {
    width: 169,
    height: 200,
    marginTop: 80,
  },

  brandRow: {

    flexDirection: "row",
  },

  brandBlue: {
    fontSize: 38,
    fontFamily: "Poppins_800ExtraBold",
    color: "#4FC3F7",
    marginRight: 2,
  },

  brandWhite: {
    fontSize: 38,
    fontFamily: "Poppins_800ExtraBold",
    color: "#FFFFFF",
    marginLeft: 2,
  },

  /* Loader */
  loader: {
    position: "absolute",
    bottom: 120,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontFamily: "Poppins_400Regular",
    color: "#FFFFFF",
    fontSize: 14,
  },

  /* Bottom Card */
  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 315,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  handle: {
    width: 50,
    height: 3,
    backgroundColor: "#04183B",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },

  welcome: {
    fontSize: 34,
    fontFamily: "Poppins_800ExtraBold",
    textAlign: "center",
    color: "#4FC3F7",
    marginBottom: 12,
  },

  pager: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  pagerText: {
    fontFamily: "Poppins_400Regular",
    color: "#888",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },

  dotInactive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#CCC",
    marginHorizontal: 4,
  },

  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#04183B",
    marginHorizontal: 4,
  },

  button: {
    borderWidth: 2,
    borderColor: "#04183B",
    borderRadius: 8,
    paddingVertical: 12,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
  },
});
