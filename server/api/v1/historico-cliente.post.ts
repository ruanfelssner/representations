import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../utils/mongo'
import { parseWithZod } from '../../utils/validation'
import { HistoricoClienteSchema } from '~/types/schemas'

async function updateClientMonthSales(db: any, clientId: string, monthStartIso: string) {
  const vendas = await db
    .collection('historicoCliente')
    .find({
      clientId,
      data: { $gte: monthStartIso },
      tipo: { $in: ['venda_fisica', 'venda_ligacao'] },
    })
    .project({ totalVenda: 1 })
    .toArray()

  const faturamento = vendas.reduce((sum: number, v: any) => sum + (Number(v?.totalVenda) || 0), 0)

  await db.collection('clients').updateOne(
    { _id: clientId },
    {
      $set: {
        'objectives.mesAberto': faturamento,
        updatedAt: new Date().toISOString(),
      },
    }
  )
}

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const body = (await readBody(event).catch(() => ({}))) as unknown

  const validated = parseWithZod(
    HistoricoClienteSchema.omit({ _id: true, createdAt: true, updatedAt: true, totalVenda: true }),
    body
  )

  const items = Array.isArray(validated.items) ? validated.items : []
  const totalVenda = items.reduce(
    (sum, item) => sum + item.quantidade * item.valorUnitario,
    0
  )

  const now = new Date().toISOString()
  const evento = {
    _id: new ObjectId(),
    ...validated,
    items,
    totalVenda,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('historicoCliente').insertOne(evento)

  const client = await db.collection('clients').findOne({ _id: validated.clientId })
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  const clientSet: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
    'sales.lastContactAt': validated.data,
  }
  if (validated.proximoContato) clientSet['sales.nextActionAt'] = validated.proximoContato

  if (client?.status !== 'inativo') {
    clientSet.status = 'ativo'
    const stage = typeof client?.sales?.stage === 'string' ? client.sales.stage : ''
    if (!stage || stage === 'lead') clientSet['sales.stage'] = 'ativo'
  }

  await db.collection('clients').updateOne({ _id: validated.clientId }, { $set: clientSet })

  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  await updateClientMonthSales(db, validated.clientId, d.toISOString())

  const { _id, ...rest } = evento as any
  return { success: true, data: { ...rest, id: String(_id) } }
})
