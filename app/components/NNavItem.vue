<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group"
    :class="[
      isActive 
        ? 'bg-sky-50 text-sky-700 font-semibold' 
        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    ]"
    @click="$emit('click')"
  >
    <NIcon 
      v-if="icon" 
      :name="icon" 
      class="w-5 h-5 flex-shrink-0"
      :class="isActive ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'"
    />
    <NTypo as="span" size="sm" :weight="isActive ? 'semibold' : 'medium'">
      {{ label }}
    </NTypo>
    <span 
      v-if="badge" 
      class="ml-auto px-2 py-0.5 text-xs font-bold rounded-full"
      :class="isActive ? 'bg-sky-200 text-sky-800' : 'bg-gray-200 text-gray-700'"
    >
      {{ badge }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  to: string
  icon?: string
  label: string
  badge?: string | number
}>()

defineEmits<{
  (e: 'click'): void
}>()

const route = useRoute()

const isActive = computed(() => {
  const currentPath = route.path
  const targetPath = props.to
  
  // Exact match
  if (currentPath === targetPath) return true
  
  // Nested routes (e.g., /admin/clients/123 should highlight /admin/clients)
  if (targetPath !== '/' && currentPath.startsWith(targetPath)) return true
  
  return false
})
</script>
