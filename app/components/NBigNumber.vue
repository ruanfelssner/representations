<template>
  <NLayer variant="solid" size="sm">
    <div class="flex items-center justify-between">
      <NTypo :size="compact ? 'xs' : 'xs'" caps tracking="wide" tone="soft" class="truncate">
        {{ label }}
      </NTypo>
      <span
        v-if="icon && !compact"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--layer-border)] bg-[color:var(--layer-muted)] text-[color:var(--ntypo-muted)]"
      >
        <NIcon :name="icon" class="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
    <NTypo :size="compact ? 'sm' : 'xl'" weight="semibold" class="leading-snug truncate">
      {{ value }}
    </NTypo>
    <NTypo v-if="!compact || description" class="mt-1" size="xs" tone="soft">
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
  compact?: boolean
}>()
</script>
