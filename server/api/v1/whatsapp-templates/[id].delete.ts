import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../../utils/mongo'

/**
 * DELETE /api/v1/whatsapp-templates/:id
 * Remove template
 */
export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID é obrigatório' })

  const db = await getMongoDb()

  let templateId: ObjectId
  try {
    templateId = new ObjectId(id)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  const result = await db.collection('whatsappTemplates').deleteOne({ _id: templateId })

  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Template não encontrado' })
  }

  return {
    success: true,
    data: { deleted: true },
  }
})
