<template>
  <div class="flex h-[360px]">
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
              v-for="marker in markers"
              :key="`marker-${marker.lat}-${marker.lng}`"
              :options="{
                position: { lat: marker.lat, lng: marker.lng },
                title: marker.title || `${marker.value} seguros`,
              }"
              @click="handleMarkerClick(marker)"
            >
              <div
                :style="markerStyle(marker)"
                class="flex items-center justify-center font-bold text-neutral-white border-2 border-white shadow-md hover:scale-110 transition-transform duration-200 ease-in-out rounded-full"
              >
                {{ marker.value }}
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
        <FButton
          :icon="showPins ? 'mdi:map-marker-off' : 'mdi:map-marker'"
          trailing
          icon-button
          @click="showPins = !showPins"
        />
        <FButton
          :icon="showPolygons ? 'tabler:map-off' : 'tabler:map'"
          trailing
          icon-button
          @click="showPolygons = !showPolygons"
        />
        <FButton icon="mdi:plus" trailing icon-button @click="zoomIn" />
        <FButton icon="mdi:minus" trailing icon-button @click="zoomOut" />
        <FButton
          :icon="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
          trailing
          icon-button
          @click="toggleFullscreen"
        />
      </div>
    </div>

    <aside
      v-if="selectedItem"
      class="w-full max-w-[400px] bg-neutral-white p-4 overflow-auto rounded-lg shadow"
    >
      <FButton icon="mdi:close" icon-button trailing class="ml-auto" @click="selectedItem = null" />
      <FTypo size="display-bold" color="neutral-darkest"> Detalhes do item selecionado </FTypo>
      <FTypo size="display" color="neutral-darkest" class="mt-2">
        {{ selectedItem.label }}
      </FTypo>
      <section class="flex flex-col gap-2">
        <ul class="text-neutral-dark flex flex-col gap-1">
          <li>
            <FTypo size="body-medium-bold">
              Seguros: {{ selectedItem.metrics?.seguros || 0 }}
            </FTypo>
          </li>
          <li>
            <FTypo size="body-medium-bold">
              Clientes: {{ selectedItem.metrics?.clientes || 0 }}
            </FTypo>
          </li>
          <li>
            <FTypo size="body-medium-bold">
              Corretores: {{ selectedItem.metrics?.corretores || 0 }}
            </FTypo>
          </li>
        </ul>
      </section>
    </aside>
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
  value?: number | string
  color?: string
  size?: number
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
  heatmapData?: HeatmapPoint[]
  heatmapOptions?: HeatmapOptions
  centerLat?: number
  centerLng?: number
  zoom?: number
  disableDefaultUI?: boolean
  onMarkerClick?: (marker: MapMarker) => void
  onPolygonClick?: (polygon: MapPolygon) => void
}

const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
  polygons: () => [],
  heatmapData: () => [],
  heatmapOptions: () => ({ radius: 20, opacity: 0.6 }),
  centerLat: -15.7942,
  centerLng: -47.8822,
  zoom: 5,
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
const selectedItem = ref<MapPolygon | null>(null)

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
  return {
    width: `${marker.size || 20}px`,
    height: `${marker.size || 20}px`,
    background: marker.color || '#6B7280',
    fontSize: marker.size && marker.size > 35 ? '12px' : '10px',
  }
}

function polygonOptions(polygon: MapPolygon) {
  return {
    paths: polygon.paths,
    strokeColor: polygon.strokeColor || '#6B7280',
    strokeOpacity: polygon.strokeOpacity || 0.8,
    strokeWeight: polygon.strokeWeight || 2,
    fillColor: polygon.fillColor || polygon.strokeColor || '#6B7280',
    fillOpacity: polygon.fillOpacity || 0.15,
  }
}

function handleMarkerClick(marker: MapMarker) {
  emit('marker-click', marker)
  props.onMarkerClick?.(marker)
}

function handlePolygonClick(polygon: MapPolygon) {
  selectedItem.value = polygon
  emit('polygon-click', polygon)
  props.onPolygonClick?.(polygon)
  zoomToPolygon(polygon.paths)
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

watch(
  () => [props.markers, props.polygons],
  () => {
    nextTick(() => fitBoundsToData())
  },
  { deep: true }
)

watch(
  () => (googleMapsRef.value as any)?.ready,
  (isReady) => {
    if (isReady) nextTick(() => fitBoundsToData())
  },
  { immediate: true }
)
</script>
