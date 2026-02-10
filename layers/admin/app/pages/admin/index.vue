<template>
  <div class="min-h-screen">

    <div class="w-full px-3 py-4 lg:px-4 lg:py-6 space-y-3">
      <!-- Filtros + Stats -->
      <NLayer variant="paper" size="base" radius="soft" class="shadow-sm lg:shadow-lg relative">
        <div class="flex flex-col gap-3 lg:gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div class="col-span-1 sm:col-span-2 lg:col-span-1">
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
                <option value="joalheria">💎 Joalheria</option>
                <option value="relojoaria">⌚ Relojoaria</option>
                <option value="otica">👓 Ótica</option>
                <option value="outros">🏪 Outros</option>
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

        <div class="mt-4 grid !grid-cols-1 sm:!grid-cols-2 md:!grid-cols-3 lg:!grid-cols-5 gap-2 sm:gap-2 md:gap-3 lg:gap-3">
          <div class="bg-emerald-50 border border-emerald-100 rounded-lg p-3 lg:p-4">
            <NTypo size="xs" tone="muted" class="mb-1">Clientes</NTypo>
            <NTypo size="xl" weight="bold" class="tabular-nums text-emerald-500 lg:text-2xl">
              {{ visitedStats.total }}
            </NTypo>
            <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
              <span class="inline-flex items-center gap-1 text-emerald-700">
                <span class="h-2 w-2 rounded-full bg-emerald-500" />
                {{ visitedStats.clientes }} clientes
              </span>
              <span class="inline-flex items-center gap-1 text-blue-700">
                <span class="h-2 w-2 rounded-full bg-blue-500" />
                {{ visitedStats.comerciais }} comercial
              </span>
              <span class="inline-flex items-center gap-1 text-gray-700">
                <span class="h-2 w-2 rounded-full bg-gray-400" />
                {{ visitedStats.prospectos }} prospectos
              </span>
            </div>
            <div class="mt-2 pt-2 border-t border-emerald-100 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
              <span class="inline-flex items-center gap-1 text-emerald-700">
                <span class="h-2 w-2 rounded-full bg-emerald-500" />
                {{ visitedStats.ativosVerde }} ativo
              </span>
              <span class="inline-flex items-center gap-1 text-yellow-700">
                <span class="h-2 w-2 rounded-full bg-yellow-500" />
                {{ visitedStats.ativosAmarelo }} atenção
              </span>
              <span class="inline-flex items-center gap-1 text-red-700">
                <span class="h-2 w-2 rounded-full bg-red-500" />
                {{ visitedStats.ativosVermelho }} crítico
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


      <!-- Mapa + painel -->
      <div class="grid !grid-cols-1 md:!grid-cols-12 lg:!grid-cols-12 gap-4 lg:gap-6">
        <div class="md:!col-span-9 lg:!col-span-9 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-2xl overflow-hidden border border-gray-200 bg-white h-[450px] sm:h-[550px] lg:h-[700px] relative">
          <!-- Controles de visibilidade -->
          <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <button
              @click="mostrarClientes = !mostrarClientes"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all text-sm font-semibold',
                mostrarClientes
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              ]"
              :title="mostrarClientes ? 'Esconder clientes' : 'Mostrar clientes'"
            >
              <NIcon :name="mostrarClientes ? 'mdi:eye' : 'mdi:eye-off'" class="w-4 h-4" />
              <span>Clientes</span>
            </button>

            <button
              @click="mostrarComerciais = !mostrarComerciais"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all text-sm font-semibold',
                mostrarComerciais
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              ]"
              :title="mostrarComerciais ? 'Esconder comercial' : 'Mostrar comercial'"
            >
              <NIcon :name="mostrarComerciais ? 'mdi:eye' : 'mdi:eye-off'" class="w-4 h-4" />
              <span>Comercial</span>
            </button>

            <button
              @click="mostrarProspectos = !mostrarProspectos"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all text-sm font-semibold',
                mostrarProspectos
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              ]"
              :title="mostrarProspectos ? 'Esconder prospectos' : 'Mostrar prospectos'"
            >
              <NIcon :name="mostrarProspectos ? 'mdi:eye' : 'mdi:eye-off'" class="w-4 h-4" />
              <span>Prospectos</span>
            </button>
          </div>

          <div class="absolute bottom-4 right-4 z-10 w-42 rounded-lg border border-white/60 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
            <div class="flex items-center gap-2">
              <NTypo as="label" size="xs" weight="semibold" tone="muted">
                Ranking
              </NTypo>
              <select
                class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                :value="topRankSelectValue"
                @change="handleTopRankSelect"
              >
                <option
                  v-for="preset in rankPresets"
                  :key="`rank-${preset.value}`"
                  :value="preset.value"
                >
                  {{ preset.label }}
                </option>
              </select>
            </div>
          </div>

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
        <div class="hidden md:block lg:block md:!col-span-3 lg:!col-span-3 h-[700px]">
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

    
      <NLayer v-if="actionPlanTop.length" variant="paper" size="base" radius="soft" class="shadow-sm lg:shadow-lg">
        <div class="flex items-start justify-between gap-3">
          <div>
            <NTypo as="h2" size="sm" weight="bold">Plano de ação</NTypo>
            <NTypo size="xs" tone="muted" class="mt-0.5">
              Comece pelos críticos com maior impacto e follow-ups atrasados.
            </NTypo>
          </div>
          <NButton variant="outline" size="zs" leading-icon="mdi:refresh" @click="loadClients()">
            Atualizar
          </NButton>
        </div>

        <div class="mt-3 divide-y rounded-lg border border-gray-100 bg-white overflow-hidden">
          <NuxtLink
            v-for="task in actionPlanTop"
            :key="task.clientId"
            :to="`/admin/clients/${task.clientId}`"
            class="block w-full px-3 py-3 hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <NTypo weight="bold" class="truncate">{{ task.nome }}</NTypo>
                  <span
                    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    :class="metaForKey(task.statusKey).chipClass"
                  >
                    <span class="h-2 w-2 rounded-full" :class="metaForKey(task.statusKey).dotClass" />
                    {{ metaForKey(task.statusKey).emoji }} {{ metaForKey(task.statusKey).label }}
                  </span>
                  <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {{ task.priority }}
                  </span>
                </div>

                <NTypo size="xs" tone="muted" class="mt-1 truncate">
                  <span v-if="task.cidade">{{ task.cidade }}</span>
                  <span v-if="task.cidade && task.segmento"> • </span>
                  <span v-if="task.segmento">{{ task.segmento }}</span>
                  <span v-if="task.valueMetricLabel && task.valueMetric > 0"> • {{ task.valueMetricLabel }}</span>
                </NTypo>

                <NTypo v-if="task.reasons.length" size="xs" class="mt-1 text-slate-700">
                  {{ task.suggestedActionLabel }} • {{ task.reasons.join(' · ') }}
                </NTypo>
              </div>

              <div class="shrink-0 flex items-center gap-2" @click.prevent>
                <NButton
                  v-if="task.telefone"
                  variant="success"
                  size="zs"
                  leading-icon="mdi:whatsapp"
                  :href="whatsAppUrl(task.telefone, task.nome)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </NButton>
              </div>
            </div>
          </NuxtLink>
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
import type { Cliente } from '~/types/client'
import type { ClientDto } from '~/types/schemas'
import { useClientsApi } from '~/composables/useClientsApi'
import { useHistoricoClienteApi } from '~/composables/useHistoricoClienteApi'

interface MapData {
  markers: any[]
  polygons: any[]
  mapSettings: {
    center: { lat: number; lng: number }
    zoom: number
  }
}

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
const mostrarClientes = ref(true)
const mostrarComerciais = ref(true)
const mostrarProspectos = ref(false)
const topRankLimit = ref<number | null>(null)

const { fetchClients, patchClient, deleteClient } = useClientsApi()
const { createEvento } = useHistoricoClienteApi()
const { keyForClient, metaForClient, metaForKey } = useClientEngagementStatus()
const { topTasks } = useSellerActionPlan()
const currentUserId = 'user-app'

onMounted(async () => {
  try {
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
    const data = await fetchClients({ scope: 'portfolio', exclude: ['inativo'] })
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

    if (selectedClient.value && !(selectedClient.value as any)._isProspect) {
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

const portfolioClientes = computed(() => {
  if (filterTipo.value === 'inativo') {
    return clientes.value.filter((c) => (c as any)?.status === 'inativo')
  }
  return clientes.value.filter((c) => (c as any)?.status !== 'inativo')
})

const filteredClientes = computed(() => {
  let result = portfolioClientes.value

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

const MAX_PINS = 10000
const clientesParaPins = computed(() => {
  const geocoded = filteredClientes.value.filter(
    (c) => Number.isFinite((c as any).lat) && Number.isFinite((c as any).lng)
  )
  if (geocoded.length <= MAX_PINS) return geocoded
  return geocoded.slice(0, MAX_PINS)
})

function categorizeClient(cliente: any) {
  const temVendas = safeNumber(cliente?.sales?.totalAllTime) > 0 || 
                    safeNumber(cliente?.sales?.total12m) > 0 || 
                    safeNumber(cliente?.sales?.total90d) > 0
  const temContatos = Array.isArray(cliente?.visitas) && cliente.visitas.length > 0
  
  if (temVendas) return 'cliente' // Verde/Amarelo/Vermelho baseado no engajamento
  if (temContatos) return 'comercial' // Azul
  return 'prospecto' // Cinza
}

function markerColor(cliente: any) {
  const categoria = categorizeClient(cliente)
  
  if (categoria === 'prospecto') {
    return '#9CA3AF' // gray-400
  }
  
  if (categoria === 'comercial') {
    return '#3B82F6' // blue-500
  }
  
  // Cliente com vendas - usar lógica de engajamento
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

  const maxMetric = pairs.length && pairs[0] ? Math.max(1, pairs[0].metric) : 1
  return { rank, metric, totals, maxMetric }
})

const maxRankLimit = computed(() => pinMetricByClientId.value.rank.size || 0)
const topRankLabel = computed(() => {
  if (!maxRankLimit.value) return '--'
  if (topRankLimit.value === null) return 'Tudo'
  if (topRankLimit.value <= 0 || topRankLimit.value >= maxRankLimit.value) {
    return 'Tudo'
  }
  return `Top ${topRankLimit.value}`
})

const rankPresets = computed(() => {
  const maxValue = maxRankLimit.value
  if (!maxValue) return []
  const base = [3, 10, 50, 100].filter((n) => n < maxValue)
  return [...base, maxValue].map((value) => ({
    value,
    label: value === maxValue ? 'Tudo' : `Top ${value}`,
  }))
})

const topRankSelectValue = computed(() => {
  const maxValue = maxRankLimit.value
  if (!maxValue) return 0
  if (topRankLimit.value === null) return maxValue
  return Math.min(topRankLimit.value, maxValue)
})

watch(maxRankLimit, (maxValue) => {
  if (!maxValue) return
  if (topRankLimit.value === null) {
    topRankLimit.value = maxValue
  } else if (topRankLimit.value > maxValue) {
    topRankLimit.value = maxValue
  }
})

function setTopRank(value: number) {
  const maxValue = maxRankLimit.value || 0
  if (!maxValue) {
    topRankLimit.value = null
    return
  }
  topRankLimit.value = Math.min(Math.max(1, value), maxValue)
}

function handleTopRankSelect(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = Number(target.value)
  if (!Number.isFinite(value) || value <= 0) return
  setTopRank(value)
}

const createVisitedMarkers = computed(() => {
  const markers: any[] = []
  const meta = pinMetricByClientId.value
  const maxRank = maxRankLimit.value
  const limit = topRankLimit.value
  const shouldLimit = typeof limit === 'number' && limit > 0 && limit < maxRank

  for (const cliente of clientesParaPins.value) {
    const categoria = categorizeClient(cliente)
    
    // Filtrar por toggle
    if (categoria === 'cliente' && !mostrarClientes.value) continue
    if (categoria === 'comercial' && !mostrarComerciais.value) continue
    if (categoria === 'prospecto' && !mostrarProspectos.value) continue

    const id = (cliente as any).id
    const m = meta.metric.get(id) || 0
    const r = meta.rank.get(id) || 1

    if (shouldLimit && r > (limit as number)) continue
    
    markers.push({
      lat: cliente.lat,
      lng: cliente.lng,
      title: m > 0 ? `${cliente.nome} (#${r} · R$ ${formatCompactMoney(m)})` : `${cliente.nome} (#${r})`,
      value: r,
      color: markerColor(cliente),
      size: (() => {
        const minSize = categoria === 'prospecto' ? 18 : categoria === 'comercial' ? 22 : 24
        if (m <= 0) return minSize
        const ratio = Math.max(0, Math.min(1, m / meta.maxMetric))
        const base = minSize + Math.round(ratio * 18)
        if (r <= 3) return base + 6
        if (r <= 10) return base + 3
        return base
      })(),
      clientId: id,
      categoria,
    })
  }

  return markers
})

const carteiraBuckets = computed(() => {
  let clientes = 0 // Com vendas
  let comerciais = 0 // Só contatos
  let prospectos = 0 // Sem histórico
  let verde = 0
  let amarelo = 0
  let vermelho = 0

  for (const c of portfolioClientes.value as any[]) {
    const categoria = categorizeClient(c)
    
    if (categoria === 'cliente') {
      clientes++
      // Subcategorizar por engajamento
      const k = keyForClient(c)
      if (k === 'critico') vermelho++
      else if (k === 'atencao') amarelo++
      else verde++
    } else if (categoria === 'comercial') {
      comerciais++
    } else {
      prospectos++
    }
  }

  return {
    clientes,
    comerciais,
    prospectos,
    verde,
    amarelo,
    vermelho,
    total: clientes + comerciais + prospectos,
  }
})

const visitedStats = computed(() => {
  const carteira = carteiraBuckets.value
  return {
    total: carteira.total,
    clientes: carteira.clientes,
    comerciais: carteira.comerciais,
    prospectos: carteira.prospectos,
    ativosVerde: carteira.verde,
    ativosAmarelo: carteira.amarelo,
    ativosVermelho: carteira.vermelho,
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

const rankedPortfolioClientes = computed(() => {
  const list = portfolioClientes.value
  const maxRank = maxRankLimit.value
  const limit = topRankLimit.value
  const shouldLimit = typeof limit === 'number' && limit > 0 && limit < maxRank
  if (!shouldLimit) return list

  const rankMap = pinMetricByClientId.value.rank
  return list.filter((c: any) => {
    const r = rankMap.get(c.id) || 1
    return r <= (limit as number)
  })
})

const actionPlanTop = computed(() => topTasks(rankedPortfolioClientes.value, { limit: 8 }))

function whatsAppUrl(telefoneRaw: string, nome: string) {
  const telefone = String(telefoneRaw || '').replace(/\D/g, '')
  if (!telefone) return '#'
  const mensagem = encodeURIComponent(`Olá ${nome}! Sou representante comercial e gostaria de falar com você.`)
  return `https://wa.me/55${telefone}?text=${mensagem}`
}

function noop() {}

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

async function handleSubmitEditarCliente(updates: Record<string, unknown>) {
  if (!selectedClient.value) return

  const clientId = selectedClient.value.id
  const updated = await patchClient(clientId, updates as any)
  console.log('✅ Cliente atualizado:', { id: updated.id, lat: updated.lat, lng: updated.lng })
  
  await loadClients()
  
  // Re-selecionar o cliente após reload para garantir dados frescos
  const freshClient = clientes.value.find(c => c.id === clientId)
  if (freshClient) {
    selectedClient.value = freshClient
    console.log('🔄 Cliente re-selecionado:', { id: freshClient.id, lat: freshClient.lat, lng: freshClient.lng })
  }
  
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
