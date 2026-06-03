import { createBrowserClient } from '@supabase/ssr'

let _client: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
  if (globalThis.window === undefined) return null

  if (!_client) {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
    const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

    const finalUrl = (!url || !url.startsWith('http') || url.includes('placeholder'))
      ? 'https://vpalasmdcxnhpsbwmsqq.supabase.co'
      : url

    const finalKey = (!key || key.includes('placeholder'))
      ? 'sb_publishable_4Gy_GS1rdX_oGlzxYgF8Sg_snXLmTdO'
      : key

    _client = createBrowserClient(finalUrl, finalKey)
  }

  return _client
}

// Proxy que vincula `this` corretamente ao cliente real em todos os métodos
export const supabase = new Proxy({} as any, {
  get(_, prop) {
    const client = getClient()
    if (!client) return () => Promise.resolve({ data: null, error: null })
    const value = (client as any)[prop]
    if (typeof value === 'function') return value.bind(client)
    return value
  }
})
