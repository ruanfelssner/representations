import { getMongoDb } from '../../utils/mongo'
import { toSimpleIdApi } from '../../utils/dto'

export default defineEventHandler(async (event) => {
  const url = new URL((event as any)?.node?.req?.url || (event as any)?.req?.url || '', 'http://localhost')
  const query = url.searchParams
  const db = await getMongoDb()

  const filter: Record<string, any> = {}
  const role = query.get('role')
  const ativo = query.get('ativo')
  if (role) filter.role = role
  if (ativo !== null) filter.ativo = ativo === 'true'

  const users = await db.collection('users').find(filter).sort({ nome: 1 }).toArray()
  return { success: true, data: users.map(toSimpleIdApi) }
})
