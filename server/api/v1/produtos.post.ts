import { createError } from 'h3'
import { z } from 'zod'
import { getMongoDb } from '../../utils/mongo'
import { parseWithZod } from '../../utils/validation'
import { ProdutoSchema } from '~/types/schemas'

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const body = (await readBody(event).catch(() => ({}))) as unknown

  const validated = parseWithZod(
    ProdutoSchema.pick({
      codigo: true,
      nome: true,
      descricao: true,
      descricaoRapida: true,
      descricaoCompleta: true,
      valor: true,
      categoria: true,
      linha: true,
      imagemAlt: true,
      dimensoes: true,
      pesoUnitario: true,
      nota: true,
      precoOuro18kReferencia: true,
      destaque: true,
    }).extend({
      codigo: z.string().min(1),
      nome: z.string().min(1),
      valor: z.number().min(0),
    }),
    body
  )

  const codigo = validated.codigo.trim()
  const now = new Date().toISOString()
  const produtoId = `produto-${codigo}`

  const existing = await db.collection('produtos').findOne({ _id: produtoId })
  if (existing) throw createError({ statusCode: 409, statusMessage: 'Produto já existe.' })

  const produto = {
    _id: produtoId,
    ...validated,
    codigo,
    ativo: true,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('produtos').insertOne(produto)
  await db.collection('historicoValores').insertOne({
    produtoId: produtoId,
    data: now,
    valor: validated.valor,
    createdAt: now,
  })

  const { _id, ...rest } = produto as any
  return { success: true, data: { ...rest, id: String(_id) } }
})

