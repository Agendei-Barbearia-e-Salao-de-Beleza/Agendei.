import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// These should be configured in .env or eas secret
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://vpalasmdcxnhpsbwmsqq.supabase.co";
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_4Gy_GS1rdX_oGlzxYgF8Sg_snXLmTdO";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
