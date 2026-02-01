<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 class="flex items-center gap-2">
        <span
          v-if="icon"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white"
        >
          <NIcon :name="icon" class="h-5 w-5 text-gray-500" aria-hidden="true" />
        </span>
        <NTypo as="span" size="3xl" weight="semibold" family="serif">
          {{ title }}
        </NTypo>
      </h1>
      <NTypo v-if="description" size="sm" tone="muted" class="mt-1">
        {{ description }}
      </NTypo>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>
