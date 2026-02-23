import { z } from 'zod'
import { getMongoDb } from '../../utils/mongo'
import { parseWithZod } from '../../utils/validation'
import { toSimpleIdApi } from '../../utils/dto'
import { GeoJsonMultiPolygonSchema, GeoJsonPolygonSchema } from '~/types/schemas'
import { ensureTerritoryIndexes, normalizeText } from '../../utils/territory'

const RegionCreateSchema = z.object({
  nome: z.string().trim().min(1),
  stateIds: z.array(z.string().trim().min(1)).default([]),
  geometry: z.union([GeoJsonPolygonSchema, GeoJsonMultiPolygonSchema]),
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

  const db = await getMongoDb()
  await ensureTerritoryIndexes(db)

  const now = new Date().toISOString()
  const base = toSlug(parsed.nome) || 'region'
  const id = `${base}-${Date.now().toString(36)}`

  const doc = {
    _id: id,
    nome: parsed.nome,
    normalizedName: normalizeText(parsed.nome),
    stateIds: parsed.stateIds,
    geometry: parsed.geometry,
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
