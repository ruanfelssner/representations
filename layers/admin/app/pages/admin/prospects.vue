<template>
  <div class="space-y-4">
    <!-- Header -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <NTypo as="h1" size="2xl" weight="bold" class="lg:text-3xl">
            Prospecção SC - Joalherias
          </NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">
            {{ stats.total }} empresas ativas em Santa Catarina
          </NTypo>
        </div>
        <div class="flex items-center gap-2">
          <NButton
            variant="outline"
            size="sm"
            leading-icon="mdi:filter"
            @click="showFilters = !showFilters"
          >
            Filtros
          </NButton>
          <NButton
            variant="primary"
            size="sm"
            leading-icon="mdi:download"
            @click="exportarClientes"
          >
            Exportar
          </NButton>
        </div>
      </div>
    </NLayer>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <NTypo size="xs" tone="muted" caps>Total</NTypo>
        <NTypo size="2xl" weight="bold" class="text-sky-600 tabular-nums">
          {{ stats.total }}
        </NTypo>
      </NLayer>

      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <NTypo size="xs" tone="muted" caps>Com Localização</NTypo>
        <NTypo size="2xl" weight="bold" class="text-emerald-600 tabular-nums">
          {{ clientesComCoordenadas }}
        </NTypo>
        <NTypo size="xs" tone="muted">{{ percentualGeocoded }}%</NTypo>
      </NLayer>

      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <NTypo size="xs" tone="muted" caps>Joalherias</NTypo>
        <NTypo size="2xl" weight="bold" class="text-amber-600 tabular-nums">
          {{ stats.porSegmento.joalheria || 0 }}
        </NTypo>
      </NLayer>

      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <NTypo size="xs" tone="muted" caps>Ópticas</NTypo>
        <NTypo size="2xl" weight="bold" class="text-emerald-600 tabular-nums">
          {{ stats.porSegmento.optica || 0 }}
        </NTypo>
      </NLayer>

      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <NTypo size="xs" tone="muted" caps>Relojoarias</NTypo>
        <NTypo size="2xl" weight="bold" class="text-violet-600 tabular-nums">
          {{ stats.porSegmento.relojoaria || 0 }}
        </NTypo>
      </NLayer>
    </div>

    <!-- Filtros (expansível) -->
    <NLayer v-if="showFilters" variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <NTypo size="xs" tone="muted" weight="medium" class="mb-2">Segmento</NTypo>
          <NSelect
            v-model="filtroSegmento"
            placeholder="Todos os segmentos"
            :options="opcoesSegmento"
          />
        </div>

        <div>
          <NTypo size="xs" tone="muted" weight="medium" class="mb-2">Cidade</NTypo>
          <NSelect
            v-model="filtroCidade"
            placeholder="Todas as cidades"
            :options="opcoesCidade"
          />
        </div>

        <div>
          <NTypo size="xs" tone="muted" weight="medium" class="mb-2">Porte</NTypo>
          <NSelect
            v-model="filtroPorte"
            placeholder="Todos os portes"
            :options="opcoesPorte"
          />
        </div>
      </div>

      <div class="mt-4 flex gap-2 items-center justify-between">
        <div class="flex items-center gap-2">
          <NToggle v-model="apenasComCoordenadas" />
          <NTypo size="sm">Apenas com localização no mapa</NTypo>
        </div>
        <div class="flex gap-2">
          <NButton size="sm" variant="primary" @click="aplicarFiltros">
            Aplicar filtros
          </NButton>
          <NButton size="sm" variant="outline" @click="limparFiltros">
            Limpar
          </NButton>
        </div>
      </div>
    </NLayer>

    <!-- Mapa -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center h-150">
        <NTypo tone="muted">Carregando clientes...</NTypo>
      </div>

      <div v-else-if="error" class="p-6 text-center">
        <NTypo tone="danger" weight="semibold">Erro ao carregar clientes mock</NTypo>
        <NTypo size="sm" tone="muted" class="mt-2">{{ error.message }}</NTypo>
      </div>

      <div v-else class="h-full">
        <BrokerMaps
          :markers="markersToShow"
          :polygons="polygonsSC"
          :center-lat="-27.2423"
          :center-lng="-50.2189"
          :zoom="7"
          @marker-click="handleMarkerClick"
          class="min-h-[800px]"
        />
      </div>
    </NLayer>

    <!-- Top Cidades -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <NTypo size="lg" weight="semibold" class="mb-4">Top 15 Cidades</NTypo>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          v-for="[cidade, count] in stats.topCidades"
          :key="cidade"
          class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all cursor-pointer"
          @click="filtrarPorCidade(cidade)"
        >
          <div>
            <NTypo size="sm" weight="medium">{{ cidade }}</NTypo>
            <NTypo size="xs" tone="muted">{{ count }} empresas</NTypo>
          </div>
          <NIcon name="mdi:map-marker" class="w-5 h-5 text-sky-600" />
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import type { ClientDto } from '~/types/schemas'
import { useMockClients } from '~/composables/useMockClients'

// Extended type for mock clients with metadata
interface MockClientDto extends Omit<ClientDto, 'localizacao'> {
  _metadata?: {
    razao_social: string
    porte: string
    porte_desc: string
    optante_simples: string
    eh_mei: string
    cnae_principal: string
    cnae_desc: string
  }
  localizacao?: {
    latitude: number
    longitude: number
    geo?: {
      type: 'Point'
      coordinates: [number, number]
    }
  }
}

definePageMeta({
  layout: 'admin',
})

useSeoMeta({
  title: 'Prospecção SC - Joalherias',
  description: 'Empresas potenciais em Santa Catarina',
})

const { clients, loading, error, loadMockClients, stats, getClientsByCidade, getClientsBySegmento } = useMockClients()

const showFilters = ref(false)
const filtroSegmento = ref('')
const filtroCidade = ref('')
const filtroPorte = ref('')
const apenasComCoordenadas = ref(false)
const selectedClient = ref<any>(null)

// Carrega clientes mock ao montar
onMounted(async () => {
  await loadMockClients()
})

// Opções de filtro
const opcoesSegmento = computed(() => [
  { value: '', label: 'Todos' },
  { value: 'joalheria', label: 'Joalheria' },
  { value: 'optica', label: 'Óptica' },
  { value: 'relojoaria', label: 'Relojoaria' },
  { value: 'bijuteria', label: 'Bijuteria' },
  { value: 'atacado', label: 'Atacado' },
  { value: 'outro', label: 'Outro' },
])

const opcoesCidade = computed(() => {
  const cidades = [...new Set(clients.value.map(c => c.cidade).filter(Boolean))]
  return [
    { value: '', label: 'Todas' },
    ...cidades.sort().map(c => ({ value: c!, label: c! })),
  ]
})

const opcoesPorte = computed(() => [
  { value: '', label: 'Todos' },
  { value: 'ME', label: 'ME - Microempresa' },
  { value: 'EPP', label: 'EPP - Pequeno Porte' },
  { value: 'DEMAIS', label: 'Demais' },
])

// Clientes filtrados
const clientesFiltrados = computed(() => {
  let resultado = [...clients.value] as any[]

  if (filtroSegmento.value) {
    resultado = resultado.filter(c => c.segmento === filtroSegmento.value)
  }

  if (filtroCidade.value) {
    resultado = resultado.filter(c => c.cidade === filtroCidade.value)
  }

  if (filtroPorte.value) {
    resultado = resultado.filter(c => c._metadata?.porte === filtroPorte.value)
  }
  
  if (apenasComCoordenadas.value) {
    resultado = resultado.filter(c => c.lat && c.lng)
  }

  return resultado
})

// Estatísticas de geocoding
const clientesComCoordenadas = computed(() => {
  return clients.value.filter((c: any) => c.lat && c.lng).length
})

const percentualGeocoded = computed(() => {
  if (clients.value.length === 0) return 0
  return Math.round((clientesComCoordenadas.value / clients.value.length) * 100)
})

// Agrupa clientes por cidade para criar markers
const markersToShow = computed(() => {
  const markers: any[] = []
  
  // Para cada cliente com coordenadas, cria um marker individual
  for (const client of clientesFiltrados.value) {
    const lat = (client as any).lat
    const lng = (client as any).lng
    
    if (lat && lng) {
      // Marker individual para cada cliente com coordenadas
      markers.push({
        lat,
        lng,
        title: `${client.nome}\n${client.cidade || ''}`,
        value: 1,
        color: getColorBySegmento(client.segmento),
        size: 18,
        clientId: client.id,
      })
    }
  }
  
  // Se tiver muitos markers, agrupa por proximidade ou cidade
  // Para simplificar, se não houver coordenadas, agrupa por cidade (fallback)
  if (markers.length === 0) {
    const groupedByCidade: Record<string, any[]> = {}

    for (const client of clientesFiltrados.value) {
      const cidade = client.cidade || 'Desconhecida'
      if (!groupedByCidade[cidade]) {
        groupedByCidade[cidade] = []
      }
      groupedByCidade[cidade].push(client)
    }

    const cidadeCoordenadas = getCidadeCoordenadas()

    return Object.entries(groupedByCidade).map(([cidade, clients]) => {
      const coords = cidadeCoordenadas[cidade.toUpperCase()] || { lat: -27.2423, lng: -50.2189 }
      const color = getColorBySegmento(clients[0]?.segmento)

      return {
        lat: coords.lat,
        lng: coords.lng,
        title: `${cidade} - ${clients.length} empresas`,
        value: clients.length,
        color,
        size: Math.min(Math.max(clients.length / 10 + 16, 18), 36),
      }
    })
  }
  
  return markers
})

// Polígono de SC (simplificado)
const polygonsSC = computed(() => {
  return [
    {
      id: 'sc',
      paths: [
        { lat: -25.9577, lng: -48.5465 },
        { lat: -26.2479, lng: -48.6414 },
        { lat: -26.9035, lng: -48.6703 },
        { lat: -27.5968, lng: -48.5490 },
        { lat: -28.7248, lng: -49.3897 },
        { lat: -29.3544, lng: -49.7327 },
        { lat: -29.3416, lng: -50.3247 },
        { lat: -28.9820, lng: -50.9167 },
        { lat: -28.1325, lng: -52.0420 },
        { lat: -27.3253, lng: -53.1055 },
        { lat: -26.4778, lng: -53.5225 },
        { lat: -26.0063, lng: -53.3767 },
        { lat: -25.5979, lng: -52.2803 },
        { lat: -25.8424, lng: -51.4531 },
        { lat: -26.2174, lng: -50.1660 },
        { lat: -26.0336, lng: -49.1699 },
      ],
      strokeColor: '#0ea5e9',
      fillColor: '#0ea5e9',
      fillOpacity: 0.1,
    },
  ]
})

function getColorBySegmento(segmento?: string) {
  const colors: Record<string, string> = {
    joalheria: '#f59e0b',
    optica: '#10b981',
    relojoaria: '#8b5cf6',
    bijuteria: '#ec4899',
    atacado: '#6366f1',
    outro: '#6b7280',
  }
  return colors[segmento || 'outro'] || '#6b7280'
}

function getCidadeCoordenadas(): Record<string, { lat: number; lng: number }> {
  return {
    'FLORIANOPOLIS': { lat: -27.5954, lng: -48.5480 },
    'JOINVILLE': { lat: -26.3045, lng: -48.8487 },
    'BLUMENAU': { lat: -26.9194, lng: -49.0661 },
    'SAO JOSE': { lat: -27.5969, lng: -48.6336 },
    'BALNEARIO CAMBORIU': { lat: -26.9928, lng: -48.6351 },
    'ITAJAI': { lat: -26.9078, lng: -48.6619 },
    'CRICIUMA': { lat: -28.6773, lng: -49.3693 },
    'CHAPECO': { lat: -27.0964, lng: -52.6159 },
    'PALHOCA': { lat: -27.6450, lng: -48.6703 },
    'ITAPEMA': { lat: -27.0907, lng: -48.6122 },
    'JARAGUA DO SUL': { lat: -26.4869, lng: -49.0669 },
    'LAGES': { lat: -27.8161, lng: -50.3264 },
    'BRUSQUE': { lat: -27.0987, lng: -48.9159 },
    'TUBARAO': { lat: -28.4668, lng: -49.0070 },
    'SAO BENTO DO SUL': { lat: -26.2503, lng: -49.3797 },
  }
}
  apenasComCoordenadas.value = false

function handleMarkerClick(marker: any) {
  console.log('Marker clicked:', marker)
  
  // Busca o cliente pelo ID do marker
  if (marker.clientId) {
    const client = clients.value.find((c: any) => c.id === marker.clientId)
    if (client) {
      selectedClient.value = client
    }
  }
}

function closeClientModal() {
  selectedClient.value = null
}

function filtrarPorCidade(cidade: string) {
  filtroCidade.value = cidade
  showFilters.value = true
  aplicarFiltros()
}

function aplicarFiltros() {
  // Filtros são reativos, então já estão aplicados
  console.log('Filtros aplicados:', { filtroSegmento: filtroSegmento.value, filtroCidade: filtroCidade.value, filtroPorte: filtroPorte.value })
}

function limparFiltros() {
  filtroSegmento.value = ''
  filtroCidade.value = ''
  filtroPorte.value = ''
}

function exportarClientes() {
  const dataStr = JSON.stringify(clientesFiltrados.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

  const exportFileDefaultName = `prospects-sc-${new Date().toISOString().split('T')[0]}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}
</script>
