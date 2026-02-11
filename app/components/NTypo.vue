<template>
  <component :is="as" :class="classes">
    <NIcon v-if="leadingIcon" :name="leadingIcon" :size="iconSize" class="inline-block" />
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
  | 'paper'
type TypoWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
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
    leadingIcon?: string
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
  paper: 'text-amber-50',
}

const weightClasses: Record<TypoWeight, string> = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-[900]',
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

const iconSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'xs'
    case 'sm': return 'sm'
    case 'base': return 'base'
    case 'lg': return 'lg'
    case 'xl': return 'xl'
    case '2xl': return '2xl'
    case '3xl': return '3xl'
    case '4xl': return '4xl'
    case '5xl': return '5xl'
    default: return 'base'
  }
})

const attrs = useAttrs()
const classes = computed(() => [
  sizeClasses[props.size],
  toneClasses[props.tone],
  weightClasses[props.weight],
  familyClasses[props.family],
  trackingClasses[props.tracking],
  props.caps ? 'uppercase' : '',
  props.leadingIcon ? 'inline-flex items-center gap-2' : '',
  attrs.class,
])
</script>
