import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../../utils/mongo'
import { WhatsAppTemplateCreateSchema } from '~/types/schemas'

/**
 * POST /api/v1/whatsapp-templates
 * Cria novo template
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validar com Zod
  const parsed = WhatsAppTemplateCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos',
      data: parsed.error.errors,
    })
  }

  const db = await getMongoDb()
  const now = new Date()

  const template = {
    _id: new ObjectId(),
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('whatsappTemplates').insertOne(template)

  return {
    success: true,
    data: {
      ...template,
      id: String(template._id),
      _id: undefined,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    },
  }
})
