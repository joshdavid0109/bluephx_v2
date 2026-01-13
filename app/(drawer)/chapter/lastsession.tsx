// app/chapters/lastsession.tsx
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function LastSession() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/(auth)"
        );
        return;
      }

      const { data } = await supabase
        .from("user_reading_progress")
        .select("chapter_id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (!data?.chapter_id) {
        router.replace("/(drawer)/main");
        return;
      }

      router.replace(`/chapter/${data.chapter_id}`);
    })();
  }, []);

  return null;
}
