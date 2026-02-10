import { createError } from 'h3'
import { geocodeAddress } from '../../utils/geocode'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as Record<string, unknown>
  const endereco =
    (body.endereco_completo as string | undefined) ||
    (body.address as string | undefined) ||
    (body.endereco as string | undefined)

  if (!endereco || !endereco.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'endereco_completo é obrigatório.' })
  }

  const config = useRuntimeConfig()
  const apiKey = config.googleMapsServerApiKey || config.public.googleMapsApiKey
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google Maps API key não configurada (NUXT_GOOGLE_MAPS_SERVER_API_KEY ou NUXT_PUBLIC_GOOGLE_MAPS_API_KEY).',
    })
  }

  try {
    const data = await geocodeAddress(endereco.trim(), apiKey)
    return { success: true, data }
  } catch (err: any) {
    throw createError({ statusCode: 422, statusMessage: err?.message || 'Falha ao geocodificar.' })
  }
})
