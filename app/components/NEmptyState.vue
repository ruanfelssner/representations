<template>
  <NLayer
    variant="solid"
    size="lg"
    border-class="border-[color:var(--layer-border)]"
    class="border-dashed"
  >
    <NTypo size="sm" tone="muted">{{ message }}</NTypo>
  </NLayer>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>
