import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { geocodeAddress } from '../../../utils/geocode'
import { getMongoDb } from '../../../utils/mongo'
import { toClientApi } from '../../../utils/dto'

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

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const body = await readBody(event)
  
  const db = await getMongoDb()

  const existing = await resolveClientDoc(db, id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  const updates: Record<string, unknown> = {}

  ;['nome', 'telefone', 'email', 'segmento', 'status', 'objectives', 'sales'].forEach((k) => {
    if (k in body) updates[k] = body[k]
  })

  // Suporte para lat/lng direto (quando buscar coordenadas manualmente)
  const hasManualCoords = typeof body.lat === 'number' && typeof body.lng === 'number'
  
  if (hasManualCoords) {
    updates['localizacao.latitude'] = body.lat
    updates['localizacao.longitude'] = body.lng
    updates['localizacao.geo'] = { type: 'Point', coordinates: [body.lng, body.lat] }
  }

  // Compat: campos antigos (cidade/estado/endereco/endereco_completo)
  const enderecoPayload: Record<string, unknown> = {}
  if (typeof body.endereco === 'string') enderecoPayload.rua = body.endereco
  if (typeof body.cidade === 'string') enderecoPayload.cidade = body.cidade
  if (typeof body.estado === 'string') enderecoPayload.uf = body.estado
  if (typeof body.cep === 'string') enderecoPayload.cep = body.cep

  // Apenas geocodificar se endereco_completo veio E não tem coordenadas manuais
  if (typeof body.endereco_completo === 'string' && body.endereco_completo.trim() && !hasManualCoords) {
    const config = useRuntimeConfig()
    const apiKey = config.googleMapsServerApiKey || config.public.googleMapsApiKey
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google Maps API key não configurada (NUXT_GOOGLE_MAPS_SERVER_API_KEY ou NUXT_PUBLIC_GOOGLE_MAPS_API_KEY).',
      })
    }
    const geo = await geocodeAddress(body.endereco_completo.trim(), apiKey)
    enderecoPayload.endereco_completo = geo.endereco_completo
    if (geo.formatted_address) enderecoPayload.rua = geo.formatted_address
    updates['localizacao.latitude'] = geo.lat
    updates['localizacao.longitude'] = geo.lng
    updates['localizacao.geo'] = { type: 'Point', coordinates: [geo.lng, geo.lat] }
  } else if (typeof body.endereco_completo === 'string' && body.endereco_completo.trim()) {
    // Apenas salvar o endereço_completo sem geocodificar
    enderecoPayload.endereco_completo = body.endereco_completo.trim()
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

  updates.updatedAt = new Date().toISOString()

  await db.collection('clients').updateOne(
    { _id: existing._id },
    {
      $set: updates,
      $unset: { color: '', tipo: '', estado: '', cidade: '', endereco_completo: '', lat: '', lng: '' },
    }
  )
  
  const client = await db.collection('clients').findOne({ _id: existing._id })
  
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado. no patch' })

  return { success: true, data: toClientApi(client) }
})
