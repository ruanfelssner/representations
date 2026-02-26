import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { toKitCategoryApi } from '../../../utils/kits'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const category = await db.collection('kitCategories').findOne({ _id: id })
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Categoria de kit não encontrada.' })
  }

  return { success: true, data: toKitCategoryApi(category) }
})
