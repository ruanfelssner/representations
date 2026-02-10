<template>
  <div class="min-h-screen bg-gray-50">
    <PageHeader
      title="Templates WhatsApp"
      subtitle="Gerencie mensagens automáticas para abordagem de clientes"
    />

    <NContainer>
      <div class="py-6 space-y-6">
        <!-- Header com ações -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3">
            <select
              v-model="filterTriggerType"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Todos os gatilhos</option>
              <option value="FIRST_CONTACT">🤝 Primeiro Contato</option>
              <option value="LAST_SALE_90D">📦 Última Venda (90d)</option>
              <option value="LAST_CONTACT_180D">📞 Último Contato (180d)</option>
              <option value="REACTIVATION">🔄 Reativação</option>
              <option value="DATE_CAMPAIGN">📅 Campanha</option>
              <option value="BUDGET_FOLLOWUP">💰 Follow-up</option>
              <option value="RELATIONSHIP">🤝 Relacionamento</option>
            </select>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="filterOnlyActive"
                type="checkbox"
                class="w-4 h-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500"
              />
              <span class="text-sm text-gray-700">Apenas ativos</span>
            </label>
          </div>

          <NuxtLink
            to="/admin/whatsapp-templates/new"
            class="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
          >
            <NIcon name="mdi:plus" class="w-5 h-5" />
            Novo Template
          </NuxtLink>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="text-gray-500">Carregando...</div>
        </div>

        <!-- Empty state -->
        <NEmptyState
          v-else-if="filteredTemplates.length === 0"
          title="Nenhum template encontrado"
          description="Crie templates de mensagens para facilitar o contato com clientes"
        />

        <!-- Lista de templates -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ template.name }}</h3>
                <p class="text-xs text-gray-500 mt-1">{{ getTriggerLabel(template.triggerType) }}</p>
              </div>

              <button
                :class="[
                  'px-2 py-1 text-xs font-medium rounded transition-colors',
                  template.isActive
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
                @click="handleToggleActive(template)"
              >
                {{ template.isActive ? 'Ativo' : 'Inativo' }}
              </button>
            </div>

            <p class="text-sm text-gray-600 line-clamp-3 mb-4">
              {{ template.messageBody }}
            </p>

            <div class="flex items-center gap-2">
              <NuxtLink
                :to="`/admin/whatsapp-templates/${template.id}`"
                class="flex-1 px-3 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50 rounded-lg transition-colors text-center"
              >
                Editar
              </NuxtLink>

              <button
                class="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                @click="handleDelete(template)"
              >
                <NIcon name="mdi:delete" class="w-5 h-5" />
              </button>
            </div>

            <!-- Badge de variações -->
            <div v-if="template.variations && template.variations.length > 0" class="mt-2 pt-2 border-t border-gray-100">
              <span class="text-xs text-gray-500">
                {{ template.variations.length }} variação(ões)
              </span>
            </div>
          </div>
        </div>
      </div>
    </NContainer>
  </div>
</template>

<script setup lang="ts">
import type { WhatsAppTemplateDto, TriggerType } from '~/types/schemas'

definePageMeta({
  layout: 'default',
})

const { fetchTemplates, toggleActive, deleteTemplate } = useWhatsAppTemplates()
const { showToast } = useToast()

const templates = ref<WhatsAppTemplateDto[]>([])
const loading = ref(true)
const filterTriggerType = ref<TriggerType | ''>('')
const filterOnlyActive = ref(false)

const filteredTemplates = computed(() => {
  let filtered = templates.value

  if (filterTriggerType.value) {
    filtered = filtered.filter(t => t.triggerType === filterTriggerType.value)
  }

  if (filterOnlyActive.value) {
    filtered = filtered.filter(t => t.isActive)
  }

  return filtered
})

async function loadTemplates() {
  loading.value = true
  try {
    templates.value = await fetchTemplates()
  } catch (error) {
    showToast('Erro ao carregar templates', 'error')
  } finally {
    loading.value = false
  }
}

async function handleToggleActive(template: WhatsAppTemplateDto) {
  try {
    await toggleActive(template.id, !template.isActive)
    showToast(`Template ${template.isActive ? 'desativado' : 'ativado'}`, 'success')
    await loadTemplates()
  } catch (error) {
    showToast('Erro ao atualizar template', 'error')
  }
}

async function handleDelete(template: WhatsAppTemplateDto) {
  if (!confirm(`Deseja realmente excluir o template "${template.name}"?`)) return

  try {
    await deleteTemplate(template.id)
    showToast('Template excluído', 'success')
    await loadTemplates()
  } catch (error) {
    showToast('Erro ao excluir template', 'error')
  }
}

function getTriggerLabel(triggerType: TriggerType): string {
  const labels: Record<TriggerType, string> = {
    FIRST_CONTACT: '🤝 Primeiro Contato',
    LAST_SALE_90D: '📦 Última Venda (90 dias)',
    LAST_CONTACT_180D: '📞 Último Contato (180 dias)',
    REACTIVATION: '🔄 Reativação',
    DATE_CAMPAIGN: '📅 Campanha por Data',
    BUDGET_FOLLOWUP: '💰 Follow-up Orçamento',
    RELATIONSHIP: '🤝 Relacionamento',
  }
  return labels[triggerType] || triggerType
}

onMounted(() => {
  loadTemplates()
})
</script>
