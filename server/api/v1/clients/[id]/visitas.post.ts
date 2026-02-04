import { createError } from 'h3'
import { getMongoDb } from '../../../../utils/mongo'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const body = (await readBody(event).catch(() => ({}))) as Record<string, unknown>
  const db = await getMongoDb()

  const visita = {
    id: `visita-${Date.now()}`,
    data: (body.data as string | undefined) || new Date().toISOString(),
    descricao: (body.descricao as string | undefined) || '',
    vendeuAlgo: Boolean(body.vendeuAlgo),
    valorVenda: typeof body.valorVenda === 'number' ? body.valorVenda : undefined,
    produtos: Array.isArray(body.produtos) ? body.produtos : undefined,
    duracao: typeof body.duracao === 'number' ? body.duracao : undefined,
  }

  await db.collection('clients').updateOne(
    { _id: id },
    { $push: { visitas: visita }, $set: { updatedAt: new Date().toISOString() } }
  )

  const client = await db.collection('clients').findOne({ _id: id })
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  const { _id, color: _color, ...rest } = client as any
  return { success: true, data: { ...rest, id: _id } }
})
