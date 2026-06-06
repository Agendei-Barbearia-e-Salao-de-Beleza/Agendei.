import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { View, Text } from "react-native";
import "../global.css";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/welcome");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isReady, segments]);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <Text className="text-white">Carregando...</Text>
      </View>
    );
  }

  return <Slot />;
}
