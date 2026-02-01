<template>
  <NLayer variant="solid" size="base">
    <div class="flex items-center justify-between">
      <NTypo size="xs" caps tracking="wide" tone="soft">
        {{ label }}
      </NTypo>
      <span
        v-if="icon"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--layer-border)] bg-[color:var(--layer-muted)] text-[color:var(--ntypo-muted)]"
      >
        <NIcon :name="icon" class="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
    <NTypo class="mt-2" size="3xl" weight="semibold">
      {{ value }}
    </NTypo>
    <NTypo class="mt-1" size="xs" tone="soft">
      {{ description }}
    </NTypo>
  </NLayer>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  description: string
  icon?: string
}>()
</script>
