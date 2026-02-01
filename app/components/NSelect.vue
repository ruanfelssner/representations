<template>
  <div v-if="label" class="space-y-2">
    <NTypo as="label" size="sm" weight="medium">{{ label }}</NTypo>
    <select
      v-bind="selectAttrs"
      :value="selectValue"
      :class="classes"
      @change="handleChange"
      @input="handleInput"
      @blur="handleBlur"
    >
      <option v-if="options" v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
      <slot v-else />
    </select>
  </div>
  <select
    v-else
    v-bind="selectAttrs"
    :value="selectValue"
    :class="classes"
    @change="handleChange"
    @input="handleInput"
    @blur="handleBlur"
  >
    <option v-if="options" v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
    <slot v-else />
  </select>
</template>

<script setup lang="ts">
import type { SelectOption } from '~~/shared/schemas/ui/select'

defineOptions({ inheritAttrs: false })

type SelectVariant = 'default' | 'muted' | 'ghost'
type SelectSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    variant?: SelectVariant
    size?: SelectSize
    label?: string
    options?: SelectOption[]
  }>(),
  {
    modelValue: undefined,
    variant: 'default',
    size: 'md',
    label: undefined,
    options: undefined,
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()

const selectAttrs = computed(() => {
  const {
    class: _class,
    value: _value,
    onInput: _onInput,
    onChange: _onChange,
    onBlur: _onBlur,
    ...rest
  } = attrs
  return rest
})

const selectValue = computed(() => {
  if (props.modelValue !== undefined && props.modelValue !== null) {
    return String(props.modelValue)
  }
  return (attrs.value as string | number | undefined) ?? ''
})

const baseClasses =
  'w-full rounded-xl border border-stone-200 px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400'

const variantClasses: Record<SelectVariant, string> = {
  default: 'bg-white',
  muted: 'bg-stone-50',
  ghost: 'bg-transparent',
}

const sizeClasses: Record<SelectSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

const classes = computed(() => [
  baseClasses,
  variantClasses[props.variant],
  sizeClasses[props.size],
  attrs.class,
])

const invokeHandlers = (handler: unknown, event: Event) => {
  if (typeof handler === 'function') {
    handler(event)
  } else if (Array.isArray(handler)) {
    for (const item of handler) {
      if (typeof item === 'function') item(event)
    }
  }
}

const handleChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
  invokeHandlers(attrs.onChange, event)
}

const handleInput = (event: Event) => {
  invokeHandlers(attrs.onInput, event)
}

const handleBlur = (event: Event) => {
  invokeHandlers(attrs.onBlur, event)
}
</script>
