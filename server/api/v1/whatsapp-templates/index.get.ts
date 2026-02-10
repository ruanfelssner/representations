import { getMongoDb } from '../../../utils/mongo'
import { TriggerTypeSchema } from '~/types/schemas'

/**
 * GET /api/v1/whatsapp-templates
 * Lista templates com filtros opcionais
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const triggerType = query.triggerType as string | undefined
  const active = query.active as string | undefined

  const db = await getMongoDb()
  const filter: Record<string, unknown> = {}

  // Filtro por triggerType
  if (triggerType) {
    const parsed = TriggerTypeSchema.safeParse(triggerType)
    if (parsed.success) {
      filter.triggerType = parsed.data
    }
  }

  // Filtro por ativo
  if (active !== undefined) {
    filter.isActive = active === 'true'
  }

  const templates = await db
    .collection('whatsappTemplates')
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray()

  // Converter para DTO
  const templatesDto = templates.map((t) => {
    const { _id, ...rest } = t
    return {
      ...rest,
      id: String(_id),
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
    }
  })

  return {
    success: true,
    data: templatesDto,
  }
})
