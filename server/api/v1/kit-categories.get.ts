import { createError } from 'h3'
import { z } from 'zod'
import { getMongoDb } from '../../utils/mongo'
import { toKitCategoryApi } from '../../utils/kits'

const QuerySchema = z.object({
  ativo: z.union([z.string(), z.boolean()]).optional(),
})

function parseBooleanQuery(value: string | boolean | undefined) {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return undefined
}

export default defineEventHandler(async (event) => {
  const parsedQuery = QuerySchema.safeParse(getQuery(event))
  if (!parsedQuery.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsedQuery.error.issues[0]?.message || 'Query inválida.',
      data: { issues: parsedQuery.error.issues },
    })
  }

  const query = parsedQuery.data
  const ativo = parseBooleanQuery(query.ativo)

  const db = await getMongoDb()
  const filter = typeof ativo === 'boolean' ? { ativo } : {}
  const categories = await db
    .collection('kitCategories')
    .find(filter)
    .sort({ ordem: 1, nome: 1 })
    .toArray()

  return { success: true, data: categories.map(toKitCategoryApi) }
})
