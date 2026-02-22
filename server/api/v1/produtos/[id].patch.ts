import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { parseWithZod } from '../../../utils/validation'
import { ProdutoSchema } from '~/types/schemas'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

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
      ativo: true,
    }).partial(),
    body
  )

  const now = new Date().toISOString()
  const updates = { ...validated, updatedAt: now }

  const before = await db.collection('produtos').findOne({ _id: id })
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado.' })

  await db.collection('produtos').updateOne({ _id: id }, { $set: updates })

  if (typeof validated.valor === 'number' && validated.valor !== (before as any)?.valor) {
    await db.collection('historicoValores').insertOne({
      produtoId: id,
      data: now,
      valor: validated.valor,
      createdAt: now,
    })
  }

  const produto = await db.collection('produtos').findOne({ _id: id })
  if (!produto) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado.' })

  const { _id, ...rest } = produto as any
  return { success: true, data: { ...rest, id: String(_id) } }
})

