import { createError } from 'h3'
import { z } from 'zod'
import { geocodeAddress } from '../../utils/geocode'
import { getMongoDb } from '../../utils/mongo'
import { toClientApi } from '../../utils/dto'
import { parseWithZod } from '../../utils/validation'
import { ensureTerritoryIndexes, geoPointFromLatLng, resolveTerritoryByPoint } from '../../utils/territory'

const ClientCreateSchema = z.object({
  nome: z.string().trim().min(1),
  endereco_completo: z.string().trim().optional(),
  endereco: z.string().trim().optional(),
  telefone: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  cidade: z.string().trim().optional(),
  estado: z.string().trim().optional(),
  status: z.enum(['ativo', 'potencial', 'inativo']).optional(),
  segmento: z.string().trim().optional(),
  cnpj: z.string().trim().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  stateId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  regionId: z.string().trim().optional(),

  company: z
    .object({
      nomeFantasia: z.string().trim().optional(),
    })
    .optional(),
  buyerContact: z
    .object({
      contatado: z.boolean().optional(),
      nome: z.string().trim().optional(),
      telefone: z.string().trim().optional(),
    })
    .optional(),
  storeProducts: z
    .array(z.enum(['joia', 'relogio', 'oculos', 'caneta', 'perfume', 'prata']))
    .optional(),
  social: z
    .object({
      instagram: z.string().trim().optional(),
    })
    .optional(),
  serviceFlow: z
    .object({
      firstContact: z
        .object({
          channel: z.enum(['whatsapp', 'telefone']).optional(),
          outcome: z
            .enum(['agendado_online', 'agendado_presencial', 'sem_retorno', 'nao_tem_interesse'])
            .optional(),
          happenedAt: z.string().datetime().optional(),
          notes: z.string().trim().optional(),
        })
        .optional(),
    })
    .optional(),
})

export default defineEventHandler(async (event) => {
  const raw = (await readBody(event).catch(() => ({}))) as unknown
  const body = parseWithZod(ClientCreateSchema, raw)

  const db = await getMongoDb()
  await ensureTerritoryIndexes(db)
  const nome = body.nome.trim()
  const cnpj = body.cnpj?.replace(/\D/g, '')
  const enderecoCompleto = body.endereco_completo?.trim()

  let lat = body.lat
  let lng = body.lng

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    if (!enderecoCompleto) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Informe endereco_completo ou lat/lng para criar o cliente.',
      })
    }

    const config = useRuntimeConfig()
    const apiKey = config.googleMapsServerApiKey || config.public?.googleMapsApiKey
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google Maps API key não configurada (NUXT_GOOGLE_MAPS_API_KEY).',
      })
    }

    const geo = await geocodeAddress(enderecoCompleto, apiKey)
    lat = geo.lat
    lng = geo.lng
  }

  const point = geoPointFromLatLng(lat, lng)
  const territory = await resolveTerritoryByPoint(db, point, {
    stateIdHint: body.stateId,
    stateCodeHint: body.estado,
    cityNameHint: body.cidade,
  })

  const now = new Date().toISOString()
  const id = cnpj && cnpj.length >= 11 ? cnpj : `cliente-${Date.now()}`

  const doc = {
    _id: id,
    cnpj: cnpj && cnpj.length >= 11 ? cnpj : undefined,
    nome,
    telefone: (body.telefone as string | undefined) || undefined,
    email: body.email || undefined,
    segmento: body.segmento || undefined,
    stateId: body.stateId || territory.stateId,
    cityId: body.cityId || territory.cityId,
    regionId: body.regionId || territory.regionId,
    company: body.company || undefined,
    buyerContact: body.buyerContact || undefined,
    storeProducts: body.storeProducts || undefined,
    social: body.social || undefined,
    serviceFlow: body.serviceFlow || undefined,
    endereco: {
      rua: body.endereco || undefined,
      bairro: undefined,
      cidade: body.cidade || territory.cityName || '',
      cep: undefined,
      uf: (territory.stateUf || body.estado || 'SC').toUpperCase().slice(0, 2),
      endereco_completo: enderecoCompleto,
    },
    localizacao: {
      latitude: lat,
      longitude: lng,
      geo: point || undefined,
    },
    objectives: {
      mesAberto: 0,
      mesTarget: 5000,
      semestreTarget: 30000,
      anoTarget: 60000,
    },
    status:
      body.status === 'ativo'
        ? 'ativo'
        : body.status === 'inativo'
          ? 'inativo'
            : 'potencial',
    createdAt: now,
    updatedAt: now,
  }

  await db.collection('clients').updateOne({ _id: id }, { $setOnInsert: doc }, { upsert: true })
  return { success: true, data: toClientApi(doc) }
})
