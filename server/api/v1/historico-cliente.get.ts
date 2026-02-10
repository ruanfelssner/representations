import { getMongoDb } from '../../utils/mongo'
import { ObjectId } from 'mongodb'

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
  
  // clientId pode ser ObjectId ou string, buscar ambos
  if (clientId) {
    if (/^[0-9a-fA-F]{24}$/.test(clientId)) {
      // Se for hex válido, buscar tanto como ObjectId quanto como string
      filter.$or = [
        { clientId: new ObjectId(clientId) },
        { clientId: clientId }
      ]
    } else {
      filter.clientId = clientId
    }
  }
  
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
    let clientId = rest.clientId
    if (clientId && typeof clientId === 'object') {
      if (typeof clientId.toHexString === 'function') {
        clientId = clientId.toHexString()
      } else if (typeof clientId.toString === 'function') {
        const asString = clientId.toString()
        const match = asString.match(/^new ObjectId\(['"]([a-f0-9]{24})['"]\)$/i)
        clientId = match ? match[1] : asString
      }
    }
    const out: any = {
      ...rest,
      clientId,
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
