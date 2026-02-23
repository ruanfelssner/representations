import { createError } from 'h3'

type Point = { type: 'Point'; coordinates: [number, number] }

type ResolveTerritoryOptions = {
  stateIdHint?: string
  stateCodeHint?: string
  cityNameHint?: string
}

type ResolveTerritoryResult = {
  stateId?: string
  stateUf?: string
  cityId?: string
  cityName?: string
  regionId?: string
}

type GeoContainer = {
  localizacao?: {
    geo?: { coordinates?: [number, number] }
    latitude?: number
    longitude?: number
  }
  lat?: number
  lng?: number
}

export function normalizeText(input: string | undefined) {
  if (!input) return ''
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeUf(input: string | undefined) {
  if (!input) return ''
  return input.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)
}

export function geoPointFromLatLng(lat?: number, lng?: number): Point | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return {
    type: 'Point',
    coordinates: [Number(lng), Number(lat)],
  }
}

export function extractClientGeoPoint(doc: GeoContainer): Point | null {
  const coords = doc?.localizacao?.geo?.coordinates
  if (
    Array.isArray(coords) &&
    coords.length === 2 &&
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1])
  ) {
    return { type: 'Point', coordinates: [Number(coords[0]), Number(coords[1])] }
  }

  const lat = Number(doc?.localizacao?.latitude ?? doc?.lat)
  const lng = Number(doc?.localizacao?.longitude ?? doc?.lng)
  return geoPointFromLatLng(lat, lng)
}

export async function ensureTerritoryIndexes(db: any) {
  const cacheKey = '__territoryIndexesReadyAt'
  const now = Date.now()
  const cachedAt = (globalThis as any)[cacheKey]
  if (typeof cachedAt === 'number' && now - cachedAt < 15 * 60_000) return

  await Promise.allSettled([
    db.collection('states').createIndex({ uf: 1 }, { name: 'uf_1' }),
    db.collection('states').createIndex({ geometry: '2dsphere' }, { name: 'geometry_2dsphere' }),
    db.collection('cities').createIndex({ stateId: 1, nome: 1 }, { name: 'stateId_1_nome_1' }),
    db.collection('cities').createIndex(
      { stateId: 1, normalizedName: 1 },
      { name: 'stateId_1_normalizedName_1' }
    ),
    db.collection('cities').createIndex({ geometry: '2dsphere' }, { name: 'geometry_2dsphere' }),
    db.collection('regions').createIndex({ stateIds: 1, ativo: 1 }, { name: 'stateIds_1_ativo_1' }),
    db.collection('regions').createIndex({ representanteUserId: 1, ativo: 1 }, { name: 'representanteUserId_1_ativo_1' }),
    db.collection('regions').createIndex({ geometry: '2dsphere' }, { name: 'geometry_2dsphere' }),
    db.collection('clients').createIndex({ 'localizacao.geo': '2dsphere' }, { name: 'localizacao.geo_2dsphere' }),
    db.collection('clients').createIndex({ stateId: 1, cityId: 1, status: 1 }, { name: 'stateId_1_cityId_1_status_1' }),
    db.collection('clients').createIndex({ regionId: 1, status: 1 }, { name: 'regionId_1_status_1' }),
  ])
  ;(globalThis as any)[cacheKey] = now
}

async function findStateByGeoOrHint(db: any, point: Point | null, opts: ResolveTerritoryOptions) {
  const ufHint = normalizeUf(opts.stateCodeHint)

  if (opts.stateIdHint) {
    const byId = await db.collection('states').findOne({ _id: opts.stateIdHint, ativo: { $ne: false } })
    if (byId) return byId
  }

  if (point) {
    const byGeo = await db.collection('states').findOne(
      {
        ativo: { $ne: false },
        geometry: { $geoIntersects: { $geometry: point } },
      },
      { projection: { _id: 1, uf: 1, nome: 1 } }
    )
    if (byGeo) return byGeo
  }

  if (ufHint) {
    return db.collection('states').findOne(
      {
        ativo: { $ne: false },
        $or: [{ uf: ufHint }, { code: ufHint }, { sigla: ufHint }],
      },
      { projection: { _id: 1, uf: 1, nome: 1 } }
    )
  }

  return null
}

async function findCityByGeoOrHint(db: any, point: Point | null, stateId: string | undefined, cityNameHint?: string) {
  if (point) {
    const byGeo = await db.collection('cities').findOne(
      {
        ativo: { $ne: false },
        ...(stateId ? { stateId } : {}),
        geometry: { $geoIntersects: { $geometry: point } },
      },
      { projection: { _id: 1, nome: 1 } }
    )
    if (byGeo) return byGeo
  }

  const normalized = normalizeText(cityNameHint)
  if (!normalized) return null

  return db.collection('cities').findOne(
    {
      ativo: { $ne: false },
      ...(stateId ? { stateId } : {}),
      $or: [{ normalizedName: normalized }, { nome: cityNameHint }],
    },
    { projection: { _id: 1, nome: 1 } }
  )
}

async function findRegionByGeo(db: any, point: Point | null, stateId: string | undefined) {
  if (!point) return null

  const query: Record<string, unknown> = {
    ativo: { $ne: false },
    geometry: { $geoIntersects: { $geometry: point } },
  }

  if (stateId) {
    query.$or = [{ stateIds: stateId }, { stateIds: { $size: 0 } }, { stateIds: { $exists: false } }]
  }

  return db
    .collection('regions')
    .find(query, { projection: { _id: 1 } })
    .sort({ priority: -1, updatedAt: -1 })
    .limit(1)
    .next()
}

export async function resolveTerritoryByPoint(
  db: any,
  point: Point | null,
  opts: ResolveTerritoryOptions = {}
): Promise<ResolveTerritoryResult> {
  if (!db) {
    throw createError({ statusCode: 500, statusMessage: 'MongoDB indisponível para resolver território.' })
  }

  const state = await findStateByGeoOrHint(db, point, opts)
  const stateId = state ? String(state._id) : undefined
  const stateUf =
    typeof state?.uf === 'string'
      ? normalizeUf(state.uf)
      : typeof state?.code === 'string'
        ? normalizeUf(state.code)
        : undefined

  const city = await findCityByGeoOrHint(db, point, stateId, opts.cityNameHint)
  const cityId = city ? String(city._id) : undefined
  const cityName = typeof city?.nome === 'string' ? city.nome : undefined

  const region = await findRegionByGeo(db, point, stateId)
  const regionId = region ? String(region._id) : undefined

  return {
    stateId,
    stateUf,
    cityId,
    cityName,
    regionId,
  }
}
