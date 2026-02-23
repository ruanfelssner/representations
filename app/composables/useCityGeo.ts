type LatLng = { lat: number; lng: number }

export type CityGeoFeature = {
  id: string
  uf: string
  name: string
  normalizedName: string
  paths: LatLng[]
  centroid: LatLng
}

function normalizeText(value: string | undefined) {
  if (!value) return ''
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeNumericId(value: string | undefined) {
  return String(value || '')
    .replace(/\D/g, '')
    .trim()
}

function cityNameKey(normalizedName: string, uf?: string) {
  const normalizedUf = String(uf || '')
    .trim()
    .toUpperCase()
  return normalizedUf ? `${normalizedUf}:${normalizedName}` : normalizedName
}

function parsePolygonGeometry(geometry: any) {
  if (!geometry || typeof geometry !== 'object') return [] as LatLng[]

  if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates?.[0])) {
    return geometry.coordinates[0]
      .filter((coord: any) => Array.isArray(coord) && coord.length >= 2)
      .map((coord: any) => ({ lat: Number(coord[1]), lng: Number(coord[0]) }))
      .filter((coord: LatLng) => Number.isFinite(coord.lat) && Number.isFinite(coord.lng))
  }

  if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates?.[0]?.[0])) {
    return geometry.coordinates[0][0]
      .filter((coord: any) => Array.isArray(coord) && coord.length >= 2)
      .map((coord: any) => ({ lat: Number(coord[1]), lng: Number(coord[0]) }))
      .filter((coord: LatLng) => Number.isFinite(coord.lat) && Number.isFinite(coord.lng))
  }

  return [] as LatLng[]
}

function computePathsCenter(paths: LatLng[]) {
  if (!paths.length) return null
  const latValues = paths.map((p) => p.lat)
  const lngValues = paths.map((p) => p.lng)
  return {
    lat: (Math.min(...latValues) + Math.max(...latValues)) / 2,
    lng: (Math.min(...lngValues) + Math.max(...lngValues)) / 2,
  }
}

function extractCityFeatures(payload: any, uf: string): CityGeoFeature[] {
  if (!payload || !Array.isArray(payload.features)) return []

  const normalizedUf = String(uf || '')
    .trim()
    .toUpperCase()

  const parsed: CityGeoFeature[] = []
  for (const feature of payload.features as any[]) {
    const rawId = String(feature?.properties?.id || feature?.id || '').trim()
    const id = normalizeNumericId(rawId) || rawId
    const name = String(feature?.properties?.name || feature?.properties?.description || id).trim()
    const paths = parsePolygonGeometry(feature?.geometry)
    const centroid = computePathsCenter(paths)
    if (!id || !name || !paths.length || !centroid) continue

    parsed.push({
      id,
      uf: normalizedUf,
      name,
      normalizedName: normalizeText(name),
      paths,
      centroid,
    })
  }

  return parsed.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

async function fetchCityGeoJsonByUf(uf: string) {
  const normalized = String(uf || '').trim()
  if (!normalized) return null
  const candidates = Array.from(new Set([normalized.toLowerCase(), normalized.toUpperCase()]))

  for (const suffix of candidates) {
    try {
      return await $fetch(`/geojson/cities-${suffix}.geojson`)
    } catch {
      // tenta a próxima variação de nome
    }
  }

  return null
}

export function useCityGeo() {
  return {
    normalizeText,
    normalizeNumericId,
    cityNameKey,
    parsePolygonGeometry,
    computePathsCenter,
    extractCityFeatures,
    fetchCityGeoJsonByUf,
  }
}
