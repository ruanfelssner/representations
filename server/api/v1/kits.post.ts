import { createError } from 'h3'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { getMongoDb } from '../../utils/mongo'
import { parseWithZod } from '../../utils/validation'
import { KitSchema } from '~/types/schemas'
import { normalizeSizes, toKitApi } from '../../utils/kits'

const CreateKitSchema = KitSchema.pick({
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
}).extend({
  codigo: z.string().min(1),
  nome: z.string().min(1),
  categoriaId: z.string().min(1),
  precoUnitario: z.number().min(0),
  produtoReferenciaId: z.string().nullish(),
  tamanhosDisponiveis: z.union([z.array(z.union([z.string(), z.number()])), z.string()]).optional(),
})

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as unknown
  const validated = parseWithZod(CreateKitSchema, body)

  const db = await getMongoDb()
  const codigo = validated.codigo.trim().toUpperCase()
  const nome = validated.nome.trim()
  const categoriaId = validated.categoriaId.trim()
  const produtoReferenciaId = validated.produtoReferenciaId?.trim() || undefined
  const tamanhosDisponiveis = normalizeSizes(validated.tamanhosDisponiveis)

  const existingByCode = await db.collection('kits').findOne({ codigo })
  if (existingByCode) {
    throw createError({ statusCode: 409, statusMessage: 'Já existe um kit com este código.' })
  }

  const category = await db.collection('kitCategories').findOne({ _id: categoriaId })
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Categoria não encontrada.' })
  }

  if (produtoReferenciaId) {
    const product = await db.collection('produtos').findOne({ _id: produtoReferenciaId })
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Produto de referência não encontrado.' })
    }
  }

  const now = new Date().toISOString()
  const kit = {
    _id: `kit-${randomUUID()}`,
    codigo,
    nome,
    categoriaId,
    produtoReferenciaId,
    descricaoRapida: validated.descricaoRapida?.trim() || undefined,
    descricaoCompleta: validated.descricaoCompleta?.trim() || undefined,
    precoUnitario: validated.precoUnitario,
    tamanhosDisponiveis,
    destaque: validated.destaque ?? false,
    ativo: validated.ativo ?? true,
    imagemAlt: validated.imagemAlt?.trim() || undefined,
    dimensoes: validated.dimensoes?.trim() || undefined,
    pesoUnitario: validated.pesoUnitario,
    nota: validated.nota?.trim() || undefined,
    galeriaFileIds: [] as string[],
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('kits').insertOne(kit)
  const categoriesById = new Map([[String((category as any)._id), category]])

  return { success: true, data: toKitApi(kit, categoriesById) }
})
