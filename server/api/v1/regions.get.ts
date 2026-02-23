import { z } from 'zod'
import { createError } from 'h3'
import { getMongoDb } from '../../utils/mongo'
import { toSimpleIdApi } from '../../utils/dto'
import { ensureTerritoryIndexes, normalizeText } from '../../utils/territory'

const QuerySchema = z.object({
  stateId: z.string().trim().optional(),
  representativeUserId: z.string().trim().optional(),
  active: z.enum(['true', 'false']).optional(),
  withGeometry: z.enum(['true', 'false']).optional(),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
})

export default defineEventHandler(async (event) => {
  const url = new URL((event as any)?.node?.req?.url || '/', 'http://localhost')
  const parsed = QuerySchema.safeParse({
    stateId: url.searchParams.get('stateId') || undefined,
    representativeUserId: url.searchParams.get('representativeUserId') || undefined,
    active: url.searchParams.get('active') || undefined,
    withGeometry: url.searchParams.get('withGeometry') || undefined,
    search: url.searchParams.get('search') || undefined,
    limit: url.searchParams.get('limit') || undefined,
  })

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Query inválida para regions.' })
  }

  const db = await getMongoDb()
  await ensureTerritoryIndexes(db)

  const { stateId, representativeUserId, active, withGeometry, search, limit } = parsed.data
  const filter: Record<string, unknown> = {}

  if (stateId) filter.stateIds = stateId
  if (representativeUserId) filter.representanteUserId = representativeUserId
  if (active === 'true') filter.ativo = { $ne: false }
  if (active === 'false') filter.ativo = false

  if (search) {
    const normalized = normalizeText(search)
    filter.$or = [{ nome: { $regex: search, $options: 'i' } }, { normalizedName: normalized }]
  }

  const projection = withGeometry === 'false' ? { projection: { geometry: 0 } } : undefined

  const rows = await db
    .collection('regions')
    .find(filter, projection as any)
    .sort({ nome: 1 })
    .limit(limit || 500)
    .toArray()

  return { success: true, data: rows.map(toSimpleIdApi) }
})
