import { createError } from 'h3'
import { z } from 'zod'
import { getMongoDb } from '../../../utils/mongo'
import { parseWithZod } from '../../../utils/validation'
import { KitCategorySchema } from '~/types/schemas'
import { resolveCategorySlug, toKitCategoryApi } from '../../../utils/kits'

const UpdateCategorySchema = KitCategorySchema.pick({
  nome: true,
  ordem: true,
  ativo: true,
})
  .extend({
    slug: z.string().optional(),
  })
  .partial()

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const existing = await db.collection('kitCategories').findOne({ _id: id })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Categoria de kit não encontrada.' })
  }

  const body = (await readBody(event).catch(() => ({}))) as unknown
  const validated = parseWithZod(UpdateCategorySchema, body)

  const nextNome =
    typeof validated.nome === 'string' ? validated.nome.trim() : String((existing as any).nome || '')
  if (!nextNome) {
    throw createError({ statusCode: 400, statusMessage: 'Nome é obrigatório.' })
  }

  const nextSlug =
    validated.slug !== undefined || validated.nome !== undefined
      ? resolveCategorySlug(validated.slug, nextNome)
      : String((existing as any).slug || '')

  if (nextSlug !== (existing as any).slug) {
    const duplicated = await db.collection('kitCategories').findOne({ slug: nextSlug })
    if (duplicated) {
      throw createError({ statusCode: 409, statusMessage: 'Já existe uma categoria com este slug.' })
    }
  }

  const now = new Date().toISOString()
  const updates = {
    ...(validated.nome !== undefined ? { nome: nextNome } : {}),
    ...(validated.ordem !== undefined ? { ordem: validated.ordem } : {}),
    ...(validated.ativo !== undefined ? { ativo: validated.ativo } : {}),
    ...(nextSlug ? { slug: nextSlug } : {}),
    updatedAt: now,
  }

  await db.collection('kitCategories').updateOne({ _id: id }, { $set: updates })
  const updated = await db.collection('kitCategories').findOne({ _id: id })
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Categoria de kit não encontrada.' })
  }

  return { success: true, data: toKitCategoryApi(updated) }
})
