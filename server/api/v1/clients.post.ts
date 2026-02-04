import { createError } from 'h3'
import { geocodeAddress } from '../../utils/geocode'
import { getMongoDb } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as Record<string, unknown>

  const nome = (body.nome as string | undefined)?.trim()
  const endereco_completo = (body.endereco_completo as string | undefined)?.trim()
  const cnpj = (body.cnpj as string | undefined)?.replace(/\D/g, '')

  if (!nome) throw createError({ statusCode: 400, statusMessage: 'nome é obrigatório.' })
  if (!endereco_completo) {
    throw createError({ statusCode: 400, statusMessage: 'endereco_completo é obrigatório.' })
  }

  const db = await getMongoDb()
  const config = useRuntimeConfig()
  const apiKey = config.googleMapsServerApiKey
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google Maps API key não configurada (NUXT_GOOGLE_MAPS_API_KEY).',
    })
  }

  const geo = await geocodeAddress(endereco_completo, apiKey)

  const now = new Date().toISOString()
  const id = cnpj && cnpj.length >= 11 ? cnpj : `cliente-${Date.now()}`

  const doc = {
    _id: id,
    cnpj: cnpj && cnpj.length >= 11 ? cnpj : undefined,
    nome,
    telefone: (body.telefone as string | undefined) || undefined,
    email: (body.email as string | undefined) || undefined,
    endereco: geo.formatted_address || endereco_completo,
    endereco_completo,
    cidade: (body.cidade as string | undefined) || '',
    estado: (body.estado as string | undefined) || 'SC',
    lat: geo.lat,
    lng: geo.lng,
    visitas: [],
    tipo: (body.tipo as string | undefined) || 'prospecto',
    segmento: (body.segmento as string | undefined) || 'otica',
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('clients').updateOne({ _id: id }, { $setOnInsert: doc }, { upsert: true })
  const { _id, ...rest } = doc as any
  return { success: true, data: { ...rest, id } }
})
