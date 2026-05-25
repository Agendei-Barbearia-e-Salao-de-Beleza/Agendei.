import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vpalasmdcxnhpsbwmsqq.supabase.co'
const SUPABASE_KEY = 'sb_publishable_4Gy_GS1rdX_oGlzxYgF8Sg_snXLmTdO'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})
