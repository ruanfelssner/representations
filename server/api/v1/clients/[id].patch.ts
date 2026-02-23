import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { geocodeAddress } from '../../../utils/geocode'
import { getMongoDb } from '../../../utils/mongo'
import { toClientApi } from '../../../utils/dto'
import { parseWithZod } from '../../../utils/validation'
import {
  ensureTerritoryIndexes,
  extractClientGeoPoint,
  geoPointFromLatLng,
  resolveTerritoryByPoint,
} from '../../../utils/territory'

async function resolveClientDoc(db: any, id: string) {
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const byObjectId = await db.collection('clients').findOne({ _id: new ObjectId(id) })
    if (byObjectId) return byObjectId
  }
  const byId = await db.collection('clients').findOne({ _id: id })
  if (byId) return byId
  const byCnpj = await db.collection('clients').findOne({ cnpj: id })
  if (byCnpj) return byCnpj
  return null
}

const ClientPatchSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  telefone: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  segmento: z.string().trim().optional(),
  status: z.enum(['ativo', 'potencial', 'inativo']).optional(),
  objectives: z.record(z.any()).optional(),
  sales: z.record(z.any()).optional(),
  stateId: z.string().trim().optional(),
  cityId: z.string().trim().optional(),
  regionId: z.string().trim().optional(),

  lat: z.number().optional(),
  lng: z.number().optional(),

  endereco: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z.string().trim().optional(),
  cep: z.string().trim().optional(),
  endereco_completo: z.string().trim().optional(),

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

function shouldRecomputeTerritory(payload: z.infer<typeof ClientPatchSchema>) {
  return (
    (Number.isFinite(payload.lat) && Number.isFinite(payload.lng)) ||
    typeof payload.endereco_completo === 'string' ||
    typeof payload.cidade === 'string' ||
    typeof payload.estado === 'string'
  )
}

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const bodyRaw = (await readBody(event).catch(() => ({}))) as unknown
  const body = parseWithZod(ClientPatchSchema, bodyRaw)

  const db = await getMongoDb()
  await ensureTerritoryIndexes(db)
  const existing = await resolveClientDoc(db, id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  const updates: Record<string, unknown> = {}
  const unsetFields: Record<string, ''> = {
    color: '',
    tipo: '',
    estado: '',
    cidade: '',
    endereco_completo: '',
    lat: '',
    lng: '',
  }
  const directKeys: Array<keyof typeof body> = [
    'nome',
    'telefone',
    'email',
    'segmento',
    'status',
    'objectives',
    'sales',
    'company',
    'buyerContact',
    'storeProducts',
    'social',
    'serviceFlow',
  ]

  for (const key of directKeys) {
    if (key in body) updates[key] = body[key]
  }

  const enderecoPayload: Record<string, unknown> = {}
  if (typeof body.endereco === 'string') enderecoPayload.rua = body.endereco
  if (typeof body.cidade === 'string') enderecoPayload.cidade = body.cidade
  if (typeof body.estado === 'string') enderecoPayload.uf = body.estado.toUpperCase().slice(0, 2)
  if (typeof body.cep === 'string') enderecoPayload.cep = body.cep

  let point = extractClientGeoPoint(existing)

  const hasManualCoords = Number.isFinite(body.lat) && Number.isFinite(body.lng)
  if (hasManualCoords) {
    point = geoPointFromLatLng(body.lat, body.lng)
  } else if (typeof body.endereco_completo === 'string' && body.endereco_completo.trim()) {
    const config = useRuntimeConfig()
    const apiKey = config.googleMapsServerApiKey || config.public.googleMapsApiKey
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage:
          'Google Maps API key não configurada (NUXT_GOOGLE_MAPS_SERVER_API_KEY ou NUXT_PUBLIC_GOOGLE_MAPS_API_KEY).',
      })
    }

    const geo = await geocodeAddress(body.endereco_completo.trim(), apiKey)
    point = geoPointFromLatLng(geo.lat, geo.lng)
    enderecoPayload.endereco_completo = geo.endereco_completo
    if (geo.formatted_address) enderecoPayload.rua = geo.formatted_address
  } else if (typeof body.endereco_completo === 'string') {
    enderecoPayload.endereco_completo = body.endereco_completo.trim()
  }

  if (point) {
    updates['localizacao.latitude'] = point.coordinates[1]
    updates['localizacao.longitude'] = point.coordinates[0]
    updates['localizacao.geo'] = point
  }

  if (Object.keys(enderecoPayload).length > 0) {
    const existingEndereco =
      existing && typeof (existing as any).endereco === 'object' && (existing as any).endereco !== null
        ? (existing as any).endereco
        : typeof (existing as any).endereco === 'string'
          ? { rua: (existing as any).endereco }
          : {}
    updates.endereco = { ...existingEndereco, ...enderecoPayload }
  }

  const hasExplicitTerritory =
    typeof body.stateId === 'string' || typeof body.cityId === 'string' || typeof body.regionId === 'string'

  if (shouldRecomputeTerritory(body) && point) {
    const territory = await resolveTerritoryByPoint(db, point, {
      stateIdHint: body.stateId || (existing as any).stateId,
      stateCodeHint:
        body.estado ||
        (existing as any)?.endereco?.uf ||
        (existing as any)?.estado,
      cityNameHint: body.cidade || (existing as any)?.endereco?.cidade || (existing as any)?.cidade,
    })
    const nextStateId = body.stateId || territory.stateId
    const nextCityId = body.cityId || territory.cityId
    const nextRegionId = body.regionId || territory.regionId

    if (nextStateId) updates.stateId = nextStateId
    else unsetFields.stateId = ''
    if (nextCityId) updates.cityId = nextCityId
    else unsetFields.cityId = ''
    if (nextRegionId) updates.regionId = nextRegionId
    else unsetFields.regionId = ''
    if (territory.stateUf && !body.estado) {
      const baseEndereco =
        (updates.endereco as any) ||
        ((existing as any)?.endereco && typeof (existing as any).endereco === 'object'
          ? (existing as any).endereco
          : {})
      updates.endereco = { ...baseEndereco, uf: territory.stateUf }
    }
  } else if (hasExplicitTerritory) {
    if ('stateId' in body) {
      if (body.stateId) updates.stateId = body.stateId
      else unsetFields.stateId = ''
    }
    if ('cityId' in body) {
      if (body.cityId) updates.cityId = body.cityId
      else unsetFields.cityId = ''
    }
    if ('regionId' in body) {
      if (body.regionId) updates.regionId = body.regionId
      else unsetFields.regionId = ''
    }
  }

  updates.updatedAt = new Date().toISOString()

  await db.collection('clients').updateOne(
    { _id: existing._id },
    {
      $set: updates,
      $unset: unsetFields,
    }
  )

  const client = await db.collection('clients').findOne({ _id: existing._id })
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado após patch.' })

  return { success: true, data: toClientApi(client) }
})
