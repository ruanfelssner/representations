import { createError } from 'h3'
import { geocodeAddress } from '../../utils/geocode'
import { getMongoDb } from '../../utils/mongo'
import { toClientApi } from '../../utils/dto'

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
    segmento: (body.segmento as string | undefined) || undefined,
    endereco: {
      rua: (body.endereco as string | undefined) || undefined,
      bairro: undefined,
      cidade: (body.cidade as string | undefined) || '',
      cep: (body.cep as string | undefined) || undefined,
      uf: (body.estado as string | undefined) || 'SC',
      endereco_completo,
    },
    localizacao: {
      latitude: geo.lat,
      longitude: geo.lng,
      geo: { type: 'Point', coordinates: [geo.lng, geo.lat] },
    },
    objectives: {
      mesAberto: 0,
      mesTarget: 5000,
      semestreTarget: 30000,
      anoTarget: 60000,
    },
    status:
      (body.status as string | undefined) === 'ativo'
        ? 'ativo'
        : (body.status as string | undefined) === 'inativo'
          ? 'inativo'
          : (body.tipo as string | undefined) === 'inativo'
            ? 'inativo'
            : 'potencial',
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('clients').updateOne({ _id: id }, { $setOnInsert: doc }, { upsert: true })
  return { success: true, data: toClientApi(doc) }
})
