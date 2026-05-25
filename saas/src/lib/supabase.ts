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

      // Fallback silencioso: Se não houver URL real, usa a do projeto de Produção
      const finalUrl = (!url || !url.startsWith('http') || url.includes('placeholder')) 
        ? 'https://vpalasmdcxnhpsbwmsqq.supabase.co' 
        : url;
        
      const finalKey = (!key || key.includes('placeholder'))
        ? 'sb_publishable_4Gy_GS1rdX_oGlzxYgF8Sg_snXLmTdO'
        : key;

      client = createBrowserClient(finalUrl, finalKey)
    }
    
    return client[prop]
  }
})
