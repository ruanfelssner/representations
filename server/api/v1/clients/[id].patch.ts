import { createError } from 'h3'
import { geocodeAddress } from '../../../utils/geocode'
import { getMongoDb } from '../../../utils/mongo'
import { toClientApi } from '../../../utils/dto'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const body = (await readBody(event).catch(() => ({}))) as Record<string, unknown>
  const db = await getMongoDb()

  const updates: Record<string, unknown> = {}

  ;['nome', 'telefone', 'email', 'segmento', 'status', 'objectives', 'sales'].forEach((k) => {
    if (k in body) updates[k] = body[k]
  })

  // Compat: campos antigos (cidade/estado/endereco/endereco_completo)
  const enderecoUpdates: Record<string, unknown> = {}
  if (typeof body.endereco === 'string') enderecoUpdates['endereco.rua'] = body.endereco
  if (typeof body.cidade === 'string') enderecoUpdates['endereco.cidade'] = body.cidade
  if (typeof body.estado === 'string') enderecoUpdates['endereco.uf'] = body.estado
  if (typeof body.cep === 'string') enderecoUpdates['endereco.cep'] = body.cep
  Object.assign(updates, enderecoUpdates)

  if (typeof body.endereco_completo === 'string' && body.endereco_completo.trim()) {
    const config = useRuntimeConfig()
    const apiKey = config.googleMapsServerApiKey
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google Maps API key não configurada (NUXT_GOOGLE_MAPS_API_KEY).',
      })
    }
    const geo = await geocodeAddress(body.endereco_completo.trim(), apiKey)
    updates['endereco.endereco_completo'] = geo.endereco_completo
    if (geo.formatted_address) updates['endereco.rua'] = geo.formatted_address
    updates['localizacao.latitude'] = geo.lat
    updates['localizacao.longitude'] = geo.lng
    updates['localizacao.geo'] = { type: 'Point', coordinates: [geo.lng, geo.lat] }
  }

  updates.updatedAt = new Date().toISOString()

  await db.collection('clients').updateOne(
    { _id: id },
    {
      $set: updates,
      $unset: { color: '', tipo: '', estado: '', cidade: '', endereco_completo: '', lat: '', lng: '' },
    }
  )
  const client = await db.collection('clients').findOne({ _id: id })
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado.' })

  return { success: true, data: toClientApi(client) }
})
