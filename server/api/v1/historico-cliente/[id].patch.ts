import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../../utils/mongo'
import { parseWithZod } from '../../../utils/validation'
import { toSimpleIdApi } from '../../../utils/dto'
import { HistoricoClienteSchema } from '~/types/schemas'

async function updateClientMonthSales(db: any, clientId: string, monthStartIso: string) {
  
  const vendas = await db
    .collection('historicoCliente')
    .find({
      clientId,
      data: { $gte: monthStartIso },
      tipo: { $in: ['venda_fisica', 'venda_online', 'venda_telefone'] },
    })
    .project({ totalVenda: 1, tipo: 1 })
    .toArray()

  const faturamento = vendas.reduce((sum: number, v: any) => sum + (Number(v?.totalVenda) || 0), 0)
  

  const result = await db.collection('clients').updateOne(
    { _id: new ObjectId(clientId) }, // CONVERTER PARA OBJECTID
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
  const body = (await readBody(event).catch(() => ({}))) as unknown

  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID obrigatorio' })
  if (!ObjectId.isValid(id)) throw createError({ statusCode: 400, statusMessage: 'ID invalido' })

  const validated = parseWithZod(
    HistoricoClienteSchema.omit({ _id: true, createdAt: true, updatedAt: true, totalVenda: true }).partial(),
    body
  )


  const existing = await db.collection('historicoCliente').findOne({ _id: new ObjectId(id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Historico nao encontrado' })

  const items = validated.items !== undefined ? validated.items : existing.items
  const totalVenda = Array.isArray(items)
    ? items.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0)
    : existing.totalVenda || 0
  
  console.log('💵 Total calculado:', { totalVenda, numItems: Array.isArray(items) ? items.length : 0 })

  const now = new Date().toISOString()
  await db.collection('historicoCliente').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...validated,
        items,
        totalVenda,
        updatedAt: now,
      },
    }
  )
  ;(globalThis as any).__clientsHistoricoSummaryCache = undefined

  const updated = await db.collection('historicoCliente').findOne({ _id: new ObjectId(id) })
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Historico nao encontrado apos update' })
  
  const clientId = updated.clientId

  // Recalcular se o tipo antigo OU novo era venda (para garantir que mudanças de tipo sejam refletidas)
  const wasVenda = existing.tipo === 'venda_fisica' || existing.tipo === 'venda_online' || existing.tipo === 'venda_telefone'
  const isVenda = updated.tipo === 'venda_fisica' || updated.tipo === 'venda_online' || updated.tipo === 'venda_telefone'
  const needsRecalc = (wasVenda || isVenda) && clientId
  
  if (needsRecalc) {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStartIso = monthStart.toISOString()
    await updateClientMonthSales(db, clientId, monthStartIso)
  }

  return { success: true, data: toSimpleIdApi(updated) }
})
