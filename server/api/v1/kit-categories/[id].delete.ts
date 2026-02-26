import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()

  const kitsUsingCategory = await db.collection('kits').countDocuments({ categoriaId: id }, { limit: 1 })
  if (kitsUsingCategory > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Categoria em uso por kits. Realoque os kits antes de excluir.',
    })
  }

  await db.collection('kitCategories').deleteOne({ _id: id })
  return { success: true }
})
