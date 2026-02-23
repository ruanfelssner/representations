import { createError } from 'h3'
import { promises as fs } from 'node:fs'
import path from 'node:path'

type TerritoryRegionDoc = {
  _id: string
  nome?: string
  cityIds?: unknown
}

function normalizeId(value: unknown) {
  return String(value || '').trim()
}

function normalizeNumericId(value: unknown) {
  return String(value || '')
    .replace(/\D/g, '')
    .trim()
}

export function normalizeCityIds(input: unknown) {
  if (!Array.isArray(input)) return [] as string[]
  const unique = new Set<string>()
  for (const value of input) {
    const id = normalizeId(value)
    if (!id) continue
    unique.add(id)
  }
  return Array.from(unique)
}

function polygonPartsFromGeometry(geometry: any) {
  if (!geometry || typeof geometry !== 'object') return [] as number[][][][]
  if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
    return [geometry.coordinates as number[][][]]
  }
  if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)) {
    return geometry.coordinates as number[][][][]
  }
  return [] as number[][][][]
}

type TerritoryCityLookupDoc = {
  _id: string
  nome?: string
  stateId?: string
  ibgeCode?: string
  geometry?: unknown
}

let geoCityIndexPromise: Promise<Map<string, TerritoryCityLookupDoc>> | null = null

async function loadGeoCityIndex() {
  if (geoCityIndexPromise) return geoCityIndexPromise

  geoCityIndexPromise = (async () => {
    const index = new Map<string, TerritoryCityLookupDoc>()
    const geoDir = path.resolve(process.cwd(), 'public', 'geojson')

    let files: string[] = []
    try {
      files = await fs.readdir(geoDir)
    } catch {
      return index
    }

    const cityFiles = files.filter((file) => /^cities-[a-z]{2}\.geojson$/i.test(file))
    for (const fileName of cityFiles) {
      const match = fileName.match(/^cities-([a-z]{2})\.geojson$/i)
      if (!match) continue

      const uf = String(match[1] || '')
        .trim()
        .toUpperCase()
      const stateId = uf ? `UF:${uf}` : ''

      try {
        const raw = await fs.readFile(path.join(geoDir, fileName), 'utf8')
        const payload = JSON.parse(raw) as any
        const features = Array.isArray(payload?.features) ? payload.features : []

        for (const feature of features) {
          const rawId = normalizeId(feature?.properties?.id || feature?.id || '')
          const numericId = normalizeNumericId(rawId)
          const cityId = numericId || rawId
          if (!cityId) continue

          const geometry = feature?.geometry
          if (!geometry || typeof geometry !== 'object') continue

          const nome = String(
            feature?.properties?.name ||
              feature?.properties?.nome ||
              feature?.properties?.description ||
              cityId
          ).trim()

          const cityDoc: TerritoryCityLookupDoc = {
            _id: cityId,
            nome: nome || cityId,
            stateId: stateId || undefined,
            ibgeCode: numericId || undefined,
            geometry,
          }

          const keys = new Set<string>([
            cityId,
            rawId,
            numericId,
            normalizeNumericId(feature?.properties?.id),
            normalizeNumericId(feature?.id),
          ])

          for (const key of keys) {
            const normalized = normalizeId(key)
            if (!normalized) continue
            index.set(normalized, cityDoc)
          }
        }
      } catch {
        // ignora arquivo inválido
      }
    }

    return index
  })()

  return geoCityIndexPromise
}

export function buildRegionGeometryFromCities(cities: any[]) {
  const polygons: number[][][][] = []
  const stateIds = new Set<string>()
  const missingGeometryCities: string[] = []

  for (const city of cities) {
    const cityName = String(city?.nome || city?._id || 'cidade')
    const cityPolygons = polygonPartsFromGeometry(city?.geometry)
    if (!cityPolygons.length) {
      missingGeometryCities.push(cityName)
      continue
    }
    polygons.push(...cityPolygons)

    const stateId = normalizeId(city?.stateId)
    if (stateId) stateIds.add(stateId)
  }

  if (missingGeometryCities.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Cidades sem geometria: ${missingGeometryCities.slice(0, 10).join(', ')}.`,
    })
  }

  if (!polygons.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Não foi possível montar a geometria da área com as cidades informadas.',
    })
  }

  if (polygons.length === 1) {
    return {
      geometry: {
        type: 'Polygon' as const,
        coordinates: polygons[0],
      },
      stateIds: Array.from(stateIds),
    }
  }

  return {
    geometry: {
      type: 'MultiPolygon' as const,
      coordinates: polygons,
    },
    stateIds: Array.from(stateIds),
  }
}

export async function loadCitiesByIds(db: any, cityIds: string[]) {
  const normalizedCityIds = normalizeCityIds(cityIds)
  const numericCityIds = Array.from(
    new Set(normalizedCityIds.map((cityId) => normalizeNumericId(cityId)).filter(Boolean))
  )

  const rowsById = (await db
    .collection('cities')
    .find(
      {
        _id: { $in: normalizedCityIds },
        ativo: { $ne: false },
      },
      {
        projection: { _id: 1, nome: 1, stateId: 1, ibgeCode: 1, geometry: 1 },
      }
    )
    .toArray()) as TerritoryCityLookupDoc[]

  const rowsByIbgeCode = (
    numericCityIds.length
      ? ((await db
          .collection('cities')
          .find(
            {
              ibgeCode: { $in: numericCityIds },
              ativo: { $ne: false },
            },
            {
              projection: { _id: 1, nome: 1, stateId: 1, ibgeCode: 1, geometry: 1 },
            }
          )
          .toArray()) as TerritoryCityLookupDoc[])
      : []
  ) as TerritoryCityLookupDoc[]

  const byDbId = new Map<string, TerritoryCityLookupDoc>()
  for (const row of rowsById) {
    const id = normalizeId(row?._id)
    if (!id) continue
    byDbId.set(id, row)
  }

  const byIbgeCode = new Map<string, TerritoryCityLookupDoc>()
  for (const row of [...rowsById, ...rowsByIbgeCode]) {
    const ibge = normalizeNumericId(row?.ibgeCode || row?._id)
    if (!ibge) continue
    if (!byIbgeCode.has(ibge)) {
      byIbgeCode.set(ibge, row)
    }
  }

  const resolvedByRequestedId = new Map<string, TerritoryCityLookupDoc>()
  for (const cityId of normalizedCityIds) {
    const byId = byDbId.get(cityId)
    if (byId) {
      resolvedByRequestedId.set(cityId, byId)
      continue
    }

    const numeric = normalizeNumericId(cityId)
    if (numeric && byIbgeCode.has(numeric)) {
      resolvedByRequestedId.set(cityId, byIbgeCode.get(numeric)!)
    }
  }

  const missing = normalizedCityIds.filter((cityId) => !resolvedByRequestedId.has(cityId))
  if (missing.length) {
    const geoCityIndex = await loadGeoCityIndex()
    for (const cityId of missing) {
      const byGeoId = geoCityIndex.get(cityId)
      if (byGeoId) {
        resolvedByRequestedId.set(cityId, byGeoId)
        continue
      }

      const numeric = normalizeNumericId(cityId)
      if (numeric && geoCityIndex.has(numeric)) {
        resolvedByRequestedId.set(cityId, geoCityIndex.get(numeric)!)
      }
    }
  }

  const unresolved = normalizedCityIds.filter((cityId) => !resolvedByRequestedId.has(cityId))
  if (unresolved.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Cidades inválidas ou inativas: ${unresolved.slice(0, 20).join(', ')}.`,
    })
  }

  return normalizedCityIds
    .map((cityId) => resolvedByRequestedId.get(cityId))
    .filter((city): city is TerritoryCityLookupDoc => !!city)
}

export async function assertNoActiveRegionCityConflicts(
  db: any,
  cityIds: string[],
  opts: { excludeRegionId?: string } = {}
) {
  if (!cityIds.length) return

  const filter: Record<string, unknown> = {
    ativo: { $ne: false },
    cityIds: { $in: cityIds },
  }

  const excludeRegionId = normalizeId(opts.excludeRegionId)
  if (excludeRegionId) {
    filter._id = { $ne: excludeRegionId }
  }

  const matches = (await db
    .collection('regions')
    .find(filter, { projection: { _id: 1, nome: 1, cityIds: 1 } })
    .toArray()) as TerritoryRegionDoc[]

  if (!matches.length) return

  const requested = new Set(cityIds)
  const conflicts: Array<{ cityId: string; regionId: string; regionName: string }> = []

  for (const row of matches) {
    const rowCityIds = normalizeCityIds(row?.cityIds)
    for (const cityId of rowCityIds) {
      if (!requested.has(cityId)) continue
      conflicts.push({
        cityId,
        regionId: String(row?._id || ''),
        regionName: String(row?.nome || row?._id || 'Área'),
      })
    }
  }

  if (!conflicts.length) return

  const preview = conflicts
    .slice(0, 6)
    .map((item) => `${item.cityId} (${item.regionName})`)
    .join(', ')

  throw createError({
    statusCode: 409,
    statusMessage: `Cidades já vinculadas em outra área ativa: ${preview}.`,
    data: { conflicts },
  })
}
