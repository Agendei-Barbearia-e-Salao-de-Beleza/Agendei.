import { createBrowserClient } from '@supabase/ssr'

let client: any = null

export const supabase = new Proxy({} as any, {
  get(_, prop) {
    // Se estivermos no servidor (Build), retornamos um mock seguro
    if (typeof window === 'undefined') {
      return () => ({})
    }

    // No navegador, precisamos das variáveis reais
    if (!client) {
      const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
      const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

      // Se a URL for inválida no navegador, o erro é de configuração
      if (!url || !url.startsWith('http') || url.includes('placeholder')) {
        console.error('ERRO: Variáveis do Supabase não encontradas no Vercel!')
        // Fallback apenas para evitar crash imediato, mas o login vai avisar o erro
        client = createBrowserClient('https://vpalasmdcxnhpsbwmsqq.supabase.co', 'sb_publishable_4Gy_GS1rdX_oGlzxYgF8Sg_snXLmTdO')
      } else {
        client = createBrowserClient(url, key)
      }
    }
    
    return client[prop]
  }
})
