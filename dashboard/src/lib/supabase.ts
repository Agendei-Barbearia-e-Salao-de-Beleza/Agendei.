import { createBrowserClient } from '@supabase/ssr'

// CONFIGURAÇÃO NUCLEAR: 
// Usamos um Proxy para que o cliente do Supabase só seja criado no momento do uso.
// Isso impede que o Next.js tente inicializar o Supabase durante o build (prerender).
let client: any = null

export const supabase = new Proxy({} as any, {
  get(_, prop) {
    if (typeof window === 'undefined') {
      // No servidor/build, retornamos um objeto vazio que não quebra
      return () => ({})
    }

    if (!client) {
      const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
      const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

      if (!url || !url.startsWith('http')) {
        console.warn('Supabase URL missing or invalid. Using placeholder for build.')
        client = createBrowserClient('https://placeholder.supabase.co', 'placeholder-key')
      } else {
        client = createBrowserClient(url, key)
      }
    }
    
    return client[prop]
  }
})
