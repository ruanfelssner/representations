import { defineEventHandler } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

const SALES_TYPES = ['venda_fisica', 'venda_online', 'venda_telefone'] as const
const MIN_YEAR = 2020
const MAX_YEAR = 2100
const DEFAULT_LIMIT = 10

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function parseIntOr(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function totalFromItems(items: unknown): number {
  if (!Array.isArray(items)) return 0
  let total = 0
  for (const item of items) {
    const quantidade = toFiniteNumber((item as any)?.quantidade)
    const valorUnitario = toFiniteNumber((item as any)?.valorUnitario)
    total += Math.max(0, quantidade) * Math.max(0, valorUnitario)
  }
  return total
}

function monthLabel(month: number): string {
  const safeMonth = clamp(month, 1, 12)
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2020, safeMonth - 1, 1)))
}

export default defineEventHandler(async (event) => {
  try {
    const url = new URL(
      (event as any)?.node?.req?.url || (event as any)?.req?.url || '',
      'http://localhost'
    )
    const query = url.searchParams

    const now = new Date()
    const scope = query.get('scope') === 'year' ? 'year' : 'month'
    const year = clamp(parseIntOr(query.get('year'), now.getUTCFullYear()), MIN_YEAR, MAX_YEAR)
    const month = clamp(parseIntOr(query.get('month'), now.getUTCMonth() + 1), 1, 12)
    const limit = clamp(parseIntOr(query.get('limit'), DEFAULT_LIMIT), 1, 50)

    const start =
      scope === 'year'
        ? new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
        : new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
    const end =
      scope === 'year'
        ? new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0))
        : new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))

    const startIso = start.toISOString()
    const endIso = end.toISOString()

    const db = await getMongoDb()
    const historicoCollection = db.collection('historicoCliente')
    const usersCollection = db.collection('users')

    const events = await historicoCollection
      .find({
        tipo: { $in: [...SALES_TYPES] },
        userId: { $exists: true, $ne: '' },
        $or: [
          { data: { $gte: startIso, $lt: endIso } },
          { data: { $gte: start, $lt: end } },
        ],
      })
      .project({
        userId: 1,
        clientId: 1,
        totalVenda: 1,
        valorVenda: 1,
        items: 1,
      })
      .toArray()

    const sellers = await usersCollection
      .find({ role: 'vendedor' })
      .project({ _id: 1, nome: 1, ativo: 1 })
      .toArray()

    const sellerById = new Map(
      sellers.map((seller) => [
        String((seller as any)._id),
        {
          nome: String((seller as any).nome || 'Sem nome'),
          ativo: (seller as any).ativo !== false,
        },
      ])
    )

    const rankingBySeller = new Map<
      string,
      {
        userId: string
        totalVendido: number
        numeroVendas: number
        clientesSet: Set<string>
      }
    >()

    for (const eventRow of events) {
      const userId = String((eventRow as any)?.userId || '').trim()
      if (!userId) continue

      const rawTotal =
        toFiniteNumber((eventRow as any)?.totalVenda) || toFiniteNumber((eventRow as any)?.valorVenda)
      const totalVenda = rawTotal > 0 ? rawTotal : totalFromItems((eventRow as any)?.items)
      const clientId = String((eventRow as any)?.clientId || '').trim()

      const current = rankingBySeller.get(userId)
      if (current) {
        current.totalVendido += Math.max(0, totalVenda)
        current.numeroVendas += 1
        if (clientId) current.clientesSet.add(clientId)
      } else {
        rankingBySeller.set(userId, {
          userId,
          totalVendido: Math.max(0, totalVenda),
          numeroVendas: 1,
          clientesSet: clientId ? new Set([clientId]) : new Set<string>(),
        })
      }
    }

    const ranking = Array.from(rankingBySeller.values())
      .map((entry) => {
        const seller = sellerById.get(entry.userId)
        const clientesUnicos = entry.clientesSet.size
        const ticketMedio = entry.numeroVendas > 0 ? entry.totalVendido / entry.numeroVendas : 0

        return {
          userId: entry.userId,
          nome: seller?.nome || 'Vendedor não listado',
          ativo: seller ? seller.ativo : null,
          encontrado: Boolean(seller),
          numeroVendas: entry.numeroVendas,
          clientesUnicos,
          totalVendido: Number(entry.totalVendido.toFixed(2)),
          ticketMedio: Number(ticketMedio.toFixed(2)),
        }
      })
      .sort((a, b) => {
        if (b.totalVendido !== a.totalVendido) return b.totalVendido - a.totalVendido
        if (b.numeroVendas !== a.numeroVendas) return b.numeroVendas - a.numeroVendas
        if (b.clientesUnicos !== a.clientesUnicos) return b.clientesUnicos - a.clientesUnicos
        return a.nome.localeCompare(b.nome, 'pt-BR')
      })
      .slice(0, limit)

    const periodLabel =
      scope === 'year' ? `Ano ${year}` : `${monthLabel(month)} de ${year}`

    return {
      success: true,
      data: {
        ranking,
        scope,
        year,
        month: scope === 'month' ? month : null,
        periodLabel,
        totalEventos: events.length,
      },
    }
  } catch (error) {
    console.error('Erro ao buscar ranking de vendedores:', error)
    return {
      success: false,
      error: 'Falha ao buscar ranking de vendedores',
    }
  }
})
