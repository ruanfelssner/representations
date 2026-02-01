<template>
  <Icon :icon="name" v-bind="$attrs" :class="classes" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
type IconSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
type IconTone =
  | 'default'
  | 'muted'
  | 'soft'
  | 'subtle'
  | 'brand'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

const props = defineProps<{
  name: string
  tone?: IconTone
  size?: IconSize
}>()
const toneClasses: Record<IconTone, string> = {
  default: 'text-[color:var(--ntypo-default)]',
  muted: 'text-[color:var(--ntypo-muted)]',
  soft: 'text-[color:var(--ntypo-soft)]',
  subtle: 'text-[color:var(--ntypo-subtle)]',
  brand: 'text-[color:var(--ntypo-brand)]',
  accent: 'text-[color:var(--ntypo-accent)]',
  info: 'text-[color:var(--ntypo-info)]',
  success: 'text-[color:var(--ntypo-success)]',
  warning: 'text-[color:var(--ntypo-warning)]',
  danger: 'text-[color:var(--ntypo-danger)]',
}

const sizeClasses: Record<IconSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  base: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
  '2xl': 'h-8 w-8',
  '3xl': 'h-9 w-9',
  '4xl': 'h-10 w-10',
  '5xl': 'h-12 w-12',
}

const classes = computed(() => {
  const toneClass = props.tone ? toneClasses[props.tone] : ''
  const sizeClass = props.size ? sizeClasses[props.size] : ''
  return [toneClass, sizeClass].join(' ')
})
</script>
