<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="$emit('close')" />

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div class="bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-5 text-white flex-shrink-0">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-bold">Editar Cliente</h3>
                  <p class="text-sm text-white/80">{{ cliente?.nome || '' }}</p>
                </div>
                <button @click="$emit('close')" class="rounded-lg p-2 hover:bg-white/20 transition-colors">
                  <NIcon name="mdi:close" class="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div class="overflow-y-auto flex-1 p-6">
              <form @submit.prevent="handleSubmit" class="space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
                    <input
                      v-model="form.nome"
                      type="text"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Segmento</label>
                    <select
                      v-model="form.segmento"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="joalheria">💎 Joalheria</option>
                      <option value="relojoaria">⌚ Relojoaria</option>
                      <option value="otica">👓 Ótica</option>
                      <option value="outros">🏪 Outros</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      v-model="form.status"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="potencial">Potencial</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                    <input
                      v-model="form.telefone"
                      type="text"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      v-model="form.email"
                      type="email"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Endereço completo (re-geocodifica)
                    </label>
                    <div class="space-y-2">
                      <textarea
                        v-model="form.endereco_completo"
                        rows="2"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                        placeholder="Ex: Rua X, Bairro Y, Cidade/UF, CEP..."
                      />
                      <button
                        type="button"
                        @click="buscarCoordenadas"
                        :disabled="!form.endereco_completo.trim() || buscandoCoordenadas"
                        class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        <NIcon :name="buscandoCoordenadas ? 'mdi:loading' : 'mdi:map-marker-radius'" :class="{ 'animate-spin': buscandoCoordenadas }" class="w-4 h-4" />
                        {{ buscandoCoordenadas ? 'Buscando...' : 'Buscar Coordenadas' }}
                      </button>
                      
                      <div v-if="coordenadasAtualizadas" class="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <NIcon name="mdi:check-circle" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div class="text-sm">
                          <p class="font-semibold text-green-900">Coordenadas atualizadas com sucesso!</p>
                          <p class="text-green-700 mt-1">
                            <span class="font-medium">Antiga:</span> {{ coordenadasAntigas }}<br>
                            <span class="font-medium">Nova:</span> {{ coordenadasNovas }}
                          </p>
                          <p class="text-green-600 text-xs mt-1">As coordenadas serão salvas ao clicar em "Salvar"</p>
                        </div>
                      </div>

                      <div v-if="erroGeocoding" class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <NIcon name="mdi:alert-circle" class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div class="text-sm">
                          <p class="font-semibold text-red-900">Erro ao buscar coordenadas</p>
                          <p class="text-red-700 mt-1">{{ erroGeocoding }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="border-t pt-5">
                  <h4 class="text-sm font-bold text-gray-900 mb-3">Camada comercial</h4>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Etapa</label>
                      <select
                        v-model="form.stage"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        <option value="">(não definido)</option>
                        <option value="lead">Lead</option>
                        <option value="ativo">Ativo</option>
                        <option value="negociacao">Negociação</option>
                        <option value="perdido">Perdido</option>
                        <option value="reativacao">Reativação</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Pontuação (0–100)</label>
                      <input
                        v-model.number="form.priorityScore"
                        type="number"
                        min="0"
                        max="100"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Próxima ação</label>
                      <select
                        v-model="form.nextActionType"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        <option value="">(não definido)</option>
                        <option value="ligar">Ligar</option>
                        <option value="visitar">Visitar</option>
                        <option value="enviar_catalogo">Enviar catálogo</option>
                        <option value="cobrar">Cobrar</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Data da próxima ação</label>
                      <input
                        v-model="form.nextActionAt"
                        type="datetime-local"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

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
                class="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-violet-500 text-white rounded-lg hover:from-sky-600 hover:to-violet-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-md"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Cliente } from '~/types/client'

interface Props {
  isOpen: boolean
  cliente: Cliente | null
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', updates: Record<string, unknown>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref({
  nome: '',
  telefone: '',
  email: '',
  segmento: 'otica',
  status: 'potencial',
  endereco_completo: '',
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,

  stage: '' as '' | 'lead' | 'ativo' | 'negociacao' | 'perdido' | 'reativacao',
  priorityScore: undefined as number | undefined,
  nextActionType: '' as '' | 'ligar' | 'visitar' | 'enviar_catalogo' | 'cobrar',
  nextActionAt: '',
})

const buscandoCoordenadas = ref(false)
const coordenadasAtualizadas = ref(false)
const coordenadasAntigas = ref('')
const coordenadasNovas = ref('')
const erroGeocoding = ref('')

watch(
  () => props.cliente,
  (cliente) => {
    if (!cliente) return
    form.value = {
      nome: cliente.nome,
      telefone: cliente.telefone || '',
      email: cliente.email || '',
      segmento: (cliente.segmento as any) || 'otica',
      status: (cliente.status as any) || 'potencial',
      endereco_completo: cliente.endereco_completo || cliente.endereco?.endereco_completo || '',
      lat: (cliente as any).lat,
      lng: (cliente as any).lng,
      stage: (cliente.sales?.stage as any) || '',
      priorityScore: typeof cliente.sales?.priorityScore === 'number' ? cliente.sales.priorityScore : undefined,
      nextActionType: (cliente.sales?.nextActionType as any) || '',
      nextActionAt: cliente.sales?.nextActionAt ? cliente.sales.nextActionAt.slice(0, 16) : '',
    }
    coordenadasAtualizadas.value = false
    erroGeocoding.value = ''
  },
  { immediate: true }
)

const isFormValid = computed(() => Boolean(form.value.nome.trim()))

async function buscarCoordenadas() {
  if (!form.value.endereco_completo.trim()) return

  buscandoCoordenadas.value = true
  erroGeocoding.value = ''
  coordenadasAtualizadas.value = false

  try {
    const response = await $fetch('/api/v1/geocode', {
      method: 'POST',
      body: { address: form.value.endereco_completo.trim() }
    })

    if (response.data?.lat && response.data?.lng) {
      coordenadasAntigas.value = form.value.lat && form.value.lng 
        ? `${form.value.lat.toFixed(6)}, ${form.value.lng.toFixed(6)}`
        : 'N/A'
      
      form.value.lat = response.data.lat
      form.value.lng = response.data.lng
      
      coordenadasNovas.value = `${response.data.lat.toFixed(6)}, ${response.data.lng.toFixed(6)}`
      coordenadasAtualizadas.value = true
    } else {
      erroGeocoding.value = 'Nenhuma coordenada encontrada para este endereço.'
    }
  } catch (error: any) {
    console.error('Erro ao buscar coordenadas:', error)
    erroGeocoding.value = error?.data?.message || 'Erro ao buscar coordenadas. Tente novamente.'
  } finally {
    buscandoCoordenadas.value = false
  }
}

function handleSubmit() {
  if (!isFormValid.value) return

  const updates: Record<string, unknown> = {
    nome: form.value.nome.trim(),
    telefone: form.value.telefone.trim() || undefined,
    email: form.value.email.trim() || undefined,
    segmento: form.value.segmento || undefined,
    status: form.value.status,
    sales: {
      stage: form.value.stage || undefined,
      priorityScore: typeof form.value.priorityScore === 'number' ? form.value.priorityScore : undefined,
      nextActionType: form.value.nextActionType || undefined,
      nextActionAt: form.value.nextActionAt ? new Date(form.value.nextActionAt).toISOString() : undefined,
    },
  }

  if (form.value.endereco_completo.trim()) {
    updates.endereco_completo = form.value.endereco_completo.trim()
  }

  // Incluir coordenadas se foram atualizadas
  if (form.value.lat !== undefined && form.value.lng !== undefined) {
    updates.lat = form.value.lat
    updates.lng = form.value.lng
  }

  emit('submit', updates)
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) return
    form.value = {
      nome: '',
      telefone: '',
      email: '',
      segmento: 'otica',
      status: 'potencial',
      endereco_completo: '',
      lat: undefined,
      lng: undefined,
      stage: '',
      priorityScore: undefined,
      nextActionType: '',
      nextActionAt: '',
    }
    coordenadasAtualizadas.value = false
    erroGeocoding.value = ''
  }
)
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
