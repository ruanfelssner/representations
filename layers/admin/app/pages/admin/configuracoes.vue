<template>
  <div class="space-y-4 lg:space-y-6">
    <!-- Header -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <NTypo as="h1" size="2xl" weight="bold" class="lg:text-3xl">Configurações</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">
            Defina parâmetros gerais da aplicação
          </NTypo>
        </div>
        <NButton
          as="NuxtLink"
          to="/admin/dashboard"
          variant="outline"
          size="sm"
          leading-icon="mdi:arrow-left"
        >
          Voltar ao Dashboard
        </NButton>
      </div>
    </NLayer>

    <!-- Formulário de Comissão -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="flex items-start gap-3 mb-4">
        <div class="p-2 bg-emerald-100 rounded-lg">
          <NIcon name="mdi:cash-multiple" class="w-6 h-6 text-emerald-700" />
        </div>
        <div class="flex-1">
          <NTypo as="h2" size="lg" weight="bold">Taxa de Comissão</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">
            Porcentagem de comissão aplicada sobre o faturamento total
          </NTypo>
        </div>
      </div>

      <form @submit.prevent="saveSettings" class="space-y-6">
        <!-- Campo de Porcentagem -->
        <div class="max-w-md">
          <label class="block mb-2">
            <NTypo size="sm" weight="semibold">Porcentagem de Comissão (%)</NTypo>
          </label>
          <div class="flex items-center gap-3">
            <input
              v-model.number="commissionPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-lg font-semibold"
              placeholder="15"
            />
            <span class="text-2xl font-bold text-gray-400">%</span>
          </div>
          <NTypo size="xs" tone="muted" class="mt-2">
            Exemplo: 15% significa que você recebe R$ 15.000 de um faturamento de R$ 100.000
          </NTypo>
        </div>

        <!-- Preview de Cálculo -->
        <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <NTypo size="sm" weight="semibold" class="text-emerald-900 mb-3">
            📊 Exemplo de Cálculo
          </NTypo>
          <div class="grid gap-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-700">Faturamento de R$ 100.000</span>
              <span class="font-bold text-emerald-700">{{ formatCurrency(100000 * (commissionPercentage / 100)) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-700">Faturamento de R$ 250.000</span>
              <span class="font-bold text-emerald-700">{{ formatCurrency(250000 * (commissionPercentage / 100)) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-700">Faturamento de R$ 500.000</span>
              <span class="font-bold text-emerald-700">{{ formatCurrency(500000 * (commissionPercentage / 100)) }}</span>
            </div>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex items-center gap-3">
          <NButton
            type="submit"
            variant="primary"
            size="md"
            leading-icon="mdi:content-save"
            :disabled="saving || !hasChanges"
          >
            {{ saving ? 'Salvando...' : 'Salvar Configurações' }}
          </NButton>
          <NButton
            v-if="hasChanges"
            type="button"
            variant="outline"
            size="md"
            @click="resetForm"
          >
            Cancelar
          </NButton>
        </div>

        <!-- Mensagem de Sucesso -->
        <div v-if="showSuccess" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center gap-2">
            <NIcon name="mdi:check-circle" class="w-5 h-5 text-green-600" />
            <NTypo size="sm" weight="semibold" class="text-green-800">
              Configurações salvas com sucesso!
            </NTypo>
          </div>
        </div>

        <!-- Mensagem de Erro -->
        <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center gap-2">
            <NIcon name="mdi:alert-circle" class="w-5 h-5 text-red-600" />
            <NTypo size="sm" weight="semibold" class="text-red-800">
              {{ errorMessage }}
            </NTypo>
          </div>
        </div>
      </form>
    </NLayer>

    <!-- Informações Adicionais -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="flex items-start gap-3">
        <div class="p-2 bg-blue-100 rounded-lg">
          <NIcon name="mdi:information" class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <NTypo size="sm" weight="semibold" class="text-blue-900 mb-2">
            Como funciona?
          </NTypo>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold">•</span>
              <span>A taxa de comissão é aplicada automaticamente em todos os cálculos de faturamento</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold">•</span>
              <span>Os valores de comissão aparecerão no dashboard abaixo dos cards de faturamento</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold">•</span>
              <span>A configuração é salva no banco de dados e persiste entre sessões</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold">•</span>
              <span>Você pode alterar essa porcentagem a qualquer momento</span>
            </li>
          </ul>
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { z } from 'zod'

definePageMeta({ layout: 'admin' })

const SettingsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    commissionRate: z.number(),
  }),
})

// Buscar configurações atuais
const { data: settingsData, refresh: refreshSettings } = await useFetch('/api/v1/settings', {
  transform: (res) => SettingsResponseSchema.parse(res).data,
})

const originalCommissionRate = computed(() => settingsData.value?.commissionRate || 0.15)
const commissionPercentage = ref((originalCommissionRate.value * 100))

// Estado do formulário
const saving = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

// Verifica se houve alteração
const hasChanges = computed(() => {
  const current = commissionPercentage.value / 100
  return Math.abs(current - originalCommissionRate.value) > 0.0001
})

// Resetar formulário
function resetForm() {
  commissionPercentage.value = originalCommissionRate.value * 100
  errorMessage.value = ''
  showSuccess.value = false
}

// Salvar configurações
async function saveSettings() {
  if (saving.value || !hasChanges.value) return

  saving.value = true
  errorMessage.value = ''
  showSuccess.value = false

  try {
    const response = await $fetch('/api/v1/settings', {
      method: 'POST',
      body: {
        commissionRate: commissionPercentage.value / 100,
      },
    })

    if (response && (response as any).success) {
      showSuccess.value = true
      await refreshSettings()
      
      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    } else {
      errorMessage.value = 'Erro ao salvar configurações. Tente novamente.'
    }
  } catch (err) {
    console.error('Erro ao salvar:', err)
    errorMessage.value = 'Erro ao salvar configurações. Verifique os dados e tente novamente.'
  } finally {
    saving.value = false
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Atualizar o valor quando os dados carregarem
watch(originalCommissionRate, (newRate) => {
  if (!hasChanges.value) {
    commissionPercentage.value = newRate * 100
  }
})
</script>
