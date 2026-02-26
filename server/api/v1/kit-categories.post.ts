import { createError } from 'h3'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { getMongoDb } from '../../utils/mongo'
import { parseWithZod } from '../../utils/validation'
import { KitCategorySchema } from '~/types/schemas'
import { resolveCategorySlug, toKitCategoryApi } from '../../utils/kits'

const CreateCategorySchema = KitCategorySchema.pick({
  nome: true,
  ordem: true,
  ativo: true,
}).extend({
  nome: z.string().min(1),
  slug: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as unknown
  const validated = parseWithZod(CreateCategorySchema, body)

  const db = await getMongoDb()
  const nome = validated.nome.trim()
  const slug = resolveCategorySlug(validated.slug, nome)

  const existing = await db.collection('kitCategories').findOne({ slug })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Já existe uma categoria com este slug.' })
  }

  const now = new Date().toISOString()
  const category = {
    _id: `kit-category-${randomUUID()}`,
    slug,
    nome,
    ordem: validated.ordem ?? 0,
    ativo: validated.ativo ?? true,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('kitCategories').insertOne(category)
  return { success: true, data: toKitCategoryApi(category) }
})
