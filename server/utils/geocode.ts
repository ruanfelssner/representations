export type GeocodeResult = {
  endereco_completo: string
  lat: number
  lng: number
  place_id?: string
  formatted_address?: string
  raw?: unknown
}

export async function geocodeAddress(endereco_completo: string, apiKey: string): Promise<GeocodeResult> {
  const address = endereco_completo.trim()
  if (!address) throw new Error('endereco_completo vazio.')
  if (!apiKey) throw new Error('Google Maps API key não configurada.')

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

  return {
    endereco_completo: address,
    lat: loc.lat,
    lng: loc.lng,
    place_id: result.place_id,
    formatted_address: result.formatted_address,
    raw: { status: data.status, result },
  }
}

