import { z } from 'zod'
import { createError } from 'h3'
import { getMongoDb } from '../../utils/mongo'
import { toSimpleIdApi } from '../../utils/dto'
import { ensureTerritoryIndexes } from '../../utils/territory'

const QuerySchema = z.object({
  uf: z.string().trim().toUpperCase().length(2).optional(),
  ids: z.string().optional(),
  active: z.enum(['true', 'false']).optional(),
  withGeometry: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
})

export default defineEventHandler(async (event) => {
  const url = new URL((event as any)?.node?.req?.url || '/', 'http://localhost')
  const parsed = QuerySchema.safeParse({
    uf: url.searchParams.get('uf') || undefined,
    ids: url.searchParams.get('ids') || undefined,
    active: url.searchParams.get('active') || undefined,
    withGeometry: url.searchParams.get('withGeometry') || undefined,
    limit: url.searchParams.get('limit') || undefined,
  })

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Query inválida para states.' })
  }

  const db = await getMongoDb()
  await ensureTerritoryIndexes(db)

  const { uf, ids, active, withGeometry, limit } = parsed.data
  const filter: Record<string, unknown> = {}
  if (uf) filter.uf = uf
  if (active === 'true') filter.ativo = { $ne: false }
  if (active === 'false') filter.ativo = false
  if (ids) {
    const idList = ids
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    if (idList.length) filter._id = { $in: idList }
  }

  const projection = withGeometry === 'false' ? { projection: { geometry: 0 } } : undefined

  const rows = await db
    .collection('states')
    .find(filter, projection as any)
    .sort({ nome: 1 })
    .limit(limit || 500)
    .toArray()

  return { success: true, data: rows.map(toSimpleIdApi) }
})
