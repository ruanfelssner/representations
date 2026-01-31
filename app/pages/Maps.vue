<template>
  <div class="container mx-auto p-4">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Mapa de Cobertura Comercial - Santa Catarina
      </h1>
      <p class="text-gray-600">
        Visualize todos os pontos de atendimento comercial no estado de Santa Catarina
      </p>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div class="text-blue-600 text-sm font-medium">Total de Pontos</div>
        <div class="text-2xl font-bold text-blue-900">{{ stats.total }}</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg border border-green-200">
        <div class="text-green-600 text-sm font-medium">Filiais</div>
        <div class="text-2xl font-bold text-green-900">{{ stats.filiais }}</div>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div class="text-yellow-600 text-sm font-medium">Distribuidores</div>
        <div class="text-2xl font-bold text-yellow-900">{{ stats.distribuidores }}</div>
      </div>
      <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div class="text-orange-600 text-sm font-medium">Parceiros</div>
        <div class="text-2xl font-bold text-orange-900">{{ stats.parceiros }}</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white p-4 rounded-lg shadow-sm mb-4 border">
      <div class="flex flex-wrap gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="filters.sede"
            type="checkbox"
            class="w-4 h-4 text-blue-600 rounded"
          >
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-blue-600"></span>
            <span class="text-sm">Sede</span>
          </span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="filters.filial"
            type="checkbox"
            class="w-4 h-4 text-green-600 rounded"
          >
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-green-600"></span>
            <span class="text-sm">Filiais</span>
          </span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="filters.distribuidor"
            type="checkbox"
            class="w-4 h-4 text-yellow-600 rounded"
          >
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-yellow-600"></span>
            <span class="text-sm">Distribuidores</span>
          </span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="filters.parceiro"
            type="checkbox"
            class="w-4 h-4 text-orange-600 rounded"
          >
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-orange-600"></span>
            <span class="text-sm">Parceiros</span>
          </span>
        </label>
      </div>
    </div>

    <!-- Mapa -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <BrokerMaps
        v-if="mapData"
        :markers="filteredMarkers"
        :polygons="mapData.polygons"
        :center-lat="mapData.mapSettings.center.lat"
        :center-lng="mapData.mapSettings.center.lng"
        :zoom="mapData.mapSettings.zoom"
        class="h-[600px]"
        @polygon-click="handlePolygonClick"
        @marker-click="handleMarkerClick"
      />
      <div v-else class="h-[600px] flex items-center justify-center">
        <div class="text-gray-500">Carregando mapa...</div>
      </div>
    </div>

    <!-- Lista de pontos -->
    <div class="mt-6 bg-white rounded-lg shadow-sm border overflow-hidden">
      <div class="p-4 bg-gray-50 border-b">
        <h2 class="text-lg font-semibold text-gray-900">Pontos de Atendimento</h2>
      </div>
      <div class="divide-y max-h-96 overflow-y-auto">
        <div
          v-for="marker in filteredMarkers"
          :key="`${marker.lat}-${marker.lng}`"
          class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="handleMarkerClick(marker)"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3">
              <div
                :style="{ background: marker.color }"
                class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1"
              >
                {{ marker.value }}
              </div>
              <div>
                <h3 class="font-medium text-gray-900">{{ marker.title }}</h3>
                <p class="text-sm text-gray-600">{{ marker.address }}</p>
                <p class="text-sm text-gray-500">{{ marker.phone }}</p>
              </div>
            </div>
            <span
              class="px-2 py-1 text-xs rounded-full"
              :class="{
                'bg-blue-100 text-blue-700': marker.type === 'sede',
                'bg-green-100 text-green-700': marker.type === 'filial',
                'bg-yellow-100 text-yellow-700': marker.type === 'distribuidor',
                'bg-orange-100 text-orange-700': marker.type === 'parceiro'
              }"
            >
              {{ marker.type.charAt(0).toUpperCase() + marker.type.slice(1) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BrokerMaps from '~/components/BrokerMaps.vue'

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
  markers: MarkerData[]
  polygons: any[]
  mapSettings: {
    center: { lat: number; lng: number }
    zoom: number
  }
}

// Estado reativo
const mapData = ref<MapData | null>(null)
const scGeoJson = ref<any>(null)
const filters = ref({
  sede: true,
  filial: true,
  distribuidor: true,
  parceiro: true,
})

// Carregar dados
onMounted(async () => {
  try {
    // Carregar pontos comerciais
    const commercialResponse = await fetch('/mock-commercial-points.json')
    const commercialData = await commercialResponse.json()

    // Carregar GeoJSON de Santa Catarina
    const scResponse = await fetch('/santa-catarina.json')
    scGeoJson.value = await scResponse.json()

    // Processar polígono de SC
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

    mapData.value = {
      markers: commercialData.data.markers,
      polygons: [scPolygon],
      mapSettings: commercialData.data.mapSettings,
    }
  }
  catch (error) {
    console.error('Erro ao carregar dados do mapa:', error)
  }
})

// Processar coordenadas do GeoJSON (inverter lat/lng)
function processGeoJsonCoordinates(coordinates: any[]): { lat: number; lng: number }[] {
  const paths: { lat: number; lng: number }[] = []

  function processCoords(coords: any) {
    if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
      // MultiPolygon
      coords.forEach((polygon: any) => {
        polygon.forEach((ring: any) => {
          ring.forEach((coord: any) => {
            paths.push({ lat: coord[1], lng: coord[0] })
          })
        })
      })
    }
    else if (Array.isArray(coords[0])) {
      // Polygon
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

// Markers filtrados
const filteredMarkers = computed(() => {
  if (!mapData.value)
    return []

  return mapData.value.markers.filter((marker) => {
    return filters.value[marker.type]
  })
})

// Estatísticas
const stats = computed(() => {
  if (!mapData.value)
    return { total: 0, filiais: 0, distribuidores: 0, parceiros: 0 }

  const markers = mapData.value.markers
  return {
    total: markers.length,
    filiais: markers.filter(m => m.type === 'filial' || m.type === 'sede').length,
    distribuidores: markers.filter(m => m.type === 'distribuidor').length,
    parceiros: markers.filter(m => m.type === 'parceiro').length,
  }
})

// Handlers
function handlePolygonClick(polygon: any) {
  console.log('Polígono clicado:', polygon)
}

function handleMarkerClick(marker: MarkerData) {
  console.log('Marker clicado:', marker)
}
</script>