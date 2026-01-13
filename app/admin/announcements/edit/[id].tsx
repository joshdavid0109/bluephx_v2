import { useSideNav } from "@/context/SideNavContext";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditAnnouncementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { open } = useSideNav();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ---------- ADMIN GUARD ---------- */
  useEffect(() => {
    guardAdmin();
    fetchAnnouncement();
  }, []);

  const guardAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace("/main");

    const { data } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!data?.is_admin) router.replace("/main");
  };

  /* ---------- FETCH ---------- */
  const fetchAnnouncement = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("title, body, image_url")
      .eq("id", id)
      .single();

    if (error || !data) {
      Alert.alert("Error", "Announcement not found.");
      console.log(error)
      router.back();
      return;
    }

    setTitle(data.title);
    setContent(data.body);
    setImageUrl(data.image_url);
    setLoading(false);
  };

  /* ---------- IMAGE PICKER ---------- */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const ext = asset.uri.split(".").pop();
    const fileName = `announcement-${Date.now()}.${ext}`;

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

      if (error) throw error;

      const { data } = supabase.storage
        .from("announcements")
        .getPublicUrl(fileName);

      setImageUrl(data.publicUrl);
    } catch (e) {
      console.error(e);
      setErrorMsg("Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SAVE ---------- */
  const save = async () => {
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and content are required.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase
      .from("announcements")
      .update({
        title: title.trim(),
        body: content.trim(),
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      setErrorMsg("Failed to update announcement.");
    } else {
      router.back();
    }
  };

  /* ---------- DELETE ---------- */
  const deleteAnnouncement = async () => {
    Alert.alert(
      "Delete Announcement",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await supabase
              .from("announcements")
              .delete()
              .eq("id", id);
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator size="large" color="#04183B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER */}
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

        <Text style={styles.title}>Edit Announcement</Text>

        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Title"
        />

        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          style={[styles.input, styles.textArea]}
          placeholder="Content"
        />

        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
          <Text style={styles.imageBtnText}>
            {imageUrl ? "Change Image" : "Upload Image"}
          </Text>
        </TouchableOpacity>

        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.preview} />
        )}

        <TouchableOpacity style={styles.btn} onPress={save}>
          <Text style={styles.btnText}>SAVE CHANGES</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.danger]}
          onPress={deleteAnnouncement}
        >
          <Text style={styles.btnText}>DELETE</Text>
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

  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  back: {
    fontFamily: "Poppins_600SemiBold",
    color: "#63B3ED",
    marginBottom: 12,
  },

  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#04183B",
    marginBottom: 12,
  },

  error: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
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

  danger: {
    backgroundColor: "#DC2626",
  },

  btnText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
});
