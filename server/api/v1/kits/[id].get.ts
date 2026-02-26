import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { toKitApi } from '../../../utils/kits'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const kit = await db.collection('kits').findOne({ _id: id })
  if (!kit) throw createError({ statusCode: 404, statusMessage: 'Kit não encontrado.' })

  const category = await db.collection('kitCategories').findOne({ _id: String((kit as any).categoriaId) })
  const categoriesById = new Map<string, any>()
  if (category) categoriesById.set(String((category as any)._id), category)

  return { success: true, data: toKitApi(kit, categoriesById) }
})
