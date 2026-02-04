import type { Cliente } from '~/types/client'

export type ClientEngagementStatusKey =
  | 'ativo'
  | 'atencao'
  | 'critico'
  | 'potencial'
  | 'inativo'

type StatusMeta = {
  key: ClientEngagementStatusKey
  label: string
  emoji: string
  colorHex: string
  dotClass: string
  chipClass: string
}

const STATUS_META: Record<ClientEngagementStatusKey, StatusMeta> = {
  ativo: {
    key: 'ativo',
    label: 'Ativo',
    emoji: '✅',
    colorHex: '#22c55e',
    dotClass: 'bg-emerald-500',
    chipClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  atencao: {
    key: 'atencao',
    label: 'Em atenção',
    emoji: '⚠️',
    colorHex: '#eab308',
    dotClass: 'bg-yellow-500',
    chipClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  critico: {
    key: 'critico',
    label: 'Crítico / Reativar',
    emoji: '🚨',
    colorHex: '#ef4444',
    dotClass: 'bg-red-500',
    chipClass: 'bg-red-50 text-red-800 border-red-200',
  },
  potencial: {
    key: 'potencial',
    label: 'Potencial',
    emoji: '🎯',
    colorHex: '#3b82f6',
    dotClass: 'bg-blue-500',
    chipClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  inativo: {
    key: 'inativo',
    label: 'Inativo',
    emoji: '⏸️',
    colorHex: '#9ca3af',
    dotClass: 'bg-gray-400',
    chipClass: 'bg-gray-50 text-gray-700 border-gray-200',
  },
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

export function useClientEngagementStatus() {
  function keyForClient(cliente: Cliente | null | undefined): ClientEngagementStatusKey {
    if (!cliente) return 'potencial'

    if (cliente.status === 'inativo') return 'inativo'

    const stage = String(cliente.sales?.stage || '')
    if (cliente.status === 'potencial' || stage === 'lead') return 'potencial'

    const lastIso = cliente.sales?.lastContactAt
    if (typeof lastIso !== 'string' || !lastIso) return 'potencial'

    const dias = daysSince(lastIso)
    if (dias === null) return 'potencial'

    if (dias <= 90) return 'ativo'
    if (dias <= 180) return 'atencao'
    return 'critico'
  }

  function metaForKey(key: ClientEngagementStatusKey) {
    return STATUS_META[key]
  }

  function metaForClient(cliente: Cliente | null | undefined) {
    const key = keyForClient(cliente)
    return metaForKey(key)
  }

  const options: Array<{ value: ClientEngagementStatusKey; label: string }> = [
    { value: 'ativo', label: `${STATUS_META.ativo.emoji} ${STATUS_META.ativo.label}` },
    { value: 'atencao', label: `${STATUS_META.atencao.emoji} ${STATUS_META.atencao.label}` },
    { value: 'critico', label: `${STATUS_META.critico.emoji} ${STATUS_META.critico.label}` },
    { value: 'potencial', label: `${STATUS_META.potencial.emoji} ${STATUS_META.potencial.label}` },
    { value: 'inativo', label: `${STATUS_META.inativo.emoji} ${STATUS_META.inativo.label}` },
  ]

  return { keyForClient, metaForKey, metaForClient, options }
}
