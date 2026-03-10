import { createError, defineEventHandler, readBody } from 'h3'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { getMongoDb } from '../../../../utils/mongo'
import { parseWithZod } from '../../../../utils/validation'

const SALES_TYPES = new Set(['venda_fisica', 'venda_online', 'venda_telefone'])

const TransferSaleBodySchema = z.object({
  eventId: z.string().trim().min(1, 'eventId é obrigatório.'),
  toUserId: z.string().trim().min(1, 'toUserId é obrigatório.'),
})

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

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as unknown
  const { eventId, toUserId } = parseWithZod(TransferSaleBodySchema, body)

  const db = await getMongoDb()
  const historicoCollection = db.collection('historicoCliente')
  const usersCollection = db.collection('users')

  const eventFilters: any[] = [{ _id: eventId }]
  if (ObjectId.isValid(eventId)) eventFilters.unshift({ _id: new ObjectId(eventId) })

  const saleEvent = await historicoCollection.findOne(
    eventFilters.length === 1 ? eventFilters[0] : { $or: eventFilters },
    {
      projection: {
        _id: 1,
        userId: 1,
        tipo: 1,
      },
    }
  )

  if (!saleEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Venda não encontrada para transferência.',
    })
  }

  const eventType = String((saleEvent as any)?.tipo || '').trim()
  if (!SALES_TYPES.has(eventType)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Somente eventos de venda podem ser transferidos.',
    })
  }

  const fromUserId = String((saleEvent as any)?.userId || '').trim()
  if (!fromUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A venda informada não possui representante de origem.',
    })
  }

  const userFilters: any[] = [{ _id: toUserId }]
  if (ObjectId.isValid(toUserId)) userFilters.push({ _id: new ObjectId(toUserId) })

  const targetUser = await usersCollection.findOne(
    userFilters.length === 1 ? userFilters[0] : { $or: userFilters },
    {
      projection: {
        _id: 1,
      },
    }
  )

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Representante de destino não encontrado.',
    })
  }

  const targetUserId = normalizeId((targetUser as any)?._id) || toUserId
  if (!targetUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Representante de destino inválido.',
    })
  }

  if (fromUserId === targetUserId) {
    return {
      success: true,
      data: {
        eventId: normalizeId((saleEvent as any)?._id),
        fromUserId,
        toUserId: targetUserId,
        changed: false,
      },
    }
  }

  const updateResult = await historicoCollection.updateOne(
    { _id: (saleEvent as any)._id },
    {
      $set: {
        userId: targetUserId,
        updatedAt: new Date().toISOString(),
      },
    }
  )

  if (!updateResult.matchedCount) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Venda não encontrada para atualização.',
    })
  }

  ;(globalThis as any).__clientsHistoricoSummaryCache = undefined

  return {
    success: true,
    data: {
      eventId: normalizeId((saleEvent as any)?._id),
      fromUserId,
      toUserId: targetUserId,
      changed: updateResult.modifiedCount > 0,
    },
  }
})
