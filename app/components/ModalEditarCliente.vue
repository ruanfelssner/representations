<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="$emit('close')" />

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">✏️</span>
                  <div>
                    <h3 class="text-xl font-bold">Editar Cliente</h3>
                    <p class="text-sm text-blue-100">{{ cliente?.nome }}</p>
                  </div>
                </div>
                <button
                  @click="$emit('close')"
                  class="rounded-lg p-2 hover:bg-white/20 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Form Content -->
            <div class="overflow-y-auto flex-1 p-6">
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Dados Básicos -->
                <div class="space-y-4">
                  <h4 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span>👤</span> Dados Básicos
                  </h4>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2">
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Nome do Cliente *
                      </label>
                      <input
                        v-model="form.nome"
                        type="text"
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        📞 Telefone
                      </label>
                      <input
                        v-model="form.telefone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        📧 E-mail
                      </label>
                      <input
                        v-model="form.email"
                        type="email"
                        placeholder="contato@exemplo.com"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <!-- Classificação -->
                <div class="space-y-4 bg-gray-50 rounded-xl p-4">
                  <h4 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span>🏷️</span> Classificação
                  </h4>

                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        v-model="form.tipo"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="prospecto">🔍 Prospecto</option>
                        <option value="cliente">✅ Cliente</option>
                        <option value="inativo">⏸️ Inativo</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Segmento *
                      </label>
                      <select
                        v-model="form.segmento"
                        required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="otica">👓 Ótica</option>
                        <option value="relojoaria">⌚ Relojoaria</option>
                        <option value="semijoia">💍 Semi-joias</option>
                        <option value="multimarcas">🏪 Multimarcas</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Porte
                      </label>
                      <select
                        v-model="form.porte"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Não definido</option>
                        <option value="pequeno">🏠 Pequeno</option>
                        <option value="medio">🏢 Médio</option>
                        <option value="grande">🏭 Grande</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Potencial
                      </label>
                      <select
                        v-model="form.potencial"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Não definido</option>
                        <option value="baixo">📉 Baixo</option>
                        <option value="medio">📊 Médio</option>
                        <option value="alto">📈 Alto</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Próxima Visita e Recorrência -->
                <div class="space-y-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 class="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <span>📅</span> Agendamento e Recorrência
                  </h4>

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-blue-800 mb-2">
                        Próxima Visita
                      </label>
                      <input
                        v-model="form.proximaVisita"
                        type="date"
                        class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-blue-800 mb-2">
                        Tipo de Recorrência
                      </label>
                      <select
                        v-model="form.recorrenciaTipo"
                        class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Sem recorrência</option>
                        <option value="semanal">📅 Semanal</option>
                        <option value="quinzenal">📆 Quinzenal</option>
                        <option value="mensal">🗓️ Mensal</option>
                        <option value="bimestral">📋 Bimestral</option>
                        <option value="trimestral">📊 Trimestral</option>
                      </select>
                    </div>

                    <div v-if="form.recorrenciaTipo === 'semanal'" class="col-span-2">
                      <label class="block text-sm font-semibold text-blue-800 mb-2">
                        Dia da Semana Preferido
                      </label>
                      <select
                        v-model.number="form.diaPreferido"
                        class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option :value="1">Segunda-feira</option>
                        <option :value="2">Terça-feira</option>
                        <option :value="3">Quarta-feira</option>
                        <option :value="4">Quinta-feira</option>
                        <option :value="5">Sexta-feira</option>
                        <option :value="6">Sábado</option>
                        <option :value="7">Domingo</option>
                      </select>
                    </div>

                    <div v-if="form.recorrenciaTipo === 'mensal' || form.recorrenciaTipo === 'bimestral' || form.recorrenciaTipo === 'trimestral'" class="col-span-2">
                      <label class="block text-sm font-semibold text-blue-800 mb-2">
                        Dia do Mês Preferido (1-31)
                      </label>
                      <input
                        v-model.number="form.diaPreferido"
                        type="number"
                        min="1"
                        max="31"
                        class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div v-if="form.recorrenciaTipo" class="col-span-2">
                      <label class="flex items-center gap-3 cursor-pointer">
                        <input
                          v-model="form.recorrenciaAtivo"
                          type="checkbox"
                          class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span class="text-sm font-semibold text-blue-800">
                          ✅ Recorrência ativa (agendar automaticamente próximas visitas)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Observações -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Observações
                  </label>
                  <textarea
                    v-model="form.observacoes"
                    rows="3"
                    placeholder="Anotações importantes sobre o cliente..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </form>
            </div>

            <!-- Footer Actions -->
            <div class="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3 justify-end flex-shrink-0">
              <button
                type="button"
                @click="$emit('close')"
                class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
              >
                Cancelar
              </button>
              <button
                @click="handleSubmit"
                :disabled="!isFormValid"
                class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-md"
              >
                💾 Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Cliente, Recorrencia, SegmentoCliente, PorteCliente, PotencialCliente, TipoRecorrencia } from '~/types/client'

interface Props {
  isOpen: boolean
  cliente: Cliente | null
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', updates: Partial<Cliente>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref({
  nome: '',
  telefone: '',
  email: '',
  tipo: 'prospecto' as 'cliente' | 'prospecto' | 'inativo',
  segmento: 'otica' as SegmentoCliente,
  porte: undefined as PorteCliente | undefined,
  potencial: undefined as PotencialCliente | undefined,
  proximaVisita: '',
  recorrenciaTipo: '' as TipoRecorrencia | '',
  diaPreferido: undefined as number | undefined,
  recorrenciaAtivo: false,
  observacoes: '',
})

watch(() => props.cliente, (cliente) => {
  if (cliente) {
    form.value = {
      nome: cliente.nome,
      telefone: cliente.telefone || '',
      email: cliente.email || '',
      tipo: cliente.tipo,
      segmento: cliente.segmento,
      porte: cliente.porte,
      potencial: cliente.potencial,
      proximaVisita: cliente.proximaVisita ? cliente.proximaVisita.slice(0, 10) : '',
      recorrenciaTipo: cliente.recorrencia?.tipo || '',
      diaPreferido: cliente.recorrencia?.diaPreferido,
      recorrenciaAtivo: cliente.recorrencia?.ativo || false,
      observacoes: cliente.observacoes || '',
    }
  }
}, { immediate: true })

const isFormValid = computed(() => {
  return form.value.nome && form.value.segmento
})

function handleSubmit() {
  if (!isFormValid.value) return

  const updates: Partial<Cliente> = {
    nome: form.value.nome,
    telefone: form.value.telefone || undefined,
    email: form.value.email || undefined,
    tipo: form.value.tipo,
    segmento: form.value.segmento,
    porte: form.value.porte || undefined,
    potencial: form.value.potencial || undefined,
    proximaVisita: form.value.proximaVisita ? new Date(form.value.proximaVisita).toISOString() : undefined,
    observacoes: form.value.observacoes || undefined,
  }

  if (form.value.recorrenciaTipo) {
    updates.recorrencia = {
      tipo: form.value.recorrenciaTipo as TipoRecorrencia,
      diaPreferido: form.value.diaPreferido,
      ativo: form.value.recorrenciaAtivo,
    }
  } else {
    updates.recorrencia = undefined
  }

  emit('submit', updates)
}

// Reset form when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    form.value = {
      nome: '',
      telefone: '',
      email: '',
      tipo: 'prospecto',
      segmento: 'otica',
      porte: undefined,
      potencial: undefined,
      proximaVisita: '',
      recorrenciaTipo: '',
      diaPreferido: undefined,
      recorrenciaAtivo: false,
      observacoes: '',
    }
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
