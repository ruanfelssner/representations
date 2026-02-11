<template>
  <div class="space-y-4 lg:space-y-6">
    <!-- Header -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <NTypo as="h1" size="2xl" weight="bold" class="lg:text-3xl">Histórico de Atividades</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">
            {{ filteredEventos.length }} eventos encontrados
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
            to="/admin/dashboard"
            variant="outline"
            size="sm"
            leading-icon="mdi:arrow-left"
          >
            Dashboard
          </NButton>
        </div>
      </div>
    </NLayer>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4">
      <NTypo size="sm" weight="semibold" class="text-red-700">Falha ao carregar histórico.</NTypo>
      <NTypo size="xs" tone="muted" class="mt-1">Verifique a API e o MongoDB.</NTypo>
    </div>

    <!-- Filtros -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <NTypo as="h2" size="lg" weight="bold" class="mb-4">Filtros</NTypo>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Busca de Texto -->
        <div class="md:col-span-2">
          <label class="block mb-2">
            <NTypo size="sm" weight="semibold">Buscar</NTypo>
          </label>
          <input
            v-model="searchText"
            type="text"
            placeholder="Buscar por observação, cliente, etc..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <!-- Filtro por Tipo -->
        <div>
          <label class="block mb-2">
            <NTypo size="sm" weight="semibold">Tipo</NTypo>
          </label>
          <select
            v-model="filterTipo"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todos</option>
            <option value="venda">Vendas</option>
            <option value="visita">Visitas</option>
            <option value="contato">Contatos</option>
          </select>
        </div>

        <!-- Filtro por Mês -->
        <div>
          <label class="block mb-2">
            <NTypo size="sm" weight="semibold">Mês</NTypo>
          </label>
          <select
            v-model="filterMes"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todos</option>
            <option v-for="mes in mesesDisponiveis" :key="mes.value" :value="mes.value">
              {{ mes.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Resumo de Filtros -->
      <div class="mt-4 flex items-center gap-2 flex-wrap">
        <NTypo size="xs" tone="muted">Filtros ativos:</NTypo>
        <span v-if="searchText" class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
          Busca: "{{ searchText }}"
        </span>
        <span v-if="filterTipo" class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
          Tipo: {{ filterTipo }}
        </span>
        <span v-if="filterMes" class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
          Mês: {{ getMesLabel(filterMes) }}
        </span>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          Limpar filtros
        </button>
      </div>
    </NLayer>

    <!-- Estatísticas Rápidas -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Total de Eventos</NTypo>
        <NTypo size="2xl" weight="bold" class="text-blue-600 tabular-nums">
          {{ filteredEventos.length }}
        </NTypo>
      </NLayer>

      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Vendas</NTypo>
        <NTypo size="2xl" weight="bold" class="text-emerald-600 tabular-nums">
          {{ statsFiltered.vendas }}
        </NTypo>
        <NTypo size="xs" tone="muted" class="mt-1">{{ formatCurrency(statsFiltered.totalVendas) }}</NTypo>
      </NLayer>

      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Visitas</NTypo>
        <NTypo size="2xl" weight="bold" class="text-violet-600 tabular-nums">
          {{ statsFiltered.visitas }}
        </NTypo>
      </NLayer>

      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Contatos</NTypo>
        <NTypo size="2xl" weight="bold" class="text-amber-600 tabular-nums">
          {{ statsFiltered.contatos }}
        </NTypo>
      </NLayer>
    </div>

    <!-- Lista de Eventos -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <NTypo as="h2" size="lg" weight="bold">Eventos</NTypo>
        <NTypo size="sm" tone="muted">Mostrando {{ Math.min(displayLimit, filteredEventos.length) }} de {{ filteredEventos.length }}</NTypo>
      </div>

      <div v-if="pending" class="py-12 text-center">
        <NTypo tone="muted">Carregando...</NTypo>
      </div>

      <div v-else-if="filteredEventos.length === 0" class="py-12">
        <div class="text-center">
          <div class="inline-flex p-4 bg-gray-100 rounded-full mb-3">
            <NIcon name="mdi:calendar-blank" class="w-12 h-12 text-gray-400" />
          </div>
          <NTypo size="lg" weight="semibold" class="mb-1">Nenhum evento encontrado</NTypo>
          <NTypo size="sm" tone="muted">Tente ajustar os filtros ou adicionar novos eventos.</NTypo>
        </div>
      </div>

      <div v-else class="space-y-2">
        <!-- Tabela/Lista de Eventos -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Observação</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cliente</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="evento in displayedEventos"
                :key="evento.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3">
                  <NTypo size="sm" class="whitespace-nowrap">{{ formatDate(evento.data) }}</NTypo>
                  <NTypo size="xs" tone="muted">{{ formatTime(evento.data) }}</NTypo>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-block px-2 py-1 rounded text-xs font-semibold whitespace-nowrap"
                    :class="getTipoBadgeClass(evento.tipo)"
                  >
                    {{ evento.tipo }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <NTypo size="sm" class="line-clamp-2">
                    {{ evento.observacao || '—' }}
                  </NTypo>
                </td>
                <td class="px-4 py-3 text-right">
                  <NTypo size="sm" weight="semibold" :class="evento.valor > 0 ? 'text-emerald-600' : 'text-gray-400'">
                    {{ evento.valor > 0 ? formatCurrency(evento.valor) : '—' }}
                  </NTypo>
                </td>
                <td class="px-4 py-3">
                  <NTypo size="xs" tone="muted" class="font-mono">
                    {{ evento.clientId.substring(0, 8) }}...
                  </NTypo>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Carregar Mais -->
        <div v-if="filteredEventos.length > displayLimit" class="pt-4 text-center">
          <NButton
            variant="outline"
            size="sm"
            @click="loadMore"
          >
            Carregar mais ({{ filteredEventos.length - displayLimit }} restantes)
          </NButton>
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { z } from 'zod'

definePageMeta({ layout: 'admin' })

const EventoSchema = z.object({
  id: z.string(),
  tipo: z.string(),
  data: z.string(),
  clientId: z.string(),
  valor: z.number(),
  observacao: z.string(),
})

const MesResumoSchema = z.object({
  key: z.string(),
  month: z.string(),
  year: z.number(),
  vendas: z.number(),
  visitas: z.number(),
  contatos: z.number(),
  totalVendas: z.number(),
  totalEventos: z.number(),
  eventos: z.array(EventoSchema),
})

const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    resumo: z.array(MesResumoSchema),
    totalMeses: z.number(),
  }),
})

const { data, pending, error, refresh } = await useFetch('/api/v1/admin/historico-resumo', {
  transform: (res) => ResponseSchema.parse(res).data,
})

const resumo = computed(() => data.value?.resumo || [])

// Flatten todos os eventos
const allEventos = computed(() => {
  const eventos: any[] = []
  for (const mes of resumo.value) {
    eventos.push(...mes.eventos)
  }
  // Ordenar por data (mais recente primeiro)
  return eventos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
})

// Meses disponíveis para filtro
const mesesDisponiveis = computed(() => {
  return resumo.value.map(m => ({
    value: m.key,
    label: `${m.month} ${m.year}`,
  }))
})

// Filtros
const searchText = ref('')
const filterTipo = ref('')
const filterMes = ref('')
const displayLimit = ref(50)

const hasActiveFilters = computed(() => !!searchText.value || !!filterTipo.value || !!filterMes.value)

function clearFilters() {
  searchText.value = ''
  filterTipo.value = ''
  filterMes.value = ''
}

function getMesLabel(key: string) {
  const mes = mesesDisponiveis.value.find(m => m.value === key)
  return mes?.label || key
}

// Eventos filtrados
const filteredEventos = computed(() => {
  let eventos = allEventos.value

  // Filtro de texto
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    eventos = eventos.filter(e =>
      e.observacao?.toLowerCase().includes(search) ||
      e.tipo?.toLowerCase().includes(search) ||
      e.clientId?.toLowerCase().includes(search)
    )
  }

  // Filtro de tipo
  if (filterTipo.value) {
    eventos = eventos.filter(e => {
      const tipo = e.tipo?.toLowerCase() || ''
      return tipo.includes(filterTipo.value)
    })
  }

  // Filtro de mês
  if (filterMes.value) {
    eventos = eventos.filter(e => {
      const data = new Date(e.data)
      const year = data.getFullYear()
      const month = data.getMonth() + 1
      const key = `${year}-${String(month).padStart(2, '0')}`
      return key === filterMes.value
    })
  }

  return eventos
})

const displayedEventos = computed(() => filteredEventos.value.slice(0, displayLimit.value))

function loadMore() {
  displayLimit.value += 50
}

// Estatísticas dos eventos filtrados
const statsFiltered = computed(() => {
  let vendas = 0
  let visitas = 0
  let contatos = 0
  let totalVendas = 0

  for (const evento of filteredEventos.value) {
    const tipo = String(evento.tipo || '').toLowerCase()
    
    if (tipo.includes('venda')) {
      vendas++
      totalVendas += evento.valor || 0
    } else if (tipo === 'visita' || tipo.includes('visita')) {
      visitas++
    } else if (tipo === 'contato' || tipo.includes('contato') || tipo.includes('whatsapp') || tipo.includes('telefone')) {
      contatos++
    }
  }

  return { vendas, visitas, contatos, totalVendas }
})

function getTipoBadgeClass(tipo: string) {
  const t = String(tipo || '').toLowerCase()
  if (t.includes('venda')) return 'bg-emerald-100 text-emerald-700 border border-emerald-300'
  if (t.includes('visita')) return 'bg-violet-100 text-violet-700 border border-violet-300'
  if (t.includes('contato') || t.includes('whatsapp') || t.includes('telefone')) {
    return 'bg-amber-100 text-amber-700 border border-amber-300'
  }
  return 'bg-gray-200 text-gray-700 border border-gray-300'
}

function formatDate(isoString: string) {
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  } catch {
    return isoString
  }
}

function formatTime(isoString: string) {
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return ''
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
</script>
