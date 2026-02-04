import { getMongoDb } from '../../utils/mongo'
import { parseWithZod } from '../../utils/validation'
import { UserSchema } from '~/types/schemas'

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const body = (await readBody(event).catch(() => ({}))) as unknown

  const validated = parseWithZod(
    UserSchema.pick({
      nome: true,
      email: true,
      telefone: true,
      role: true,
      dataAdmissao: true,
      meta: true,
    }),
    body
  )

  const now = new Date().toISOString()
  const user = {
    _id: `user-${Date.now()}`,
    ...validated,
    ativo: true,
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('users').insertOne(user)
  const { _id, ...rest } = user as any
  return { success: true, data: { ...rest, id: String(_id) } }
})

