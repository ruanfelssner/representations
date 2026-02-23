import { z } from 'zod'
import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { parseWithZod } from '../../../utils/validation'
import { toSimpleIdApi } from '../../../utils/dto'
import { GeoJsonMultiPolygonSchema, GeoJsonPolygonSchema } from '~/types/schemas'
import { normalizeText } from '../../../utils/territory'

const RegionPatchSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  stateIds: z.array(z.string().trim().min(1)).optional(),
  geometry: z.union([GeoJsonPolygonSchema, GeoJsonMultiPolygonSchema]).optional(),
  color: z.string().trim().optional(),
  priority: z.number().int().min(0).optional(),
  representanteUserId: z.string().trim().optional(),
  ativo: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const body = (await readBody(event).catch(() => ({}))) as unknown
  const patch = parseWithZod(RegionPatchSchema, body)

  const db = await getMongoDb()
  const existing = await db.collection('regions').findOne({ _id: id })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Região não encontrada.' })

  const updates: Record<string, unknown> = {
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  const unsets: Record<string, ''> = {}

  if (typeof patch.nome === 'string') {
    updates.normalizedName = normalizeText(patch.nome)
  }
  if (typeof patch.representanteUserId === 'string' && patch.representanteUserId.trim() === '') {
    delete updates.representanteUserId
    unsets.representanteUserId = ''
  }

  await db.collection('regions').updateOne(
    { _id: id },
    {
      $set: updates,
      ...(Object.keys(unsets).length ? { $unset: unsets } : {}),
    }
  )
  const updated = await db.collection('regions').findOne({ _id: id })
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Região não encontrada após update.' })

  return { success: true, data: toSimpleIdApi(updated) }
})
