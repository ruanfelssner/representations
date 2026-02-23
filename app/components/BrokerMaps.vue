<template>
  <div class="flex h-full w-full">
    <div class="relative h-full w-full">
      <ClientOnly>
        <GoogleMap
          ref="googleMapsRef"
          map-id="FF_BROKER_MAP"
          class="h-full w-full"
          :api-key="apiKey"
          :center="mapCenter"
          :zoom="mapZoom"
          :libraries="['marker']"
          :disable-default-ui="true"
          gesture-handling="greedy"
          :styles="mapStyles"
        >
          <template v-if="showPins">
            <CustomMarker
              v-for="marker in renderedMarkers"
              :key="markerKey(marker)"
              :options="{
                position: { lat: marker.lat, lng: marker.lng },
                title: marker.title || `${marker.value} seguros`,
              }"
              @click.stop="handleMarkerClick(marker)"
            >
              <div class="flex flex-col items-center gap-1">
                <div
                  :style="markerStyle(marker)"
                  :class="[
                    'flex items-center justify-center font-bold border border-white/70 rounded-full',
                    'shadow-[0_10px_24px_rgba(0,0,0,0.2)] hover:scale-110 transition-transform duration-200 ease-in-out',
                    markerTextClass(marker),
                    markerRingClass(marker),
                    markerBounceClass(marker),
                  ]"
                  @pointerdown.stop
                  @mousedown.stop
                  @touchstart.stop
                >
                  {{ marker.value }}
                </div>
                <div
                  v-if="showMarkerBottomLabel(marker)"
                  class="pointer-events-none max-w-[156px] truncate rounded-md border border-slate-200 bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm"
                >
                  {{ marker.bottomLabel }}
                </div>
              </div>
            </CustomMarker>
          </template>

          <template v-if="showPolygons">
            <Polygon
              v-for="polygon in polygons"
              :key="`polygon-${polygon.id}`"
              :options="polygonOptions(polygon)"
              @click="handlePolygonClick(polygon)"
            />
          </template>
        </GoogleMap>
      </ClientOnly>

      <div
        class="absolute top-2 right-3 flex flex-col gap-2 bg-main-primary rounded-md shadow-sm py-1 px-1"
      >
        <NButton
          :icon="showPins ? 'mdi:map-marker-off' : 'mdi:map-marker'"
          trailing
          icon-button
          @click="showPins = !showPins"
        />
        <NButton
          :icon="showPolygons ? 'tabler:map-off' : 'tabler:map'"
          trailing
          icon-button
          @click="showPolygons = !showPolygons"
        />
        <NButton icon="mdi:plus" trailing icon-button @click="zoomIn" />
        <NButton icon="mdi:minus" trailing icon-button @click="zoomOut" />
        <NButton
          :icon="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
          trailing
          icon-button
          @click="toggleFullscreen"
        />
        <slot name="after-controls" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRuntimeConfig } from '#imports'
import { CustomMarker, GoogleMap, Polygon } from 'vue3-google-map'

type LatLng = { lat: number; lng: number }

type MapMarker = {
  lat: number
  lng: number
  title?: string
  bottomLabel?: string
  value?: number | string
  color?: string
  size?: number
  categoria?: string
  bounce?: boolean
  cluster?: boolean
  count?: number
  clusterId?: string
  clientId?: string | number
  cityScopeId?: string
  regionScopeId?: string
  kind?: string
}

type MapPolygon = {
  id?: string
  paths: LatLng[]
  strokeColor?: string
  strokeOpacity?: number
  strokeWeight?: number
  fillColor?: string
  fillOpacity?: number
  metrics?: {
    seguros: number
    clientes: number
    corretores: number
  }
  label?: string
}

type HeatmapPoint = LatLng & { weight?: number }
type HeatmapOptions = { radius?: number; opacity?: number }

type Props = {
  markers?: MapMarker[]
  polygons?: MapPolygon[]
  selectedPolygonId?: string | null
  clusterMode?: 'off' | 'prospects' | 'all'
  heatmapData?: HeatmapPoint[]
  heatmapOptions?: HeatmapOptions
  centerLat?: number
  centerLng?: number
  zoom?: number
  focusMarkerKey?: string
  zoomOnPolygonClick?: boolean
  disableDefaultUI?: boolean
  onMarkerClick?: (marker: MapMarker) => void
  onPolygonClick?: (polygon: MapPolygon) => void
}

const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
  polygons: () => [],
  selectedPolygonId: null,
  clusterMode: 'prospects',
  heatmapData: () => [],
  heatmapOptions: () => ({ radius: 20, opacity: 0.6 }),
  centerLat: -15.7942,
  centerLng: -47.8822,
  zoom: 5,
  focusMarkerKey: '',
  zoomOnPolygonClick: true,
  disableDefaultUI: false,
})

const emit = defineEmits<{
  'marker-click': [marker: MapMarker]
  'polygon-click': [polygon: MapPolygon]
}>()

const config = useRuntimeConfig()
const apiKey = config.public.googleMapsApiKey

const googleMapsRef = ref<InstanceType<typeof GoogleMap> | null>(null)
const showPins = ref(true)
const showPolygons = ref(true)
const isFullscreen = ref(false)
const currentZoom = ref(props.zoom)
const lastPolygonClick = ref<{ key: string; at: number }>({ key: '', at: 0 })

function zoomIn() {
  const mapInstance = googleMapsRef.value?.map
  if (mapInstance) {
    mapInstance.setZoom(mapInstance.getZoom() + 1)
  }
}

function zoomOut() {
  const mapInstance = googleMapsRef.value?.map
  if (mapInstance) {
    mapInstance.setZoom(mapInstance.getZoom() - 1)
  }
}

function toggleFullscreen() {
  const mapEl = googleMapsRef.value?.$el ?? null
  if (!mapEl) return
  if (!document.fullscreenElement) {
    ;(mapEl as HTMLElement).requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const mapCenter = computed(() => ({
  lat: props.centerLat,
  lng: props.centerLng,
}))

const mapZoom = computed(() => props.zoom)

const mapStyles = [
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B7280' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#D1D5DB', weight: 1 }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E5E7EB', weight: 0.5 }],
  },
  { featureType: 'landscape', elementType: 'geometry.fill', stylers: [{ color: '#fff' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#DBEAFE' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#FFFFFF' }] },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E5E7EB', weight: 0.5 }],
  },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#FEF3C7' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#F59E0B', weight: 1 }],
  },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
]

function markerStyle(marker: MapMarker) {
  const rawSize = typeof marker.size === 'number' ? marker.size : marker.cluster ? 20 : 22
  const size = Math.max(14, Math.min(rawSize, marker.cluster ? 30 : 38))
  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: marker.color || '#6B7280',
    fontSize: `${Math.max(9, Math.round(size * 0.38))}px`,
  }
}

function markerTextClass(marker: MapMarker) {
  if (marker.cluster) return 'text-slate-800'
  const color = typeof marker.color === 'string' ? marker.color : '#6B7280'
  return isLightColor(color) ? 'text-slate-900' : 'text-white'
}

function markerRingClass(marker: MapMarker) {
  if (marker.cluster) return 'ring-2 ring-white/90'
  const rank = Number(marker.value)
  if (Number.isFinite(rank) && rank > 0 && rank <= 10) {
    return 'ring-4 ring-white/95 shadow-[0_14px_30px_rgba(0,0,0,0.28)]'
  }
  return 'ring-2 ring-white/80'
}

function markerBounceClass(marker: MapMarker) {
  return marker.bounce ? 'animate-bounce' : ''
}

function showMarkerBottomLabel(marker: MapMarker) {
  if (marker.cluster) return false
  return typeof marker.bottomLabel === 'string' && marker.bottomLabel.trim().length > 0
}

function isLightColor(hexColor: string) {
  const hex = hexColor.replace('#', '')
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  if ([r, g, b].some((v) => Number.isNaN(v))) return false
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.6
}

function polygonOptions(polygon: MapPolygon) {
  const isSelected =
    typeof props.selectedPolygonId === 'string' &&
    props.selectedPolygonId.trim() !== '' &&
    String(polygon.id || '') === props.selectedPolygonId

  const strokeOpacity = polygon.strokeOpacity ?? 0.8
  const strokeWeight = polygon.strokeWeight ?? 2
  const fillOpacity = polygon.fillOpacity ?? 0.15

  return {
    paths: polygon.paths,
    strokeColor: polygon.strokeColor || '#6B7280',
    strokeOpacity: isSelected ? Math.max(strokeOpacity, 1) : strokeOpacity,
    strokeWeight: isSelected ? Math.max(3, strokeWeight) : strokeWeight,
    fillColor: polygon.fillColor || polygon.strokeColor || '#6B7280',
    fillOpacity: fillOpacity,
    clickable: true,
  }
}

function handleMarkerClick(marker: MapMarker) {
  if (marker.cluster) {
    const mapInstance = googleMapsRef.value?.map
    if (mapInstance) {
      const nextZoom = Math.min((mapInstance.getZoom() || currentZoom.value || 10) + 2, 14)
      mapInstance.panTo({ lat: marker.lat, lng: marker.lng })
      mapInstance.setZoom(nextZoom)
    }
    return
  }
  emit('marker-click', marker)
  props.onMarkerClick?.(marker)
}

function handlePolygonClick(polygon: MapPolygon) {
  console.log('Polygon clicked:', polygon)
  const baseKey = String(polygon.id || '').trim()
  const firstPoint = polygon.paths?.[0]
  const fallbackKey = firstPoint ? `${firstPoint.lat.toFixed(6)}:${firstPoint.lng.toFixed(6)}` : ''
  const clickKey = baseKey || fallbackKey
  const now = Date.now()
  if (
    clickKey &&
    lastPolygonClick.value.key === clickKey &&
    now - lastPolygonClick.value.at < 250
  ) {
    return
  }
  lastPolygonClick.value = { key: clickKey, at: now }

  emit('polygon-click', polygon)
  props.onPolygonClick?.(polygon)
  if (props.zoomOnPolygonClick) {
    zoomToPolygon(polygon.paths)
  }
}

function resolveFocusEntityKey(rawKey: string) {
  const key = String(rawKey || '').trim()
  if (!key) return ''
  return key.split('#')[0] || ''
}

function markerEntityKey(marker: MapMarker) {
  if (marker.clientId !== undefined && marker.clientId !== null && marker.clientId !== '') {
    return `client:${String(marker.clientId)}`
  }
  if (marker.cityScopeId) {
    return `city:${String(marker.cityScopeId)}`
  }
  if (marker.regionScopeId) {
    return `region:${String(marker.regionScopeId)}`
  }
  return ''
}

const lastHandledFocusRequestKey = ref('')

function focusRequestedMarker() {
  const requestKey = String(props.focusMarkerKey || '').trim()
  if (!requestKey) {
    lastHandledFocusRequestKey.value = ''
    return
  }
  if (requestKey === lastHandledFocusRequestKey.value) return

  const entityKey = resolveFocusEntityKey(requestKey)
  if (!entityKey) return

  const marker = (props.markers || []).find((item) => markerEntityKey(item) === entityKey)
  if (!marker) return

  const mapInstance = googleMapsRef.value?.map
  const apiInstance = googleMapsRef.value?.api
  if (!mapInstance) return

  if (apiInstance) {
    const bounds = new apiInstance.LatLngBounds()
    const padding = 0.03
    bounds.extend({ lat: marker.lat - padding, lng: marker.lng - padding })
    bounds.extend({ lat: marker.lat + padding, lng: marker.lng + padding })
    mapInstance.fitBounds(bounds)

    const listener = mapInstance.addListener('bounds_changed', () => {
      const current = mapInstance.getZoom()
      if (current && current > 13) {
        mapInstance.setZoom(13)
      }
      apiInstance.event.removeListener(listener)
    })
  } else {
    mapInstance.panTo({ lat: marker.lat, lng: marker.lng })
  }

  lastHandledFocusRequestKey.value = requestKey
}

function zoomToPolygon(paths: LatLng[]) {
  const mapInstance = googleMapsRef.value?.map
  const apiInstance = googleMapsRef.value?.api
  if (!mapInstance || !apiInstance) return
  const bounds = new apiInstance.LatLngBounds()
  paths.forEach((p) => bounds.extend(p))
  mapInstance.fitBounds(bounds)
  const listener = mapInstance.addListener('bounds_changed', () => {
    const currentZoom = mapInstance.getZoom()
    if (currentZoom && currentZoom > 10) {
      mapInstance.setZoom(10)
    }
    apiInstance.event.removeListener(listener)
  })
}

function fitBoundsToData() {
  const mapInstance = (googleMapsRef.value as any)?.map
  const apiInstance = (googleMapsRef.value as any)?.api
  if (!mapInstance || !apiInstance) return
  const bounds = new apiInstance.LatLngBounds()
  let hasData = false
  props.markers.forEach((m) => {
    bounds.extend({ lat: m.lat, lng: m.lng })
    hasData = true
  })
  props.polygons.forEach((p) =>
    p.paths.forEach((path) => {
      bounds.extend(path)
      hasData = true
    })
  )
  if (hasData) {
    mapInstance.fitBounds(bounds)
    const listener = mapInstance.addListener('bounds_changed', () => {
      const currentZoom = mapInstance.getZoom()
      if (currentZoom && currentZoom > 10) {
        mapInstance.setZoom(10)
      }
      apiInstance.event.removeListener(listener)
    })
  }
}

const fitBoundsKey = computed(() => {
  const markersKey = props.markers
    .map((m) => `${Number(m.lat).toFixed(6)},${Number(m.lng).toFixed(6)}`)
    .join('|')

  const polygonsKey = props.polygons
    .map((p) => {
      const first = p.paths?.[0]
      const firstKey = first
        ? `${Number(first.lat).toFixed(6)},${Number(first.lng).toFixed(6)}`
        : ''
      return `${p.id || ''}:${p.paths?.length || 0}:${firstKey}`
    })
    .join('|')

  return `${markersKey}||${polygonsKey}`
})

watch(
  () => fitBoundsKey.value,
  () => {
    nextTick(() => fitBoundsToData())
  },
  { flush: 'post' }
)

watch(
  () => (googleMapsRef.value as any)?.ready,
  (isReady) => {
    if (!isReady) return
    nextTick(() => fitBoundsToData())
    const mapInstance = googleMapsRef.value?.map
    if (!mapInstance) return
    currentZoom.value = mapInstance.getZoom() || props.zoom
    mapInstance.addListener('zoom_changed', () => {
      currentZoom.value = mapInstance.getZoom() || props.zoom
    })
  },
  { immediate: true }
)

watch(
  () => [props.focusMarkerKey, props.markers.length, (googleMapsRef.value as any)?.ready],
  () => {
    nextTick(() => focusRequestedMarker())
  },
  { flush: 'post' }
)

const renderedMarkers = computed(() => {
  const list = props.markers || []
  if (!list.length) return list

  const clusterMode = props.clusterMode
  if (clusterMode === 'off') return list

  const zoom = currentZoom.value || props.zoom
  if (zoom >= 11) return list

  if (clusterMode === 'all') {
    return buildClusters(list, zoom)
  }

  const prospects = list.filter((m) => m.categoria === 'prospecto')
  if (!prospects.length) return list

  const nonProspects = list.filter((m) => m.categoria !== 'prospecto')
  return [...nonProspects, ...buildClusters(prospects, zoom)]
})

function buildClusters(markers: MapMarker[], zoom: number): MapMarker[] {
  const gridPx = zoom < 7 ? 90 : zoom < 9 ? 75 : 60
  const scale = 256 * Math.pow(2, zoom)
  const gridDeg = (gridPx * 360) / scale
  const buckets = new Map<string, { lat: number; lng: number; count: number }>()

  for (const m of markers) {
    const keyLat = Math.round(m.lat / gridDeg)
    const keyLng = Math.round(m.lng / gridDeg)
    const key = `${keyLat}:${keyLng}`
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.lat += m.lat
      bucket.lng += m.lng
      bucket.count += 1
    } else {
      buckets.set(key, { lat: m.lat, lng: m.lng, count: 1 })
    }
  }

  const clustered: MapMarker[] = []
  for (const [key, bucket] of buckets) {
    if (bucket.count <= 1) continue
    const count = bucket.count
    const size = Math.min(30, 16 + Math.round(Math.log2(count) * 3))
    clustered.push({
      lat: bucket.lat / count,
      lng: bucket.lng / count,
      value: formatCount(count),
      title: `${count} clientes`,
      color: '#E2E8F0',
      size,
      cluster: true,
      count,
      clusterId: key,
    })
  }

  const singles: MapMarker[] = []
  for (const m of markers) {
    const keyLat = Math.round(m.lat / gridDeg)
    const keyLng = Math.round(m.lng / gridDeg)
    const key = `${keyLat}:${keyLng}`
    const bucket = buckets.get(key)
    if (bucket && bucket.count <= 1) singles.push(m)
  }

  return [...clustered, ...singles]
}

function formatCount(count: number) {
  if (count >= 1000) return `${Math.round(count / 100) / 10}k`
  return String(count)
}

function markerKey(marker: MapMarker) {
  const base = marker.cluster
    ? `cluster-${marker.clusterId || ''}`
    : `client-${(marker as any).clientId || ''}`
  return `${base}-${marker.lat}-${marker.lng}-${marker.value || ''}-${marker.bottomLabel || ''}`
}
</script>
