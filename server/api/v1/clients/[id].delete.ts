import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { getMongoDb } from '../../../utils/mongo'

async function resolveClientId(db: any, id: string) {
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const byObjectId = await db.collection('clients').findOne({ _id: new ObjectId(id) }, { projection: { _id: 1 } })
    if (byObjectId?._id) return byObjectId._id
  }
  const byId = await db.collection('clients').findOne({ _id: id }, { projection: { _id: 1 } })
  if (byId?._id) return byId._id
  const byCnpj = await db.collection('clients').findOne({ cnpj: id }, { projection: { _id: 1 } })
  if (byCnpj?._id) return byCnpj._id
  return null
}

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const resolvedId = await resolveClientId(db, id)
  if (!resolvedId) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  await db.collection('clients').deleteOne({ _id: resolvedId })

  return { success: true }
})
