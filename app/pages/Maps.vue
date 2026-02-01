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
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-cyan-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🗺️</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-cyan-600">{{ visitedStats.total }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Total Visitado</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🏖️</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-purple-600">{{ visitedStats.praias }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Praias</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📍</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-amber-600">{{ visitedStats.pontos }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Pontos Turísticos</div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-rose-100 hover:shadow-xl transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <span class="text-2xl">📸</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-rose-600">{{ visitedStats.fotos }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Fotos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mapa de Locais Visitados -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8 border border-gray-100">
        <BrokerMaps
          v-if="visitedMapData"
          :markers="createVisitedMarkers"
          :polygons="visitedMapData.polygons"
          :center-lat="visitedMapData.mapSettings.center.lat"
          :center-lng="visitedMapData.mapSettings.center.lng"
          :zoom="visitedMapData.mapSettings.zoom"
          class="h-[700px]"
        />
        <div v-else class="h-[700px] flex items-center justify-center">
          <div class="text-center">
            <div class="text-6xl mb-4">🗺️</div>
            <div class="text-gray-500 font-medium">Carregando mapa...</div>
          </div>
        </div>
      </div>

      <!-- Formulário de Cadastro Simplificado -->
      <div
        class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6 mb-6 border border-blue-100"
      >
        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl">📍</span>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Adicionar Local Visitado</h3>
            <p class="text-sm text-gray-600">Busque um endereço e adicione ao seu mapa</p>
          </div>
        </div>

        <form @submit.prevent="addNewPlace" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">🔍 Buscar Local</label>
            <input
              ref="autocompleteInput"
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
            {{
              isGeocoding ? '🔍 Buscando...' : selectedPlace ? '✅ Adicionar ao Mapa' : '🔍 Buscar'
            }}
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

      <!-- Mensagem quando não há locais -->
      <div
        v-if="!visitedPlaces.length"
        class="text-center py-16 bg-white rounded-xl shadow-sm border"
      >
        <div class="text-6xl mb-4">🗺️</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Nenhum local visitado ainda</h3>
        <p class="text-gray-600">
          Comece adicionando seus locais favoritos usando o formulário acima!
        </p>
      </div>

      <!-- Grid de Locais Visitados -->
      <div v-if="visitedPlaces.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(place, index) in visitedPlaces"
          :key="`${place.lat}-${place.lng}-${index}`"
          class="bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-xl transition-all"
        >
          <div :style="{ backgroundColor: place.color }" class="h-3" />
          <div class="p-5">
            <div class="flex items-start justify-between mb-3">
              <h3 class="font-bold text-gray-900 text-lg">{{ place.title }}</h3>
              <button
                @click="removePlace(index)"
                class="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1"
                title="Remover"
              >
                🗑️
              </button>
            </div>
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">
              {{ place.description || 'Local adicionado ao mapa' }}
            </p>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>📅 {{ formatDate(place.date) }}</span>
              <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{{
                getTypeLabel(place.type)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BrokerMaps from '../components/BrokerMaps.vue'

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

interface VisitedPlace {
  lat: number
  lng: number
  title: string
  description: string
  date: string
  type: string
  color: string
  photos: number
  rating: number
  address: string
}

interface MapData {
  markers: any[]
  polygons: any[]
  mapSettings: {
    center: { lat: number; lng: number }
    zoom: number
  }
}

const activeTab = ref<'commercial' | 'visited'>('commercial')
const commercialMapData = ref<MapData | null>(null)
const visitedMapData = ref<MapData | null>(null)
const scGeoJson = ref<any>(null)
const visitedPlaces = ref<VisitedPlace[]>([])
const isGeocoding = ref(false)
const geocodeError = ref('')
const geocodeSuccess = ref('')
const selectedPlace = ref<any>(null)
const autocompleteInput = ref<HTMLInputElement | null>(null)

const newPlace = ref({
  address: '',
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
    const visitedData = await $fetch('/api/v1/visited-places')
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

    visitedPlaces.value = visitedData.data.places
    visitedMapData.value = {
      markers: [],
      polygons: [scPolygon],
      mapSettings: visitedData.data.mapSettings || {
        center: { lat: -27.5954, lng: -48.548 },
        zoom: 7,
      },
    }

    initializeAutocomplete()
  } catch (error) {
    console.error('Erro ao carregar dados do mapa:', error)
  }
})

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

const createVisitedMarkers = computed(() => {
  return visitedPlaces.value.map((place) => ({
    lat: place.lat,
    lng: place.lng,
    title: place.title,
    value: place.photos,
    color: place.color,
    size: 30 + place.rating * 5,
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
  return {
    total: visitedPlaces.value.length,
    praias: visitedPlaces.value.filter((p) => p.type === 'praia').length,
    pontos: visitedPlaces.value.filter((p) => p.type === 'ponto-turistico').length,
    fotos: visitedPlaces.value.reduce((sum, p) => sum + p.photos, 0),
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

function handlePolygonClick(polygon: any) {
  console.log('Polígono clicado:', polygon)
}

function handleMarkerClick(marker: any) {
  console.log('Marker clicado:', marker)
}

async function addNewPlace() {
  if (!selectedPlace.value) {
    geocodeError.value = 'Por favor, selecione um local da lista de sugestões'
    return
  }

  geocodeError.value = ''
  geocodeSuccess.value = ''
  isGeocoding.value = true

  try {
    const location = selectedPlace.value.geometry.location
    const types = selectedPlace.value.types || []
    let placeType = 'ponto-turistico'
    let color = '#f59e0b'

    if (types.includes('natural_feature') || types.includes('park')) {
      placeType = 'natureza'
      color = '#10b981'
    } else if (types.includes('museum') || types.includes('art_gallery')) {
      placeType = 'museu'
      color = '#8b5cf6'
    } else if (types.includes('church') || types.includes('place_of_worship')) {
      placeType = 'religioso'
      color = '#a855f7'
    } else if (types.includes('shopping_mall') || types.includes('store')) {
      placeType = 'mercado'
      color = '#f97316'
    }

    const newVisitedPlace: VisitedPlace = {
      lat: location.lat(),
      lng: location.lng(),
      title: selectedPlace.value.name,
      description: selectedPlace.value.formatted_address || '',
      date: new Date().toISOString().split('T')[0],
      type: placeType,
      color,
      photos: 0,
      rating: 5,
      address: selectedPlace.value.formatted_address || '',
    }

    visitedPlaces.value.push(newVisitedPlace)

    if (visitedMapData.value) {
      visitedMapData.value.markers.push({
        lat: location.lat(),
        lng: location.lng(),
        title: selectedPlace.value.name,
        value: 1,
        color,
        size: 35,
      })
    }

    geocodeSuccess.value = `"${selectedPlace.value.name}" adicionado com sucesso!`
    resetForm()

    setTimeout(() => {
      geocodeSuccess.value = ''
    }, 3000)
  } catch (error) {
    console.error('Erro ao adicionar local:', error)
    geocodeError.value = 'Erro ao adicionar local. Tente novamente.'
  } finally {
    isGeocoding.value = false
  }
}

function resetForm() {
  newPlace.value = {
    address: '',
  }
  selectedPlace.value = null
  geocodeError.value = ''
}

function removePlace(index: number) {
  visitedPlaces.value.splice(index, 1)
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    praia: '🏖️ Praia',
    natureza: '🌿 Natureza',
    evento: '🎉 Evento',
    museu: '🏛️ Museu',
    'ponto-turistico': '📍 Turístico',
    mercado: '🛒 Comércio',
    religioso: '⛪ Religioso',
  }
  return labels[type] || '📍 Local'
}

function initializeAutocomplete() {
  if (!autocompleteInput.value) return

  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${useRuntimeConfig().public.googleMapsApiKey}&libraries=places&language=pt-BR`
  script.async = true
  script.defer = true

  script.onload = () => {
    const autocomplete = new (window as any).google.maps.places.Autocomplete(
      autocompleteInput.value,
      {
        componentRestrictions: { country: 'br' },
        fields: ['name', 'formatted_address', 'geometry', 'types'],
      }
    )

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.geometry) {
        selectedPlace.value = place
        newPlace.value.address = place.formatted_address || place.name || ''
        geocodeError.value = ''
      }
    })
  }

  document.head.appendChild(script)
}
</script>
