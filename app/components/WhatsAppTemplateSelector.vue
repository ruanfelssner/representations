<template>
  <div class="space-y-3">
    <label class="block text-sm font-semibold text-gray-700">Mensagem WhatsApp</label>
    
    <select
      v-model="selectedTemplateId"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      @change="handleTemplateChange"
    >
      <option value="">Selecione um template...</option>
      <optgroup
        v-for="group in groupedTemplates"
        :key="group.triggerType"
        :label="group.label"
      >
        <option
          v-for="template in group.templates"
          :key="template.id"
          :value="template.id"
        >
          {{ template.name }}
        </option>
      </optgroup>
    </select>

    <div v-if="selectedTemplateId && selectedTemplate" class="space-y-2">
      <!-- Variações (se houver) -->
      <div v-if="selectedTemplate.variations && selectedTemplate.variations.length > 0" class="flex gap-2">
        <button
          v-for="(_, idx) in [selectedTemplate.messageBody, ...selectedTemplate.variations]"
          :key="idx"
          :class="[
            'px-3 py-1 text-sm rounded-lg transition-colors',
            selectedVariation === (idx === 0 ? undefined : idx - 1)
              ? 'bg-sky-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
          @click="selectedVariation = idx === 0 ? undefined : idx - 1"
        >
          Variação {{ idx + 1 }}
        </button>
      </div>

      <!-- Preview da mensagem -->
      <div v-if="preview" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-600 mb-2 font-medium">Preview:</p>
        <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ preview.message }}</p>
      </div>

      <!-- Erro -->
      <div v-if="error" class="p-3 bg-red-50 rounded-lg border border-red-200">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Botão WhatsApp -->
      <NWhatsAppButton
        :disabled="loading || !preview"
        class="w-full"
        @click="handleOpenWhatsApp"
      >
        Abrir WhatsApp
      </NWhatsAppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WhatsAppTemplateDto, TriggerType } from '~/types/schemas'
import type { Cliente } from '~/types/client'

const props = defineProps<{
  client: Cliente
  templates: WhatsAppTemplateDto[]
}>()

const { generatePreview, openWhatsApp } = useWhatsAppLink()

const selectedTemplateId = ref('')
const selectedVariation = ref<number | undefined>(undefined)
const preview = ref<{ message: string; waLink: string } | null>(null)
const loading = ref(false)
const error = ref('')

const selectedTemplate = computed(() => {
  return props.templates.find(t => t.id === selectedTemplateId.value)
})

// Agrupar templates por tipo de gatilho
const groupedTemplates = computed(() => {
  const groups: Record<TriggerType, { triggerType: TriggerType; label: string; templates: WhatsAppTemplateDto[] }> = {
    FIRST_CONTACT: { triggerType: 'FIRST_CONTACT', label: '🤝 Primeiro Contato', templates: [] },
    LAST_SALE_90D: { triggerType: 'LAST_SALE_90D', label: '📦 Última Venda (90 dias)', templates: [] },
    LAST_CONTACT_180D: { triggerType: 'LAST_CONTACT_180D', label: '📞 Último Contato (180 dias)', templates: [] },
    REACTIVATION: { triggerType: 'REACTIVATION', label: '🔄 Reativação', templates: [] },
    DATE_CAMPAIGN: { triggerType: 'DATE_CAMPAIGN', label: '📅 Campanha por Data', templates: [] },
    BUDGET_FOLLOWUP: { triggerType: 'BUDGET_FOLLOWUP', label: '💰 Follow-up Orçamento', templates: [] },
    RELATIONSHIP: { triggerType: 'RELATIONSHIP', label: '🤝 Relacionamento', templates: [] },
  }

  props.templates
    .filter(t => t.isActive)
    .forEach(template => {
      if (groups[template.triggerType]) {
        groups[template.triggerType].templates.push(template)
      }
    })

  return Object.values(groups).filter(g => g.templates.length > 0)
})

async function handleTemplateChange() {
  if (!selectedTemplateId.value) {
    preview.value = null
    return
  }

  await loadPreview()
}

async function loadPreview() {
  if (!selectedTemplateId.value) return

  loading.value = true
  error.value = ''
  preview.value = null

  try {
    const result = await generatePreview(
      props.client.id,
      selectedTemplateId.value,
      selectedVariation.value
    )
    preview.value = result
  } catch (err: any) {
    error.value = err?.data?.message || 'Erro ao gerar preview'
  } finally {
    loading.value = false
  }
}

function handleOpenWhatsApp() {
  if (preview.value) {
    openWhatsApp(preview.value.waLink)
  }
}

// Recarregar preview quando mudar variação
watch(selectedVariation, () => {
  if (selectedTemplateId.value) {
    loadPreview()
  }
})
</script>
