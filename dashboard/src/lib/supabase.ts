import { createBrowserClient } from '@supabase/ssr'

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
    // Retorna um objeto "fake" durante o build para não quebrar
    return {
      auth: { getUser: async () => ({ data: { user: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) })
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Exportamos como uma instância única, mas inicializada com segurança
export const supabase = typeof window !== 'undefined' 
  ? getSupabase() 
  : getSupabase() // No servidor (build), getSupabase agora é seguro
