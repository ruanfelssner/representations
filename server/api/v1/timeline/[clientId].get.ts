import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'

function toTimelineKind(tipo: string) {
  if (tipo === 'venda_fisica' || tipo === 'venda_ligacao') return 'venda'
  if (tipo === 'visita_fisica') return 'visita'
  if (tipo === 'ligacao') return 'contato'
  if (tipo === 'agendamento') return 'agendamento'
  return 'contato'
}

function toTitle(tipo: string, totalVenda: number) {
  if (tipo === 'venda_fisica') return totalVenda > 0 ? `Venda (física)` : 'Venda (física)'
  if (tipo === 'venda_ligacao') return totalVenda > 0 ? `Venda (ligação)` : 'Venda (ligação)'
  if (tipo === 'visita_fisica') return 'Visita'
  if (tipo === 'ligacao') return 'Ligação'
  if (tipo === 'agendamento') return 'Agendamento'
  if (tipo === 'feedback') return 'Feedback'
  return 'Contato'
}

export default defineEventHandler(async (event) => {
  const { clientId } = getRouterParams(event)
  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'clientId é obrigatório.' })

  const url = new URL((event as any)?.node?.req?.url || (event as any)?.req?.url || '', 'http://localhost')
  const limitRaw = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 200
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 200

  const db = await getMongoDb()
  const events = await db
    .collection('historicoCliente')
    .find({ clientId })
    .sort({ data: -1 })
    .limit(limit)
    .toArray()

  const mapped = events.map((e: any) => ({
    id: String(e._id),
    data: e.data,
    tipo: toTimelineKind(e.tipo),
    titulo: toTitle(e.tipo, Number(e.totalVenda) || 0),
    descricao: e.descricao || e.feedback || undefined,
  }))

  return { success: true, data: { clientId, events: mapped } }
})
