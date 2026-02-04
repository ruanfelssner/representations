<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {{ activeTab === 'commercial' ? 'Mapa de Cobertura Comercial' : 'Locais Visitados' }}
            </h1>
            <p class="text-gray-600 text-lg">
              {{
                activeTab === 'commercial'
                  ? 'Visualize todos os pontos de atendimento comercial no estado de Santa Catarina'
                  : 'Explore os lugares que já visitei em Santa Catarina'
              }}
            </p>
          </div>
        </div>

        <!-- Abas de navegação -->
        <div class="flex gap-3 bg-white rounded-xl shadow-sm p-2 inline-flex">
          <button
            @click="activeTab = 'commercial'"
            :class="[
              'px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200',
              activeTab === 'commercial'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100',
            ]"
          >
            📍 Pontos Comerciais
          </button>
          <button
            @click="activeTab = 'visited'"
            :class="[
              'px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200',
              activeTab === 'visited'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100',
            ]"
          >
            ✈️ Locais Visitados
          </button>
        </div>
      </div>

    <!-- Visualização Comercial -->
    <div v-if="activeTab === 'commercial'">
      <!-- Estatísticas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">📊</span>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide">Total de Pontos</div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">🏢</span>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-green-600">{{ stats.filiais }}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide">Filiais</div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100 hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">🚚</span>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-yellow-600">{{ stats.distribuidores }}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide">Distribuidores</div>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">🤝</span>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold text-orange-600">{{ stats.parceiros }}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide">Parceiros</div>
              </div>
            </div>
          </div>
        </div>

      <!-- Filtros -->
      <div class="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <input v-model="filters.sede" type="checkbox" class="w-4 h-4 text-blue-600 rounded" />
            <span class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-600" />
              <span class="text-sm font-medium text-gray-700">Sede</span>
            </span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <input
              v-model="filters.filial"
              type="checkbox"
              class="w-4 h-4 text-green-600 rounded"
            />
            <span class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-green-600" />
              <span class="text-sm font-medium text-gray-700">Filiais</span>
            </span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <input
              v-model="filters.distribuidor"
              type="checkbox"
              class="w-4 h-4 text-yellow-600 rounded"
            />
            <span class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-yellow-600" />
              <span class="text-sm font-medium text-gray-700">Distribuidores</span>
            </span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <input
              v-model="filters.parceiro"
              type="checkbox"
              class="w-4 h-4 text-orange-600 rounded"
            />
            <span class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-orange-600" />
              <span class="text-sm font-medium text-gray-700">Parceiros</span>
            </span>
          </label>
        </div>
      </div>

      <!-- Mapa Comercial -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
        <BrokerMaps
          v-if="commercialMapData"
          :markers="filteredMarkers"
          :polygons="commercialMapData.polygons"
          :center-lat="commercialMapData.mapSettings.center.lat"
          :center-lng="commercialMapData.mapSettings.center.lng"
          :zoom="commercialMapData.mapSettings.zoom"
          class="h-[700px]"
          @polygon-click="handlePolygonClick"
          @marker-click="handleMarkerClick"
        />
        <div v-else class="h-[700px] flex items-center justify-center">
          <div class="text-center">
            <div class="text-6xl mb-4">🗺️</div>
            <div class="text-gray-500 font-medium">Carregando mapa...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualização de Locais Visitados -->
    <div v-if="activeTab === 'visited'">
      <!-- Estatísticas de Visitação -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📊</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-blue-600">{{ visitedStats.total }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Total de Clientes</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">✅</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-green-600">{{ visitedStats.ativos }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Clientes Ativos</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">💰</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-purple-600">{{ formatCurrency(visitedStats.faturamentoMensal) }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Faturamento Mensal</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📈</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-amber-600">{{ formatCurrency(visitedStats.faturamentoAnual) }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Faturamento Anual</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulário de Cadastro Simplificado -->
      <div
        class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6 mb-6 border border-blue-100"
      >
        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl">🏛️</span>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Adicionar Novo Cliente</h3>
            <p class="text-sm text-gray-600">Cadastre um novo cliente no mapa</p>
          </div>
        </div>

        <form @submit.prevent="addNewPlace" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">💼 Nome do Cliente</label>
            <input
              v-model="newPlace.nome"
              type="text"
              placeholder="Ex: Supermercado Bom Preço"
              class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">🔍 Buscar Local</label>
            <input
              v-model="newPlace.address"
              type="text"
              placeholder="Digite o endereço ou nome do local..."
              class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            />
            <p class="text-xs text-gray-500 mt-1">Ex: Praia do Campeche, Florianópolis - SC</p>
          </div>

          <button
            type="submit"
            :disabled="isGeocoding"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg text-lg"
          >
            {{ isGeocoding ? '🔍 Buscando...' : '📍 Adicionar ao Mapa' }}
          </button>
        </form>

        <div v-if="geocodeError" class="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p class="text-sm text-red-700 font-medium">❌ {{ geocodeError }}</p>
        </div>

        <div
          v-if="geocodeSuccess"
          class="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg"
        >
          <p class="text-sm text-green-700 font-medium">✅ {{ geocodeSuccess }}</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">🔍</span>
          <h3 class="text-lg font-bold text-gray-900">Filtros e Busca</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Buscar Cliente</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nome, cidade, endereço ou CNPJ..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Segmento</label>
            <select
              v-model="filterSegmento"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os segmentos</option>
              <option value="otica">👓 Ótica</option>
              <option value="relojoaria">⌚ Relojoaria</option>
              <option value="semijoia">💍 Semi-joias</option>
              <option value="multimarcas">🏪 Multimarcas</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
            <select
              v-model="filterTipo"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="cliente">✅ Cliente</option>
              <option value="prospecto">🔍 Prospecto</option>
              <option value="inativo">⏸️ Inativo</option>
            </select>
          </div>
        </div>

        <div v-if="searchQuery || filterSegmento || filterTipo" class="mt-4">
          <button
            @click="searchQuery = ''; filterSegmento = ''; filterTipo = ''"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            🔄 Limpar Filtros
          </button>
          <span class="ml-3 text-sm text-gray-600">
            Mostrando {{ filteredClientes.length }} de {{ clientes.length }} clientes
          </span>
        </div>
      </div>

      <!-- Mapa de Locais Visitados -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div class="flex h-[700px]">
          <div class="relative h-full w-full">
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
                <div class="text-gray-500 font-medium">Carregando mapa...</div>
              </div>
            </div>
          </div>

          <!-- SidePanel - ao lado do mapa -->
          <ClientSidePanel
            :is-open="isSidePanelOpen"
            :client-data="selectedClient"
            @close="isSidePanelOpen = false"
            @add-visit="handleAddVisit"
            @edit-client="handleOpenEditarCliente"
            @remove-client="handleRemoveCliente"
          />
        </div>
      </div>

      <!-- Mensagem quando não há clientes -->
      <div
        v-if="!clientes.length"
        class="text-center py-16 bg-white rounded-xl shadow-sm border mt-6"
      >
        <div class="text-6xl mb-4">👥</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum cliente cadastrado ainda</h3>
        <p class="text-gray-600">
          Comece adicionando seus clientes usando o formulário acima!
        </p>
      </div>
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
import type { Cliente, Visita } from '~/types/client'
import { useClientStorage } from '~/composables/useClientStorage'
import { useClientsApi } from '~/composables/useClientsApi'

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

const activeTab = ref<'commercial' | 'visited'>('visited')
const commercialMapData = ref<MapData | null>(null)
const visitedMapData = ref<MapData | null>(null)
const scGeoJson = ref<any>(null)
const clientes = ref<Cliente[]>([])
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

const { getClientStats, getClientColor, getClientColorByLastVisit } = useClientStorage()
const { fetchClients, createClient, patchClient, deleteClient, addVisitaApi } = useClientsApi()

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
      strokeColor: '#1e40af',
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: '#3b82f6',
      fillOpacity: 0,
      label: 'Santa Catarina',
      metrics: {
        seguros: 280,
        clientes: 1850,
        corretores: 45,
      },
    }

    commercialMapData.value = {
      markers: commercialData.data.markers,
      polygons: [scPolygon],
      mapSettings: commercialData.data.mapSettings || {
        center: { lat: -27.5954, lng: -48.548 },
        zoom: 7,
      },
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
  const data = await fetchClients()
  const mapped = (data.clients || []).map((c) => ({
    ...c,
    visitas: Array.isArray(c.visitas) ? c.visitas : [],
    // Sempre recalcula no client (campo `color` no Mongo pode estar desatualizado)
    color: c.proximaVisita
      ? getClientColor(c.proximaVisita)
      : getClientColorByLastVisit({
          ...(c as any),
          visitas: Array.isArray(c.visitas) ? c.visitas : [],
        }),
  }))
  clientes.value = mapped

  if (visitedMapData.value?.mapSettings && data.mapSettings) {
    visitedMapData.value.mapSettings = data.mapSettings
  }

  if (selectedClient.value) {
    selectedClient.value = mapped.find((c) => c.id === selectedClient.value?.id) || null
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
    result = result.filter((cliente) => cliente.tipo === filterTipo.value)
  }

  return result
})

const createVisitedMarkers = computed(() => {
  return filteredClientes.value
    .filter((cliente) => typeof cliente.lat === 'number' && typeof cliente.lng === 'number')
    .map((cliente) => ({
      lat: cliente.lat,
      lng: cliente.lng,
      title: cliente.nome,
      value: cliente.visitas.length,
      color: cliente.color,
      size: Math.min(26, 16 + Math.min(cliente.visitas.length, 12) * 0.8),
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

const visitedStats = computed(() => {
  const stats = getClientStats(clientes.value)
  return {
    total: stats.totalClientes,
    ativos: stats.clientesAtivos,
    faturamentoMensal: stats.faturamentoMensal,
    faturamentoAnual: stats.faturamentoAnual,
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
      tipo: 'prospecto',
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

function handleSubmitNovaVisita(visitaData: Omit<Visita, 'id'>) {
  if (!selectedClient.value) return

  addVisitaApi(selectedClient.value.id, visitaData).then(async (updated) => {
    selectedClient.value = updated
    await loadClients()
  })

  isModalNovaVisitaOpen.value = false
}

function handleOpenEditarCliente() {
  isModalEditarClienteOpen.value = true
}

function handleSubmitEditarCliente(updates: Partial<Cliente>) {
  if (!selectedClient.value) return

  patchClient(selectedClient.value.id, updates).then(async (updated) => {
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
