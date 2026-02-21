import { createError, defineEventHandler } from 'h3'
import { z } from 'zod'

const GOLD_QUOTE_CACHE_TTL_MS = 5 * 60 * 1000

const AwesomeGoldQuoteSchema = z.object({
  XAUBRL: z.object({
    code: z.string(),
    codein: z.string(),
    name: z.string(),
    high: z.string(),
    low: z.string(),
    bid: z.string(),
    ask: z.string(),
    timestamp: z.string(),
    create_date: z.string(),
  }),
})

type GoldQuoteData = {
  pair: string
  name: string
  bid: number
  ask: number
  high: number
  low: number
  sourceTimestamp: string
  sourceDate: string
  fetchedAt: string
}

let cachedQuote: GoldQuoteData | null = null
let cachedAt = 0
let inflightQuoteRequest: Promise<GoldQuoteData> | null = null

function parseQuoteValue(raw: string, fieldName: string) {
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) {
    throw createError({
      statusCode: 502,
      statusMessage: `Campo inválido na cotação do ouro: ${fieldName}.`,
    })
  }
  return value
}

async function fetchGoldQuoteFromSource() {
  const response = await $fetch<unknown>('https://economia.awesomeapi.com.br/json/last/XAU-BRL', {
    timeout: 10_000,
  })
  const parsed = AwesomeGoldQuoteSchema.safeParse(response)

  if (!parsed.success) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Resposta inválida ao consultar cotação do ouro.',
    })
  }

  const quote = parsed.data.XAUBRL

  return {
    pair: `${quote.code}-${quote.codein}`,
    name: quote.name,
    bid: parseQuoteValue(quote.bid, 'bid'),
    ask: parseQuoteValue(quote.ask, 'ask'),
    high: parseQuoteValue(quote.high, 'high'),
    low: parseQuoteValue(quote.low, 'low'),
    sourceTimestamp: quote.timestamp,
    sourceDate: quote.create_date,
    fetchedAt: new Date().toISOString(),
  }
}

export default defineEventHandler(async () => {
  const now = Date.now()
  if (cachedQuote && now - cachedAt < GOLD_QUOTE_CACHE_TTL_MS) {
    return { success: true, data: cachedQuote }
  }

  try {
    if (!inflightQuoteRequest) {
      inflightQuoteRequest = fetchGoldQuoteFromSource()
    }
    const quote = await inflightQuoteRequest
    cachedQuote = quote
    cachedAt = Date.now()
    return { success: true, data: quote }
  } catch (error: any) {
    if (cachedQuote) {
      return { success: true, data: cachedQuote }
    }
    if (error?.statusCode) throw error

    console.error('[gold-price.get] Erro ao consultar cotação:', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível consultar a cotação do ouro.',
    })
  } finally {
    inflightQuoteRequest = null
  }
})
