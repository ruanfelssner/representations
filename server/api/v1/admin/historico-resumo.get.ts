import { defineEventHandler } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const db = await getMongoDb()
    const historicoCollection = db.collection('historicoCliente')

    // Buscar todos os eventos de histórico
    const eventos = await historicoCollection
      .find({})
      .sort({ data: -1 })
      .toArray()

    // Agrupar por mês/ano
    const groupedByMonth: Record<string, {
      month: string
      year: number
      vendas: number
      visitas: number
      contatos: number
      totalVendas: number
      eventos: any[]
    }> = {}

    for (const evento of eventos) {
      const dataStr = evento.data
      if (!dataStr) continue

      let data: Date
      if (dataStr instanceof Date) {
        data = dataStr
      } else if (typeof dataStr === 'string') {
        data = new Date(dataStr)
      } else {
        continue
      }

      if (isNaN(data.getTime())) continue

      const year = data.getFullYear()
      const month = data.getMonth() + 1 // 1-12
      const key = `${year}-${String(month).padStart(2, '0')}`

      if (!groupedByMonth[key]) {
        groupedByMonth[key] = {
          month: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(data),
          year,
          vendas: 0,
          visitas: 0,
          contatos: 0,
          totalVendas: 0,
          eventos: [],
        }
      }

      const entry = groupedByMonth[key]
      
      // Contar tipos de eventos
      const tipo = String(evento.tipo || '').toLowerCase()
      
      if (tipo.includes('venda')) {
        entry.vendas++
        // Somar valor da venda se existir
        const valor = Number(evento.valor || evento.valorVenda || 0)
        if (valor > 0) {
          entry.totalVendas += valor
        }
      } else if (tipo === 'visita' || tipo.includes('visita')) {
        entry.visitas++
      } else if (tipo === 'contato' || tipo.includes('contato') || tipo.includes('whatsapp') || tipo.includes('telefone')) {
        entry.contatos++
      }

      // Guardar evento para referência
      entry.eventos.push({
        id: String(evento._id),
        tipo: evento.tipo,
        data: dataStr,
        clientId: String(evento.clientId || ''),
        valor: evento.valor || evento.valorVenda || 0,
        observacao: evento.observacao || '',
      })
    }

    // Converter para array e ordenar por data (mais recente primeiro)
    const resumo = Object.keys(groupedByMonth)
      .sort((a, b) => b.localeCompare(a)) // Ordenar DESC (mais recente primeiro)
      .map(key => {
        const entry = groupedByMonth[key]
        if (!entry) return null
        return {
          key,
          ...entry,
          totalEventos: entry.vendas + entry.visitas + entry.contatos,
        }
      })
      .filter(Boolean)

    return {
      success: true,
      data: {
        resumo,
        totalMeses: resumo.length,
      },
    }
  } catch (err) {
    console.error('[historico-resumo.get] Erro:', err)
    return {
      success: false,
      error: 'Erro ao buscar histórico',
      data: {
        resumo: [],
        totalMeses: 0,
      },
    }
  }
})
