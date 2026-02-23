import { createError } from 'h3'
import { z } from 'zod'

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

export default defineCachedEventHandler(
  async () => {
    const { awesomeApiKey } = useRuntimeConfig()
    const response = await $fetch<unknown>(
      `https://economia.awesomeapi.com.br/json/last/XAU-BRL${awesomeApiKey ? `?token=${awesomeApiKey}` : ''}`,
      {
        timeout: 10_000,
      },
    )

    const parsed = AwesomeGoldQuoteSchema.safeParse(response)
    if (!parsed.success) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Resposta inválida ao consultar cotação do ouro.',
      })
    }

    const quote = parsed.data.XAUBRL

    return {
      success: true,
      data: {
        pair: `${quote.code}-${quote.codein}`,
        name: quote.name,
        bid: parseQuoteValue(quote.bid, 'bid'),
        ask: parseQuoteValue(quote.ask, 'ask'),
        high: parseQuoteValue(quote.high, 'high'),
        low: parseQuoteValue(quote.low, 'low'),
        sourceTimestamp: quote.timestamp,
        sourceDate: quote.create_date,
        fetchedAt: new Date().toISOString(),
      },
    }
  },
  {
    maxAge: 60 * 30, // 30 minutes
    name: 'gold-price',
    getKey: () => 'xau-brl',
  },
)
