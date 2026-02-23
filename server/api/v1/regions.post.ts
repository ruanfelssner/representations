import { z } from 'zod'
import { getMongoDb } from '../../utils/mongo'
import { parseWithZod } from '../../utils/validation'
import { toSimpleIdApi } from '../../utils/dto'
import { ensureTerritoryIndexes, normalizeText } from '../../utils/territory'
import {
  assertNoActiveRegionCityConflicts,
  buildRegionGeometryFromCities,
  loadCitiesByIds,
  normalizeCityIds,
} from '../../utils/regions'

const RegionCreateSchema = z.object({
  nome: z.string().trim().min(1),
  cityIds: z.array(z.string().trim().min(1)).min(1),
  color: z.string().trim().optional(),
  priority: z.number().int().min(0).default(0),
  representanteUserId: z.string().trim().optional(),
  ativo: z.boolean().default(true),
})

function toSlug(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as unknown
  const parsed = parseWithZod(RegionCreateSchema, body)
  const cityIds = normalizeCityIds(parsed.cityIds)

  const db = await getMongoDb()
  await ensureTerritoryIndexes(db)
  await assertNoActiveRegionCityConflicts(db, cityIds)

  const cities = await loadCitiesByIds(db, cityIds)
  const { geometry, stateIds } = buildRegionGeometryFromCities(cities)

  const now = new Date().toISOString()
  const base = toSlug(parsed.nome) || 'region'
  const id = `${base}-${Date.now().toString(36)}`

  const doc = {
    _id: id,
    nome: parsed.nome,
    normalizedName: normalizeText(parsed.nome),
    stateIds,
    cityIds,
    geometry,
    color: parsed.color || undefined,
    priority: parsed.priority,
    representanteUserId: parsed.representanteUserId || undefined,
    ativo: parsed.ativo,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('regions').insertOne(doc)
  return { success: true, data: toSimpleIdApi(doc) }
})
