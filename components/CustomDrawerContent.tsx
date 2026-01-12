import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    DrawerContentScrollView,
    DrawerItem,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

export default function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>

      {/* HEADER (nav_header_main.xml equivalent) */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
         }}
          style={styles.logo}
        />
        <Text style={styles.title}>
          Blue Phoenix
        </Text>
        <Text style={styles.subtitle}>
          Illustrated Reviewers
        </Text>
      </View>

      {/* MAIN */}
      <DrawerItem
        label="Home"
        icon={({ size }) => (
          <Feather name="home" size={size} color="#04183B" />
        )}
        onPress={() => router.push("/")}
      />

      <DrawerItem
        label="Calendar"
        icon={({ size }) => (
          <MaterialCommunityIcons
            name="calendar-month"
            size={size}
            color="#04183B"
          />
        )}
        onPress={() => router.push("/calendar")}
      />

      <DrawerItem
        label="Peer Review and Discussion"
        icon={({ size }) => (
          <MaterialCommunityIcons
            name="forum"
            size={size}
            color="#04183B"
          />
        )}
        onPress={() => router.push("/discussion")}
      />

      {/* SUBHEADER */}
      <Text style={styles.sectionTitle}>
        Communicate
      </Text>

      <DrawerItem
        label="About Us"
        icon={({ size }) => (
          <Feather name="info" size={size} color="#04183B" />
        )}
        onPress={() => router.push("/about")}
      />

      <DrawerItem
        label="FAQs"
        icon={({ size }) => (
          <Feather name="help-circle" size={size} color="#04183B" />
        )}
        onPress={() => router.push("/faqs")}
      />

      {/* LOGOUT */}
      <View style={styles.divider} />

      <DrawerItem
        label="Log out"
        icon={({ size }) => (
          <Feather name="log-out" size={size} color="#DC2626" />
        )}
        labelStyle={{ color: "#DC2626" }}
        onPress={() => {
          // supabase.auth.signOut()
        }}
      />
    </DrawerContentScrollView>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 160,
    backgroundColor: "#04183B",
    padding: 20,
    justifyContent: "flex-end",
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#CBD5E1",
  },
  sectionTitle: {
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 8,
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    color: "#64748B",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
    marginHorizontal: 16,
  },
});
