import { createError, getQuery } from 'h3'
import { z } from 'zod'
import { getMongoDb } from '../../../utils/mongo'
import { parseWithZod } from '../../../utils/validation'
import { resolveClientDoc, toClientApi } from '../../../utils/dto'

const QuerySchema = z.object({
  cnpj: z.string().min(11, 'cnpj invalido'),
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { cnpj } = parseWithZod(QuerySchema, query)
  const normalized = String(cnpj).replace(/\D/g, '')

  if (normalized.length < 11) {
    throw createError({ statusCode: 400, statusMessage: 'cnpj invalido' })
  }

  const db = await getMongoDb()
  const clientDoc = await resolveClientDoc(db, normalized)

  return {
    success: true,
    data: clientDoc ? toClientApi(clientDoc) : null,
  }
})
