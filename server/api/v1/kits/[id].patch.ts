import { createError } from 'h3'
import { z } from 'zod'
import { getMongoDb } from '../../../utils/mongo'
import { parseWithZod } from '../../../utils/validation'
import { KitSchema } from '~/types/schemas'
import { normalizeSizes, toKitApi } from '../../../utils/kits'

const UpdateKitSchema = KitSchema.pick({
  codigo: true,
  nome: true,
  categoriaId: true,
  descricaoRapida: true,
  descricaoCompleta: true,
  precoUnitario: true,
  destaque: true,
  ativo: true,
  imagemAlt: true,
  dimensoes: true,
  pesoUnitario: true,
  nota: true,
})
  .extend({
    produtoReferenciaId: z.string().nullish(),
    tamanhosDisponiveis: z.union([z.array(z.union([z.string(), z.number()])), z.string()]).optional(),
    pesoUnitario: z.number().min(0).nullish(),
  })
  .partial()

function trimToUndefined(value: string | undefined) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const existing = await db.collection('kits').findOne({ _id: id })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kit não encontrado.' })

  const body = (await readBody(event).catch(() => ({}))) as unknown
  const validated = parseWithZod(UpdateKitSchema, body)

  const setPayload: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  }
  const unsetPayload: Record<string, ''> = {}

  if (validated.codigo !== undefined) {
    const codigo = validated.codigo.trim().toUpperCase()
    if (!codigo) throw createError({ statusCode: 400, statusMessage: 'Código é obrigatório.' })

    if (codigo !== (existing as any).codigo) {
      const duplicated = await db.collection('kits').findOne({ codigo })
      if (duplicated) {
        throw createError({ statusCode: 409, statusMessage: 'Já existe um kit com este código.' })
      }
    }
    setPayload.codigo = codigo
  }

  if (validated.nome !== undefined) {
    const nome = validated.nome.trim()
    if (!nome) throw createError({ statusCode: 400, statusMessage: 'Nome é obrigatório.' })
    setPayload.nome = nome
  }

  if (validated.categoriaId !== undefined) {
    const categoriaId = validated.categoriaId.trim()
    if (!categoriaId) throw createError({ statusCode: 400, statusMessage: 'Categoria é obrigatória.' })

    const category = await db.collection('kitCategories').findOne({ _id: categoriaId })
    if (!category) throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada.' })

    setPayload.categoriaId = categoriaId
  }

  if (validated.produtoReferenciaId !== undefined) {
    const produtoReferenciaId =
      typeof validated.produtoReferenciaId === 'string'
        ? validated.produtoReferenciaId.trim()
        : undefined

    if (produtoReferenciaId) {
      const product = await db.collection('produtos').findOne({ _id: produtoReferenciaId })
      if (!product) {
        throw createError({ statusCode: 404, statusMessage: 'Produto de referência não encontrado.' })
      }
      setPayload.produtoReferenciaId = produtoReferenciaId
    } else {
      unsetPayload.produtoReferenciaId = ''
    }
  }

  if (validated.descricaoRapida !== undefined) {
    const value = trimToUndefined(validated.descricaoRapida)
    if (value) setPayload.descricaoRapida = value
    else unsetPayload.descricaoRapida = ''
  }

  if (validated.descricaoCompleta !== undefined) {
    const value = trimToUndefined(validated.descricaoCompleta)
    if (value) setPayload.descricaoCompleta = value
    else unsetPayload.descricaoCompleta = ''
  }

  if (validated.imagemAlt !== undefined) {
    const value = trimToUndefined(validated.imagemAlt)
    if (value) setPayload.imagemAlt = value
    else unsetPayload.imagemAlt = ''
  }

  if (validated.dimensoes !== undefined) {
    const value = trimToUndefined(validated.dimensoes)
    if (value) setPayload.dimensoes = value
    else unsetPayload.dimensoes = ''
  }

  if (validated.nota !== undefined) {
    const value = trimToUndefined(validated.nota)
    if (value) setPayload.nota = value
    else unsetPayload.nota = ''
  }

  if (validated.precoUnitario !== undefined) setPayload.precoUnitario = validated.precoUnitario
  if (validated.destaque !== undefined) setPayload.destaque = validated.destaque
  if (validated.ativo !== undefined) setPayload.ativo = validated.ativo

  if (validated.pesoUnitario !== undefined) {
    if (typeof validated.pesoUnitario === 'number') setPayload.pesoUnitario = validated.pesoUnitario
    else unsetPayload.pesoUnitario = ''
  }

  if (validated.tamanhosDisponiveis !== undefined) {
    setPayload.tamanhosDisponiveis = normalizeSizes(validated.tamanhosDisponiveis)
  }

  const updateQuery: Record<string, any> = { $set: setPayload }
  if (Object.keys(unsetPayload).length > 0) updateQuery.$unset = unsetPayload

  await db.collection('kits').updateOne({ _id: id }, updateQuery)
  const updated = await db.collection('kits').findOne({ _id: id })
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Kit não encontrado.' })

  const category = await db.collection('kitCategories').findOne({ _id: String((updated as any).categoriaId) })
  const categoriesById = new Map<string, any>()
  if (category) categoriesById.set(String((category as any)._id), category)

  return { success: true, data: toKitApi(updated, categoriesById) }
})
