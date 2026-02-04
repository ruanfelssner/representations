import { getMongoDb } from '../../utils/mongo'
import { toClientApi } from '../../utils/dto'

const SALES_TYPES = ['venda_fisica', 'venda_ligacao']

type HistoricoSummary = {
  lastContactAt?: string
  nextActionAt?: string
  totalAllTime?: number
  total12m?: number
  total90d?: number
  totalThisMonth?: number
}

type SalesTotals = { month: number; quarter: number; year: number }

type HistoricoSummaryResult = {
  byClientId: Map<string, HistoricoSummary>
  salesTotals: SalesTotals
}

declare global {
  // eslint-disable-next-line no-var
  var __clientsHistoricoSummaryCache:
    | { at: number; value: HistoricoSummaryResult }
    | undefined
}

async function getHistoricoSummary(db: any): Promise<HistoricoSummaryResult> {
  const ttlMs = 60_000
  const cache = globalThis.__clientsHistoricoSummaryCache
  if (cache && Date.now() - cache.at < ttlMs) return cache.value

  const now = new Date()
  const days90Ago = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const days365Ago = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const quarterStartMonth = Math.floor(month / 3) * 3
  const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const quarterStart = new Date(Date.UTC(year, quarterStartMonth, 1, 0, 0, 0, 0))
  const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
  const farFuture = new Date('9999-12-31T00:00:00.000Z')

  const pipeline: any[] = [
    {
      $addFields: {
        dataDate: { $convert: { input: '$data', to: 'date', onError: null, onNull: null } },
        proximoContatoDate: { $convert: { input: '$proximoContato', to: 'date', onError: null, onNull: null } },
        totalVendaNum: { $convert: { input: '$totalVenda', to: 'double', onError: 0, onNull: 0 } },
      },
    },
    { $match: { clientId: { $type: 'string', $ne: '' }, dataDate: { $ne: null } } },
    {
      $facet: {
        byClient: [
          {
            $group: {
              _id: '$clientId',
              lastContactAt: { $max: '$dataDate' },
              nextActionAt: {
                $min: {
                  $cond: [
                    { $and: [{ $ne: ['$proximoContatoDate', null] }, { $gte: ['$proximoContatoDate', now] }] },
                    '$proximoContatoDate',
                    farFuture,
                  ],
                },
              },
              totalAllTime: { $sum: { $cond: [{ $in: ['$tipo', SALES_TYPES] }, '$totalVendaNum', 0] } },
              total90d: {
                $sum: {
                  $cond: [
                    { $and: [{ $in: ['$tipo', SALES_TYPES] }, { $gte: ['$dataDate', days90Ago] }] },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              total12m: {
                $sum: {
                  $cond: [
                    { $and: [{ $in: ['$tipo', SALES_TYPES] }, { $gte: ['$dataDate', days365Ago] }] },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              totalThisMonth: {
                $sum: {
                  $cond: [
                    { $and: [{ $in: ['$tipo', SALES_TYPES] }, { $gte: ['$dataDate', monthStart] }] },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
            },
          },
        ],
        totals: [
          {
            $group: {
              _id: null,
              month: {
                $sum: {
                  $cond: [
                    { $and: [{ $in: ['$tipo', SALES_TYPES] }, { $gte: ['$dataDate', monthStart] }] },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              quarter: {
                $sum: {
                  $cond: [
                    { $and: [{ $in: ['$tipo', SALES_TYPES] }, { $gte: ['$dataDate', quarterStart] }] },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              year: {
                $sum: {
                  $cond: [
                    { $and: [{ $in: ['$tipo', SALES_TYPES] }, { $gte: ['$dataDate', yearStart] }] },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
            },
          },
        ],
      },
    },
  ]

  const [result] = await db
    .collection('historicoCliente')
    .aggregate(pipeline, { allowDiskUse: true })
    .toArray()
    .catch(() => [])

  const rows = (result as any)?.byClient || []
  const totalsRow = (result as any)?.totals?.[0] || {}

  const byClientId = new Map<string, HistoricoSummary>()
  for (const r of rows as any[]) {
    const clientId = String(r?._id || '')
    if (!clientId) continue
    const lastContactAt = r.lastContactAt instanceof Date ? r.lastContactAt.toISOString() : undefined
    const nextActionAt =
      r.nextActionAt instanceof Date && r.nextActionAt.getTime() !== farFuture.getTime()
        ? r.nextActionAt.toISOString()
        : undefined

    byClientId.set(clientId, {
      lastContactAt,
      nextActionAt,
      totalAllTime: Number(r.totalAllTime) || 0,
      total12m: Number(r.total12m) || 0,
      total90d: Number(r.total90d) || 0,
      totalThisMonth: Number(r.totalThisMonth) || 0,
    })
  }

  const salesTotals: SalesTotals = {
    month: Number(totalsRow?.month) || 0,
    quarter: Number(totalsRow?.quarter) || 0,
    year: Number(totalsRow?.year) || 0,
  }

  const value: HistoricoSummaryResult = { byClientId, salesTotals }
  globalThis.__clientsHistoricoSummaryCache = { at: Date.now(), value }
  return value
}

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const { byClientId: summaryByClientId, salesTotals } = await getHistoricoSummary(db)
  const clients = await db
    .collection('clients')
    .find({}, { projection: { rawOrders: 0 } })
    .toArray()

  const mapped = clients.map((doc: any) => {
    const c: any = toClientApi(doc)
    const s = summaryByClientId.get(String(c?.id || ''))
    if (!s) return c

    c.sales ||= {}
    if (!c.sales.lastContactAt && s.lastContactAt) c.sales.lastContactAt = s.lastContactAt
    if (!c.sales.nextActionAt && s.nextActionAt) c.sales.nextActionAt = s.nextActionAt

    if (typeof c.sales.totalAllTime !== 'number') c.sales.totalAllTime = s.totalAllTime
    if (typeof c.sales.total12m !== 'number') c.sales.total12m = s.total12m
    if (typeof c.sales.total90d !== 'number') c.sales.total90d = s.total90d

    c.objectives ||= {}
    if (typeof c.objectives.mesAberto !== 'number' || c.objectives.mesAberto === 0) {
      c.objectives.mesAberto = s.totalThisMonth
    }

    return c
  })

  const center = mapped.reduce(
    (acc: { lat: number; lng: number; n: number }, c: any) => {
      if (Number.isFinite(c.lat) && Number.isFinite(c.lng)) {
        acc.lat += c.lat
        acc.lng += c.lng
        acc.n += 1
      }
      return acc
    },
    { lat: 0, lng: 0, n: 0 }
  )

  const mapSettings =
    center.n > 0
      ? { center: { lat: center.lat / center.n, lng: center.lng / center.n }, zoom: 7 }
      : { center: { lat: -27.5954, lng: -48.548 }, zoom: 7 }

  return { success: true, data: { clients: mapped, mapSettings, salesTotals } }
})
