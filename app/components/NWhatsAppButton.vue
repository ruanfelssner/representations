<template>
  <button
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-all rounded-lg',
      'bg-[#25D366] hover:bg-[#20BD5A] text-white',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
    ]"
    v-bind="$attrs"
  >
    <NIcon name="mdi:whatsapp" :class="iconSize" />
    <slot>WhatsApp</slot>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm'
    case 'lg':
      return 'px-6 py-3 text-lg'
    default:
      return 'px-4 py-2 text-base'
  }
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-4 h-4'
    case 'lg':
      return 'w-6 h-6'
    default:
      return 'w-5 h-5'
  }
})
</script>
