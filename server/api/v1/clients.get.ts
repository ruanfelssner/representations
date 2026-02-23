import { createError } from 'h3'
import { getMongoDb } from '../../utils/mongo'
import { toClientApi } from '../../utils/dto'
import { z } from 'zod'
import { ensureTerritoryIndexes } from '../../utils/territory'

const SALES_TYPES = ['venda_fisica', 'venda_online', 'venda_telefone']
const CLIENT_STATUS = ['ativo', 'potencial', 'inativo'] as const

const ClientsQuerySchema = z.object({
  exclude: z.union([z.string(), z.array(z.string())]).optional(),
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  regionId: z.string().optional(),
})

function normalizeExcludeStatuses(input: string | string[] | undefined) {
  const rawValues = (Array.isArray(input) ? input : input ? [input] : [])
    .flatMap((v) => String(v).split(','))
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)

  const out: (typeof CLIENT_STATUS)[number][] = []
  for (const v of rawValues) {
    if (!(CLIENT_STATUS as readonly string[]).includes(v)) {
      throw createError({
        statusCode: 400,
        statusMessage: `exclude inválido: "${v}". Use: ${CLIENT_STATUS.join(', ')}.`,
      })
    }
    out.push(v as (typeof CLIENT_STATUS)[number])
  }
  return out
}

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
  salesTotals: SalesTotals & {
    monthPrev: number
    month2Ago: number
    monthPrevYear: number
    quarterPrev: number
    quarterPrevYear: number
    yearPrevYear: number
  }
  contactsThisMonth: number
  contactsPrevMonth: number
}

declare global {
  // eslint-disable-next-line no-var
  var __clientsHistoricoSummaryCache: { at: number; value: HistoricoSummaryResult } | undefined
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
  const nextMonthStart = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))
  const prevMonthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
  const month2AgoStart = new Date(Date.UTC(year, month - 2, 1, 0, 0, 0, 0))
  const prevMonthDurationMs = Math.max(0, now.getTime() - monthStart.getTime())
  const prevMonthCutoff = new Date(
    Math.min(monthStart.getTime(), prevMonthStart.getTime() + prevMonthDurationMs)
  )

  const monthStartPrevYear = new Date(Date.UTC(year - 1, month, 1, 0, 0, 0, 0))
  const nextMonthStartPrevYear = new Date(Date.UTC(year - 1, month + 1, 1, 0, 0, 0, 0))

  const quarterStart = new Date(Date.UTC(year, quarterStartMonth, 1, 0, 0, 0, 0))
  const prevQuarterStart = new Date(Date.UTC(year, quarterStartMonth - 3, 1, 0, 0, 0, 0))
  const quarterDurationMs = Math.max(0, now.getTime() - quarterStart.getTime())
  const prevQuarterCutoff = new Date(
    Math.min(quarterStart.getTime(), prevQuarterStart.getTime() + quarterDurationMs)
  )

  const quarterStartPrevYear = new Date(Date.UTC(year - 1, quarterStartMonth, 1, 0, 0, 0, 0))
  const nextQuarterStartPrevYear = new Date(
    Date.UTC(year - 1, quarterStartMonth + 3, 1, 0, 0, 0, 0)
  )
  const quarterPrevYearCutoff = new Date(
    Math.min(nextQuarterStartPrevYear.getTime(), quarterStartPrevYear.getTime() + quarterDurationMs)
  )

  const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
  const prevYearStart = new Date(Date.UTC(year - 1, 0, 1, 0, 0, 0, 0))
  const yearDurationMs = Math.max(0, now.getTime() - yearStart.getTime())
  const prevYearCutoff = new Date(
    Math.min(yearStart.getTime(), prevYearStart.getTime() + yearDurationMs)
  )
  const farFuture = new Date('9999-12-31T00:00:00.000Z')

  const pipeline: any[] = [
    {
      $addFields: {
        dataDate: { $convert: { input: '$data', to: 'date', onError: null, onNull: null } },
        proximoContatoDate: {
          $convert: { input: '$proximoContato', to: 'date', onError: null, onNull: null },
        },
        totalVendaNum: { $convert: { input: '$totalVenda', to: 'double', onError: 0, onNull: 0 } },
        clientIdStr: { $toString: '$clientId' },
      },
    },
    { $match: { clientIdStr: { $ne: '' }, dataDate: { $ne: null } } },
    {
      $facet: {
        byClient: [
          {
            $group: {
              _id: '$clientIdStr',
              lastContactAt: { $max: '$dataDate' },
              nextActionAt: {
                $min: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ['$proximoContatoDate', null] },
                        { $gte: ['$proximoContatoDate', now] },
                      ],
                    },
                    '$proximoContatoDate',
                    farFuture,
                  ],
                },
              },
              totalAllTime: {
                $sum: { $cond: [{ $in: ['$tipo', SALES_TYPES] }, '$totalVendaNum', 0] },
              },
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
                    {
                      $and: [{ $in: ['$tipo', SALES_TYPES] }, { $gte: ['$dataDate', days365Ago] }],
                    },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              totalThisMonth: {
                $sum: {
                  $cond: [
                    {
                      $and: [{ $in: ['$tipo', SALES_TYPES] }, { $gte: ['$dataDate', monthStart] }],
                    },
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
              contactsThisMonth: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ['$dataDate', monthStart] },
                        { $lt: ['$dataDate', now] },
                        { $not: [{ $in: ['$tipo', SALES_TYPES] }] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              contactsPrevMonth: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gte: ['$dataDate', prevMonthStart] },
                        { $lt: ['$dataDate', prevMonthCutoff] },
                        { $not: [{ $in: ['$tipo', SALES_TYPES] }] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              month: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$tipo', SALES_TYPES] },
                        { $gte: ['$dataDate', monthStart] },
                        { $lt: ['$dataDate', nextMonthStart] },
                      ],
                    },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              monthPrev: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$tipo', SALES_TYPES] },
                        { $gte: ['$dataDate', prevMonthStart] },
                        { $lt: ['$dataDate', monthStart] },
                      ],
                    },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              month2Ago: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$tipo', SALES_TYPES] },
                        { $gte: ['$dataDate', month2AgoStart] },
                        { $lt: ['$dataDate', prevMonthStart] },
                      ],
                    },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              monthPrevYear: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$tipo', SALES_TYPES] },
                        { $gte: ['$dataDate', monthStartPrevYear] },
                        { $lt: ['$dataDate', nextMonthStartPrevYear] },
                      ],
                    },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              quarter: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$tipo', SALES_TYPES] },
                        { $gte: ['$dataDate', quarterStart] },
                        { $lt: ['$dataDate', now] },
                      ],
                    },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              quarterPrev: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$tipo', SALES_TYPES] },
                        { $gte: ['$dataDate', prevQuarterStart] },
                        { $lt: ['$dataDate', prevQuarterCutoff] },
                      ],
                    },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              quarterPrevYear: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$tipo', SALES_TYPES] },
                        { $gte: ['$dataDate', quarterStartPrevYear] },
                        { $lt: ['$dataDate', quarterPrevYearCutoff] },
                      ],
                    },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              year: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$tipo', SALES_TYPES] },
                        { $gte: ['$dataDate', yearStart] },
                        { $lt: ['$dataDate', now] },
                      ],
                    },
                    '$totalVendaNum',
                    0,
                  ],
                },
              },
              yearPrevYear: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$tipo', SALES_TYPES] },
                        { $gte: ['$dataDate', prevYearStart] },
                        { $lt: ['$dataDate', prevYearCutoff] },
                      ],
                    },
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
    const lastContactAt =
      r.lastContactAt instanceof Date ? r.lastContactAt.toISOString() : undefined
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

  const contactsThisMonth = Number(totalsRow?.contactsThisMonth) || 0
  const contactsPrevMonth = Number(totalsRow?.contactsPrevMonth) || 0

  const value: HistoricoSummaryResult = {
    byClientId,
    salesTotals: {
      ...salesTotals,
      monthPrev: Number(totalsRow?.monthPrev) || 0,
      month2Ago: Number(totalsRow?.month2Ago) || 0,
      monthPrevYear: Number(totalsRow?.monthPrevYear) || 0,
      quarterPrev: Number(totalsRow?.quarterPrev) || 0,
      quarterPrevYear: Number(totalsRow?.quarterPrevYear) || 0,
      yearPrevYear: Number(totalsRow?.yearPrevYear) || 0,
    },
    contactsThisMonth,
    contactsPrevMonth,
  }
  globalThis.__clientsHistoricoSummaryCache = { at: Date.now(), value }
  return value
}

async function populateVisitas(db: any, clients: any[]): Promise<void> {
  if (!clients.length) return

  // Coletar tanto ObjectId quanto string do _id
  const clientIdsAsObjects: any[] = []
  const clientIdsAsStrings: string[] = []

  for (const c of clients) {
    if (c._id) {
      clientIdsAsObjects.push(c._id) // ObjectId original
      const idStr = c._id.toString ? c._id.toString() : String(c._id)
      clientIdsAsStrings.push(idStr) // String
    }
  }

  if (!clientIdsAsObjects.length) return

  // Buscar usando $or para cobrir ambos os casos (ObjectId e string)
  const historico = await db
    .collection('historicoCliente')
    .find(
      {
        $or: [{ clientId: { $in: clientIdsAsObjects } }, { clientId: { $in: clientIdsAsStrings } }],
      },
      {
        projection: {
          clientId: 1,
          userId: 1,
          tipo: 1,
          data: 1,
          descricao: 1,
          meetingLink: 1,
          proximoContato: 1,
          totalVenda: 1,
          createdAt: 1,
        },
        sort: { data: -1 },
      }
    )
    .toArray()

  const visitasByClientId = new Map<string, any[]>()
  for (const evento of historico) {
    // Normalizar clientId para string hexadecimal
    let clientIdStr = ''
    if (evento.clientId) {
      // Se for ObjectId, usar toHexString() ou toString()
      if (typeof evento.clientId === 'object' && evento.clientId.toHexString) {
        clientIdStr = evento.clientId.toHexString()
      } else if (typeof evento.clientId === 'object' && evento.clientId.toString) {
        // ObjectId.toString() retorna a string hex corretamente
        const str = evento.clientId.toString()
        // Extrair apenas o hex se vier no formato "new ObjectId('...')"
        const match = str.match(/^new ObjectId\(['"]([a-f0-9]{24})['"]\)$/i)
        clientIdStr = match ? match[1] : str
      } else {
        clientIdStr = String(evento.clientId)
      }
    }

    if (!clientIdStr) continue

    if (!visitasByClientId.has(clientIdStr)) {
      visitasByClientId.set(clientIdStr, [])
    }

    visitasByClientId.get(clientIdStr)!.push({
      userId: evento.userId,
      tipo: evento.tipo,
      data: evento.data,
      descricao: evento.descricao,
      meetingLink: evento.meetingLink,
      proximoContato: evento.proximoContato,
      totalVenda: evento.totalVenda,
      createdAt: evento.createdAt,
    })
  }

  for (const client of clients) {
    let clientIdStr = ''
    if (client._id) {
      if (typeof client._id === 'object' && client._id.toHexString) {
        clientIdStr = client._id.toHexString()
      } else if (typeof client._id === 'object' && client._id.toString) {
        clientIdStr = client._id.toString()
      } else {
        clientIdStr = String(client._id)
      }
    }

    const visitas = visitasByClientId.get(clientIdStr) || []
    client.visitas = visitas
  }
}

export default defineEventHandler(async (event) => {
  const url = new URL(
    (event as any)?.node?.req?.url || (event as any)?.req?.url || '',
    'http://localhost'
  )
  const queryParsed = ClientsQuerySchema.safeParse({
    exclude: url.searchParams.getAll('exclude'),
    stateId: url.searchParams.get('stateId') || undefined,
    cityId: url.searchParams.get('cityId') || undefined,
    regionId: url.searchParams.get('regionId') || undefined,
  })
  if (!queryParsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Query inválida.' })
  }
  const exclude = normalizeExcludeStatuses(queryParsed.data.exclude)
  const excludeInactive = exclude.includes('inativo')
  const stateIdFilter = queryParsed.data.stateId
  const cityIdFilter = queryParsed.data.cityId
  const regionIdFilter = queryParsed.data.regionId

  const db = await getMongoDb()
  await ensureTerritoryIndexes(db)
  const {
    byClientId: summaryByClientId,
    salesTotals,
    contactsThisMonth,
    contactsPrevMonth,
  } = await getHistoricoSummary(db)
  const clients = await db
    .collection('clients')
    .find({}, { projection: { rawOrders: 0 } })
    .toArray()

  // Popular visitas individuais de cada cliente
  await populateVisitas(db, clients)

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

  let filtered = excludeInactive ? mapped.filter((c: any) => c?.status !== 'inativo') : mapped
  if (stateIdFilter)
    filtered = filtered.filter((c: any) => String(c?.stateId || '') === stateIdFilter)
  if (cityIdFilter) filtered = filtered.filter((c: any) => String(c?.cityId || '') === cityIdFilter)
  if (regionIdFilter)
    filtered = filtered.filter((c: any) => String(c?.regionId || '') === regionIdFilter)

  const center = filtered.reduce(
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

  return {
    success: true,
    data: { clients: filtered, mapSettings, salesTotals, contactsThisMonth, contactsPrevMonth },
  }
})
