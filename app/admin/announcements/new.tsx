import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* ---------- SCREEN ---------- */

export default function NewAnnouncementScreen() {
  const router = useRouter();
  const { open } = useSideNav();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ---------- IMAGE PICKER ---------- */

  const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return;

  const asset = result.assets[0];
  const fileExt = asset.uri.split(".").pop();
  const fileName = `announcement-${Date.now()}.${fileExt}`;

  try {
    setLoading(true);

    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
      .from("announcements")
      .upload(fileName, arrayBuffer, {
        contentType: asset.mimeType ?? "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error(error);
      setErrorMsg("Image upload failed.");
      return;
    }

    const { data } = supabase.storage
      .from("announcements")
      .getPublicUrl(fileName);

    setImageUrl(data.publicUrl);
  } catch (e) {
    console.error(e);
    setErrorMsg("Image upload error.");
  } finally {
    setLoading(false);
  }
};


  /* ---------- SUBMIT ---------- */

  const submitAnnouncement = async () => {
    if (!title.trim() || !body.trim()) {
      setErrorMsg("Title and content are required.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Unauthorized.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("announcements").insert({
    title: title.trim(),
    body: body.trim(),      // ✅ FIXED
    image_url: imageUrl,
    created_by: user.id,
    is_active: true,           // ✅ good default
    });


    setLoading(false);

    if (error) {
    console.error("ANNOUNCEMENT INSERT ERROR:", error);

      setErrorMsg("Failed to save announcement.");
      return;
    }

    router.push("/(drawer)/main");
  };

  /* ---------- UI ---------- */

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER (EXACT COPY) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={open}>
          <Feather name="menu" size={26} color="#63B3ED" />
        </TouchableOpacity>

        <Image
          source={{
            uri: "https://cbjgqanwvblylaubozmj.supabase.co/storage/v1/object/public/logo/bpx_logo.png",
          }}
          style={styles.logo}
        />
      </View>

      {/* PANEL */}
      <View style={styles.panel}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>New Announcement</Text>

        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

        <TextInput
          placeholder="Announcement title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Announcement content"
          value={body}
          onChangeText={setBody}
          multiline
          style={[styles.input, styles.textArea]}
        />

        {/* IMAGE */}
        <TouchableOpacity
          style={styles.imageBtn}
          onPress={pickImage}
        >
          <Text style={styles.imageBtnText}>
            {imageUrl ? "Change Image" : "Upload Image"}
          </Text>
        </TouchableOpacity>

        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.preview}
          />
        )}

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={submitAnnouncement}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>PUBLISH</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */

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
    alignItems: "center",
  },

  logo: {
    width: 40,
    height: 40,
  },

  /* PANEL */
  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  back: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: "#63B3ED",
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#04183B",
    marginBottom: 12,
  },

  error: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#DC2626",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
  },

  textArea: {
    height: 120,
    textAlignVertical: "top",
  },

  imageBtn: {
    borderWidth: 1,
    borderColor: "#04183B",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },

  imageBtnText: {
    textAlign: "center",
    fontFamily: "Poppins_600SemiBold",
    color: "#04183B",
  },

  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#E5E7EB",
  },

  btn: {
    backgroundColor: "#04183B",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "center",
  },

  btnText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },
});
