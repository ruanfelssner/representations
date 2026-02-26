import { createError } from 'h3'
import { z } from 'zod'
import { getMongoDb } from '../../utils/mongo'
import { toKitApi } from '../../utils/kits'

const QuerySchema = z.object({
  ativo: z.union([z.string(), z.boolean()]).optional(),
  destaque: z.union([z.string(), z.boolean()]).optional(),
  categoriaId: z.string().optional(),
  categoriaSlug: z.string().optional(),
  q: z.string().optional(),
})

function parseBooleanQuery(value: string | boolean | undefined) {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return undefined
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
  const destaque = parseBooleanQuery(query.destaque)
  const q = query.q?.trim()

  const db = await getMongoDb()
  const filter: Record<string, any> = {}
  if (typeof ativo === 'boolean') filter.ativo = ativo
  if (typeof destaque === 'boolean') filter.destaque = destaque
  if (query.categoriaId) filter.categoriaId = query.categoriaId

  if (query.categoriaSlug && !query.categoriaId) {
    const category = await db.collection('kitCategories').findOne({ slug: query.categoriaSlug })
    if (!category) return { success: true, data: [] as unknown[] }
    filter.categoriaId = String((category as any)._id)
  }

  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ nome: rx }, { codigo: rx }]
  }

  const kits = await db
    .collection('kits')
    .find(filter)
    .sort({ codigo: 1 })
    .toArray()

  const categoryIds = Array.from(
    new Set(
      kits
        .map((kit) => (typeof (kit as any).categoriaId === 'string' ? (kit as any).categoriaId : ''))
        .filter(Boolean)
    )
  )

  const categories =
    categoryIds.length > 0
      ? await db.collection('kitCategories').find({ _id: { $in: categoryIds } }).toArray()
      : []
  const categoriesById = new Map(categories.map((category) => [String((category as any)._id), category]))

  return { success: true, data: kits.map((kit) => toKitApi(kit, categoriesById)) }
})
