import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../../utils/mongo'

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
  const { id } = getRouterParams(event)

  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID obrigatorio' })
  if (!ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'ID invalido' })

  const existing = await db.collection('historicoCliente').findOne({ _id: new ObjectId(id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Historico nao encontrado' })

  const clientId = existing.clientId
  const isVenda = existing.tipo === 'venda_fisica' || existing.tipo === 'venda_online' || existing.tipo === 'venda_telefone'

  await db.collection('historicoCliente').deleteOne({ _id: new ObjectId(id) })
  ;(globalThis as any).__clientsHistoricoSummaryCache = undefined

  if (isVenda && clientId) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStartIso = monthStart.toISOString()
    await updateClientMonthSales(db, clientId, monthStartIso)
  }

  return { success: true, data: { id } }
})
