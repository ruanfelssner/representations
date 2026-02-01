<template>
  <div v-if="label" class="space-y-2">
    <NTypo as="label" size="sm" weight="medium">{{ label }}</NTypo>
    <!-- Field-bound mode when name is provided -->
    <Field v-if="name" :name="name" v-slot="{ field }">
      <button
        type="button"
        :disabled="disabled"
        :class="[
          'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          isFieldOn(field)
            ? 'bg-[color:var(--toggle-on)] hover:bg-[color:var(--toggle-on-hover)]'
            : 'bg-[color:var(--toggle-off)] hover:bg-[color:var(--toggle-off-hover)]',
          attrs.class,
        ]"
        @click.prevent="toggleField(field)"
      >
        <span
          :class="[
            'inline-block h-4 w-4 transform rounded-full bg-[color:var(--toggle-knob)] transition-transform',
            isFieldOn(field) ? 'translate-x-6' : 'translate-x-1',
          ]"
        />
      </button>
    </Field>
    <!-- Local v-model fallback when no name -->
    <button
      v-else
      type="button"
      :disabled="disabled"
      :class="[
        'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        isLocalOn
          ? 'bg-[color:var(--toggle-on)] hover:bg-[color:var(--toggle-on-hover)]'
          : 'bg-[color:var(--toggle-off)] hover:bg-[color:var(--toggle-off-hover)]',
        attrs.class,
      ]"
      @click.prevent="toggleLocal"
    >
      <span
        :class="[
          'inline-block h-4 w-4 transform rounded-full bg-[color:var(--toggle-knob)] transition-transform',
          isLocalOn ? 'translate-x-6' : 'translate-x-1',
        ]"
      />
    </button>
  </div>

  <!-- No label variants -->
  <Field v-else-if="name" :name="name" v-slot="{ field }">
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        isFieldOn(field)
          ? 'bg-[color:var(--toggle-on)] hover:bg-[color:var(--toggle-on-hover)]'
          : 'bg-[color:var(--toggle-off)] hover:bg-[color:var(--toggle-off-hover)]',
        attrs.class,
      ]"
      @click.prevent="toggleField(field)"
    >
      <span
        :class="[
          'inline-block h-4 w-4 transform rounded-full bg-[color:var(--toggle-knob)] transition-transform',
          isFieldOn(field) ? 'translate-x-6' : 'translate-x-1',
        ]"
      />
    </button>
  </Field>
  <button
    v-else
    type="button"
    :disabled="disabled"
    :class="[
      'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
      isLocalOn
        ? 'bg-[color:var(--toggle-on)] hover:bg-[color:var(--toggle-on-hover)]'
        : 'bg-[color:var(--toggle-off)] hover:bg-[color:var(--toggle-off-hover)]',
      attrs.class,
    ]"
    @click.prevent="toggleLocal"
  >
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-full bg-[color:var(--toggle-knob)] transition-transform',
        isLocalOn ? 'translate-x-6' : 'translate-x-1',
      ]"
    />
  </button>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: unknown
    label?: string
    disabled?: boolean
    name?: string
    trueValue?: unknown
    falseValue?: unknown
  }>(),
  {
    modelValue: false,
    trueValue: true,
    falseValue: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const attrs = useAttrs()

const isLocalOn = computed(() => props.modelValue === props.trueValue)
const isFieldOn = (field: { value: unknown }) => field.value === props.trueValue

const toggleField = (field: { value: unknown }) => {
  const next = isFieldOn(field) ? props.falseValue : props.trueValue
  if (typeof (field as { onChange?: (value: unknown) => void }).onChange === 'function') {
    ;(field as { onChange: (value: unknown) => void }).onChange(next)
  } else {
    ;(field as any).value = next
  }
}

const toggleLocal = () => {
  const next = isLocalOn.value ? props.falseValue : props.trueValue
  emit('update:modelValue', next)
}
</script>
