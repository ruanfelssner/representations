import { defineEventHandler } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const url = new URL(
      (event as any)?.node?.req?.url || (event as any)?.req?.url || '',
      'http://localhost'
    )
    const query = url.searchParams
    const period = query.get('period') || 'all' // 'year', 'lastYear', 'all'

    const db = await getMongoDb()
    const historicoCollection = db.collection('historicoCliente')

    // Filtrar por data baseado no período
    const filter: Record<string, any> = {
      tipo: { $in: ['venda_fisica', 'venda_online', 'venda_telefone'] },
      items: { $exists: true, $ne: [] },
    }

    const now = new Date()
    const currentYear = now.getFullYear()

    if (period === 'year') {
      // Este ano
      const startOfYear = new Date(currentYear, 0, 1)
      filter.data = { $gte: startOfYear.toISOString() }
    } else if (period === 'lastYear') {
      // Ano anterior
      const startOfLastYear = new Date(currentYear - 1, 0, 1)
      const endOfLastYear = new Date(currentYear, 0, 1)
      filter.data = {
        $gte: startOfLastYear.toISOString(),
        $lt: endOfLastYear.toISOString(),
      }
    }
    // Se 'all', não adicionar filtro de data

    const eventos = await historicoCollection.find(filter).toArray()

    // Agregar produtos
    const produtosMap = new Map<
      string,
      {
        produtoId: string
        nome: string
        quantidade: number
        totalVendido: number
        numeroVendas: number
      }
    >()

    for (const evento of eventos) {
      const items = evento.items || []
      for (const item of items) {
        const produtoId = String(item.produtoId || '')
        const nome = String(item.nome || 'Produto sem nome')
        const quantidade = Number(item.quantidade || 0)
        const valorUnitario = Number(item.valorUnitario || 0)
        const subtotal = quantidade * valorUnitario

        if (!produtoId) continue

        const existing = produtosMap.get(produtoId)
        if (existing) {
          existing.quantidade += quantidade
          existing.totalVendido += subtotal
          existing.numeroVendas++
        } else {
          produtosMap.set(produtoId, {
            produtoId,
            nome,
            quantidade,
            totalVendido: subtotal,
            numeroVendas: 1,
          })
        }
      }
    }

    // Converter para array e ordenar por quantidade (decrescente)
    const ranking = Array.from(produtosMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10) // Top 10

    return {
      success: true,
      data: {
        ranking,
        period,
        totalEventos: eventos.length,
      },
    }
  } catch (error) {
    console.error('Erro ao buscar ranking de vendas:', error)
    return {
      success: false,
      error: 'Falha ao buscar ranking de vendas',
    }
  }
})
