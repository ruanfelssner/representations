<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <NTypo as="h1" size="lg" weight="bold">Gestão de regiões comerciais</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">
            Selecione cidades no mapa, feche a região e vincule ao representante.
          </NTypo>
        </div>
        <div class="flex flex-wrap gap-2">
          <NButton
            variant="outline"
            size="xs"
            leading-icon="mdi:refresh"
            :disabled="isLoading"
            @click="loadAll()"
          >
            Atualizar
          </NButton>
          <NButton
            variant="outline"
            size="xs"
            leading-icon="mdi:broom"
            :disabled="!selectedCityIds.length"
            @click="clearSelection"
          >
            Limpar seleção
          </NButton>
          <NButton
            variant="outline"
            size="xs"
            leading-icon="mdi:plus"
            :disabled="!editor.id"
            @click="resetEditor({ keepSelection: true })"
          >
            Nova região
          </NButton>
        </div>
      </div>
    </NLayer>

    <div v-if="loadError" class="rounded-lg border border-red-200 bg-red-50 p-4">
      <NTypo size="sm" tone="danger" weight="semibold">{{ loadError }}</NTypo>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <NLayer variant="paper" size="base" radius="soft" class="p-4 space-y-3">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <NSelect v-model="cityStateFilter" label="Estado">
            <option value="">Todos</option>
            <option v-for="state in states" :key="state.id" :value="state.id">
              {{ state.uf }} - {{ state.nome }}
            </option>
          </NSelect>

          <NInput v-model="citySearchQuery" label="Buscar cidade" placeholder="Nome da cidade..." />

          <NInput
            v-model="regionSearchQuery"
            label="Buscar região"
            placeholder="Nome da região ou vendedor..."
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <NButton
            size="xs"
            :variant="mapInteractionMode === 'cities' ? 'primary' : 'outline'"
            leading-icon="mdi:map-marker-multiple"
            @click="mapInteractionMode = 'cities'"
          >
            Seleção por cidades
          </NButton>
          <NButton
            size="xs"
            :variant="mapInteractionMode === 'regions' ? 'primary' : 'outline'"
            leading-icon="mdi:vector-polygon"
            @click="mapInteractionMode = 'regions'"
          >
            Editar por região
          </NButton>
          <NButton
            v-if="mapInteractionMode === 'cities'"
            size="xs"
            variant="outline"
            leading-icon="mdi:check-all"
            :disabled="!filteredCities.length"
            @click="selectVisibleCities"
          >
            Selecionar visíveis
          </NButton>
        </div>

        <div class="rounded-lg border border-slate-200 overflow-hidden h-[500px]">
          <BrokerMaps
            :markers="activeMapMarkers"
            :polygons="activeMapPolygons"
            :cluster-mode="'off'"
            :zoom-on-polygon-click="false"
            :center-lat="mapCenter.lat"
            :center-lng="mapCenter.lng"
            :zoom="mapZoom"
            class="h-full"
            @polygon-click="handleMapPolygonClick"
            @marker-click="handleMapMarkerClick"
          />
        </div>

        <div class="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
          <span class="inline-flex items-center gap-1 text-slate-600">
            <span class="h-2.5 w-2.5 rounded-full bg-slate-400" />
            Disponível
          </span>
          <span class="inline-flex items-center gap-1 text-blue-700">
            <span class="h-2.5 w-2.5 rounded-full bg-blue-600" />
            Selecionada
          </span>
          <span class="inline-flex items-center gap-1 text-emerald-700">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            Área salva
          </span>
          <span
            v-if="mapInteractionMode === 'cities' && filteredCities.length > MAX_MAP_CITY_POLYGONS"
            class="text-amber-700"
          >
            Exibindo {{ MAX_MAP_CITY_POLYGONS }} cidades. Refine os filtros para ver mais.
          </span>
          <span v-if="mapInteractionMode === 'cities'" class="text-slate-500">
            Polígonos no mapa: {{ cityMapPolygons.length }} de {{ filteredCities.length }}
          </span>
        </div>
      </NLayer>

      <NLayer variant="paper" size="base" radius="soft" class="p-4 space-y-3">
        <div>
          <NTypo as="h2" size="sm" weight="bold">
            {{ editor.id ? 'Editar região' : 'Fechar região' }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-0.5">
            {{
              editor.id
                ? `ID: ${editor.id}`
                : 'Crie uma nova região a partir da seleção de cidades.'
            }}
          </NTypo>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <NInput v-model="editor.nome" label="Nome da região *" placeholder="Ex: Litoral Norte" />
          <NSelect v-model="editor.representanteUserId" label="Representante *">
            <option value="">Selecione...</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.nome }}
            </option>
          </NSelect>
          <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input v-model="editor.ativo" type="checkbox" class="h-4 w-4" />
            Região ativa
          </label>
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <NTypo size="xs" weight="semibold" tone="muted">Cidades selecionadas</NTypo>
            <span
              class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
            >
              {{ selectedCityIds.length }}
            </span>
          </div>
          <div v-if="!selectedCities.length" class="text-xs text-slate-500">
            Selecione cidades no mapa (modo "Seleção por cidades").
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <button
              v-for="city in selectedCities.slice(0, 80)"
              :key="city.id"
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              @click="toggleCity(city.id)"
            >
              {{ city.nome }}
              <NIcon name="mdi:close" class="h-3 w-3 text-slate-400" />
            </button>
          </div>
        </div>

        <div v-if="saveError" class="rounded-lg border border-red-200 bg-red-50 p-3">
          <NTypo size="sm" tone="danger">{{ saveError }}</NTypo>
        </div>
        <div v-if="saveSuccess" class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <NTypo size="sm" class="text-emerald-700">{{ saveSuccess }}</NTypo>
        </div>

        <div class="flex flex-wrap gap-2">
          <NButton
            variant="primary"
            leading-icon="mdi:content-save"
            :disabled="isSaving || !canSubmit"
            @click="saveRegion"
          >
            {{ isSaving ? 'Salvando...' : editor.id ? 'Salvar alterações' : 'Fechar região' }}
          </NButton>

          <NButton
            v-if="editor.id"
            variant="outline"
            leading-icon="mdi:close"
            :disabled="isSaving"
            @click="resetEditor({ keepSelection: false })"
          >
            Cancelar edição
          </NButton>

          <NButton
            v-if="editor.id"
            variant="danger"
            leading-icon="mdi:trash-can-outline"
            :disabled="isSaving"
            @click="removeRegion(editor.id)"
          >
            Excluir região
          </NButton>
        </div>
      </NLayer>
    </div>

    <NLayer variant="paper" size="base" radius="soft" class="p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <NTypo as="h2" size="sm" weight="bold">Regiões cadastradas</NTypo>
          <NTypo size="xs" tone="muted" class="mt-0.5">
            Clique em uma região para editar vendedor, nome ou cidades.
          </NTypo>
        </div>
        <span
          class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
        >
          {{ filteredRegions.length }} regiões
        </span>
      </div>

      <div v-if="isLoading" class="py-8 text-center">
        <NTypo size="sm" tone="muted">Carregando dados...</NTypo>
      </div>

      <div v-else-if="!filteredRegions.length" class="py-8 text-center">
        <NTypo size="sm" tone="muted">Nenhuma região encontrada.</NTypo>
      </div>

      <div v-else class="mt-3 divide-y rounded-lg border border-slate-200 bg-white overflow-hidden">
        <button
          v-for="region in filteredRegions"
          :key="region.id"
          type="button"
          class="flex w-full items-start justify-between gap-3 px-3 py-3 text-left hover:bg-slate-50"
          :class="editor.id === region.id ? 'bg-blue-50' : ''"
          @click="startEditRegion(region.id)"
        >
          <div class="min-w-0">
            <NTypo weight="bold" class="truncate">{{ region.nome }}</NTypo>
            <NTypo size="xs" tone="muted" class="mt-1">
              {{ representativeLabel(region.representanteUserId) }} •
              {{ regionCityCount(region) }} cidades
            </NTypo>
          </div>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
            :class="
              region.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
            "
          >
            {{ region.ativo ? 'Ativa' : 'Inativa' }}
          </span>
        </button>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { UserDtoSchema } from '~/types/schemas'
import type {
  TerritoryCityDto,
  TerritoryRegionDto,
  TerritoryStateDto,
  UserDto,
} from '~/types/schemas'
import { useCityGeo, type CityGeoFeature } from '~/composables/useCityGeo'
import { useTerritoryApi } from '~/composables/useTerritoryApi'

definePageMeta({
  layout: 'admin',
})

type RegionEditorState = {
  id: string | null
  nome: string
  representanteUserId: string
  ativo: boolean
}

type RegionMapPolygon = {
  id: string
  paths: Array<{ lat: number; lng: number }>
  strokeColor?: string
  strokeOpacity?: number
  strokeWeight?: number
  fillColor?: string
  fillOpacity?: number
  label?: string
  cityId?: string
  regionId?: string
}

const { fetchStates, fetchCities, fetchRegions } = useTerritoryApi()
const {
  cityNameKey,
  computePathsCenter,
  extractCityFeatures,
  fetchCityGeoJsonByUf,
  normalizeNumericId,
  normalizeText,
} = useCityGeo()

const MAX_MAP_CITY_POLYGONS = 1000

const states = ref<TerritoryStateDto[]>([])
const cities = ref<TerritoryCityDto[]>([])
const regions = ref<TerritoryRegionDto[]>([])
const users = ref<UserDto[]>([])
const geoCityFeatures = ref<CityGeoFeature[]>([])

const isLoading = ref(false)
const isSaving = ref(false)
const loadError = ref('')
const saveError = ref('')
const saveSuccess = ref('')

const cityStateFilter = ref('')
const citySearchQuery = ref('')
const regionSearchQuery = ref('')
const mapInteractionMode = ref<'cities' | 'regions'>('cities')
const selectedCityIds = ref<string[]>([])
const lastCityToggle = ref<{ id: string; at: number }>({ id: '', at: 0 })

const editor = ref<RegionEditorState>({
  id: null,
  nome: '',
  representanteUserId: '',
  ativo: true,
})

const UsersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserDtoSchema),
})

const selectedCityIdSet = computed(() => new Set(selectedCityIds.value))

const stateById = computed(() => {
  const map = new Map<string, TerritoryStateDto>()
  for (const state of states.value) map.set(state.id, state)
  return map
})

const geoCityFeatureById = computed(() => {
  const map = new Map<string, CityGeoFeature>()
  for (const feature of geoCityFeatures.value) {
    map.set(String(feature.id), feature)
  }
  return map
})

const geoCityFeatureByName = computed(() => {
  const map = new Map<string, CityGeoFeature>()
  for (const feature of geoCityFeatures.value) {
    map.set(cityNameKey(feature.normalizedName, feature.uf), feature)
    if (!map.has(feature.normalizedName)) {
      map.set(feature.normalizedName, feature)
    }
  }
  return map
})

const cityById = computed(() => {
  const map = new Map<string, TerritoryCityDto>()
  for (const city of cities.value) map.set(String(city.id), city)
  return map
})

function stateIdForUf(uf: string) {
  const normalizedUf = String(uf || '')
    .trim()
    .toUpperCase()
  if (!normalizedUf) return ''
  const existing = states.value.find(
    (state) =>
      String(state?.uf || '')
        .trim()
        .toUpperCase() === normalizedUf
  )
  return existing?.id || `UF:${normalizedUf}`
}

function buildFallbackStatesFromGeo(features: CityGeoFeature[]) {
  const ufs = Array.from(
    new Set(
      features
        .map((feature) =>
          String(feature?.uf || '')
            .trim()
            .toUpperCase()
        )
        .filter((value) => value.length === 2)
    )
  ).sort()

  return ufs.map((uf) => ({
    id: `UF:${uf}`,
    uf,
    nome: uf,
    ativo: true,
  })) as TerritoryStateDto[]
}

function buildFallbackCitiesFromGeo(features: CityGeoFeature[]) {
  return features
    .map((feature) => {
      const cityId = String(feature.id || '').trim()
      if (!cityId) return null

      return {
        id: cityId,
        stateId: stateIdForUf(feature.uf),
        nome: feature.name,
        normalizedName: feature.normalizedName,
        ibgeCode: normalizeNumericId(cityId) || undefined,
        centroid: feature.centroid,
        ativo: true,
      } as TerritoryCityDto
    })
    .filter((city): city is TerritoryCityDto => !!city)
}

const usersById = computed(() => {
  const map = new Map<string, UserDto>()
  for (const user of users.value) {
    map.set(String(user.id), user)
  }
  return map
})

const selectedCities = computed(() => {
  return selectedCityIds.value
    .map((cityId) => cityById.value.get(cityId))
    .filter((city): city is TerritoryCityDto => !!city)
})

const activeRegionCityOwnerByCityId = computed(() => {
  const map = new Map<string, string>()
  for (const region of regions.value) {
    if (region.ativo === false) continue
    const regionId = String(region.id || '').trim()
    if (!regionId) continue

    const cityIds = regionCityIds(region)
    for (const cityIdRaw of cityIds) {
      const cityId = String(cityIdRaw || '').trim()
      if (!cityId) continue
      if (!map.has(cityId)) {
        map.set(cityId, regionId)
      }

      const numericCityId = normalizeNumericId(cityId)
      if (numericCityId && !map.has(numericCityId)) {
        map.set(numericCityId, regionId)
      }
    }
  }
  return map
})

const filteredCities = computed(() => {
  const query = citySearchQuery.value.trim().toLowerCase()
  const selectedStateId = cityStateFilter.value

  return cities.value
    .filter((city) => {
      if (selectedStateId && city.stateId !== selectedStateId) return false
      if (!query) return true
      return city.nome.toLowerCase().includes(query)
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})

const mapCities = computed(() => {
  return filteredCities.value
    .filter((city) => {
      const paths = resolveCityPaths(city)
      return paths.length > 0
    })
    .slice(0, MAX_MAP_CITY_POLYGONS)
})

const filteredRegions = computed(() => {
  const query = regionSearchQuery.value.trim().toLowerCase()
  const list = [...regions.value].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  if (!query) return list

  return list.filter((region) => {
    const sellerName = representativeLabel((region as any).representanteUserId).toLowerCase()
    return region.nome.toLowerCase().includes(query) || sellerName.includes(query)
  })
})

function parseGeometryToPathList(geometry: any) {
  const parseInput = (value: any): any => {
    if (!value) return null
    if (typeof value === 'string') {
      try {
        return parseInput(JSON.parse(value))
      } catch {
        return null
      }
    }
    if (typeof value !== 'object') return null
    if (value.type === 'Feature' && value.geometry) {
      return parseInput(value.geometry)
    }
    return value
  }

  const parsed = parseInput(geometry)
  if (!parsed || typeof parsed !== 'object') return [] as Array<Array<{ lat: number; lng: number }>>

  const toPath = (ring: any) => {
    if (!Array.isArray(ring)) return [] as Array<{ lat: number; lng: number }>
    return ring
      .map((coord: any) => {
        if (Array.isArray(coord) && coord.length >= 2) {
          const first = Number(coord[0])
          const second = Number(coord[1])
          if (!Number.isFinite(first) || !Number.isFinite(second)) return null
          const maybeLngLat = { lat: second, lng: first }
          if (Math.abs(maybeLngLat.lat) <= 90 && Math.abs(maybeLngLat.lng) <= 180) {
            return maybeLngLat
          }
          const maybeLatLng = { lat: first, lng: second }
          if (Math.abs(maybeLatLng.lat) <= 90 && Math.abs(maybeLatLng.lng) <= 180) {
            return maybeLatLng
          }
          return null
        }
        if (coord && typeof coord === 'object') {
          const lat = Number((coord as any).lat)
          const lng = Number((coord as any).lng)
          if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
        }
        return null
      })
      .filter((coord): coord is { lat: number; lng: number } => !!coord)
  }

  if (parsed.type === 'Polygon' && Array.isArray(parsed.coordinates?.[0])) {
    const path = toPath(parsed.coordinates[0])
    return path.length ? [path] : []
  }

  if (parsed.type === 'MultiPolygon' && Array.isArray(parsed.coordinates)) {
    return parsed.coordinates
      .map((polygon: any) => toPath(Array.isArray(polygon) ? polygon[0] : null))
      .filter((path: Array<{ lat: number; lng: number }>) => path.length)
  }

  return [] as Array<Array<{ lat: number; lng: number }>>
}

function resolveCityPaths(city: TerritoryCityDto) {
  const pathsList = parseGeometryToPathList((city as any)?.geometry)
  if (pathsList.length) return pathsList[0]

  const stateUf = String(stateById.value.get(String(city.stateId))?.uf || '')
    .trim()
    .toUpperCase()
  const normalizedCityName = normalizeText(city.nome)

  const idCandidates = [
    String(city.id || '').trim(),
    normalizeNumericId(String(city.id || '')),
    normalizeNumericId(String((city as any)?.ibgeCode || '')),
  ].filter(Boolean)

  for (const id of idCandidates) {
    const feature = geoCityFeatureById.value.get(id)
    if (feature?.paths?.length) return feature.paths
  }

  if (normalizedCityName && stateUf) {
    const byUfName = geoCityFeatureByName.value.get(cityNameKey(normalizedCityName, stateUf))
    if (byUfName?.paths?.length) return byUfName.paths
  }

  if (normalizedCityName) {
    const byName = geoCityFeatureByName.value.get(normalizedCityName)
    if (byName?.paths?.length) return byName.paths
  }

  return [] as Array<{ lat: number; lng: number }>
}

function stableHash(value: string) {
  let hash = 0
  const source = String(value || '')
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(index)
    hash |= 0
  }
  return hash
}

const REGION_COLORS = ['#16A34A', '#2563EB', '#EA580C', '#7C3AED', '#0E7490', '#BE185D']

function regionColor(regionId: string, customColor?: string) {
  const normalized = String(customColor || '').trim()
  if (normalized) return normalized
  const seed = Math.abs(stableHash(regionId))
  return REGION_COLORS[seed % REGION_COLORS.length]
}

const cityMapPolygons = computed<RegionMapPolygon[]>(() => {
  return mapCities.value
    .map((city) => {
      const paths = resolveCityPaths(city)
      if (!paths.length) return null
      const cityId = String(city.id)
      const isSelected = selectedCityIdSet.value.has(cityId)
      const locked = isCityLocked(cityId)
      return {
        id: `city:${cityId}`,
        cityId,
        paths,
        strokeColor: isSelected ? '#1D4ED8' : locked ? '#047857' : '#64748B',
        strokeOpacity: isSelected ? 0.95 : locked ? 0.85 : 0.5,
        strokeWeight: isSelected ? 2.4 : locked ? 1.9 : 1.1,
        fillColor: isSelected ? '#3B82F6' : locked ? '#10B981' : '#94A3B8',
        fillOpacity: isSelected ? 0.34 : locked ? 0.22 : 0.08,
        label: `${city.nome} (${stateLabelById(city.stateId)})${locked ? ' • Área salva' : ''}`,
      } as RegionMapPolygon
    })
    .filter((polygon): polygon is RegionMapPolygon => !!polygon)
})

const regionMapPolygons = computed<RegionMapPolygon[]>(() => {
  const out: RegionMapPolygon[] = []
  for (const region of filteredRegions.value) {
    const regionId = String(region.id || '').trim()
    if (!regionId) continue
    const pathsList = parseGeometryToPathList((region as any).geometry)
    const color = regionColor(regionId, (region as any).color)

    for (let index = 0; index < pathsList.length; index += 1) {
      const path = pathsList[index]
      out.push({
        id: `region:${regionId}:${index}`,
        regionId,
        paths: path,
        strokeColor: color,
        strokeOpacity: 0.95,
        strokeWeight: editor.value.id === regionId ? 3 : 1.8,
        fillColor: color,
        fillOpacity: editor.value.id === regionId ? 0.3 : 0.15,
        label: `${region.nome} • ${representativeLabel((region as any).representanteUserId)}`,
      })
    }
  }
  return out
})

const activeMapPolygons = computed(() => {
  if (mapInteractionMode.value === 'regions') return regionMapPolygons.value
  return cityMapPolygons.value
})

const activeMapMarkers = computed(() => {
  if (mapInteractionMode.value !== 'regions') return []

  const markers: Array<{
    lat: number
    lng: number
    value: number
    color: string
    regionScopeId: string
    title: string
  }> = []

  for (const region of filteredRegions.value) {
    const regionId = String(region.id || '').trim()
    if (!regionId) continue
    const pathsList = parseGeometryToPathList((region as any).geometry)
    const path = pathsList[0]
    if (!path?.length) continue
    const centroid = computePathsCenter(path)
    if (!centroid) continue

    const cityIds = regionCityIds(region)
    markers.push({
      lat: centroid.lat,
      lng: centroid.lng,
      value: Math.max(1, cityIds.length),
      color: regionColor(regionId, (region as any).color),
      regionScopeId: regionId,
      title: `${region.nome} • ${representativeLabel((region as any).representanteUserId)}`,
    })
  }

  return markers
})

const mapCenter = computed(() => {
  const polygons = activeMapPolygons.value
  if (!polygons.length) return { lat: -27.5954, lng: -48.548 }

  if (mapInteractionMode.value === 'cities') {
    const selected = polygons.find((polygon) =>
      selectedCityIdSet.value.has(String(polygon.cityId || '').trim())
    )
    if (selected) {
      const center = computePathsCenter(selected.paths)
      if (center) return center
    }
  }

  if (mapInteractionMode.value === 'regions' && editor.value.id) {
    const selected = polygons.find((polygon) => polygon.regionId === editor.value.id)
    if (selected) {
      const center = computePathsCenter(selected.paths)
      if (center) return center
    }
  }

  const first = polygons[0]
  const center = computePathsCenter(first.paths)
  if (center) return center
  return { lat: -27.5954, lng: -48.548 }
})

const mapZoom = computed(() => {
  if (mapInteractionMode.value === 'regions') return 6
  if (cityStateFilter.value) return 7
  return 6
})

const canSubmit = computed(() => {
  if (!selectedCityIds.value.length) return false
  if (!editor.value.nome.trim()) return false
  if (!editor.value.representanteUserId.trim()) return false
  return true
})

watch(
  () => states.value,
  (rows) => {
    if (!rows.length || cityStateFilter.value) return
    const sc = rows.find((state) => state.uf === 'SC')
    if (sc) {
      cityStateFilter.value = sc.id
      return
    }
    cityStateFilter.value = rows[0]?.id || ''
  },
  { immediate: true }
)

function stateLabelById(stateId: string) {
  const state = stateById.value.get(String(stateId))
  if (!state) return stateId
  return `${state.uf} - ${state.nome}`
}

function representativeLabel(representanteUserId: unknown) {
  const id = String(representanteUserId || '').trim()
  if (!id) return 'Sem representante'
  return usersById.value.get(id)?.nome || `ID ${id}`
}

function regionCityIds(region: TerritoryRegionDto) {
  const raw = Array.isArray((region as any)?.cityIds) ? (region as any).cityIds : []
  return raw.map((value: unknown) => String(value || '').trim()).filter(Boolean)
}

function regionCityCount(region: TerritoryRegionDto) {
  return regionCityIds(region).length
}

function cityOwnerRegionId(cityId: string) {
  const id = String(cityId || '').trim()
  if (!id) return ''
  const direct = activeRegionCityOwnerByCityId.value.get(id)
  if (direct) return direct

  const numeric = normalizeNumericId(id)
  if (!numeric) return ''
  return activeRegionCityOwnerByCityId.value.get(numeric) || ''
}

function isCityLocked(cityId: string) {
  const ownerRegionId = cityOwnerRegionId(cityId)
  if (!ownerRegionId) return false
  if (editor.value.id && ownerRegionId === editor.value.id) return false
  return true
}

function toggleCity(cityId: string) {
  const id = String(cityId || '').trim()
  if (!id) return

  if (isCityLocked(id)) return

  const now = Date.now()
  if (lastCityToggle.value.id === id && now - lastCityToggle.value.at < 450) {
    return
  }
  lastCityToggle.value = { id, at: now }

  if (selectedCityIdSet.value.has(id)) {
    selectedCityIds.value = selectedCityIds.value.filter((value) => value !== id)
    return
  }
  selectedCityIds.value = [...selectedCityIds.value, id]
}

function selectVisibleCities() {
  const next = new Set(selectedCityIds.value)
  let blockedCount = 0
  for (const city of filteredCities.value) {
    const cityId = String(city.id)
    if (isCityLocked(cityId)) {
      blockedCount += 1
      continue
    }
    next.add(cityId)
  }
  selectedCityIds.value = Array.from(next)
  if (blockedCount > 0) {
    saveError.value = `${blockedCount} cidade(s) já vinculada(s) a outra região ativa e foram ignoradas.`
  } else {
    saveError.value = ''
  }
}

function clearSelection() {
  selectedCityIds.value = []
}

function resetEditor(opts?: { keepSelection?: boolean }) {
  editor.value = {
    id: null,
    nome: '',
    representanteUserId: '',
    ativo: true,
  }
  if (!opts?.keepSelection) {
    selectedCityIds.value = []
  } else {
    selectedCityIds.value = selectedCityIds.value.filter((cityId) => !isCityLocked(cityId))
  }
  saveError.value = ''
  saveSuccess.value = ''
  mapInteractionMode.value = 'cities'
}

function startEditRegion(regionId: string) {
  const region = regions.value.find((item) => String(item.id) === String(regionId))
  if (!region) return

  editor.value = {
    id: String(region.id),
    nome: region.nome || '',
    representanteUserId: String((region as any).representanteUserId || ''),
    ativo: region.ativo !== false,
  }
  selectedCityIds.value = regionCityIds(region)
  saveError.value = ''
  saveSuccess.value = ''
  mapInteractionMode.value = 'cities'
}

function resolveRegionIdFromMapEntity(input: any) {
  const direct = String(input?.regionId || input?.regionScopeId || '').trim()
  if (direct) return direct

  const rawId = String(input?.id || '').trim()
  if (!rawId) return ''
  if (rawId.startsWith('region:')) {
    const [, regionId = ''] = rawId.split(':')
    return regionId.trim()
  }
  return ''
}

function pointsAreClose(
  a: { lat: number; lng: number } | null | undefined,
  b: { lat: number; lng: number } | null | undefined,
  tolerance = 0.0002
) {
  if (!a || !b) return false
  return Math.abs(a.lat - b.lat) <= tolerance && Math.abs(a.lng - b.lng) <= tolerance
}

function resolveCityIdFromMapEntity(input: any) {
  const direct = String(input?.cityId || '').trim()
  if (direct) return direct

  const rawId = String(input?.id || '').trim()
  if (!rawId) {
    const labelOnly = String(input?.label || '').trim()
    if (!labelOnly) return ''
    const cityName = normalizeText(labelOnly.split('(')[0]?.split('•')[0] || '')
    if (!cityName) return ''
    const candidate = (filteredCities.value.length ? filteredCities.value : cities.value).find(
      (city) => normalizeText(city.nome) === cityName
    )
    return candidate ? String(candidate.id) : ''
  }
  if (rawId.startsWith('city:')) {
    return rawId.slice('city:'.length).trim()
  }
  if (cityById.value.has(rawId)) {
    return rawId
  }
  if (normalizeNumericId(rawId) && cityById.value.has(normalizeNumericId(rawId))) {
    return normalizeNumericId(rawId)
  }

  const label = String(input?.label || '').trim()
  const cityName = normalizeText(label.split('(')[0]?.split('•')[0] || '')
  if (!cityName) return ''
  const candidate = (filteredCities.value.length ? filteredCities.value : cities.value).find(
    (city) => normalizeText(city.nome) === cityName
  )
  if (candidate) return String(candidate.id)

  const clickedPaths = Array.isArray(input?.paths) ? input.paths : []
  const clickedFirst = clickedPaths.length ? clickedPaths[0] : null
  const clickedCenter = clickedPaths.length ? computePathsCenter(clickedPaths) : null
  if (clickedFirst || clickedCenter) {
    const sourceCities = mapCities.value.length
      ? mapCities.value
      : filteredCities.value.length
        ? filteredCities.value
        : cities.value

    for (const city of sourceCities) {
      const cityPaths = resolveCityPaths(city)
      if (!cityPaths.length) continue
      const cityFirst = cityPaths[0]
      const cityCenter = computePathsCenter(cityPaths)
      if (pointsAreClose(clickedFirst, cityFirst) || pointsAreClose(clickedCenter, cityCenter)) {
        return String(city.id)
      }
    }
  }

  return ''
}

function handleMapPolygonClick(polygon: any) {
  if (mapInteractionMode.value === 'regions') {
    const regionId = resolveRegionIdFromMapEntity(polygon)
    if (!regionId) return
    startEditRegion(regionId)
    return
  }

  const cityId = resolveCityIdFromMapEntity(polygon)
  if (!cityId) return
  if (isCityLocked(cityId)) {
    const ownerRegionId = cityOwnerRegionId(cityId)
    const ownerRegion = regions.value.find((region) => String(region.id) === ownerRegionId)
    saveError.value = ownerRegion
      ? `Cidade já vinculada à região "${ownerRegion.nome}".`
      : 'Cidade já vinculada a outra região ativa.'
    return
  }
  saveError.value = ''
  toggleCity(cityId)
}

function handleMapMarkerClick(marker: any) {
  if (mapInteractionMode.value !== 'regions') return
  const regionId = resolveRegionIdFromMapEntity(marker)
  if (!regionId) return
  startEditRegion(regionId)
}

async function loadGeoCityFeatures(stateRows: TerritoryStateDto[]) {
  const ufs = Array.from(
    new Set(
      stateRows
        .map((state) =>
          String(state?.uf || '')
            .trim()
            .toUpperCase()
        )
        .filter((value) => value.length === 2)
    )
  )

  const targetUfs = ufs.length ? Array.from(new Set([...ufs, 'SC'])) : ['SC']

  const featuresByUf = await Promise.all(
    targetUfs.map(async (uf) => {
      const payload = await fetchCityGeoJsonByUf(uf)
      return extractCityFeatures(payload, uf)
    })
  )

  geoCityFeatures.value = featuresByUf.flat()
}

function extractErrorMessage(error: any, fallback: string) {
  return error?.data?.statusMessage || error?.data?.message || error?.message || fallback
}

async function loadAll() {
  isLoading.value = true
  loadError.value = ''

  const [statesResult, citiesResult, regionsResult, usersResult] = await Promise.allSettled([
    fetchStates({ active: true, withGeometry: true, limit: 200 }),
    fetchCities({ active: true, withGeometry: true, limit: 10000 }),
    fetchRegions({ withGeometry: true, limit: 1000 }),
    $fetch('/api/v1/users?role=vendedor&ativo=true'),
  ])

  const errors: string[] = []

  if (statesResult.status === 'fulfilled') {
    states.value = statesResult.value
  } else {
    states.value = []
  }

  try {
    await loadGeoCityFeatures(states.value)
  } catch (error: any) {
    geoCityFeatures.value = []
    errors.push(`GeoJSON cidades: ${extractErrorMessage(error, 'falha ao carregar')}`)
  }

  const stateFallbackApplied = !states.value.length && geoCityFeatures.value.length > 0
  if (stateFallbackApplied) {
    states.value = buildFallbackStatesFromGeo(geoCityFeatures.value)
  }

  if (statesResult.status === 'rejected' && !stateFallbackApplied) {
    errors.push(`Estados: ${extractErrorMessage(statesResult.reason, 'falha ao carregar')}`)
  }

  if (citiesResult.status === 'fulfilled') {
    cities.value = citiesResult.value
  } else {
    cities.value = []
  }

  const cityFallbackApplied = !cities.value.length && geoCityFeatures.value.length > 0
  if (cityFallbackApplied) {
    cities.value = buildFallbackCitiesFromGeo(geoCityFeatures.value)
  }

  if (citiesResult.status === 'rejected' && !cityFallbackApplied) {
    errors.push(`Cidades: ${extractErrorMessage(citiesResult.reason, 'falha ao carregar')}`)
  }

  if (regionsResult.status === 'fulfilled') {
    regions.value = regionsResult.value
  } else {
    regions.value = []
    errors.push(`Regiões: ${extractErrorMessage(regionsResult.reason, 'falha ao carregar')}`)
  }

  if (usersResult.status === 'fulfilled') {
    try {
      users.value = UsersResponseSchema.parse(usersResult.value).data
    } catch (error: any) {
      users.value = []
      errors.push(`Vendedores: ${extractErrorMessage(error, 'resposta inválida')}`)
    }
  } else {
    users.value = []
    errors.push(`Vendedores: ${extractErrorMessage(usersResult.reason, 'falha ao carregar')}`)
  }

  loadError.value = errors.join(' | ')
  isLoading.value = false
}

async function saveRegion() {
  saveError.value = ''
  saveSuccess.value = ''

  if (!selectedCityIds.value.length) {
    saveError.value = 'Selecione ao menos uma cidade para a região.'
    return
  }
  if (!editor.value.nome.trim()) {
    saveError.value = 'Informe o nome da região.'
    return
  }
  if (!editor.value.representanteUserId.trim()) {
    saveError.value = 'Selecione o representante da região.'
    return
  }

  isSaving.value = true
  try {
    const payload = {
      nome: editor.value.nome.trim(),
      representanteUserId: editor.value.representanteUserId.trim(),
      ativo: Boolean(editor.value.ativo),
      cityIds: selectedCityIds.value,
    }

    if (editor.value.id) {
      await $fetch(`/api/v1/regions/${encodeURIComponent(editor.value.id)}`, {
        method: 'PATCH',
        body: payload,
      })
      saveSuccess.value = 'Região atualizada com sucesso.'
      const editedId = editor.value.id
      await loadAll()
      if (editedId) startEditRegion(editedId)
      return
    }

    await $fetch('/api/v1/regions', {
      method: 'POST',
      body: payload,
    })

    saveSuccess.value = 'Região criada com sucesso.'
    await loadAll()
    resetEditor({ keepSelection: false })
  } catch (error: any) {
    saveError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.message ||
      'Falha ao salvar região.'
  } finally {
    isSaving.value = false
  }
}

async function removeRegion(regionId: string) {
  const id = String(regionId || '').trim()
  if (!id) return

  const ok = confirm('Deseja remover esta região?')
  if (!ok) return

  saveError.value = ''
  saveSuccess.value = ''
  isSaving.value = true

  try {
    await $fetch(`/api/v1/regions/${encodeURIComponent(id)}`, { method: 'DELETE' })
    await loadAll()

    if (editor.value.id === id) {
      resetEditor({ keepSelection: false })
    }

    saveSuccess.value = 'Região removida com sucesso.'
  } catch (error: any) {
    saveError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.message ||
      'Falha ao remover região.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadAll()
})
</script>
