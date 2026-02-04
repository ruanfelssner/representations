<template>
  <div class="space-y-4 lg:space-y-6">
    <!-- Header -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <NTypo as="h1" size="2xl" weight="bold" class="lg:text-3xl">Dashboard</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">
            Visão geral do negócio • {{ currentDate }}
          </NTypo>
        </div>
        <div class="flex items-center gap-2">
          <NButton
            variant="outline"
            size="sm"
            leading-icon="mdi:refresh"
            :disabled="pending"
            @click="refresh()"
          >
            Atualizar
          </NButton>
          <NButton
            as="NuxtLink"
            to="/"
            variant="outline"
            size="sm"
            leading-icon="mdi:map"
          >
            Ver Mapa
          </NButton>
        </div>
      </div>
    </NLayer>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4">
      <NTypo size="sm" weight="semibold" class="text-red-700">Falha ao carregar números do dashboard.</NTypo>
      <NTypo size="xs" tone="muted" class="mt-1">Verifique a API `/api/v1/clients` e o Mongo.</NTypo>
    </div>

    <!-- KPIs Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <!-- Total Clientes -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Total Clientes</NTypo>
            <NTypo size="3xl" weight="bold" class="text-sky-600 tabular-nums lg:text-4xl">
              {{ stats.totalClients }}
            </NTypo>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <NIcon name="mdi:account-plus" class="w-4 h-4 text-sky-600" />
              <span class="font-semibold text-sky-700 tabular-nums">+{{ stats.createdThisMonth }}</span>
              <span class="text-gray-500">novos no mês</span>
            </div>
          </div>
          <div class="p-2 bg-sky-50 rounded-lg">
            <NIcon name="mdi:account-group" class="w-6 h-6 text-sky-600" />
          </div>
        </div>
      </NLayer>

      <!-- Clientes Ativos -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Ativos (≤90d)</NTypo>
            <NTypo size="3xl" weight="bold" class="text-emerald-600 tabular-nums lg:text-4xl">
              {{ stats.activosVerde }}
            </NTypo>
            <div class="mt-2 text-xs text-gray-600">
              <span class="font-semibold">{{ activePercentage }}%</span> da base
            </div>
          </div>
          <div class="p-2 bg-emerald-50 rounded-lg">
            <NIcon name="mdi:check-circle" class="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </NLayer>

      <!-- Críticos -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Críticos (>180d)</NTypo>
            <NTypo size="3xl" weight="bold" class="text-red-600 tabular-nums lg:text-4xl">
              {{ stats.activosVermelho }}
            </NTypo>
            <div class="mt-2 text-xs text-gray-600">
              <span class="font-semibold">{{ criticalPercentage }}%</span> precisam atenção
            </div>
          </div>
          <div class="p-2 bg-red-50 rounded-lg">
            <NIcon name="mdi:alert-circle" class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </NLayer>

      <!-- Contatos no Mês -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Contatos (mês)</NTypo>
            <NTypo size="3xl" weight="bold" class="text-violet-600 tabular-nums lg:text-4xl">
              {{ stats.contatosNoMes }}
            </NTypo>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <NIcon :name="contatosVsMesAnterior.icon" class="w-4 h-4" :class="contatosVsMesAnterior.iconClass" />
              <span class="font-semibold tabular-nums" :class="contatosVsMesAnterior.textClass">{{ contatosVsMesAnterior.text }}</span>
              <span class="text-gray-500">vs mês anterior</span>
            </div>
          </div>
          <div class="p-2 bg-violet-50 rounded-lg">
            <NIcon name="mdi:phone" class="w-6 h-6 text-violet-600" />
          </div>
        </div>
      </NLayer>
    </div>

    <!-- Faturamento Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
      <!-- Mensal -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-3">
            <NTypo size="xs" tone="muted" weight="medium">Faturamento Mensal</NTypo>
            <div class="p-1.5 bg-violet-50 rounded-lg">
              <NIcon name="mdi:calendar-month" class="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <NTypo size="2xl" weight="bold" class="text-violet-600 tabular-nums lg:text-3xl">
            {{ formatCurrency(stats.faturamentoMensal) }}
          </NTypo>
          <div class="mt-3 pt-3 border-t space-y-1.5">
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon :name="mensalVsMesAnterior.icon" class="w-3.5 h-3.5" :class="mensalVsMesAnterior.iconClass" />
              <span class="font-semibold tabular-nums" :class="mensalVsMesAnterior.textClass">{{ mensalVsMesAnterior.text }}</span>
              <span class="text-gray-500">vs mês anterior</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon :name="mensalVsMesmoMesAnoAnterior.icon" class="w-3.5 h-3.5" :class="mensalVsMesmoMesAnoAnterior.iconClass" />
              <span class="font-semibold tabular-nums" :class="mensalVsMesmoMesAnoAnterior.textClass">{{ mensalVsMesmoMesAnoAnterior.text }}</span>
              <span class="text-gray-500">vs mesmo mês (ano anterior)</span>
            </div>
          </div>
        </div>
      </NLayer>

      <!-- Trimestral -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-3">
            <NTypo size="xs" tone="muted" weight="medium">Faturamento Trimestral</NTypo>
            <div class="p-1.5 bg-amber-50 rounded-lg">
              <NIcon name="mdi:calendar-range" class="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <NTypo size="2xl" weight="bold" class="text-amber-600 tabular-nums lg:text-3xl">
            {{ formatCurrency(stats.faturamentoTrimestral) }}
          </NTypo>
          <div class="mt-3 pt-3 border-t space-y-1.5">
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon :name="trimestralVsTrimestreAnterior.icon" class="w-3.5 h-3.5" :class="trimestralVsTrimestreAnterior.iconClass" />
              <span class="font-semibold tabular-nums" :class="trimestralVsTrimestreAnterior.textClass">{{ trimestralVsTrimestreAnterior.text }}</span>
              <span class="text-gray-500">vs trimestre anterior</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon :name="trimestralVsMesmoTrimestreAnoAnterior.icon" class="w-3.5 h-3.5" :class="trimestralVsMesmoTrimestreAnoAnterior.iconClass" />
              <span class="font-semibold tabular-nums" :class="trimestralVsMesmoTrimestreAnoAnterior.textClass">{{ trimestralVsMesmoTrimestreAnoAnterior.text }}</span>
              <span class="text-gray-500">vs mesmo trimestre (ano anterior)</span>
            </div>
          </div>
        </div>
      </NLayer>

      <!-- Anual -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-3">
            <NTypo size="xs" tone="muted" weight="medium">Faturamento Anual</NTypo>
            <div class="p-1.5 bg-orange-50 rounded-lg">
              <NIcon name="mdi:calendar-year" class="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <NTypo size="2xl" weight="bold" class="text-orange-600 tabular-nums lg:text-3xl">
            {{ formatCurrency(stats.faturamentoAnual) }}
          </NTypo>
          <div class="mt-3 pt-3 border-t">
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon :name="anualVsAnoAnterior.icon" class="w-3.5 h-3.5" :class="anualVsAnoAnterior.iconClass" />
              <span class="font-semibold tabular-nums" :class="anualVsAnoAnterior.textClass">{{ anualVsAnoAnterior.text }}</span>
              <span class="text-gray-500">vs mesmo período (ano anterior)</span>
            </div>
          </div>
        </div>
      </NLayer>
    </div>

    <!-- Status Distribution & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <!-- Distribuição por Status -->
      <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
        <NTypo as="h2" size="lg" weight="bold" class="mb-4">Distribuição por Status</NTypo>
        <div class="space-y-3">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-500" />
                <NTypo size="sm" weight="medium">Ativos (≤90d)</NTypo>
              </div>
              <NTypo size="sm" weight="bold" class="text-emerald-600">{{ stats.activosVerde }}</NTypo>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-emerald-500 rounded-full transition-all bar-active"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-yellow-500" />
                <NTypo size="sm" weight="medium">Atenção (91-180d)</NTypo>
              </div>
              <NTypo size="sm" weight="bold" class="text-yellow-600">{{ stats.activosAmarelo }}</NTypo>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-yellow-500 rounded-full transition-all bar-attention"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500" />
                <NTypo size="sm" weight="medium">Críticos (>180d)</NTypo>
              </div>
              <NTypo size="sm" weight="bold" class="text-red-600">{{ stats.activosVermelho }}</NTypo>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-red-500 rounded-full transition-all bar-critical"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-500" />
                <NTypo size="sm" weight="medium">Potenciais</NTypo>
              </div>
              <NTypo size="sm" weight="bold" class="text-blue-600">{{ stats.potenciais }}</NTypo>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-blue-500 rounded-full transition-all bar-potential"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-gray-400" />
                <NTypo size="sm" weight="medium">Inativos</NTypo>
              </div>
              <NTypo size="sm" weight="bold" class="text-gray-600">{{ stats.inativos }}</NTypo>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gray-400 rounded-full transition-all bar-inactive"
              />
            </div>
          </div>
        </div>
      </NLayer>

      <!-- Ações Rápidas -->
      <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
        <NTypo as="h2" size="lg" weight="bold" class="mb-4">Acesso Rápido</NTypo>
        <div class="grid grid-cols-1 gap-3">
          <NuxtLink 
            to="/admin/clients" 
            class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-sky-200 hover:bg-sky-50 transition-all group"
          >
            <div class="p-2 bg-sky-100 rounded-lg group-hover:bg-sky-200 transition-colors">
              <NIcon name="mdi:account-group" class="w-5 h-5 text-sky-600" />
            </div>
            <div class="flex-1">
              <NTypo weight="semibold" class="group-hover:text-sky-700">Gerenciar Clientes</NTypo>
              <NTypo size="xs" tone="muted">Visualizar e editar cadastros</NTypo>
            </div>
            <NIcon name="mdi:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-sky-600" />
          </NuxtLink>

          <NuxtLink 
            to="/admin/users" 
            class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
          >
            <div class="p-2 bg-violet-100 rounded-lg group-hover:bg-violet-200 transition-colors">
              <NIcon name="mdi:account" class="w-5 h-5 text-violet-600" />
            </div>
            <div class="flex-1">
              <NTypo weight="semibold" class="group-hover:text-violet-700">Gerenciar Usuários</NTypo>
              <NTypo size="xs" tone="muted">Vendedores, gerentes e admins</NTypo>
            </div>
            <NIcon name="mdi:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-violet-600" />
          </NuxtLink>

          <NuxtLink 
            to="/admin/produtos" 
            class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
          >
            <div class="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <NIcon name="mdi:package-variant" class="w-5 h-5 text-emerald-600" />
            </div>
            <div class="flex-1">
              <NTypo weight="semibold" class="group-hover:text-emerald-700">Catálogo de Produtos</NTypo>
              <NTypo size="xs" tone="muted">Preços e disponibilidade</NTypo>
            </div>
            <NIcon name="mdi:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
          </NuxtLink>

          <NuxtLink 
            to="/" 
            class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
          >
            <div class="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <NIcon name="mdi:map" class="w-5 h-5 text-blue-600" />
            </div>
            <div class="flex-1">
              <NTypo weight="semibold" class="group-hover:text-blue-700">Visualizar Mapa</NTypo>
              <NTypo size="xs" tone="muted">Distribuição geográfica</NTypo>
            </div>
            <NIcon name="mdi:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </NuxtLink>
        </div>
      </NLayer>
    </div>

    <!-- Segmentos -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <NTypo as="h2" size="lg" weight="bold" class="mb-4">Distribuição por Segmento</NTypo>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">👓</span>
            <NTypo size="sm" weight="semibold" class="text-blue-900">Ótica</NTypo>
          </div>
          <NTypo size="2xl" weight="bold" class="text-blue-600 tabular-nums">
            {{ stats.segmentos.otica }}
          </NTypo>
        </div>

        <div class="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">⌚</span>
            <NTypo size="sm" weight="semibold" class="text-purple-900">Relojoaria</NTypo>
          </div>
          <NTypo size="2xl" weight="bold" class="text-purple-600 tabular-nums">
            {{ stats.segmentos.relojoaria }}
          </NTypo>
        </div>

        <div class="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">💍</span>
            <NTypo size="sm" weight="semibold" class="text-pink-900">Semi-joias</NTypo>
          </div>
          <NTypo size="2xl" weight="bold" class="text-pink-600 tabular-nums">
            {{ stats.segmentos.semijoia }}
          </NTypo>
        </div>

        <div class="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">🏪</span>
            <NTypo size="sm" weight="semibold" class="text-amber-900">Multimarcas</NTypo>
          </div>
          <NTypo size="2xl" weight="bold" class="text-amber-600 tabular-nums">
            {{ stats.segmentos.multimarcas }}
          </NTypo>
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { z } from 'zod'
import { ClientDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const ClientsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    clients: z.array(ClientDtoSchema),
    mapSettings: z.any(),
    salesTotals: z
      .object({
        month: z.number(),
        monthPrev: z.number().optional(),
        monthPrevYear: z.number().optional(),
        quarter: z.number(),
        quarterPrev: z.number().optional(),
        quarterPrevYear: z.number().optional(),
        year: z.number(),
        yearPrevYear: z.number().optional(),
      })
      .optional(),
    contactsThisMonth: z.number().optional(),
    contactsPrevMonth: z.number().optional(),
  }),
})

const { data, pending, error, refresh } = await useFetch('/api/v1/clients', {
  transform: (res) => ClientsResponseSchema.parse(res).data,
})

const clients = computed(() => data.value?.clients || [])
const salesTotals = computed(() => {
  const s = data.value?.salesTotals
  return {
    month: s?.month || 0,
    monthPrev: s?.monthPrev || 0,
    monthPrevYear: s?.monthPrevYear || 0,
    quarter: s?.quarter || 0,
    quarterPrev: s?.quarterPrev || 0,
    quarterPrevYear: s?.quarterPrevYear || 0,
    year: s?.year || 0,
    yearPrevYear: s?.yearPrevYear || 0,
  }
})

const contactsThisMonth = computed(() => Number(data.value?.contactsThisMonth) || 0)
const contactsPrevMonth = computed(() => Number(data.value?.contactsPrevMonth) || 0)

const { keyForClient } = useClientEngagementStatus()

const createdThisMonth = computed(() => {
  const now = new Date()
  const start = new Date(now)
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  let count = 0
  for (const c of clients.value as any[]) {
    const iso = c?.createdAt
    if (typeof iso !== 'string' || !iso) continue
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) continue
    if (d >= start) count++
  }
  return count
})

const statusBuckets = computed(() => {
  let verde = 0
  let amarelo = 0
  let vermelho = 0
  let potencial = 0
  let inativo = 0

  for (const c of clients.value as any[]) {
    const k = keyForClient(c)
    if (k === 'inativo') inativo++
    else if (k === 'potencial') potencial++
    else if (k === 'critico') vermelho++
    else if (k === 'atencao') amarelo++
    else verde++
  }

  return { verde, amarelo, vermelho, potencial, inativo }
})

const segmentos = computed(() => {
  const out = { otica: 0, relojoaria: 0, semijoia: 0, multimarcas: 0 }
  for (const c of clients.value as any[]) {
    const seg = String(c?.segmento || '')
    if (seg === 'otica') out.otica++
    else if (seg === 'relojoaria') out.relojoaria++
    else if (seg === 'semijoia') out.semijoia++
    else if (seg === 'multimarcas') out.multimarcas++
  }
  return out
})

const stats = computed(() => ({
  totalClients: clients.value.length,
  createdThisMonth: createdThisMonth.value,
  activosVerde: statusBuckets.value.verde,
  activosAmarelo: statusBuckets.value.amarelo,
  activosVermelho: statusBuckets.value.vermelho,
  potenciais: statusBuckets.value.potencial,
  inativos: statusBuckets.value.inativo,
  contatosNoMes: contactsThisMonth.value,
  faturamentoMensal: salesTotals.value.month,
  faturamentoTrimestral: salesTotals.value.quarter,
  faturamentoAnual: salesTotals.value.year,
  segmentos: segmentos.value,
}))

const currentDate = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
})

function pct(n: number, d: number) {
  if (!d) return 0
  return Math.round((n / d) * 100)
}

const activePercentage = computed(() => pct(stats.value.activosVerde, stats.value.totalClients))
const activePercentagePct = computed(() => `${activePercentage.value}%`)

const attentionPercentage = computed(() =>
  pct(stats.value.activosAmarelo, stats.value.totalClients)
)
const attentionPercentagePct = computed(() => `${attentionPercentage.value}%`)

const criticalPercentage = computed(() =>
  pct(stats.value.activosVermelho, stats.value.totalClients)
)
const criticalPercentagePct = computed(() => `${criticalPercentage.value}%`)

const potentialPercentage = computed(() =>
  pct(stats.value.potenciais, stats.value.totalClients)
)
const potentialPercentagePct = computed(() => `${potentialPercentage.value}%`)

const inactivePercentage = computed(() =>
  pct(stats.value.inativos, stats.value.totalClients)
)
const inactivePercentagePct = computed(() => `${inactivePercentage.value}%`)

type DeltaMeta = { text: string; textClass: string; icon: string; iconClass: string }
function deltaMeta(current: number, previous: number): DeltaMeta {
  const c = Number.isFinite(current) ? current : 0
  const p = Number.isFinite(previous) ? previous : 0

  if (p <= 0) {
    if (c <= 0) return { text: '0%', textClass: 'text-slate-600', icon: 'mdi:minus', iconClass: 'text-slate-500' }
    return { text: 'novo', textClass: 'text-emerald-700', icon: 'mdi:trending-up', iconClass: 'text-emerald-600' }
  }

  const pct = Math.round(((c - p) / p) * 100)
  if (pct > 0) return { text: `+${pct}%`, textClass: 'text-emerald-700', icon: 'mdi:trending-up', iconClass: 'text-emerald-600' }
  if (pct < 0) return { text: `${pct}%`, textClass: 'text-red-700', icon: 'mdi:trending-down', iconClass: 'text-red-600' }
  return { text: '0%', textClass: 'text-slate-600', icon: 'mdi:minus', iconClass: 'text-slate-500' }
}

const contatosVsMesAnterior = computed(() => deltaMeta(contactsThisMonth.value, contactsPrevMonth.value))
const mensalVsMesAnterior = computed(() => deltaMeta(salesTotals.value.month, salesTotals.value.monthPrev))
const mensalVsMesmoMesAnoAnterior = computed(() => deltaMeta(salesTotals.value.month, salesTotals.value.monthPrevYear))
const trimestralVsTrimestreAnterior = computed(() => deltaMeta(salesTotals.value.quarter, salesTotals.value.quarterPrev))
const trimestralVsMesmoTrimestreAnoAnterior = computed(() => deltaMeta(salesTotals.value.quarter, salesTotals.value.quarterPrevYear))
const anualVsAnoAnterior = computed(() => deltaMeta(salesTotals.value.year, salesTotals.value.yearPrevYear))

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
.bar-active {
  width: v-bind(activePercentagePct);
}
.bar-attention {
  width: v-bind(attentionPercentagePct);
}
.bar-critical {
  width: v-bind(criticalPercentagePct);
}
.bar-potential {
  width: v-bind(potentialPercentagePct);
}
.bar-inactive {
  width: v-bind(inactivePercentagePct);
}
</style>
