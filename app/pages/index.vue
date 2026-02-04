<template>
  <div class="min-h-screen">

    <div class="w-full px-3 py-4 lg:px-4 lg:py-6 space-y-3">
      <img src="/logo.webp" alt="Felssner Representações" class="h-20 lg:h-12 mx-auto" />
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
                <option value="ativo">✅ Ativo</option>
                <option value="potencial">🔍 Potencial</option>
                <option value="inativo">⏸️ Inativo</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
          <div class="bg-sky-50 border border-sky-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Total</NTypo>
            <NTypo size="xl" weight="bold" class="tabular-nums text-sky-500 lg:text-2xl">
              {{ visitedStats.total }}
            </NTypo>
          </div>
          <div class="bg-emerald-50 border border-emerald-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Ativos</NTypo>
            <NTypo size="xl" weight="bold" class="tabular-nums text-emerald-500 lg:text-2xl">
              {{ visitedStats.ativos }}
            </NTypo>
            <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
              <span class="inline-flex items-center gap-1 text-emerald-700">
                <span class="h-2 w-2 rounded-full bg-emerald-500" />
                {{ visitedStats.ativosVerde }} ≤90d
              </span>
              <span class="inline-flex items-center gap-1 text-yellow-700">
                <span class="h-2 w-2 rounded-full bg-yellow-500" />
                {{ visitedStats.ativosAmarelo }} ≤180d
              </span>
              <span class="inline-flex items-center gap-1 text-red-700">
                <span class="h-2 w-2 rounded-full bg-red-500" />
                {{ visitedStats.ativosVermelho }} &gt;180d
              </span>
              <span v-if="visitedStats.ativosSemContato" class="inline-flex items-center gap-1 text-sky-700">
                <span class="h-2 w-2 rounded-full bg-sky-500" />
                {{ visitedStats.ativosSemContato }} sem contato
              </span>
            </div>
          </div>
          <div class="bg-violet-50 border border-violet-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Mensal</NTypo>
            <NTypo size="sm" weight="bold" class="tabular-nums text-violet-500 lg:text-xl">
              {{ formatCurrency(visitedStats.faturamentoMensal) }}
            </NTypo>
          </div>
          <div class="bg-amber-50 border border-amber-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Trimestral</NTypo>
            <NTypo size="sm" weight="bold" class="tabular-nums text-amber-600 lg:text-xl">
              {{ formatCurrency(visitedStats.faturamentoTrimestral) }}
            </NTypo>
          </div>
          <div class="bg-orange-50 border border-orange-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Anual</NTypo>
            <NTypo size="sm" weight="bold" class="tabular-nums text-orange-500 lg:text-xl">
              {{ formatCurrency(visitedStats.faturamentoAnual) }}
            </NTypo>
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

    <!-- Formulário de Cadastro -->
    <Transition name="slide-down">
      <div v-if="isFormOpen" class="lg:block">
        <NLayer variant="paper" size="lg" radius="soft" class="shadow-md">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <NTypo as="span" size="2xl" class="lg:text-3xl">🏛️</NTypo>
            <div>
              <NTypo as="h3" size="lg" weight="bold" class="lg:text-xl">Adicionar Novo Cliente</NTypo>
              <NTypo size="xs" tone="muted" class="lg:text-sm">Cadastre um novo cliente no mapa</NTypo>
            </div>
          </div>
          <button
            @click="isFormOpen = false"
            class="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <NIcon name="x" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="addNewPlace" class="space-y-3 lg:space-y-4">
          <div>
            <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5 lg:mb-2 lg:text-sm">
              💼 Nome do Cliente
            </NTypo>
            <input
              v-model="newPlace.nome"
              type="text"
              placeholder="Ex: Supermercado Bom Preço"
              class="w-full px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
              required
            />
          </div>
          <div>
            <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5 lg:mb-2 lg:text-sm">
              🔍 Buscar Local
            </NTypo>
            <input
              v-model="newPlace.address"
              type="text"
              placeholder="Digite o endereço ou nome do local..."
              class="w-full px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
              required
            />
            <NTypo size="xs" tone="muted" class="mt-1.5">Ex: Praia do Campeche, Florianópolis - SC</NTypo>
          </div>

          <button
            type="submit"
            :disabled="isGeocoding"
            class="w-full bg-blue-500 text-white px-4 py-2.5 lg:px-6 lg:py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow-md text-base lg:text-lg active:scale-95"
          >
            {{ isGeocoding ? '🔍 Buscando...' : '📍 Adicionar ao Mapa' }}
          </button>
        </form>

        <div
          v-if="geocodeError"
          class="mt-3 lg:mt-4 p-3 lg:p-4 rounded-lg border border-red-200 bg-red-50"
        >
          <NTypo size="sm" weight="medium" class="text-red-700">❌ {{ geocodeError }}</NTypo>
        </div>

        <div
          v-if="geocodeSuccess"
          class="mt-3 lg:mt-4 p-3 lg:p-4 rounded-lg border border-green-200 bg-green-50"
        >
          <NTypo size="sm" weight="medium" class="text-green-700">✅ {{ geocodeSuccess }}</NTypo>
        </div>
      </NLayer>
      </div>
    </Transition>

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
const salesTotals = ref<{ month: number; quarter: number; year: number }>({ month: 0, quarter: 0, year: 0 })
const loadClientsError = ref('')
const isGeocoding = ref(false)
const geocodeError = ref('')
const geocodeSuccess = ref('')
const isSidePanelOpen = ref(false)
const selectedClient = ref<Cliente | null>(null)
const isModalNovaVisitaOpen = ref(false)
const isModalEditarClienteOpen = ref(false)
const searchQuery = ref('')
const filterSegmento = ref('')
const filterTipo = ref('')
const isFormOpen = ref(true) // Desktop: aberto por padrão
const isSidePanelOpenMobile = ref(false)

const { fetchClients, createClient, patchClient, deleteClient } = useClientsApi()
const { createEvento } = useHistoricoClienteApi()
const currentUserId = 'user-app'

const newPlace = ref({
  address: '',
  nome: '',
})

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
    if (data.salesTotals) salesTotals.value = data.salesTotals

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
    result = result.filter((cliente: any) => cliente.status === filterTipo.value)
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
  if (cliente?.status === 'inativo') return '#9ca3af'

  const last = cliente?.sales?.lastContactAt ? new Date(cliente.sales.lastContactAt) : null
  if (last && !Number.isNaN(last.getTime())) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const lastDay = new Date(last)
    lastDay.setHours(0, 0, 0, 0)
    const dias = Math.ceil((hoje.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24))
    // Regra (carteira): <=90 verde | 91–180 amarelo | >180 vermelho
    if (dias > 180) return '#ef4444'
    if (dias > 90) return '#eab308'
    return '#22c55e'
  }

  const next = cliente?.sales?.nextActionAt ? new Date(cliente.sales.nextActionAt) : null
  if (next && !Number.isNaN(next.getTime())) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataProxima = new Date(next)
    dataProxima.setHours(0, 0, 0, 0)
    const diasRestantes = Math.ceil((dataProxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    if (diasRestantes < 0) return '#ef4444'
    if (diasRestantes <= 3) return '#eab308'
    return '#22c55e'
  }

  return '#3b82f6'
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
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const msPerDay = 1000 * 60 * 60 * 24

  let verde = 0
  let amarelo = 0
  let vermelho = 0
  let semContato = 0

  for (const c of clientes.value as any[]) {
    if (c?.status === 'inativo') continue

    const lastIso = c?.sales?.lastContactAt
    if (typeof lastIso !== 'string' || !lastIso) {
      semContato++
      continue
    }

    const last = new Date(lastIso)
    if (Number.isNaN(last.getTime())) {
      semContato++
      continue
    }

    last.setHours(0, 0, 0, 0)
    const dias = Math.ceil((hoje.getTime() - last.getTime()) / msPerDay)

    if (dias > 180) vermelho++
    else if (dias > 90) amarelo++
    else verde++
  }

  return { verde, amarelo, vermelho, semContato, total: verde + amarelo + vermelho + semContato }
})

const visitedStats = computed(() => {
  const carteira = carteiraBuckets.value
  return {
    total: clientes.value.length,
    ativos: carteira.total,
    ativosVerde: carteira.verde,
    ativosAmarelo: carteira.amarelo,
    ativosVermelho: carteira.vermelho,
    ativosSemContato: carteira.semContato,
    faturamentoMensal: salesTotals.value.month,
    faturamentoTrimestral: salesTotals.value.quarter,
    faturamentoAnual: salesTotals.value.year,
  }
})

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
    // No mobile, fecha o formulário se estiver aberto
    if (window.innerWidth < 1024) {
      isFormOpen.value = false
    }
  }
}

async function addNewPlace() {
  if (!newPlace.value.nome.trim() || !newPlace.value.address.trim()) {
    geocodeError.value = 'Por favor, preencha o nome e o endereço'
    return
  }

  geocodeError.value = ''
  geocodeSuccess.value = ''
  isGeocoding.value = true

  try {
    const novoCliente = await createClient({
      nome: newPlace.value.nome,
      endereco_completo: newPlace.value.address,
      status: 'potencial',
      segmento: 'otica',
    })

    geocodeSuccess.value = `Cliente "${novoCliente.nome}" adicionado com sucesso!`
    resetForm()
    await loadClients()

    setTimeout(() => {
      geocodeSuccess.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error)
    geocodeError.value = 'Erro ao salvar/geocodificar. Verifique sua conexão e tente novamente.'
  } finally {
    isGeocoding.value = false
  }
}

function resetForm() {
  newPlace.value = {
    address: '',
    nome: '',
  }
  geocodeError.value = ''
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
</script>
