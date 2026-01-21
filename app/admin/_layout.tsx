import { supabase } from "@/lib/supabase";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function AdminLayout() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAllowed(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setAllowed(data?.role === "admin");
    };

    checkRole();
  }, []);

  if (allowed === null) return null;

  if (!allowed) {
    return <Redirect href="/(drawer)/main" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ FIX
      }}
    />
  );
}
