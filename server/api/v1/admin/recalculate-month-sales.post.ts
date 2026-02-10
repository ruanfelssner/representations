import { getMongoDb } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()

  console.log('🔄 Recalculando faturamento mensal de todos os clientes...')

  // Pegar primeiro dia do mês atual
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartIso = monthStart.toISOString()

  console.log(`📅 Mês atual: ${monthStart.toLocaleDateString('pt-BR')}`)

  // Buscar todos os clientes
  const clients = await db.collection('clients').find({}).project({ _id: 1 }).toArray()

  console.log(`👥 ${clients.length} clientes encontrados`)

  let updated = 0
  const results = []

  for (const client of clients) {
    const clientId = String(client._id)

    // Buscar todas as vendas deste mês para este cliente
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

    // Atualizar cliente
    await db.collection('clients').updateOne(
      { _id: client._id },
      {
        $set: {
          'objectives.mesAberto': faturamento,
          updatedAt: new Date().toISOString(),
        },
      }
    )

    if (faturamento > 0) {
      const result = `Cliente ${clientId}: R$ ${faturamento.toFixed(2)} (${vendas.length} vendas)`
      console.log(`  ✅ ${result}`)
      results.push(result)
      updated++
    }
  }

  // Limpar cache
  ;(globalThis as any).__clientsHistoricoSummaryCache = undefined

  console.log(`\n✨ Recalculado com sucesso! ${updated} clientes com faturamento > 0`)

  return {
    success: true,
    message: `Recalculado ${updated} clientes com faturamento > 0`,
    results,
  }
})
