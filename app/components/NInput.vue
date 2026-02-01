<template>
  <div v-if="label" class="space-y-2">
    <NTypo as="label" size="sm" weight="medium">{{ label }}</NTypo>
    <input
      v-bind="inputAttrs"
      :value="inputValue"
      :class="classes"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
    />
  </div>
  <input
    v-else
    v-bind="inputAttrs"
    :value="inputValue"
    :class="classes"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

type InputVariant = 'default' | 'muted' | 'ghost'
type InputSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    variant?: InputVariant
    size?: InputSize
    label?: string
  }>(),
  {
    modelValue: undefined,
    variant: 'default',
    size: 'md',
    label: undefined,
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const attrs = useAttrs()

const inputAttrs = computed(() => {
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

const inputValue = computed(() => {
  if (props.modelValue !== undefined && props.modelValue !== null) {
    return String(props.modelValue)
  }
  return (attrs.value as string | number | undefined) ?? ''
})

const baseClasses =
  'w-full rounded-xl border border-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400'

const variantClasses: Record<InputVariant, string> = {
  default: 'bg-white text-stone-900 placeholder:text-stone-400 ',
  muted: 'bg-stone-50 text-stone-700 placeholder:text-stone-400 ',
  ghost: 'bg-transparent text-stone-700 placeholder:text-stone-400 ',
}

const sizeClasses: Record<InputSize, string> = {
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

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  invokeHandlers(attrs.onInput, event)
}

const handleChange = (event: Event) => {
  invokeHandlers(attrs.onChange, event)
}

const handleBlur = (event: Event) => {
  invokeHandlers(attrs.onBlur, event)
}
</script>
