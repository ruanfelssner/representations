import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { toSimpleIdApi } from '../../../utils/dto'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const produto = await db.collection('produtos').findOne({ _id: id })
  if (!produto) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado.' })

  return { success: true, data: toSimpleIdApi(produto) }
})

