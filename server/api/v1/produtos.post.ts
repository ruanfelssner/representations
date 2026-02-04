import { createError } from 'h3'
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
      valor: true,
      categoria: true,
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

