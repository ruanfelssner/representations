import type { Db } from 'mongodb'

export type GeocodeDoc = {
  endereco_completo: string
  lat: number
  lng: number
  place_id?: string
  formatted_address?: string
  raw?: unknown
  updatedAt: string
}

declare global {
  // eslint-disable-next-line no-var
  var __geocodeIndexesReady: boolean | undefined
}

export async function ensureGeocodeIndexes(db: Db) {
  if (globalThis.__geocodeIndexesReady) return
  await db.collection<GeocodeDoc>('geocodes').createIndex({ endereco_completo: 1 }, { unique: true })
  globalThis.__geocodeIndexesReady = true
}

export async function geocodeWithCache(
  db: Db,
  endereco_completo: string,
  apiKey: string
): Promise<GeocodeDoc> {
  await ensureGeocodeIndexes(db)

  const col = db.collection<GeocodeDoc>('geocodes')
  const address = endereco_completo.trim()
  const cached = await col.findOne({ endereco_completo: address })
  if (cached) return cached

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${encodeURIComponent(apiKey)}&language=pt-BR`

  const resp = await fetch(url)
  if (!resp.ok) throw new Error('Falha ao chamar Google Geocoding.')
  const data = (await resp.json().catch(() => null)) as any

  if (!data || data.status !== 'OK' || !Array.isArray(data.results) || !data.results[0]) {
    throw new Error(`Não foi possível geocodificar: ${data?.status || 'UNKNOWN'}`)
  }

  const result = data.results[0]
  const loc = result.geometry?.location
  if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
    throw new Error('Resposta inválida do Geocoding.')
  }

  const doc: GeocodeDoc = {
    endereco_completo: address,
    lat: loc.lat,
    lng: loc.lng,
    place_id: result.place_id,
    formatted_address: result.formatted_address,
    raw: { status: data.status, result: result },
    updatedAt: new Date().toISOString(),
  }

  await col.insertOne(doc)
  return doc
}

