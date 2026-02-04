import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const client = await db.collection('clients').findOne({ _id: id })
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  const { _id, ...rest } = client as any
  return { success: true, data: { ...rest, id: _id } }
})
