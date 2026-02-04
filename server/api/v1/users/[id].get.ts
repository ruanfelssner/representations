import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { toSimpleIdApi } from '../../../utils/dto'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const user = await db.collection('users').findOne({ _id: id })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User não encontrado.' })

  return { success: true, data: toSimpleIdApi(user) }
})

