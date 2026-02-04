import type { Cliente } from '~/types/client'
import type { ClientEngagementStatusKey } from '~/composables/useClientEngagementStatus'

export type SellerSuggestedActionType = 'ligar' | 'visitar' | 'enviar_catalogo' | 'cobrar'

export type SellerActionPriority = 'P0' | 'P1' | 'P2'

export type SellerActionTask = {
  clientId: string
  nome: string
  cidade?: string
  segmento?: string
  telefone?: string

  statusKey: ClientEngagementStatusKey
  score: number
  priority: SellerActionPriority

  suggestedAction: SellerSuggestedActionType
  suggestedActionLabel: string
  suggestedIcon: string

  valueMetric: number
  valueMetricLabel: string

  daysSinceLastContact: number | null
  nextActionAt?: string
  reasons: string[]
}

function safeNumber(v: unknown) {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function startOfDay(d: Date) {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function daysSince(iso: string, now = new Date()) {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return null
  const today = startOfDay(now)
  const lastDay = startOfDay(parsed)
  const msPerDay = 1000 * 60 * 60 * 24
  const diff = Math.ceil((today.getTime() - lastDay.getTime()) / msPerDay)
  return Math.max(0, diff)
}

function daysUntil(iso: string, now = new Date()) {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return null
  const today = startOfDay(now)
  const dueDay = startOfDay(parsed)
  const msPerDay = 1000 * 60 * 60 * 24
  const diff = Math.ceil((dueDay.getTime() - today.getTime()) / msPerDay)
  return diff
}

function formatCompactMoney(v: number) {
  const n = Math.round(v)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  return String(n)
}

function priorityForScore(score: number): SellerActionPriority {
  if (score >= 120) return 'P0'
  if (score >= 90) return 'P1'
  return 'P2'
}

function suggestedActionFor(statusKey: ClientEngagementStatusKey, nextActionType?: string): SellerSuggestedActionType {
  const t = String(nextActionType || '')
  if (t === 'ligar' || t === 'visitar' || t === 'enviar_catalogo' || t === 'cobrar') return t

  if (statusKey === 'critico') return 'ligar'
  if (statusKey === 'atencao') return 'ligar'
  if (statusKey === 'potencial') return 'enviar_catalogo'
  if (statusKey === 'ativo') return 'visitar'
  return 'ligar'
}

function actionLabel(action: SellerSuggestedActionType) {
  if (action === 'ligar') return 'Ligar'
  if (action === 'visitar') return 'Visitar'
  if (action === 'enviar_catalogo') return 'Enviar catálogo'
  return 'Cobrar'
}

function actionIcon(action: SellerSuggestedActionType) {
  if (action === 'ligar') return 'mdi:phone'
  if (action === 'visitar') return 'mdi:map-marker'
  if (action === 'enviar_catalogo') return 'mdi:send'
  return 'mdi:cash'
}

export function useSellerActionPlan() {
  const { keyForClient } = useClientEngagementStatus()

  function taskForClient(cliente: Cliente, now = new Date()): SellerActionTask | null {
    const id = String((cliente as any)?.id || '')
    if (!id) return null

    const statusKey = keyForClient(cliente)
    if (statusKey === 'inativo') return null

    const totalAllTime = safeNumber((cliente as any)?.sales?.totalAllTime)
    const total12m = safeNumber((cliente as any)?.sales?.total12m)
    const total90d = safeNumber((cliente as any)?.sales?.total90d)
    const mesAberto = safeNumber((cliente as any)?.objectives?.mesAberto)
    const priorityScore = safeNumber((cliente as any)?.sales?.priorityScore)
    const stage = String((cliente as any)?.sales?.stage || '')

    const valueMetric = total90d || total12m || mesAberto || totalAllTime
    const valueMetricLabel = valueMetric > 0 ? `R$ ${formatCompactMoney(valueMetric)}` : 'R$ 0'

    const lastIso = String((cliente as any)?.sales?.lastContactAt || '')
    const daysSinceLastContact = lastIso ? daysSince(lastIso, now) : null

    const nextActionAt = String((cliente as any)?.sales?.nextActionAt || '')
    const nextActionDays = nextActionAt ? daysUntil(nextActionAt, now) : null

    let score = 0
    const reasons: string[] = []

    // Base por status (carteira)
    if (statusKey === 'critico') score += 100
    else if (statusKey === 'atencao') score += 70
    else if (statusKey === 'potencial') score += 50
    else score += 20

    // Impacto (compra / potencial de faturamento)
    score += Math.round(Math.log10(1 + Math.max(0, valueMetric)) * 12)
    if (valueMetric > 0) reasons.push(`Impacto: ${valueMetricLabel}`)

    // Dados manuais do vendedor (0-100) vira alavanca do score
    if (priorityScore > 0) {
      score += Math.round(priorityScore / 5)
      reasons.push(`Prioridade manual: ${Math.round(priorityScore)}/100`)
    }

    // Etapa comercial
    if (stage === 'negociacao') {
      score += 15
      reasons.push('Etapa: negociação')
    } else if (stage === 'reativacao') {
      score += 25
      reasons.push('Etapa: reativação')
    } else if (stage === 'perdido') {
      score -= 10
      reasons.push('Etapa: perdido')
    }

    // Urgência de follow-up
    if (typeof nextActionDays === 'number') {
      if (nextActionDays <= 0) {
        score += 35
        reasons.push('Follow-up: atrasado')
      } else if (nextActionDays <= 3) {
        score += 18
        reasons.push('Follow-up: próximo (≤3d)')
      }
    } else if (statusKey === 'critico' || statusKey === 'atencao') {
      reasons.push('Sem follow-up agendado')
    }

    // Recência de contato (explica o status)
    if (typeof daysSinceLastContact === 'number') {
      reasons.push(`Último contato: há ${daysSinceLastContact}d`)
    } else if (statusKey === 'potencial') {
      reasons.push('Sem histórico de contato/venda')
    }

    // Segmento (prospecção direcionada)
    const segmento = String((cliente as any)?.segmento || '')
    if (statusKey === 'potencial' && (segmento === 'relojoaria' || segmento === 'joalheria')) {
      score += 10
      reasons.push('Segmento: alvo (joias/relógios)')
    }

    const suggestedAction = suggestedActionFor(statusKey, (cliente as any)?.sales?.nextActionType)

    return {
      clientId: id,
      nome: String((cliente as any)?.nome || id),
      cidade: String((cliente as any)?.cidade || (cliente as any)?.endereco?.cidade || ''),
      segmento,
      telefone: String((cliente as any)?.telefone || ''),
      statusKey,
      score,
      priority: priorityForScore(score),
      suggestedAction,
      suggestedActionLabel: actionLabel(suggestedAction),
      suggestedIcon: actionIcon(suggestedAction),
      valueMetric,
      valueMetricLabel,
      daysSinceLastContact,
      nextActionAt: nextActionAt || undefined,
      reasons: reasons.slice(0, 3),
    }
  }

  function topTasks(clientes: Cliente[], opts?: { limit?: number; now?: Date }) {
    const limit = Math.max(1, Math.min(50, opts?.limit || 10))
    const now = opts?.now || new Date()

    const list = (clientes || [])
      .map((c) => taskForClient(c, now))
      .filter(Boolean) as SellerActionTask[]

    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.valueMetric !== a.valueMetric) return b.valueMetric - a.valueMetric
      const aHasPhone = a.telefone ? 1 : 0
      const bHasPhone = b.telefone ? 1 : 0
      if (bHasPhone !== aHasPhone) return bHasPhone - aHasPhone
      return a.nome.localeCompare(b.nome)
    })

    return list.slice(0, limit)
  }

  return { taskForClient, topTasks }
}

