import { z } from 'zod'
import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { parseWithZod } from '../../../utils/validation'
import { toSimpleIdApi } from '../../../utils/dto'
import { ensureTerritoryIndexes, normalizeText } from '../../../utils/territory'
import {
  assertNoActiveRegionCityConflicts,
  buildRegionGeometryFromCities,
  loadCitiesByIds,
  normalizeCityIds,
} from '../../../utils/regions'

const RegionPatchSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  cityIds: z.array(z.string().trim().min(1)).min(1).optional(),
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
  await ensureTerritoryIndexes(db)
  const existing = await db.collection('regions').findOne({ _id: id })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Região não encontrada.' })

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  const unsets: Record<string, ''> = {}

  if (typeof patch.nome === 'string') {
    updates.nome = patch.nome
    updates.normalizedName = normalizeText(patch.nome)
  }
  if (typeof patch.priority === 'number') {
    updates.priority = patch.priority
  }
  if (typeof patch.ativo === 'boolean') {
    updates.ativo = patch.ativo
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'color')) {
    const color = String(patch.color || '').trim()
    if (color) {
      updates.color = color
    } else {
      unsets.color = ''
    }
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'representanteUserId')) {
    const representanteUserId = String(patch.representanteUserId || '').trim()
    if (representanteUserId) {
      updates.representanteUserId = representanteUserId
    } else {
      unsets.representanteUserId = ''
    }
  }

  if (Array.isArray(patch.cityIds)) {
    const cityIds = normalizeCityIds(patch.cityIds)
    if (!cityIds.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Selecione ao menos uma cidade para a área.',
      })
    }

    await assertNoActiveRegionCityConflicts(db, cityIds, { excludeRegionId: id })

    const cities = await loadCitiesByIds(db, cityIds)
    const { geometry, stateIds } = buildRegionGeometryFromCities(cities)
    updates.cityIds = cityIds
    updates.stateIds = stateIds
    updates.geometry = geometry
  }

  await db.collection('regions').updateOne(
    { _id: id },
    {
      $set: updates,
      ...(Object.keys(unsets).length ? { $unset: unsets } : {}),
    }
  )
  const updated = await db.collection('regions').findOne({ _id: id })
  if (!updated)
    throw createError({ statusCode: 404, statusMessage: 'Região não encontrada após update.' })

  return { success: true, data: toSimpleIdApi(updated) }
})
