<template>
  <div class="min-h-screen bg-gray-50">
    <PageHeader
      :title="isNew ? 'Novo Template WhatsApp' : 'Editar Template WhatsApp'"
      :subtitle="isNew ? 'Crie um novo template de mensagem' : 'Atualize o template existente'"
    />

    <NContainer>
      <div class="py-6">
        <div class="max-w-3xl mx-auto">
          <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <!-- Nome -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nome do Template *</label>
              <NInput
                v-model="form.name"
                required
                placeholder="Ex: Primeiro Contato - Formal"
              />
            </div>

            <!-- Tipo de Gatilho -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Gatilho *</label>
              <NSelect v-model="form.triggerType" required>
                <option value="">Selecione...</option>
                <option value="FIRST_CONTACT">🤝 Primeiro Contato</option>
                <option value="LAST_SALE_90D">📦 Última Venda (90 dias)</option>
                <option value="LAST_CONTACT_180D">📞 Último Contato (180 dias)</option>
                <option value="REACTIVATION">🔄 Reativação</option>
                <option value="DATE_CAMPAIGN">📅 Campanha por Data</option>
                <option value="BUDGET_FOLLOWUP">💰 Follow-up Orçamento</option>
                <option value="RELATIONSHIP">🤝 Relacionamento</option>
              </NSelect>
            </div>

            <!-- Status -->
            <div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.isActive"
                  type="checkbox"
                  class="w-4 h-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500"
                />
                <span class="text-sm font-medium text-gray-700">Template ativo</span>
              </label>
            </div>

            <!-- Mensagem Principal -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Mensagem Principal *</label>
              <NTextArea
                v-model="form.messageBody"
                required
                :maxlength="800"
                rows="6"
                placeholder="Olá {{nome}}! Sou {{atendente}} da Felssner Representações..."
              />
              <p class="text-xs text-gray-500 mt-1">
                {{ form.messageBody.length }}/800 caracteres
              </p>
            </div>

            <!-- Variações -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Variações (opcional)</label>
              <p class="text-xs text-gray-500 mb-3">
                Crie até 3 variações da mensagem para evitar repetição
              </p>

              <div class="space-y-3">
                <div v-for="(variation, idx) in form.variations" :key="idx">
                  <div class="flex items-start gap-2">
                    <NTextArea
                      v-model="form.variations[idx]"
                      :maxlength="800"
                      rows="4"
                      :placeholder="`Variação ${idx + 1}`"
                    />
                    <button
                      type="button"
                      class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      @click="removeVariation(idx)"
                    >
                      <NIcon name="mdi:delete" class="w-5 h-5" />
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ variation.length }}/800 caracteres
                  </p>
                </div>
              </div>

              <NButton
                v-if="form.variations.length < 3"
                type="button"
                variant="outline"
                class="mt-3"
                @click="addVariation"
              >
                <NIcon name="mdi:plus" class="w-4 h-4" />
                Adicionar Variação
              </NButton>
            </div>

            <!-- Variáveis Disponíveis -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 class="text-sm font-semibold text-gray-700 mb-2">Variáveis Disponíveis</h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <code class="px-2 py-1 bg-white rounded border border-gray-300">{{nome}}</code>
                <code class="px-2 py-1 bg-white rounded border border-gray-300">{{atendente}}</code>
                <code class="px-2 py-1 bg-white rounded border border-gray-300">{{empresa}}</code>
                <code class="px-2 py-1 bg-white rounded border border-gray-300">{{cidade}}</code>
                <code class="px-2 py-1 bg-white rounded border border-gray-300">{{linha}}</code>
                <code class="px-2 py-1 bg-white rounded border border-gray-300">{{ultimaCompraData}}</code>
              </div>
            </div>

            <!-- Ações -->
            <div class="flex gap-3 pt-4">
              <NButton
                type="submit"
                :loading="saving"
                class="flex-1"
              >
                {{ isNew ? 'Criar Template' : 'Salvar Alterações' }}
              </NButton>

              <NButton
                type="button"
                variant="outline"
                @click="router.back()"
              >
                Cancelar
              </NButton>
            </div>
          </form>
        </div>
      </div>
    </NContainer>
  </div>
</template>

<script setup lang="ts">
import type { TriggerType } from '~/types/schemas'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const { createTemplate, updateTemplate, fetchTemplates } = useWhatsAppTemplates()
const { showToast } = useToast()

const id = computed(() => route.params.id as string)
const isNew = computed(() => id.value === 'new')

const form = ref({
  name: '',
  triggerType: '' as TriggerType | '',
  isActive: true,
  messageBody: '',
  variations: [] as string[],
  language: 'pt-BR',
  variablesAllowed: ['nome', 'atendente', 'empresa', 'cidade', 'linha', 'ultimaCompraData'],
})

const saving = ref(false)

async function loadTemplate() {
  if (isNew.value) return

  try {
    const templates = await fetchTemplates()
    const template = templates.find(t => t.id === id.value)

    if (!template) {
      showToast('Template não encontrado', 'error')
      router.push('/admin/whatsapp-templates')
      return
    }

    form.value = {
      name: template.name,
      triggerType: template.triggerType,
      isActive: template.isActive,
      messageBody: template.messageBody,
      variations: template.variations || [],
      language: template.language,
      variablesAllowed: template.variablesAllowed,
    }
  } catch (error) {
    showToast('Erro ao carregar template', 'error')
  }
}

async function handleSubmit() {
  if (!form.value.name || !form.value.triggerType || !form.value.messageBody) {
    showToast('Preencha todos os campos obrigatórios', 'error')
    return
  }

  saving.value = true

  try {
    if (isNew.value) {
      await createTemplate({
        name: form.value.name,
        triggerType: form.value.triggerType as TriggerType,
        isActive: form.value.isActive,
        messageBody: form.value.messageBody,
        variations: form.value.variations.filter(v => v.trim()),
        language: form.value.language,
        variablesAllowed: form.value.variablesAllowed,
      })
      showToast('Template criado com sucesso', 'success')
    } else {
      await updateTemplate(id.value, {
        name: form.value.name,
        triggerType: form.value.triggerType as TriggerType,
        isActive: form.value.isActive,
        messageBody: form.value.messageBody,
        variations: form.value.variations.filter(v => v.trim()),
        language: form.value.language,
        variablesAllowed: form.value.variablesAllowed,
      })
      showToast('Template atualizado com sucesso', 'success')
    }

    router.push('/admin/whatsapp-templates')
  } catch (error: any) {
    showToast(error?.data?.message || 'Erro ao salvar template', 'error')
  } finally {
    saving.value = false
  }
}

function addVariation() {
  if (form.value.variations.length < 3) {
    form.value.variations.push('')
  }
}

function removeVariation(index: number) {
  form.value.variations.splice(index, 1)
}

onMounted(() => {
  loadTemplate()
})
</script>
