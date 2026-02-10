<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="$emit('close')" />

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">{{ actionMeta.emoji }}</span>
                    <div>
                      <h3 class="text-xl font-bold">{{ evento ? 'Editar Acao' : 'Registrar Acao' }}</h3>
                      <p class="text-sm text-emerald-100">{{ actionMeta.label }} • {{ clienteNome }}</p>
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
              <form @submit.prevent="handleSubmit" class="space-y-5">
                <div class="grid gap-4 md:grid-cols-2">
                  <!-- Tipo de acao -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      🧭 Tipo de acao
                    </label>
                    <select
                      v-model="form.actionType"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="visita_fisica">Visita fisica</option>
                      <option value="atendimento_online">Atendimento online</option>
                      <option value="ligacao">Ligacao</option>
                      <option value="venda_fisica">Venda fisica</option>
                      <option value="venda_online">Venda online</option>
                      <option value="venda_telefone">Venda por telefone</option>
                    </select>
                  </div>

                  <!-- Vendedor -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      👤 Vendedor
                    </label>
                    <select
                      v-model="form.userId"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      <option v-for="seller in sellers" :key="seller.id" :value="seller.id">
                        {{ seller.nome }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Data da Acao -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Data da acao *
                  </label>
                  <input
                    v-model="form.data"
                    type="datetime-local"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <!-- Descrição -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    📋 Descricao da acao
                  </label>
                  <textarea
                    v-model="form.descricao"
                    rows="3"
                    placeholder="Ex: Apresentação de nova linha de óculos de sol..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                <!-- Duração e Próximo contato lado a lado -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Duração -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      ⏱️ Duração (minutos)
                    </label>
                    <input
                      v-model.number="form.duracao"
                      type="number"
                      min="1"
                      placeholder="Ex: 45"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Próximo contato -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      📌 Próximo contato
                    </label>
                    <input
                      v-model="form.proximoContato"
                      type="datetime-local"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <!-- Campos de Venda (aparecem se tipo = venda) -->
                <Transition name="slide-down">
                  <div v-if="form.actionType === 'venda_fisica' || form.actionType === 'venda_online' || form.actionType === 'venda_telefone'" class="space-y-4 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <!-- Valor da Venda -->
                    <div>
                      <label class="block text-sm font-semibold text-emerald-800 mb-2">
                        💵 Valor Total da Venda (R$) *
                      </label>
                      <input
                        v-model.number="form.valorVenda"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="Ex: 1500.00"
                        class="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    <!-- Produtos Vendidos -->
                    <div>
                      <label class="block text-sm font-semibold text-emerald-800 mb-2">
                        🛒 Produtos Vendidos
                      </label>
                      
                      <!-- Lista de Produtos Adicionados -->
                      <div v-if="form.produtos.length > 0" class="space-y-2 mb-3">
                        <div
                          v-for="(item, index) in form.produtos"
                          :key="index"
                          class="flex items-center gap-3 bg-white p-3 rounded-lg border border-emerald-200"
                        >
                          <div class="flex-1">
                            <div class="font-medium text-gray-900">{{ item.nome }}</div>
                            <div class="text-sm text-gray-600">
                              {{ item.quantidade }}x {{ formatCurrency(item.precoUnitario) }}
                              = <span class="font-semibold text-emerald-700">{{ formatCurrency(item.quantidade * item.precoUnitario) }}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            @click="removeProduto(index)"
                            class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <!-- Formulário de Adicionar Produto -->
                      <div class="space-y-3 bg-white p-4 rounded-lg border border-emerald-300">
                        <select
                          v-model="novoProduto.produtoId"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Selecione um produto...</option>
                          <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
                            {{ produto.categoria === 'oculos' ? '👓' : produto.categoria === 'relogio' ? '⌚' : produto.categoria === 'semijoia' ? '💍' : '🎁' }}
                            {{ produto.nome }} - {{ formatCurrency(produto.valor) }}
                          </option>
                        </select>

                        <div class="grid grid-cols-2 gap-3">
                          <input
                            v-model.number="novoProduto.quantidade"
                            type="number"
                            min="1"
                            placeholder="Quantidade"
                            class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            v-model.number="novoProduto.preco"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Preço unitário"
                            class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>

                        <button
                          type="button"
                          @click="adicionarProduto"
                          :disabled="!novoProduto.produtoId || !novoProduto.quantidade || !novoProduto.preco"
                          class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
                        >
                          ➕ Adicionar Produto
                        </button>
                      </div>
                    </div>
                  </div>
                </Transition>
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
                class="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-md"
              >
                💾 Salvar Acao
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
import type { ProdutoDto } from '~/types/produto'

interface Props {
  isOpen: boolean
  clienteNome: string
  initialActionType?: 'visita_fisica' | 'atendimento_online' | 'ligacao' | 'venda_fisica' | 'venda_online' | 'venda_telefone'
  defaultUserId?: string
  evento?: any // Evento existente para edição
}

type NovoEventoPayload = {
  id?: string
  data: string
  descricao: string
  tipo: 'visita_fisica' | 'venda_fisica' | 'ligacao'
  userId: string
  items?: Array<{ produtoId: string; nome: string; quantidade: number; valorUnitario: number }>
  duracao?: number
  proximoContato?: string
  resultado?: 'sucesso' | 'pendente' | 'fracasso'
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', payload: NovoEventoPayload): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const produtos = ref<ProdutoDto[]>([])

const form = ref({
  data: new Date().toISOString().slice(0, 16),
  actionType: 'visita_fisica' as 'visita_fisica' | 'atendimento_online' | 'ligacao' | 'venda_fisica' | 'venda_online' | 'venda_telefone',
  userId: '',
  descricao: '',
  valorVenda: 0,
  produtos: [] as Array<{ produtoId: string; nome: string; quantidade: number; precoUnitario: number }>,
  duracao: undefined as number | undefined,
  proximoContato: '',
})

const sellers = ref<Array<{ id: string; nome: string }>>([])

const novoProduto = ref({
  produtoId: '',
  quantidade: 1,
  preco: 0,
})

const actionMeta = computed(() => {
  switch (form.value.actionType) {
    case 'venda_fisica':
      return { label: 'Venda fisica', emoji: '💰', tipo: 'venda_fisica' as const }
    case 'venda_online':
      return { label: 'Venda online', emoji: '🛒', tipo: 'venda_online' as const }
    case 'venda_telefone':
      return { label: 'Venda por telefone', emoji: '📱', tipo: 'venda_telefone' as const }
    case 'ligacao':
      return { label: 'Ligacao', emoji: '📞', tipo: 'ligacao' as const }
    case 'atendimento_online':
      return { label: 'Atendimento online', emoji: '💻', tipo: 'ligacao' as const }
    case 'visita_fisica':
    default:
      return { label: 'Visita fisica', emoji: '📝', tipo: 'visita_fisica' as const }
  }
})

const loadSellers = async () => {
  if (!import.meta.client) return
  try {
    const res = await $fetch<{ success: boolean; data: Array<{ id: string; nome: string }> }>(
      '/api/v1/users?role=vendedor&ativo=true'
    )
    sellers.value = Array.isArray(res.data) ? res.data : []
    if (!form.value.userId && props.defaultUserId) {
      form.value.userId = props.defaultUserId
    }
    if (!form.value.userId && sellers.value.length) {
      form.value.userId = sellers.value[0].id
    }
  } catch (error) {
    console.error('Erro ao carregar vendedores:', error)
    sellers.value = []
  }
}

const loadProducts = async () => {
  if (!import.meta.client) return
  if (produtos.value.length) return
  try {
    const res = await $fetch<{ success: boolean; data: ProdutoDto[] }>('/api/v1/produtos')
    produtos.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
    produtos.value = []
  }
}

watch(() => form.value.actionType, (tipo) => {
  const isVenda = tipo === 'venda_fisica' || tipo === 'venda_online' || tipo === 'venda_telefone'
  if (!isVenda) {
    form.value.valorVenda = 0
    form.value.produtos = []
  }
})

watch(() => novoProduto.value.produtoId, (produtoId) => {
  if (produtoId) {
    const produto = produtos.value.find(p => p.id === produtoId)
    if (produto) {
      novoProduto.value.preco = produto.valor
    }
  }
})

const isFormValid = computed(() => {
  if (!form.value.data) return false
  if (!form.value.userId) return false
  const isVenda = form.value.actionType === 'venda_fisica' || form.value.actionType === 'venda_online' || form.value.actionType === 'venda_telefone'
  if (isVenda) {
    if (form.value.produtos.length === 0 && (!form.value.valorVenda || form.value.valorVenda <= 0)) {
      return false
    }
  }
  return true
})

function adicionarProduto() {
  if (!novoProduto.value.produtoId || !novoProduto.value.quantidade || !novoProduto.value.preco) return

  const produto = produtos.value.find(p => p.id === novoProduto.value.produtoId)
  if (!produto) return

  form.value.produtos.push({
    produtoId: novoProduto.value.produtoId,
    nome: produto.nome,
    quantidade: novoProduto.value.quantidade,
    precoUnitario: novoProduto.value.preco,
  })

  // Resetar formulário de produto
  novoProduto.value = {
    produtoId: '',
    quantidade: 1,
    preco: 0,
  }
}

function removeProduto(index: number) {
  form.value.produtos.splice(index, 1)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function handleSubmit() {
  if (!isFormValid.value) return

  const isVenda = form.value.actionType === 'venda_fisica' || form.value.actionType === 'venda_online' || form.value.actionType === 'venda_telefone'
  
  // Calcular o total dos produtos
  const totalProdutos = form.value.produtos.reduce((sum, p) => sum + (p.quantidade * p.precoUnitario), 0)
  
  // Se tem produtos E o valor manual é diferente da soma, substituir por um item genérico
  const items =
    isVenda && form.value.valorVenda > 0 && form.value.valorVenda !== totalProdutos
      ? [
          {
            produtoId: 'produto-generico',
            nome: 'Venda sem detalhes',
            quantidade: 1,
            valorUnitario: form.value.valorVenda,
          },
        ]
      : isVenda && form.value.produtos.length > 0
        ? form.value.produtos.map((p) => ({
            produtoId: p.produtoId,
            nome: p.nome,
            quantidade: p.quantidade,
            valorUnitario: p.precoUnitario,
          }))
        : isVenda && form.value.valorVenda > 0
          ? [
              {
                produtoId: 'produto-generico',
                nome: 'Venda sem detalhes',
                quantidade: 1,
                valorUnitario: form.value.valorVenda,
              },
            ]
          : undefined

  const descricaoBase = form.value.descricao.trim()
  const descricao =
    form.value.actionType === 'atendimento_online'
      ? `Atendimento online - ${descricaoBase}`
      : descricaoBase

  const payload: NovoEventoPayload = {
    data: new Date(form.value.data).toISOString(),
    descricao,
    tipo: actionMeta.value.tipo,
    userId: form.value.userId,
    items,
    duracao: form.value.duracao,
    proximoContato: form.value.proximoContato ? new Date(form.value.proximoContato).toISOString() : undefined,
    resultado: isVenda ? 'sucesso' : 'pendente',
  }

  // Incluir ID se for edição
  if (props.evento?.id) {
    payload.id = props.evento.id
  }

  emit('submit', payload)
  resetForm()
}

function resetForm() {
  form.value = {
    data: new Date().toISOString().slice(0, 16),
    actionType: props.initialActionType || 'visita_fisica',
    userId: props.defaultUserId || '',
    descricao: '',
    valorVenda: 0,
    produtos: [],
    duracao: undefined,
    proximoContato: '',
  }
}

// Reset form when modal closes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.evento) {
      // Preencher formulário com dados do evento existente
      const eventoData = new Date(props.evento.data)
      const items = props.evento.items || []
      form.value = {
        data: eventoData.toISOString().slice(0, 16),
        actionType: props.evento.tipo || 'visita_fisica',
        userId: props.evento.userId || props.defaultUserId || '',
        descricao: props.evento.descricao || '',
        valorVenda: props.evento.totalVenda || 0,
        produtos: items.map((item: any) => ({
          produtoId: item.produtoId,
          nome: item.nome,
          quantidade: item.quantidade,
          precoUnitario: item.valorUnitario,
        })),
        duracao: props.evento.duracao,
        proximoContato: props.evento.proximoContato ? new Date(props.evento.proximoContato).toISOString().slice(0, 16) : '',
      }
    } else {
      resetForm()
    }
    loadSellers()
    loadProducts()
    return
  }
  resetForm()
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
