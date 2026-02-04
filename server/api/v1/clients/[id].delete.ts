import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  await db.collection('clients').deleteOne({ _id: id })

  return { success: true }
})

