import { supabase } from "@/lib/supabase";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return session
    ? <Redirect href="/(welcome)" />
    : <Redirect href="/(auth)" />;
}



// import { Redirect } from "expo-router";
// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";

// export default function Index() {
//   const [loading, setLoading] = useState(true);
//   const [hasSession, setHasSession] = useState(false);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setHasSession(!!data.session);
//       setLoading(false);
//     });
//   }, []);

//   if (loading) return null;

//   return hasSession
//     ? <Redirect href="/(tabs)" />
//     : <Redirect href="/(auth)" />;
// }
