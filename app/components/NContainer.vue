<template>
  <div :class="classes" v-bind="attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
const attrs = useAttrs()
const classes = computed(() => ['container mx-auto px-6', attrs.class])
</script>
