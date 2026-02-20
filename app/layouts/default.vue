<template>
  <div class="min-h-screen bg-slate-50">
    <NAppHeader logo-link="/">
      <template #actions>
        <div class="flex items-center gap-2">
          <NButton
            variant="outline"
            size="xs"
            leading-icon="mdi:file-pdf-box"
            @click="isPdfImporterOpen = true"
          >
            Importar PDF
          </NButton>
          <NButton
            v-if="showGoldCalculator"
            variant="outline"
            size="xs"
            leading-icon="mdi:calculator-variant-outline"
            @click="isGoldCalculatorOpen = true"
          >
            Calculadora Ouro
          </NButton>
          <NButton
            as="NuxtLink"
            to="/admin/dashboard"
            variant="outline"
            size="xs"
            leading-icon="mdi:shield-account"
          >
            Admin
          </NButton>
        </div>
      </template>
      <template #mobileActions>
        <div class="flex items-center gap-1">
          <NButton variant="ghost" size="xs" @click="isPdfImporterOpen = true">
            <NIcon name="mdi:file-pdf-box" class="w-5 h-5" />
          </NButton>
          <NButton
            v-if="showGoldCalculator"
            variant="ghost"
            size="xs"
            @click="isGoldCalculatorOpen = true"
          >
            <NIcon name="mdi:calculator-variant-outline" class="w-5 h-5" />
          </NButton>
          <NButton as="NuxtLink" to="/admin/dashboard" variant="ghost" size="xs">
            <NIcon name="mdi:shield-account" class="w-5 h-5" />
          </NButton>
        </div>
      </template>
    </NAppHeader>

    <slot />

    <ModalImportarPdfVenda v-model="isPdfImporterOpen" />
    <ModalCalculadoraOuro v-model="isGoldCalculatorOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const isPdfImporterOpen = ref(false)
const isGoldCalculatorOpen = ref(false)

const route = useRoute()
const showGoldCalculator = computed(() => route.path === '/admin')

watch(showGoldCalculator, (visible) => {
  if (!visible) {
    isGoldCalculatorOpen.value = false
  }
})
</script>
