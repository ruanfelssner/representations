import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

type MonthBucket = { ym: string; total: number }

function ymOf(iso: string) {
  const d = new Date(iso)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function linearRegression(points: Array<{ x: number; y: number }>) {
  // y = a + b x
  const n = points.length
  if (n < 2) return { a: 0, b: 0 }
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0
  for (const p of points) {
    sumX += p.x
    sumY += p.y
    sumXY += p.x * p.y
    sumXX += p.x * p.x
  }
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return { a: 0, b: 0 }
  const b = (n * sumXY - sumX * sumY) / denom
  const a = (sumY - b * sumX) / n
  return { a, b }
}

export default defineEventHandler(async (event) => {
  const { clientId } = getRouterParams(event)
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'clientId é obrigatório.' })

  const db = await getMongoDb()
  const client = await db.collection('clients').findOne({ _id: clientId })
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  const vendas = await db
    .collection('historicoCliente')
    .find({ clientId, tipo: { $in: ['venda_fisica', 'venda_online', 'venda_telefone'] } })
    .project({ items: 1, totalVenda: 1, data: 1 })
    .toArray()

  const totalVendas = vendas.length
  const totalFaturamento = vendas.reduce((sum: number, v: any) => sum + (Number(v?.totalVenda) || 0), 0)

  const prodAgg = new Map<string, { qtd: number; faturamento: number }>()
  for (const v of vendas) {
    const items = Array.isArray(v.items) ? v.items : []
    for (const item of items) {
      const produtoId = String(item?.produtoId || '')
      if (!produtoId) continue
      const quantidade = Number(item?.quantidade) || 0
      const valorUnitario = Number(item?.valorUnitario) || 0
      const current = prodAgg.get(produtoId) || { qtd: 0, faturamento: 0 }
      current.qtd += quantidade
      current.faturamento += quantidade * valorUnitario
      prodAgg.set(produtoId, current)
    }
  }

  const produtosTopVendidos = Array.from(prodAgg.entries())
    .map(([produtoId, v]) => ({ produtoId, qtd: v.qtd, faturamento: v.faturamento }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5)

  const buckets = new Map<string, number>()
  for (const v of vendas) {
    const ym = ymOf(v.data)
    buckets.set(ym, (buckets.get(ym) || 0) + (Number(v.totalVenda) || 0))
  }

  const series: MonthBucket[] = Array.from(buckets.entries())
    .map(([ym, total]) => ({ ym, total }))
    .sort((a, b) => a.ym.localeCompare(b.ym))
    .slice(-12)

  const points = series.map((b, idx) => ({ x: idx, y: b.total }))
  const { a, b } = linearRegression(points)
  const n = points.length
  const previsaoMesAtual = n ? Math.max(0, a + b * (n - 1)) : 0
  const previsaoProxMes = n ? Math.max(0, a + b * n) : 0

  const metaMesAtual = Number((client as any)?.objectives?.mesTarget) || 0
  const probabilidadeAtingirMeta =
    metaMesAtual > 0 ? Math.max(0, Math.min(100, (previsaoMesAtual / metaMesAtual) * 100)) : 0

  return {
    success: true,
    data: {
      clientId,
      totalVendas,
      totalFaturamento,
      ticketMedio: totalVendas > 0 ? totalFaturamento / totalVendas : 0,
      produtosTopVendidos,
      previsoes: {
        previsaoMesAtual,
        previsaoProxMes,
        probabilidadeAtingirMeta,
        series,
      },
      computedAt: new Date().toISOString(),
    },
  }
})

