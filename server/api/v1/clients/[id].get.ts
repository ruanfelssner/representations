import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../../utils/mongo'
import { toClientApi } from '../../../utils/dto'

const SALES_TYPES = ['venda_fisica', 'venda_ligacao']

async function resolveClientDoc(db: any, id: string) {
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const byObjectId = await db.collection('clients').findOne({ _id: new ObjectId(id) })
    if (byObjectId) return byObjectId
  }
  const byId = await db.collection('clients').findOne({ _id: id })
  if (byId) return byId
  const byCnpj = await db.collection('clients').findOne({ cnpj: id })
  if (byCnpj) return byCnpj
  return null
}

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const client = await resolveClientDoc(db, id)
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado. ' })

  const dto: any = toClientApi(client)
  const clientIdKeys = [String(client?._id || ''), id].filter(Boolean)

  // Enriquecer com resumo do histórico (para debug/UI)
  const now = new Date()
  const days90Ago = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const days365Ago = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const farFuture = new Date('9999-12-31T00:00:00.000Z')

  const [summary] = await db
    .collection('historicoCliente')
    .aggregate(
      [
        {
          $addFields: {
            dataDate: { $convert: { input: '$data', to: 'date', onError: null, onNull: null } },
            proximoContatoDate: { $convert: { input: '$proximoContato', to: 'date', onError: null, onNull: null } },
            totalVendaNum: { $convert: { input: '$totalVenda', to: 'double', onError: 0, onNull: 0 } },
          },
        },
        { $match: { clientId: { $in: clientIdKeys }, dataDate: { $ne: null } } },
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
      { allowDiskUse: true }
    )
    .toArray()
    .catch(() => [])

  if (summary) {
    dto.sales ||= {}
    if (!dto.sales.lastContactAt && summary.lastContactAt instanceof Date) {
      dto.sales.lastContactAt = summary.lastContactAt.toISOString()
    }
    if (
      !dto.sales.nextActionAt &&
      summary.nextActionAt instanceof Date &&
      summary.nextActionAt.getTime() !== farFuture.getTime()
    ) {
      dto.sales.nextActionAt = summary.nextActionAt.toISOString()
    }

    dto.sales.totalAllTime = typeof dto.sales.totalAllTime === 'number' ? dto.sales.totalAllTime : Number(summary.totalAllTime) || 0
    dto.sales.total12m = typeof dto.sales.total12m === 'number' ? dto.sales.total12m : Number(summary.total12m) || 0
    dto.sales.total90d = typeof dto.sales.total90d === 'number' ? dto.sales.total90d : Number(summary.total90d) || 0

    dto.objectives ||= {}
    if (typeof dto.objectives.mesAberto !== 'number' || dto.objectives.mesAberto === 0) {
      dto.objectives.mesAberto = Number(summary.totalThisMonth) || 0
    }
  }

  return { success: true, data: dto }
})
