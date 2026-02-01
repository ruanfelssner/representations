<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div v-for="(step, index) in steps" :key="index" class="flex items-center">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition"
            :class="getStepClasses(index)"
          >
            {{ index + 1 }}
          </div>
          <div
            v-if="index < steps.length - 1"
            class="mx-2 h-0.5 w-8 transition"
            :class="index < currentStep ? 'bg-emerald-600' : 'bg-[color:var(--layer-border)]'"
          />
        </div>
      </div>
      <NTypo size="xs" tone="soft"> Passo {{ currentStep + 1 }} de {{ steps.length }} </NTypo>
    </div>

    <div>
      <NTypo size="lg" weight="semibold">
        {{ steps[currentStep] }}
      </NTypo>
    </div>

    <div>
      <slot :step="currentStep" />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <NButton
        v-if="currentStep > 0"
        type="button"
        variant="outline"
        size="sm"
        @click="previousStep"
      >
        <NIcon name="mdi:arrow-left" class="h-4 w-4" aria-hidden="true" />
        Voltar
      </NButton>
      <div v-else />

      <div class="flex gap-3">
        <slot name="actions" :step="currentStep" />
        <NButton
          v-if="currentStep < steps.length - 1"
          type="button"
          variant="primary"
          size="sm"
          :disabled="!canProceed"
          @click="nextStep"
        >
          Proximo
          <NIcon name="mdi:arrow-right" class="h-4 w-4" aria-hidden="true" />
        </NButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  steps: string[]
  modelValue: number
  canProceed?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

const currentStep = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const getStepClasses = (index: number) => {
  if (index < currentStep.value) {
    return 'bg-emerald-600 text-white'
  }
  if (index === currentStep.value) {
    return 'bg-emerald-600 text-white'
  }
  return 'bg-[color:var(--layer-muted)] text-[color:var(--ntypo-soft)]'
}

const nextStep = () => {
  if (currentStep.value < props.steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}
</script>
