import { createError } from 'h3'
import { geocodeWithCache } from '../../../utils/geocode'
import { getMongoDb } from '../../../utils/mongo'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const body = (await readBody(event).catch(() => ({}))) as Record<string, unknown>
  const db = await getMongoDb()

  const updates: Record<string, unknown> = {}
  ;[
    'nome',
    'telefone',
    'email',
    'endereco',
    'cidade',
    'estado',
    'tipo',
    'segmento',
    'porte',
    'potencial',
    'recorrencia',
    'observacoes',
    'proximaVisita',
  ].forEach((k) => {
    if (k in body) updates[k] = body[k]
  })

  if (typeof body.endereco_completo === 'string' && body.endereco_completo.trim()) {
    const config = useRuntimeConfig()
    const apiKey = config.googleMapsServerApiKey
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google Maps API key não configurada (NUXT_GOOGLE_MAPS_API_KEY).',
      })
    }
    const geo = await geocodeWithCache(db, body.endereco_completo.trim(), apiKey)
    updates.endereco_completo = geo.endereco_completo
    updates.endereco = geo.formatted_address || geo.endereco_completo
    updates.lat = geo.lat
    updates.lng = geo.lng
  }

  updates.updatedAt = new Date().toISOString()

  await db.collection('clients').updateOne({ _id: id }, { $set: updates })
  const client = await db.collection('clients').findOne({ _id: id })
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  const { _id, ...rest } = client as any
  return { success: true, data: { ...rest, id: _id } }
})
