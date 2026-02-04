import { createError } from 'h3'
import { getMongoDb } from '../../../../utils/mongo'
import { ObjectId } from 'mongodb'
import { toClientApi } from '../../../../utils/dto'

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
        'sales.lastContactAt': new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
  )
}

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const body = (await readBody(event).catch(() => ({}))) as Record<string, unknown>
  const db = await getMongoDb()

  const data = (body.data as string | undefined) || new Date().toISOString()
  const descricao = (body.descricao as string | undefined) || ''
  const vendeuAlgo = Boolean(body.vendeuAlgo)
  const duracao = typeof body.duracao === 'number' ? body.duracao : undefined

  const produtos = Array.isArray(body.produtos) ? body.produtos : []
  const items = produtos
    .map((p: any) => ({
      produtoId: String(p?.produtoId || ''),
      nome: String(p?.nome || p?.produtoId || ''),
      quantidade: Number(p?.quantidade) || 0,
      valorUnitario: Number(p?.precoUnitario ?? p?.valorUnitario ?? 0) || 0,
    }))
    .filter((i) => i.produtoId && i.quantidade > 0)

  const totalFromItems = items.reduce((sum, i) => sum + i.quantidade * i.valorUnitario, 0)
  const totalVenda = typeof body.valorVenda === 'number' ? body.valorVenda : totalFromItems

  const now = new Date().toISOString()
  await db.collection('historicoCliente').insertOne({
    _id: new ObjectId(),
    clientId: id,
    userId: typeof body.userId === 'string' ? body.userId : 'user-app',
    tipo: vendeuAlgo ? 'venda_fisica' : 'visita_fisica',
    data,
    descricao,
    items,
    resultado: vendeuAlgo ? 'sucesso' : 'pendente',
    feedback: typeof body.feedback === 'string' ? body.feedback : '',
    totalVenda: vendeuAlgo ? totalVenda : 0,
    duracao,
    proximoContato: typeof body.proximoContato === 'string' ? body.proximoContato : undefined,
    createdAt: now,
    updatedAt: now,
  })

  const client = await db.collection('clients').findOne({ _id: id })
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  await updateClientMonthSales(db, id, monthStart.toISOString())

  return { success: true, data: toClientApi(client) }
})
