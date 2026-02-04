import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

function toIso(v: any): string | undefined {
  if (!v) return undefined
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'string') return v
  if (typeof v === 'object' && typeof v.toString === 'function') return v.toString()
  return undefined
}

export default defineEventHandler(async (event) => {
  const { clientId } = getRouterParams(event)
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'clientId é obrigatório.' })

  const db = await getMongoDb()
  const historico = await db
    .collection('historicoCliente')
    .find({ clientId })
    .sort({ data: -1 })
    .toArray()

  const eventos = historico.map((e: any) => {
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

  return { success: true, data: { clientId, total: eventos.length, eventos } }
})
