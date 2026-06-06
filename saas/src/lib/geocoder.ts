export interface Coordinates {
  lat: number
  lng: number
}

// Cache em memória (sobrevive apenas durante a instância do servidor)
const coordsCache = new Map<string, Coordinates>()

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const key = address.toLowerCase().trim()

  if (coordsCache.has(key)) {
    return coordsCache.get(key)!
  }

  const query = encodeURIComponent(address + ", Brasil")
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=br`

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Agendei-SaaS/1.0 (academic-project)" },
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!data.length) return null

    const coords: Coordinates = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }

    coordsCache.set(key, coords)
    return coords
  } catch {
    return null
  }
}
