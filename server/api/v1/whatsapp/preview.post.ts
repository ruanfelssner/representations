import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../../utils/mongo'
import { resolveClientDoc } from '../../../utils/dto'
import { WhatsAppPreviewRequestSchema } from '~/types/schemas'
import { resolveWhatsAppTemplate } from '../../../utils/whatsapp'

/**
 * POST /api/v1/whatsapp/preview
 * Gera preview de mensagem WhatsApp resolvida
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validar com Zod
  const parsed = WhatsAppPreviewRequestSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos',
      data: parsed.error.errors,
    })
  }

  const { clientId, templateId, variationIndex } = parsed.data

  const db = await getMongoDb()

  // Buscar cliente (suporta ObjectId, string _id ou CNPJ)
  const client = await resolveClientDoc(db, clientId)
  if (!client) {
    throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado' })
  }

  // Buscar template
  let templateObjId: ObjectId
  try {
    templateObjId = new ObjectId(templateId)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'ID de template inválido' })
  }

  const template = await db.collection('whatsappTemplates').findOne({ _id: templateObjId })
  if (!template) {
    throw createError({ statusCode: 404, statusMessage: 'Template não encontrado' })
  }

  if (!template.isActive) {
    throw createError({ statusCode: 400, statusMessage: 'Template inativo' })
  }

  // Verificar se cliente tem telefone
  if (!client.telefone) {
    throw createError({ statusCode: 400, statusMessage: 'Cliente não possui telefone cadastrado' })
  }

  // Resolver template
  try {
    const resolved = resolveWhatsAppTemplate(template, client, variationIndex)

    return {
      success: true,
      data: resolved,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 422,
      statusMessage: error?.message || 'Erro ao gerar preview',
    })
  }
})
