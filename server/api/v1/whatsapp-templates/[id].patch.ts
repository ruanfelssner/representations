import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../../utils/mongo'
import { WhatsAppTemplateUpdateSchema } from '~/types/schemas'

/**
 * PATCH /api/v1/whatsapp-templates/:id
 * Atualiza template existente
 */
export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID é obrigatório' })

  const body = await readBody(event)

  // Validar com Zod
  const parsed = WhatsAppTemplateUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos',
      data: parsed.error.errors,
    })
  }

  const db = await getMongoDb()

  // Buscar template
  let templateId: ObjectId
  try {
    templateId = new ObjectId(id)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  const existing = await db.collection('whatsappTemplates').findOne({ _id: templateId })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Template não encontrado' })
  }

  // Atualizar
  const updates = {
    ...parsed.data,
    updatedAt: new Date(),
  }

  await db.collection('whatsappTemplates').updateOne(
    { _id: templateId },
    { $set: updates }
  )

  const updated = await db.collection('whatsappTemplates').findOne({ _id: templateId })

  return {
    success: true,
    data: {
      ...updated,
      id: String(updated!._id),
      _id: undefined,
      createdAt: updated!.createdAt instanceof Date ? updated!.createdAt.toISOString() : updated!.createdAt,
      updatedAt: updated!.updatedAt instanceof Date ? updated!.updatedAt.toISOString() : updated!.updatedAt,
    },
  }
})
