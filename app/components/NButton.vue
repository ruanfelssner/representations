<template>
  <component
    :is="resolvedAs"
    :class="classes"
    v-bind="attrs"
    :type="resolvedType"
    :disabled="loading || attrs.disabled"
  >
    <NIcon v-if="loading" name="mdi:loading" :size="iconSize" class="animate-spin" />
    <NIcon v-else-if="leadingIcon" :name="leadingIcon" :size="iconSize" />
    <NTypo v-if="label" :as="resolvedAs === 'button' ? 'span' : undefined" :size="labelSize">{{
      label
    }}</NTypo>
    <slot />
    <NIcon v-if="trailingIcon" :name="trailingIcon" :size="iconSize" />
  </component>
</template>

<script setup lang="ts">
import { resolveComponent } from 'vue'
import type { Component } from 'vue'
import type { TypoSize } from './NTypo.vue'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'soft'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
type ButtonSize = 'link' | 'xs' | 'sm' | 'md' | 'lg'
type ButtonRadius = 'full' | 'soft'
type IconSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'

const props = withDefaults(
  defineProps<{
    as?: string | Component
    variant?: ButtonVariant
    size?: ButtonSize
    radius?: ButtonRadius
    caps?: boolean
    label?: string
    leadingIcon?: string
    trailingIcon?: string
    loading?: boolean
  }>(),
  {
    as: 'button',
    variant: 'primary',
    size: 'sm',
    radius: 'full',
    caps: false,
  }
)

const attrs = useAttrs()
const resolvedAs = computed(() => {
  if (props.as !== 'button') {
    if (props.as === 'NuxtLink' || props.as === 'nuxt-link') {
      return resolveComponent('NuxtLink')
    }
    return props.as
  }
  if ('to' in attrs) return resolveComponent('NuxtLink')
  if ('href' in attrs) return 'a'
  return 'button'
})
const isLinkTarget = computed(() => resolvedAs.value !== 'button')
const resolvedSize = computed<ButtonSize>(() => (isLinkTarget.value ? 'link' : props.size))
const resolvedType = computed(() => {
  if (resolvedAs.value !== 'button') return undefined
  return Object.prototype.hasOwnProperty.call(attrs, 'type') ? undefined : 'button'
})

const labelSize = computed<TypoSize | undefined>(() => {
  switch (resolvedSize.value) {
    case 'link':
      return 'link'
    case 'xs':
      return 'xs'
    case 'sm':
      return 'sm'
    case 'md':
      return 'base'
    case 'lg':
      return 'lg'
    default:
      return undefined
  }
})

const iconSize = computed<IconSize>(() => {
  switch (resolvedSize.value) {
    case 'xs':
      return 'sm'
    case 'sm':
      return 'base'
    case 'md':
      return 'base'
    case 'lg':
      return 'lg'
    default:
      return 'base'
  }
})

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 pointer'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-stone-900 text-white shadow-sm hover:bg-stone-800',
  secondary: 'border border-stone-200 bg-white text-stone-400 shadow-sm hover:border-stone-400',
  outline: 'border border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-400',
  soft: 'border border-stone-200 bg-white/20 text-stone-400 shadow-sm hover:border-stone-400',
  ghost: 'text-stone-400 hover:text-stone-600',
  danger: 'border border-rose-200 text-rose-700 hover:bg-rose-50',
  success: 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50',
  warning: 'border border-amber-200 text-amber-700 hover:bg-amber-50',
}

const sizeClasses: Record<ButtonSize, string> = {
  link: 'px-1 py-2 text-sm',
  xs: 'px-2 py-2 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-sm',
}

const radiusClasses: Record<ButtonRadius, string> = {
  full: 'rounded-full',
  soft: 'rounded-xl',
}

const classes = computed(() => [
  baseClasses,
  variantClasses[props.variant],
  sizeClasses[resolvedSize.value],
  radiusClasses[props.radius],
  props.caps ? 'uppercase tracking-[0.3em]' : '',
  attrs.class,
])
</script>
