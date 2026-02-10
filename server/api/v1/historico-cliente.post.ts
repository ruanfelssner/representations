import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../utils/mongo'
import { parseWithZod } from '../../utils/validation'
import { resolveClientDoc } from '../../utils/dto'
import { HistoricoClienteSchema } from '~/types/schemas'

async function updateClientMonthSales(db: any, clientId: string, monthStartIso: string) {
  const vendas = await db
    .collection('historicoCliente')
    .find({
      clientId,
      data: { $gte: monthStartIso },
      tipo: { $in: ['venda_fisica', 'venda_online', 'venda_telefone'] },
    })
    .project({ totalVenda: 1 })
    .toArray()

  const faturamento = vendas.reduce((sum: number, v: any) => sum + (Number(v?.totalVenda) || 0), 0)

  await db.collection('clients').updateOne(
    { _id: new ObjectId(clientId) },
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

  const pedidoCodigoRaw = typeof validated.pedidoCodigo === 'string' ? validated.pedidoCodigo : ''
  const pedidoCodigo = pedidoCodigoRaw.replace(/\D/g, '')
  if (pedidoCodigo) {
    const existing = await db.collection('historicoCliente').findOne({ pedidoCodigo })
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: 'Pedido de venda ja registrado.' })
    }
  }

  const items = Array.isArray(validated.items) ? validated.items : []
  const totalVenda = items.reduce(
    (sum, item) => sum + item.quantidade * item.valorUnitario,
    0
  )

  const now = new Date().toISOString()
  const evento = {
    _id: new ObjectId(),
    ...validated,
    pedidoCodigo: pedidoCodigo || undefined,
    items,
    totalVenda,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('historicoCliente').insertOne(evento)
  ;(globalThis as any).__clientsHistoricoSummaryCache = undefined

  const client = await resolveClientDoc(db, validated.clientId)
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

  await db.collection('clients').updateOne({ _id: client._id }, { $set: clientSet })

  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  await updateClientMonthSales(db, String(client._id), d.toISOString())

  const { _id, ...rest } = evento as any
  return { success: true, data: { ...rest, id: String(_id) } }
})
