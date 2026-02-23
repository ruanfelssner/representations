import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const existing = await db.collection('regions').findOne({ _id: id })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Região não encontrada.' })

  await db.collection('regions').deleteOne({ _id: id })
  await db.collection('clients').updateMany({ regionId: id }, { $unset: { regionId: '' } })

  return { success: true, data: { id } }
})
