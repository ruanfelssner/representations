import { defineEventHandler } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

const SALES_TYPES = ['venda_fisica', 'venda_online', 'venda_telefone'] as const
const ATTEMPT_TYPES = ['visita_fisica', 'ligacao', 'atendimento_online'] as const
const DAY_MS = 24 * 60 * 60 * 1000

type SalesRow = {
  clientId: string
  dataDate: Date
  totalVenda: number
  items?: Array<{ nome?: string; produtoId?: string; quantidade?: number }>
}

type AttemptRow = {
  clientId: string
  dataDate: Date
}

type MonthWindow = {
  key: string
  label: string
  start: Date
  end: Date
}

type DistributionItem = {
  label: string
  count: number
  percentage: number
}

declare global {
  // eslint-disable-next-line no-var
  var __adminKpisComerciaisCache:
    | {
        at: number
        value: Record<string, unknown>
      }
    | undefined
}

function toFiniteNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function average(values: number[]): number {
  if (!values.length) return 0
  const sum = values.reduce((acc, n) => acc + n, 0)
  return sum / values.length
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.max(0, Math.ceil(p * sorted.length) - 1)
  return sorted[idx] ?? 0
}

function piecesFromItems(items: unknown): number {
  if (!Array.isArray(items)) return 0
  let total = 0
  for (const item of items) {
    total += Math.max(0, Math.floor(toFiniteNumber((item as any)?.quantidade)))
  }
  return total
}

function findFirstOnOrAfter(sortedAscMs: number[], targetMs: number): number {
  let lo = 0
  let hi = sortedAscMs.length - 1
  let found = -1

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if ((sortedAscMs[mid] ?? 0) >= targetMs) {
      found = mid
      hi = mid - 1
    } else {
      lo = mid + 1
    }
  }

  return found
}

function findLastOnOrBefore(sortedAscMs: number[], targetMs: number): number {
  let lo = 0
  let hi = sortedAscMs.length - 1
  let found = -1

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if ((sortedAscMs[mid] ?? 0) <= targetMs) {
      found = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return found
}

function toMonthStartUtc(base: Date, offsetMonths = 0): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + offsetMonths, 1, 0, 0, 0, 0))
}

function toMonthKeyUtc(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function monthLabelPtBr(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function buildLast3MonthWindows(now: Date): MonthWindow[] {
  const out: MonthWindow[] = []
  for (let offset = -2; offset <= 0; offset++) {
    const start = toMonthStartUtc(now, offset)
    const end = toMonthStartUtc(now, offset + 1)
    out.push({
      key: toMonthKeyUtc(start),
      label: monthLabelPtBr(start),
      start,
      end,
    })
  }
  return out
}

function bucketOrderSize(pieces: number): string {
  if (pieces <= 0) return 'Sem itens'
  if (pieces <= 5) return '1-5 peças'
  if (pieces <= 10) return '6-10 peças'
  if (pieces <= 20) return '11-20 peças'
  return '21+ peças'
}

function extractSizeLabel(raw: string): string | null {
  if (!raw) return null

  const explicitMatch = raw.match(/(?:aro|tam(?:anho)?|size)\s*[:#-]?\s*(\d{1,2})/i)
  if (explicitMatch?.[1]) {
    const n = Number(explicitMatch[1])
    if (Number.isFinite(n) && n >= 1 && n <= 40) return String(n)
  }

  const trailingMatch = raw.match(/(\d{2})(?:[a-z])?$/i)
  if (trailingMatch?.[1]) {
    const n = Number(trailingMatch[1])
    if (Number.isFinite(n) && n >= 1 && n <= 40) return String(n)
  }

  return null
}

function normalizeDistribution(
  map: Map<string, number>,
  options?: { preferredOrder?: string[]; sortNumericLabels?: boolean }
): DistributionItem[] {
  const total = Array.from(map.values()).reduce((acc, n) => acc + n, 0)
  const rows = Array.from(map.entries()).map(([label, count]) => ({
    label,
    count,
    percentage: total > 0 ? round((count / total) * 100, 1) : 0,
  }))

  const preferredOrder = options?.preferredOrder || []
  if (preferredOrder.length) {
    const byLabel = new Map(rows.map((r) => [r.label, r]))
    const ordered: DistributionItem[] = []
    for (const label of preferredOrder) {
      const item = byLabel.get(label)
      if (item) ordered.push(item)
      byLabel.delete(label)
    }
    const rest = Array.from(byLabel.values()).sort((a, b) => b.count - a.count)
    return [...ordered, ...rest]
  }

  if (options?.sortNumericLabels) {
    return rows.sort((a, b) => {
      if (a.label === 'Sem tamanho') return 1
      if (b.label === 'Sem tamanho') return -1
      const aNum = Number(a.label)
      const bNum = Number(b.label)
      if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum
      return a.label.localeCompare(b.label)
    })
  }

  return rows.sort((a, b) => b.count - a.count)
}

function ensureSortedMapValues(map: Map<string, number[]>) {
  for (const values of map.values()) {
    values.sort((a, b) => a - b)
  }
}

export default defineEventHandler(async () => {
  const ttlMs = 60_000
  const cache = globalThis.__adminKpisComerciaisCache
  if (cache && Date.now() - cache.at < ttlMs) {
    return { success: true, data: cache.value }
  }

  const db = await getMongoDb()
  const historico = db.collection('historicoCliente')

  const now = new Date()
  const windowStart = toMonthStartUtc(now, -2)
  const windowStartForPrazo = new Date(windowStart.getTime() - 90 * DAY_MS)
  const window30Days = new Date(now.getTime() - 30 * DAY_MS)
  const monthWindows = buildLast3MonthWindows(now)

  const salesPipeline = [
    {
      $addFields: {
        clientIdStr: { $toString: '$clientId' },
        dataDate: { $convert: { input: '$data', to: 'date', onError: null, onNull: null } },
        totalVendaNum: { $convert: { input: '$totalVenda', to: 'double', onError: 0, onNull: 0 } },
      },
    },
    {
      $match: {
        clientIdStr: { $ne: '' },
        dataDate: { $ne: null, $gte: windowStart, $lt: now },
        tipo: { $in: [...SALES_TYPES] },
      },
    },
    {
      $project: {
        _id: 0,
        clientId: '$clientIdStr',
        dataDate: 1,
        totalVenda: '$totalVendaNum',
        items: 1,
      },
    },
  ]

  const attemptsPipeline = [
    {
      $addFields: {
        clientIdStr: { $toString: '$clientId' },
        dataDate: { $convert: { input: '$data', to: 'date', onError: null, onNull: null } },
      },
    },
    {
      $match: {
        clientIdStr: { $ne: '' },
        dataDate: { $ne: null, $gte: windowStartForPrazo, $lt: now },
        tipo: { $in: [...ATTEMPT_TYPES] },
      },
    },
    {
      $project: {
        _id: 0,
        clientId: '$clientIdStr',
        dataDate: 1,
      },
    },
  ]

  const [salesRowsRaw, attemptsRowsRaw, activeClients] = await Promise.all([
    historico.aggregate(salesPipeline, { allowDiskUse: true }).toArray(),
    historico.aggregate(attemptsPipeline, { allowDiskUse: true }).toArray(),
    db.collection('clients').countDocuments({ status: 'ativo' }),
  ])

  const salesRows = (salesRowsRaw as SalesRow[])
    .filter((row) => row?.clientId && row.dataDate instanceof Date)
    .map((row) => {
      const totalVenda = Math.max(0, toFiniteNumber(row.totalVenda))
      const pieces = piecesFromItems(row.items)
      const timeMs = row.dataDate.getTime()
      return {
        clientId: row.clientId,
        dataDate: row.dataDate,
        timeMs,
        totalVenda,
        pieces,
        items: Array.isArray(row.items) ? row.items : [],
      }
    })

  const attemptsRows = (attemptsRowsRaw as AttemptRow[])
    .filter((row) => row?.clientId && row.dataDate instanceof Date)
    .map((row) => ({
      clientId: row.clientId,
      dataDate: row.dataDate,
      timeMs: row.dataDate.getTime(),
    }))

  const ordersCount = salesRows.length
  const totalRevenue = salesRows.reduce((sum, row) => sum + row.totalVenda, 0)
  const totalPieces = salesRows.reduce((sum, row) => sum + row.pieces, 0)
  const piecesPerOrder = salesRows.map((row) => row.pieces)

  const mediaPecasPorPedido = round(average(piecesPerOrder), 2)
  const percentil75PecasPorPedido = round(percentile(piecesPerOrder, 0.75), 2)
  const ticketMedioPorPedido = ordersCount > 0 ? round(totalRevenue / ordersCount, 2) : 0
  const ticketMedioPorPeca = totalPieces > 0 ? round(totalRevenue / totalPieces, 2) : 0

  const ordersByMonth = new Map<string, number>()
  for (const row of salesRows) {
    const key = toMonthKeyUtc(row.dataDate)
    ordersByMonth.set(key, (ordersByMonth.get(key) || 0) + 1)
  }

  const pedidosPorClienteAtivoMes = monthWindows.map((m) => {
    const pedidos = ordersByMonth.get(m.key) || 0
    const ratio = activeClients > 0 ? pedidos / activeClients : 0
    return {
      key: m.key,
      label: m.label,
      pedidos,
      pedidosPorClienteAtivo: round(ratio, 3),
    }
  })

  const pedidosPorClienteAtivoMedio = round(
    average(pedidosPorClienteAtivoMes.map((m) => m.pedidosPorClienteAtivo)),
    3
  )

  const firstSale30dByClient = new Map<string, Date>()
  for (const row of salesRows) {
    if (row.dataDate < window30Days) continue
    const current = firstSale30dByClient.get(row.clientId)
    if (!current || row.dataDate < current) firstSale30dByClient.set(row.clientId, row.dataDate)
  }

  const clientIds30d = Array.from(firstSale30dByClient.keys())
  let previousSalesRows: Array<{ _id: string; lastSaleDate: Date }> = []

  if (clientIds30d.length) {
    const previousPipeline = [
      {
        $addFields: {
          clientIdStr: { $toString: '$clientId' },
          dataDate: { $convert: { input: '$data', to: 'date', onError: null, onNull: null } },
        },
      },
      {
        $match: {
          clientIdStr: { $in: clientIds30d },
          tipo: { $in: [...SALES_TYPES] },
          dataDate: { $ne: null, $lt: window30Days },
        },
      },
      {
        $group: {
          _id: '$clientIdStr',
          lastSaleDate: { $max: '$dataDate' },
        },
      },
    ]

    previousSalesRows = (await historico
      .aggregate(previousPipeline, { allowDiskUse: true })
      .toArray()) as Array<{ _id: string; lastSaleDate: Date }>
  }

  const previousSaleByClient = new Map<string, Date>()
  for (const row of previousSalesRows) {
    if (!row?._id || !(row.lastSaleDate instanceof Date)) continue
    previousSaleByClient.set(row._id, row.lastSaleDate)
  }

  let reativados30d = 0
  for (const [clientId, firstSaleDate] of firstSale30dByClient.entries()) {
    const previousSaleDate = previousSaleByClient.get(clientId)
    if (!previousSaleDate) continue

    const diffDays = (firstSaleDate.getTime() - previousSaleDate.getTime()) / DAY_MS
    if (diffDays >= 90) reativados30d++
  }

  const clientesComPedido30d = firstSale30dByClient.size
  const taxaReativacao30d =
    clientesComPedido30d > 0 ? round((reativados30d / clientesComPedido30d) * 100, 1) : 0

  const attemptsByClient = new Map<string, number[]>()
  const attempts3m: Array<{ clientId: string; timeMs: number }> = []

  for (const row of attemptsRows) {
    const list = attemptsByClient.get(row.clientId) || []
    list.push(row.timeMs)
    attemptsByClient.set(row.clientId, list)

    if (row.dataDate >= windowStart) {
      attempts3m.push({ clientId: row.clientId, timeMs: row.timeMs })
    }
  }

  const salesByClient = new Map<string, number[]>()
  for (const row of salesRows) {
    const list = salesByClient.get(row.clientId) || []
    list.push(row.timeMs)
    salesByClient.set(row.clientId, list)
  }

  ensureSortedMapValues(attemptsByClient)
  ensureSortedMapValues(salesByClient)

  let tentativasConvertidas3m = 0
  for (const attempt of attempts3m) {
    const salesTimes = salesByClient.get(attempt.clientId)
    if (!salesTimes?.length) continue

    const idx = findFirstOnOrAfter(salesTimes, attempt.timeMs)
    if (idx === -1) continue

    const firstSaleAfterAttempt = salesTimes[idx] || 0
    if (firstSaleAfterAttempt <= attempt.timeMs + 30 * DAY_MS) {
      tentativasConvertidas3m++
    }
  }

  const tentativas3m = attempts3m.length
  const taxaConversaoTentativaPedido =
    tentativas3m > 0 ? round((tentativasConvertidas3m / tentativas3m) * 100, 1) : 0

  const prazosDias: number[] = []
  for (const sale of salesRows) {
    const attemptsTimes = attemptsByClient.get(sale.clientId)
    if (!attemptsTimes?.length) continue

    const idx = findLastOnOrBefore(attemptsTimes, sale.timeMs)
    if (idx === -1) continue

    const latestAttemptBeforeSale = attemptsTimes[idx] || 0
    if (latestAttemptBeforeSale < sale.timeMs - 90 * DAY_MS) continue

    const diffDays = (sale.timeMs - latestAttemptBeforeSale) / DAY_MS
    if (diffDays >= 0) prazosDias.push(diffDays)
  }

  const prazoMedioDias = round(average(prazosDias), 1)

  const orderSizeBuckets = new Map<string, number>()
  for (const row of salesRows) {
    const label = bucketOrderSize(row.pieces)
    orderSizeBuckets.set(label, (orderSizeBuckets.get(label) || 0) + 1)
  }

  const distribuicaoPorPedido = normalizeDistribution(orderSizeBuckets, {
    preferredOrder: ['Sem itens', '1-5 peças', '6-10 peças', '11-20 peças', '21+ peças'],
  })

  const sizeBuckets = new Map<string, number>()
  for (const sale of salesRows) {
    for (const item of sale.items) {
      const quantity = Math.max(0, Math.floor(toFiniteNumber((item as any)?.quantidade)))
      if (quantity <= 0) continue

      const rawName = String((item as any)?.nome || '')
      const rawProductId = String((item as any)?.produtoId || '')
      const sizeFromName = extractSizeLabel(rawName)
      const sizeFromId = extractSizeLabel(rawProductId)
      const sizeLabel = sizeFromName || sizeFromId || 'Sem tamanho'

      sizeBuckets.set(sizeLabel, (sizeBuckets.get(sizeLabel) || 0) + quantity)
    }
  }

  const distribuicaoPorTamanho = normalizeDistribution(sizeBuckets, { sortNumericLabels: true })

  const responseData = {
    janelaInicio: windowStart.toISOString(),
    janelaFim: now.toISOString(),
    pedidos3m: ordersCount,
    clientesAtivos: activeClients,

    mediaPecasPorPedido: mediaPecasPorPedido,
    percentil75PecasPorPedido: percentil75PecasPorPedido,

    pedidosPorClienteAtivoMedio,
    pedidosPorClienteAtivoMes,

    reativados30d,
    clientesComPedido30d,
    taxaReativacao30d,

    tentativas3m,
    tentativasConvertidas3m,
    taxaConversaoTentativaPedido,

    prazoMedioDias,

    ticketMedioPorPedido,
    ticketMedioPorPeca,

    distribuicaoPorPedido,
    distribuicaoPorTamanho,

    observacoes: {
      prazoMedioBase: 'dias entre tentativa (contato/ligação/visita) e pedido',
      tamanhoBase: 'extraído de nome/produto quando houver padrão de tamanho',
    },
    computedAt: now.toISOString(),
  }

  globalThis.__adminKpisComerciaisCache = {
    at: Date.now(),
    value: responseData,
  }

  return {
    success: true,
    data: responseData,
  }
})
