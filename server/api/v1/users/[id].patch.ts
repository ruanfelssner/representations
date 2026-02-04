import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { parseWithZod } from '../../../utils/validation'
import { UserSchema } from '~/types/schemas'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const body = (await readBody(event).catch(() => ({}))) as unknown

  const validated = parseWithZod(
    UserSchema.pick({
      nome: true,
      email: true,
      telefone: true,
      role: true,
      ativo: true,
      dataAdmissao: true,
      meta: true,
      permissions: true,
    }).partial(),
    body
  )

  const updates = { ...validated, updatedAt: new Date().toISOString() }
  await db.collection('users').updateOne({ _id: id }, { $set: updates })

  const user = await db.collection('users').findOne({ _id: id })
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User não encontrado.' })

  const { _id, ...rest } = user as any
  return { success: true, data: { ...rest, id: String(_id) } }
})

