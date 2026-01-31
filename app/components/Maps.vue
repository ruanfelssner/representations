<template>
  <GoogleMap
    v-if="apiKey"
    :api-key="apiKey"
    :center="{ position: { lat, lng } }"
    :zoom="15"
    :style="customStyle"
    class="rounded-sm w-full"
    :class="customClass"
    :disable-default-ui="disableControls"
  >
    <Marker :options="{ position: { lat, lng } }" class="rounded-sm" />
  </GoogleMap>
</template>

<script lang="ts" setup>
import { useRuntimeConfig } from '#imports'
import { GoogleMap, Marker } from 'vue3-google-map'

type IProps = {
  lat?: number
  lng?: number
  customClass?: string
  customStyle?: string
  disableControls?: boolean
}
withDefaults(defineProps<IProps>(), {
  lat: 0,
  lng: 0,
  customClass: '',
  customStyle: '',
  disableControls: false,
})

const config = useRuntimeConfig()

export type LatLng = { lat: number, lng: number }

const apiKey = config.public.googleMapsApiKey
</script>
