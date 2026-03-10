import { createError, defineEventHandler } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../../../utils/mongo'

const SALES_TYPES = ['venda_fisica', 'venda_online', 'venda_telefone'] as const
const MIN_YEAR = 2020
const MAX_YEAR = 2100
const DEFAULT_LIMIT = 200
const MAX_LIMIT = 1000

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
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
    const quantidade = Math.max(0, toFiniteNumber((item as any)?.quantidade))
    const valorUnitario = Math.max(0, toFiniteNumber((item as any)?.valorUnitario))
    total += quantidade * valorUnitario
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

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

function normalizeId(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  if (typeof value === 'object') {
    const maybeObject = value as any
    if (typeof maybeObject.toHexString === 'function') {
      return String(maybeObject.toHexString()).trim()
    }
    if (typeof maybeObject.toString === 'function') {
      const asString = String(maybeObject.toString()).trim()
      const objectIdMatch = asString.match(/^new ObjectId\(['"]([a-f0-9]{24})['"]\)$/i)
      return (objectIdMatch?.[1] || asString).trim()
    }
  }

  return ''
}

function normalizeSaleType(tipo: string): string {
  if (tipo === 'venda_fisica') return 'física'
  if (tipo === 'venda_online') return 'online'
  if (tipo === 'venda_telefone') return 'telefone'
  return 'outro'
}

function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    const text = String(value || '').trim()
    if (text) return text
  }
  return ''
}

function cityFromEndereco(endereco: unknown): string {
  if (!endereco) return ''

  if (typeof endereco === 'object') {
    const obj = endereco as any
    return firstNonEmpty(obj?.cidade, obj?.municipio)
  }

  if (typeof endereco === 'string') {
    const raw = endereco.trim()
    if (!raw) return ''

    // Tenta extrair "CIDADE - UF" de endereços em string livre.
    const cityUfMatch = raw.match(/,\s*([^,]+?)\s*-\s*[A-Za-z]{2}\b/i)
    if (cityUfMatch?.[1]) return cityUfMatch[1].trim()

    return ''
  }

  return ''
}

function clientDisplayName(client: any): string {
  return (
    firstNonEmpty(
      client?.nome,
      client?.razao_social,
      client?.razaoSocial,
      client?.nome_fantasia,
      client?.nomeFantasia,
      client?.company?.nomeFantasia
    ) || firstNonEmpty(client?.cnpj) || 'Cliente não identificado'
  )
}

function clientDisplayCity(client: any): string {
  return (
    firstNonEmpty(client?.cidade, client?.municipio, cityFromEndereco(client?.endereco)) ||
    'Cidade não informada'
  )
}

export default defineEventHandler(async (event) => {
  try {
    const { userId } = getRouterParams(event)
    const sellerId = String(userId || '').trim()
    if (!sellerId) {
      throw createError({ statusCode: 400, statusMessage: 'userId é obrigatório.' })
    }

    const url = new URL(
      (event as any)?.node?.req?.url || (event as any)?.req?.url || '',
      'http://localhost'
    )
    const query = url.searchParams

    const now = new Date()
    const scope = query.get('scope') === 'year' ? 'year' : 'month'
    const year = clamp(parseIntOr(query.get('year'), now.getUTCFullYear()), MIN_YEAR, MAX_YEAR)
    const month = clamp(parseIntOr(query.get('month'), now.getUTCMonth() + 1), 1, 12)
    const limit = clamp(parseIntOr(query.get('limit'), DEFAULT_LIMIT), 1, MAX_LIMIT)

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
    const clientsCollection = db.collection('clients')

    const events = await historicoCollection
      .find({
        tipo: { $in: [...SALES_TYPES] },
        userId: sellerId,
        $or: [
          { data: { $gte: startIso, $lt: endIso } },
          { data: { $gte: start, $lt: end } },
        ],
      })
      .project({
        _id: 1,
        tipo: 1,
        data: 1,
        clientId: 1,
        totalVenda: 1,
        valorVenda: 1,
        items: 1,
      })
      .toArray()

    const normalizedEvents: Array<{
      eventId: string
      tipo: string
      dataDate: Date
      clientId: string
      totalVenda: number
    }> = []

    const clientIdsAsStrings = new Set<string>()
    const clientObjectIdsByHex = new Map<string, ObjectId>()

    for (const row of events) {
      const dataDate = parseDate((row as any)?.data)
      if (!dataDate) continue

      const eventId = normalizeId((row as any)?._id)
      const clientId = normalizeId((row as any)?.clientId)
      const tipo = String((row as any)?.tipo || '')
      const rawTotal = toFiniteNumber((row as any)?.totalVenda) || toFiniteNumber((row as any)?.valorVenda)
      const totalVenda = rawTotal > 0 ? rawTotal : totalFromItems((row as any)?.items)

      if (clientId) {
        clientIdsAsStrings.add(clientId)

        if (ObjectId.isValid(clientId) && !clientObjectIdsByHex.has(clientId)) {
          clientObjectIdsByHex.set(clientId, new ObjectId(clientId))
        }

        const rawClientId = (row as any)?.clientId
        if (rawClientId && typeof rawClientId === 'object' && typeof rawClientId.toHexString === 'function') {
          const hex = String(rawClientId.toHexString())
          if (ObjectId.isValid(hex) && !clientObjectIdsByHex.has(hex)) {
            clientObjectIdsByHex.set(hex, new ObjectId(hex))
          }
        }
      }

      normalizedEvents.push({
        eventId,
        tipo,
        dataDate,
        clientId,
        totalVenda: Math.max(0, totalVenda),
      })
    }

    normalizedEvents.sort((a, b) => b.dataDate.getTime() - a.dataDate.getTime())

    const clientFilters: any[] = []
    const stringIds = Array.from(clientIdsAsStrings)
    const objectIds = Array.from(clientObjectIdsByHex.values())

    if (stringIds.length) clientFilters.push({ _id: { $in: stringIds } })
    if (objectIds.length) clientFilters.push({ _id: { $in: objectIds } })

    const clients =
      clientFilters.length === 0
        ? []
        : await clientsCollection
            .find(clientFilters.length === 1 ? clientFilters[0] : { $or: clientFilters })
            .project({
              _id: 1,
              nome: 1,
              cidade: 1,
              municipio: 1,
              endereco: 1,
              company: 1,
              nome_fantasia: 1,
              nomeFantasia: 1,
              razao_social: 1,
              razaoSocial: 1,
              cnpj: 1,
            })
            .toArray()

    const clientById = new Map<string, { nome: string; cidade: string }>()
    for (const client of clients) {
      const clientId = normalizeId((client as any)?._id)
      if (!clientId) continue

      const nome = clientDisplayName(client)
      const cidade = clientDisplayCity(client)

      clientById.set(clientId, { nome, cidade })
    }

    const rows = normalizedEvents.slice(0, limit).map((row) => {
      const clientInfo = row.clientId ? clientById.get(row.clientId) : null
      return {
        eventId: row.eventId,
        tipo: row.tipo,
        tipoLabel: normalizeSaleType(row.tipo),
        data: row.dataDate.toISOString(),
        valor: Number(row.totalVenda.toFixed(2)),
        clientId: row.clientId,
        clientNome: clientInfo?.nome || 'Cliente não identificado',
        cidade: clientInfo?.cidade || 'Cidade não informada',
      }
    })

    const periodLabel =
      scope === 'year' ? `Ano ${year}` : `${monthLabel(month)} de ${year}`

    return {
      success: true,
      data: {
        userId: sellerId,
        scope,
        year,
        month: scope === 'month' ? month : null,
        periodLabel,
        totalEventos: normalizedEvents.length,
        returnedEventos: rows.length,
        limit,
        rows,
      },
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do ranking de vendedor:', error)
    return {
      success: false,
      error: 'Falha ao buscar detalhes do vendedor',
    }
  }
})
