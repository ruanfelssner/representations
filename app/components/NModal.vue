<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeOnBackdrop && close()"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <NLayer
            v-if="modelValue"
            :class="sizeClasses"
            class="relative max-h-[90vh] w-full overflow-y-auto"
            variant="solid"
            radius="hero"
            size="lg"
          >
            <button
              v-if="closable"
              type="button"
              class="absolute right-4 top-4 rounded-full p-2 transition hover:bg-[color:var(--layer-muted)]"
              @click="close"
            >
              <NIcon name="mdi:close" class="h-5 w-5" aria-hidden="true" />
            </button>

            <div v-if="title || $slots.header" class="pr-12">
              <slot name="header">
                <NTypo v-if="title" as="h2" size="2xl" family="serif" weight="semibold">
                  {{ title }}
                </NTypo>
              </slot>
            </div>

            <div class="mt-6">
              <slot />
            </div>

            <div v-if="$slots.footer" :class="footerClasses">
              <slot name="footer" />
            </div>
          </NLayer>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closable?: boolean
    closeOnBackdrop?: boolean
    stickyFooter?: boolean
  }>(),
  {
    size: 'md',
    closable: true,
    closeOnBackdrop: true,
    stickyFooter: false,
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  }
  return sizes[props.size]
})

const footerClasses = computed(() => [
  'mt-6 flex flex-wrap items-center gap-3',
  props.stickyFooter
    ? 'sticky bottom-0 z-10 border-t border-[color:var(--layer-border)] bg-[color:var(--layer-solid)] pt-4'
    : '',
])

const close = () => {
  emit('update:modelValue', false)
}

// Prevent body scroll when modal is open
watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

// Cleanup on unmount
onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>
