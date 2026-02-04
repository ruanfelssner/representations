import { getMongoDb } from '../../utils/mongo'
import { toSimpleIdApi } from '../../utils/dto'

export default defineEventHandler(async () => {
  const db = await getMongoDb()
  const produtos = await db.collection('produtos').find({}).sort({ nome: 1 }).toArray()
  return { success: true, data: produtos.map(toSimpleIdApi) }
})

