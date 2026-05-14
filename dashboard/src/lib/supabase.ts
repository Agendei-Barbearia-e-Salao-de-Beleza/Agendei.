import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Só cria o cliente se as chaves existirem, para evitar erro no build da Vercel
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : (null as any) // Retorna null durante o build
