<template>
  <component :is="as" :class="classes" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

type LayerVariant = 'default' | 'paper' | 'solid' | 'muted'
type LayerSize = 'lg' | 'md' | 'sm' | 'row' | 'base'
type LayerRadius = 'hero' | 'card' | 'soft'

const props = withDefaults(
  defineProps<{
    as?: string | Component
    variant?: LayerVariant
    size?: LayerSize
    radius?: LayerRadius
    shadow?: boolean
    border?: boolean
    borderClass?: string
  }>(),
  {
    as: 'div',
    variant: 'default',
    size: 'lg',
    radius: 'soft',
    shadow: true,
    border: true,
    borderClass: 'border-[color:var(--layer-border)]',
  }
)

const variantClasses: Record<LayerVariant, string> = {
  default: 'bg-[color:var(--layer-default)]',
  paper: 'bg-[color:var(--layer-paper)]',
  solid: 'bg-[color:var(--layer-solid)]',
  muted: 'bg-[color:var(--layer-muted)]',
}

const sizeClasses: Record<LayerSize, string> = {
  lg: 'p-6',
  md: 'p-4',
  sm: 'p-3',
  base: 'p-5',
  row: 'px-4 py-3',
}

const radiusClasses: Record<LayerRadius, string> = {
  hero: 'rounded-[28px]',
  card: 'rounded-[26px]',
  soft: 'rounded-2xl',
}

const classes = computed(() => [
  props.border ? 'border' : '',
  props.border ? props.borderClass : '',
  variantClasses[props.variant],
  sizeClasses[props.size],
  radiusClasses[props.radius],
  props.shadow ? 'shadow-sm' : '',
])
</script>
