import { createBrowserClient } from '@supabase/ssr'

// CONFIGURAÇÃO BRUTAL: Se as variáveis não existirem (comum no build da Vercel), 
// usamos placeholders para não quebrar a compilação.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)
