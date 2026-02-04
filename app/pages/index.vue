<template>
  <div class="min-h-screen">

    <div class="w-full px-3 py-4 lg:px-4 lg:py-6 space-y-3">
      <!-- Filtros + Stats -->
      <NLayer variant="paper" size="base" radius="soft" class="shadow-sm lg:shadow-lg relative">
        <div class="flex flex-col gap-3 lg:gap-4">
          <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div class="col-span-2 lg:col-span-1">
              <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1">
                Buscar
              </NTypo>
              
            <NButton
              v-if="searchQuery || filterSegmento || filterTipo"
              @click="searchQuery = ''; filterSegmento = ''; filterTipo = ''"
              variant="outline"
              size="zs"
              class="absolute right-2 top-2"
              >
              Limpar filtros
            </NButton>
              <div class="relative">
                <NTypo
                  as="span"
                  size="sm"
                  tone="muted"
                  class="absolute left-3 top-1/2 -translate-y-1/2"
                >
                  🔎
                </NTypo>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Nome, cidade, endereço ou CNPJ..."
                  class="w-full pl-10 pr-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1">
                Segmento
              </NTypo>
              <select
                v-model="filterSegmento"
                class="w-full px-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
              >
                <option value="">Todos</option>
                <option value="otica">👓 Ótica</option>
                <option value="relojoaria">⌚ Relojoaria</option>
                <option value="semijoia">💍 Semi-joias</option>
                <option value="multimarcas">🏪 Multimarcas</option>
              </select>
            </div>

            <div>
              <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1">
                Status
              </NTypo>
              <select
                v-model="filterTipo"
                class="w-full px-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
              >
                <option value="">Todos</option>
                <option value="ativo">✅ Ativo (≤90d)</option>
                <option value="atencao">⚠️ Em atenção (91–180d)</option>
                <option value="critico">🚨 Crítico / Reativar (&gt;180d)</option>
                <option value="potencial">🎯 Potencial</option>
                <option value="inativo">⏸️ Inativo</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
          <div class="bg-emerald-50 border border-emerald-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Clientes</NTypo>
            <NTypo size="xl" weight="bold" class="tabular-nums text-emerald-500 lg:text-2xl">
              {{ visitedStats.total }}
            </NTypo>
            <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
              <span class="inline-flex items-center gap-1 text-emerald-700">
                <span class="h-2 w-2 rounded-full bg-emerald-500" />
                {{ visitedStats.ativosVerde }} ≤90d
              </span>
              <span class="inline-flex items-center gap-1 text-yellow-700">
                <span class="h-2 w-2 rounded-full bg-yellow-500" />
                {{ visitedStats.ativosAmarelo }} 91–180d
              </span>
              <span class="inline-flex items-center gap-1 text-red-700">
                <span class="h-2 w-2 rounded-full bg-red-500" />
                {{ visitedStats.ativosVermelho }} &gt;180d
              </span>
              <span v-if="visitedStats.potenciais" class="inline-flex items-center gap-1 text-blue-700">
                <span class="h-2 w-2 rounded-full bg-blue-500" />
                {{ visitedStats.potenciais }} potencial
              </span>
              <span v-if="visitedStats.inativos" class="inline-flex items-center gap-1 text-gray-700">
                <span class="h-2 w-2 rounded-full bg-gray-400" />
                {{ visitedStats.inativos }} inativo
              </span>
            </div>
          </div>          
          <div class="bg-sky-50 border border-sky-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Contatos nesse mês</NTypo>
            <NTypo size="xl" weight="bold" class="tabular-nums text-sky-500 lg:text-2xl">
              {{ visitedStats.contatosNoMes }}
            </NTypo>
            <div class="mt-2 flex items-center gap-1 text-[11px] font-semibold" :class="contatosVsMesAnterior.class">
              <NIcon :name="contatosVsMesAnterior.icon" class="w-4 h-4" />
              <span class="tabular-nums">{{ contatosVsMesAnterior.text }}</span>
              <span class="font-medium text-slate-500">vs mês anterior</span>
            </div>
          </div>
          <div class="bg-violet-50 border border-violet-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Mensal</NTypo>
            <NTypo size="xl" weight="bold" class="tabular-nums text-violet-500 lg:text-2xl">
              {{ formatCurrency(visitedStats.faturamentoMensal) }}
            </NTypo>
            <div class="mt-2 space-y-1 text-[11px] font-semibold">
              <div class="flex items-center gap-1" :class="mensalVsMesAnterior.class">
                <NIcon :name="mensalVsMesAnterior.icon" class="w-4 h-4" />
                <span class="tabular-nums">{{ mensalVsMesAnterior.text }}</span>
                <span class="font-medium text-slate-500">vs mês anterior</span>
              </div>
              <div class="flex items-center gap-1" :class="mensalVsMesmoMesAnoAnterior.class">
                <NIcon :name="mensalVsMesmoMesAnoAnterior.icon" class="w-4 h-4" />
                <span class="tabular-nums">{{ mensalVsMesmoMesAnoAnterior.text }}</span>
                <span class="font-medium text-slate-500">vs mesmo mês (ano anterior)</span>
              </div>
            </div>
          </div>
          <div class="bg-amber-50 border border-amber-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Trimestral</NTypo>
            <NTypo size="xl" weight="bold" class="tabular-nums text-amber-600 lg:text-2xl">
              {{ formatCurrency(visitedStats.faturamentoTrimestral) }}
            </NTypo>
            <div class="mt-2 space-y-1 text-[11px] font-semibold">
              <div class="flex items-center gap-1" :class="trimestralVsTrimestreAnterior.class">
                <NIcon :name="trimestralVsTrimestreAnterior.icon" class="w-4 h-4" />
                <span class="tabular-nums">{{ trimestralVsTrimestreAnterior.text }}</span>
                <span class="font-medium text-slate-500">vs trimestre anterior</span>
              </div>
              <div class="flex items-center gap-1" :class="trimestralVsMesmoTrimestreAnoAnterior.class">
                <NIcon :name="trimestralVsMesmoTrimestreAnoAnterior.icon" class="w-4 h-4" />
                <span class="tabular-nums">{{ trimestralVsMesmoTrimestreAnoAnterior.text }}</span>
                <span class="font-medium text-slate-500">vs mesmo trimestre (ano anterior)</span>
              </div>
            </div>
          </div>
          <div class="bg-orange-50 border border-orange-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Anual</NTypo>
            <NTypo size="xl" weight="bold" class="tabular-nums text-orange-500 lg:text-2xl">
              {{ formatCurrency(visitedStats.faturamentoAnual) }}
            </NTypo>
            <div class="mt-2 flex items-center gap-1 text-[11px] font-semibold" :class="anualVsAnoAnterior.class">
              <NIcon :name="anualVsAnoAnterior.icon" class="w-4 h-4" />
              <span class="tabular-nums">{{ anualVsAnoAnterior.text }}</span>
              <span class="font-medium text-slate-500">vs mesmo período (ano anterior)</span>
            </div>
          </div>
        </div>
      </NLayer>

      <div v-if="loadClientsError" class="rounded-xl border border-red-200 bg-red-50 p-3 lg:p-4">
        <NTypo size="sm" weight="semibold" class="text-red-700">
          Falha ao carregar clientes: {{ loadClientsError }}
        </NTypo>
        <NTypo size="xs" tone="muted" class="mt-1">
          Verifique se o Mongo está rodando e se `NUXT_MONGO_URI` / `NUXT_MONGO_DB_NAME` estão configurados.
        </NTypo>
      </div>

      <!-- Mapa + painel -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <div class="lg:col-span-9 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-2xl overflow-hidden border border-gray-200 bg-white h-[450px] sm:h-[550px] lg:h-[700px]">
          <BrokerMaps
            v-if="visitedMapData"
            :markers="createVisitedMarkers"
            :polygons="visitedMapData.polygons"
            :center-lat="visitedMapData.mapSettings.center.lat"
            :center-lng="visitedMapData.mapSettings.center.lng"
            :zoom="visitedMapData.mapSettings.zoom"
            class="h-full"
            @marker-click="handleVisitedMarkerClick"
          />
          <div v-else class="h-full flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-4">🗺️</div>
              <NTypo size="sm" tone="muted" weight="medium">Carregando mapa...</NTypo>
            </div>
          </div>
        </div>

        <!-- Painel desktop (sidebar) -->
        <div class="hidden lg:block lg:col-span-3 h-[700px]">
          <ClientSidePanel
            :is-open="true"
            :client-data="selectedClient"
            :show-close="false"
            @add-visit="handleAddVisit"
            @edit-client="handleOpenEditarCliente"
            @remove-client="handleRemoveCliente"
          />
        </div>

        <!-- Painel mobile (drawer no fluxo do documento) -->
        <Transition name="slide-down">
                <ClientSidePanel
                 class="lg:hidden"
                 v-if="selectedClient && isSidePanelOpen"
                  :is-open="true"
                  :client-data="selectedClient"
                  :show-close="false"
                  @add-visit="handleAddVisit"
                  @edit-client="handleOpenEditarCliente"
                  @remove-client="handleRemoveCliente"
                />
        </Transition>
      </div>

    <!-- Mensagem quando não há clientes -->
    <div
      v-if="!clientes.length"
      class="text-center py-12 lg:py-16 rounded-xl shadow-sm border border-gray-200 bg-white mx-4"
    >
      <div class="text-5xl lg:text-6xl mb-3 lg:mb-4">👥</div>
      <NTypo as="h3" size="lg" weight="bold" class="mb-2 lg:text-xl">Nenhum cliente cadastrado ainda</NTypo>
      <NTypo size="sm" tone="muted" class="lg:text-base">
        Comece adicionando seus clientes usando o formulário acima!
      </NTypo>
    </div>

    </div>
    <!-- Modais -->
    <ModalNovaVisita
      :is-open="isModalNovaVisitaOpen"
      :cliente-nome="selectedClient?.nome || ''"
      @close="isModalNovaVisitaOpen = false"
      @submit="handleSubmitNovaVisita"
    />

    <ModalEditarCliente
      :is-open="isModalEditarClienteOpen"
      :cliente="selectedClient"
      @close="isModalEditarClienteOpen = false"
      @submit="handleSubmitEditarCliente"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BrokerMaps from '../components/BrokerMaps.vue'
import ClientSidePanel from '../components/ClientSidePanel.vue'
import ModalNovaVisita from '../components/ModalNovaVisita.vue'
import ModalEditarCliente from '../components/ModalEditarCliente.vue'
import type { Cliente } from '~/types/client'
import { useClientsApi } from '~/composables/useClientsApi'
import { useHistoricoClienteApi } from '~/composables/useHistoricoClienteApi'

interface MarkerData {
  lat: number
  lng: number
  title: string
  value: number
  color: string
  size: number
  type: 'sede' | 'filial' | 'distribuidor' | 'parceiro'
  address: string
  phone: string
  city: string
}

interface MapData {
  markers: any[]
  polygons: any[]
  mapSettings: {
    center: { lat: number; lng: number }
    zoom: number
  }
}

const commercialMapData = ref<MapData | null>(null)
const visitedMapData = ref<MapData | null>(null)
const scGeoJson = ref<any>(null)
const clientes = ref<Cliente[]>([])
const salesTotals = ref<{
  month: number
  monthPrev: number
  monthPrevYear: number
  quarter: number
  quarterPrev: number
  quarterPrevYear: number
  year: number
  yearPrevYear: number
}>({
  month: 0,
  monthPrev: 0,
  monthPrevYear: 0,
  quarter: 0,
  quarterPrev: 0,
  quarterPrevYear: 0,
  year: 0,
  yearPrevYear: 0,
})
const contactsThisMonth = ref(0)
const contactsPrevMonth = ref(0)
const loadClientsError = ref('')
const isSidePanelOpen = ref(false)
const selectedClient = ref<Cliente | null>(null)
const isModalNovaVisitaOpen = ref(false)
const isModalEditarClienteOpen = ref(false)
const searchQuery = ref('')
const filterSegmento = ref('')
const filterTipo = ref('')

const { fetchClients, patchClient, deleteClient } = useClientsApi()
const { createEvento } = useHistoricoClienteApi()
const { keyForClient, metaForClient } = useClientEngagementStatus()
const currentUserId = 'user-app'

const filters = ref({
  sede: true,
  filial: true,
  distribuidor: true,
  parceiro: true,
})

onMounted(async () => {
  try {
    const commercialData = await $fetch('/api/v1/commercial-points')
    const geoJsonData = await $fetch('/santa-catarina.json')

    scGeoJson.value = geoJsonData

    const scPolygon = {
      id: 'santa-catarina',
      paths: processGeoJsonCoordinates(scGeoJson.value.geometry.coordinates),
      strokeColor: '#2563eb',
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: '#2563eb',
      fillOpacity: 0,
      label: 'Santa Catarina',
      metrics: {
        seguros: 280,
        clientes: 1850,
        corretores: 45,
      },
    }

    if (commercialData && 'data' in commercialData) {
      commercialMapData.value = {
        markers: commercialData.data.markers,
        polygons: [scPolygon],
        mapSettings: commercialData.data.mapSettings || {
          center: { lat: -27.5954, lng: -48.548 },
          zoom: 7,
        },
      }
    }

    visitedMapData.value = {
      markers: [],
      polygons: [scPolygon],
      mapSettings: {
        center: { lat: -27.5954, lng: -48.548 },
        zoom: 7,
      },
    }

    await loadClients()
  } catch (error) {
    console.error('Erro ao carregar dados do mapa:', error)
  }
})

// Atualizar cores dos clientes periodicamente e quando a página ganha foco
onMounted(() => {
  // Atualizar cores a cada minuto
  const intervalId = setInterval(async () => {
    await loadClients()
  }, 60000)

  // Atualizar quando a página ganha foco
  const handleFocus = async () => {
    await loadClients()
  }
  window.addEventListener('focus', handleFocus)

  // Cleanup
  onUnmounted(() => {
    clearInterval(intervalId)
    window.removeEventListener('focus', handleFocus)
  })
})

async function loadClients() {
  try {
    loadClientsError.value = ''
    const data = await fetchClients()
    clientes.value = (data.clients || []) as Cliente[]
    if (data.salesTotals) {
      salesTotals.value = {
        month: data.salesTotals.month,
        monthPrev: data.salesTotals.monthPrev || 0,
        monthPrevYear: data.salesTotals.monthPrevYear || 0,
        quarter: data.salesTotals.quarter,
        quarterPrev: data.salesTotals.quarterPrev || 0,
        quarterPrevYear: data.salesTotals.quarterPrevYear || 0,
        year: data.salesTotals.year,
        yearPrevYear: data.salesTotals.yearPrevYear || 0,
      }
    }
    if (typeof data.contactsThisMonth === 'number') contactsThisMonth.value = data.contactsThisMonth
    if (typeof data.contactsPrevMonth === 'number') contactsPrevMonth.value = data.contactsPrevMonth

    if (visitedMapData.value?.mapSettings && data.mapSettings) {
      visitedMapData.value.mapSettings = data.mapSettings
    }

    if (selectedClient.value) {
      selectedClient.value = clientes.value.find((c) => c.id === selectedClient.value?.id) || null
    }
  } catch (err: any) {
    console.error('Erro ao carregar clientes:', err)
    clientes.value = []
    loadClientsError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      'Erro desconhecido'
  }
}

function processGeoJsonCoordinates(coordinates: any[]): { lat: number; lng: number }[] {
  const paths: { lat: number; lng: number }[] = []

  function processCoords(coords: any) {
    if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
      coords.forEach((polygon: any) => {
        polygon.forEach((ring: any) => {
          ring.forEach((coord: any) => {
            paths.push({ lat: coord[1], lng: coord[0] })
          })
        })
      })
    } else if (Array.isArray(coords[0])) {
      coords.forEach((ring: any) => {
        ring.forEach((coord: any) => {
          paths.push({ lat: coord[1], lng: coord[0] })
        })
      })
    }
  }

  processCoords(coordinates)
  return paths
}

const filteredMarkers = computed(() => {
  if (!commercialMapData.value) return []

  return commercialMapData.value.markers.filter((marker: MarkerData) => {
    return filters.value[marker.type as keyof typeof filters.value]
  })
})

const filteredClientes = computed(() => {
  let result = clientes.value

  // Filtro por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    const queryDigits = searchQuery.value.replace(/\D/g, '')
    result = result.filter((cliente) =>
      cliente.nome.toLowerCase().includes(query) ||
      cliente.cidade?.toLowerCase().includes(query) ||
      cliente.endereco?.toLowerCase().includes(query) ||
      (queryDigits.length > 0 &&
        ((cliente.cnpj || '').replace(/\D/g, '').includes(queryDigits) ||
          String(cliente.id || '').replace(/\D/g, '').includes(queryDigits)))
    )
  }

  // Filtro por segmento
  if (filterSegmento.value) {
    result = result.filter((cliente) => cliente.segmento === filterSegmento.value)
  }

  // Filtro por tipo
  if (filterTipo.value) {
    result = result.filter((cliente) => keyForClient(cliente) === (filterTipo.value as any))
  }

  return result
})

const MAX_PINS = 2500
const clientesParaPins = computed(() => {
  const geocoded = filteredClientes.value.filter(
    (c) => Number.isFinite((c as any).lat) && Number.isFinite((c as any).lng)
  )
  if (geocoded.length <= MAX_PINS) return geocoded
  return geocoded.slice(0, MAX_PINS)
})

function markerColor(cliente: any) {
  return metaForClient(cliente).colorHex
}

function safeNumber(v: any) {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function formatCompactMoney(v: number) {
  const n = Math.round(v)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  return String(n)
}

const pinMetricByClientId = computed(() => {
  const list = clientesParaPins.value
  const pairs = list.map((c: any) => {
    const totalAllTime = safeNumber(c?.sales?.totalAllTime)
    const total12m = safeNumber(c?.sales?.total12m)
    const total90d = safeNumber(c?.sales?.total90d)
    const mesAberto = safeNumber(c?.objectives?.mesAberto)
    const metric = total90d || total12m || mesAberto || totalAllTime || safeNumber(c?.sales?.priorityScore)
    return { id: c.id, metric, totalAllTime, total12m, total90d, mesAberto }
  })

  pairs.sort((a, b) => b.metric - a.metric)

  const rank = new Map<string, number>()
  const metric = new Map<string, number>()
  const totals = new Map<string, { totalAllTime: number; total12m: number; total90d: number; mesAberto: number }>()
  pairs.forEach((p, idx) => {
    rank.set(p.id, idx + 1)
    metric.set(p.id, p.metric)
    totals.set(p.id, { totalAllTime: p.totalAllTime, total12m: p.total12m, total90d: p.total90d, mesAberto: p.mesAberto })
  })

  const maxMetric = pairs.length ? Math.max(1, pairs[0].metric) : 1
  return { rank, metric, totals, maxMetric }
})

const createVisitedMarkers = computed(() => {
  const meta = pinMetricByClientId.value
  return clientesParaPins.value
    .map((cliente) => ({
      lat: cliente.lat,
      lng: cliente.lng,
      title: (() => {
        const id = (cliente as any).id
        const m = meta.metric.get(id) || 0
        const r = meta.rank.get(id) || 1
        return m > 0 ? `${cliente.nome} (#${r} · R$ ${formatCompactMoney(m)})` : `${cliente.nome} (#${r})`
      })(),
      // Número do pin: ranking (sempre varia). O "peso" fica no tamanho.
      value: meta.rank.get((cliente as any).id) || 1,
      color: markerColor(cliente),
      size: (() => {
        const m = meta.metric.get((cliente as any).id) || 0
        if (m <= 0) return 18
        const ratio = Math.max(0, Math.min(1, m / meta.maxMetric))
        return 16 + Math.round(ratio * 12)
      })(),
      clientId: cliente.id,
    }))
})

const stats = computed(() => {
  if (!commercialMapData.value) return { total: 0, filiais: 0, distribuidores: 0, parceiros: 0 }

  const markers = commercialMapData.value.markers
  return {
    total: markers.length,
    filiais: markers.filter((m: MarkerData) => m.type === 'filial' || m.type === 'sede').length,
    distribuidores: markers.filter((m: MarkerData) => m.type === 'distribuidor').length,
    parceiros: markers.filter((m: MarkerData) => m.type === 'parceiro').length,
  }
})

const carteiraBuckets = computed(() => {
  let verde = 0
  let amarelo = 0
  let vermelho = 0
  let potencial = 0
  let inativo = 0

  for (const c of clientes.value as any[]) {
    const k = keyForClient(c)
    if (k === 'inativo') inativo++
    else if (k === 'potencial') potencial++
    else if (k === 'critico') vermelho++
    else if (k === 'atencao') amarelo++
    else verde++
  }

  return {
    verde,
    amarelo,
    vermelho,
    potencial,
    inativo,
    total: verde + amarelo + vermelho + potencial + inativo,
  }
})

const visitedStats = computed(() => {
  const carteira = carteiraBuckets.value
  return {
    total: carteira.total,
    ativosVerde: carteira.verde,
    ativosAmarelo: carteira.amarelo,
    ativosVermelho: carteira.vermelho,
    potenciais: carteira.potencial,
    inativos: carteira.inativo,
    contatosNoMes: contactsThisMonth.value,
    faturamentoMensal: salesTotals.value.month,
    faturamentoTrimestral: salesTotals.value.quarter,
    faturamentoAnual: salesTotals.value.year,
  }
})

function deltaMeta(current: number, previous: number) {
  const c = Number.isFinite(current) ? current : 0
  const p = Number.isFinite(previous) ? previous : 0

  if (p <= 0) {
    if (c <= 0) return { text: '0%', class: 'text-slate-600', icon: 'mdi:minus' }
    return { text: 'novo', class: 'text-emerald-700', icon: 'mdi:trending-up' }
  }

  const pct = Math.round(((c - p) / p) * 100)
  if (pct > 0) return { text: `+${pct}%`, class: 'text-emerald-700', icon: 'mdi:trending-up' }
  if (pct < 0) return { text: `${pct}%`, class: 'text-red-700', icon: 'mdi:trending-down' }
  return { text: '0%', class: 'text-slate-600', icon: 'mdi:minus' }
}

const contatosVsMesAnterior = computed(() => deltaMeta(contactsThisMonth.value, contactsPrevMonth.value))
const mensalVsMesAnterior = computed(() => deltaMeta(salesTotals.value.month, salesTotals.value.monthPrev))
const mensalVsMesmoMesAnoAnterior = computed(() =>
  deltaMeta(salesTotals.value.month, salesTotals.value.monthPrevYear)
)
const trimestralVsTrimestreAnterior = computed(() =>
  deltaMeta(salesTotals.value.quarter, salesTotals.value.quarterPrev)
)
const trimestralVsMesmoTrimestreAnoAnterior = computed(() =>
  deltaMeta(salesTotals.value.quarter, salesTotals.value.quarterPrevYear)
)
const anualVsAnoAnterior = computed(() => deltaMeta(salesTotals.value.year, salesTotals.value.yearPrevYear))

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function handlePolygonClick(polygon: any) {
  console.log('Polígono clicado:', polygon)
}

function handleMarkerClick(marker: any) {
  console.log('Marker clicado:', marker)
}

function handleVisitedMarkerClick(marker: any) {
  const cliente = clientes.value.find((c) => c.id === marker.clientId)
  if (cliente) {
    selectedClient.value = cliente
    isSidePanelOpen.value = true
  }
}

function handleAddVisit() {
  isModalNovaVisitaOpen.value = true
}

function handleSubmitNovaVisita(payload: any) {
  if (!selectedClient.value) return

  createEvento({
    clientId: selectedClient.value.id,
    userId: currentUserId,
    ...payload,
  }).then(async () => {
    await loadClients()
  })

  isModalNovaVisitaOpen.value = false
}

function handleOpenEditarCliente() {
  isModalEditarClienteOpen.value = true
}

function handleSubmitEditarCliente(updates: Record<string, unknown>) {
  if (!selectedClient.value) return

  patchClient(selectedClient.value.id, updates as any).then(async (updated) => {
    selectedClient.value = updated
    await loadClients()
  })

  isModalEditarClienteOpen.value = false
}

function handleRemoveCliente() {
  if (!selectedClient.value) return

  deleteClient(selectedClient.value.id).then(async () => {
    isSidePanelOpen.value = false
    selectedClient.value = null
    await loadClients()
  })
}

definePageMeta({
  layout: 'default',
})
</script>
