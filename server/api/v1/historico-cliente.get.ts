import { getMongoDb } from '../../utils/mongo'

function toIso(v: any): string | undefined {
  if (!v) return undefined
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'string') return v
  if (typeof v === 'object' && typeof v.toString === 'function') return v.toString()
  return undefined
}

export default defineEventHandler(async (event) => {
  const url = new URL((event as any)?.node?.req?.url || (event as any)?.req?.url || '', 'http://localhost')
  const query = url.searchParams
  const db = await getMongoDb()

  const filter: Record<string, any> = {}
  const clientId = query.get('clientId')
  const userId = query.get('userId')
  const tipo = query.get('tipo')
  if (clientId) filter.clientId = clientId
  if (userId) filter.userId = userId
  if (tipo) filter.tipo = tipo

  const from = query.get('from') || undefined
  const to = query.get('to') || undefined
  if (from || to) {
    filter.data = {}
    if (from) filter.data.$gte = from
    if (to) filter.data.$lte = to
  }

  const limitRaw = query.get('limit') ? Number(query.get('limit')) : 200
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200

  const events = await db
    .collection('historicoCliente')
    .find(filter)
    .sort({ data: -1 })
    .limit(limit)
    .toArray()

  const mapped = events.map((e: any) => {
    const { _id, ...rest } = e
    const out: any = {
      ...rest,
      id: String(_id),
      data: toIso(rest.data),
      proximoContato: toIso(rest.proximoContato),
      createdAt: toIso(rest.createdAt),
      updatedAt: toIso(rest.updatedAt),
    }
    if (typeof rest.duracao === 'number') out.duracao = rest.duracao
    else delete out.duracao
    if (!out.proximoContato) delete out.proximoContato
    if (!out.createdAt) delete out.createdAt
    if (!out.updatedAt) delete out.updatedAt
    return out
  })

  return { success: true, data: mapped }
})
