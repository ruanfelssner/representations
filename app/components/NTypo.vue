<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

type TypoSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
type TypoTone =
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
type TypoWeight = 'regular' | 'medium' | 'semibold' | 'bold'
type TypoFamily = 'sans' | 'serif' | 'mono'

const props = withDefaults(
  defineProps<{
    as?: string | Component
    size?: TypoSize
    tone?: TypoTone
    weight?: TypoWeight
    family?: TypoFamily
    caps?: boolean
    tracking?: 'tight' | 'normal' | 'wide'
  }>(),
  {
    as: 'p',
    size: 'base',
    tone: 'default',
    weight: 'regular',
    family: 'sans',
    caps: false,
    tracking: 'normal',
  }
)

const sizeClasses: Record<TypoSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
}

const toneClasses: Record<TypoTone, string> = {
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

const weightClasses: Record<TypoWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const familyClasses: Record<TypoFamily, string> = {
  sans: "font-['Space_Grotesk']",
  serif: "font-['Fraunces']",
  mono: 'font-mono',
}

const trackingClasses = {
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-[0.3em]',
}

const attrs = useAttrs()
const classes = computed(() => [
  sizeClasses[props.size],
  toneClasses[props.tone],
  weightClasses[props.weight],
  familyClasses[props.family],
  trackingClasses[props.tracking],
  props.caps ? 'uppercase' : '',
  attrs.class,
])
</script>
