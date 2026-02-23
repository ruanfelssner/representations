<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          @click="$emit('close')"
        />

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white flex-shrink-0"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">{{ actionMeta.emoji }}</span>
                  <div>
                    <h3 class="text-xl font-bold">
                      {{ evento ? 'Editar Acao' : 'Registrar Acao' }}
                    </h3>
                    <p class="text-sm text-emerald-100">
                      {{ actionMeta.label }} • {{ clienteNome }}
                    </p>
                  </div>
                </div>
                <button
                  @click="$emit('close')"
                  class="rounded-lg p-2 hover:bg-white/20 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
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
                      <option value="visita_fisica">Apresentação presencial</option>
                      <option value="atendimento_online">Apresentação online</option>
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
                      <option value="" disabled>
                        {{ isLoadingSellers ? 'Carregando vendedores...' : 'Selecione...' }}
                      </option>
                      <option v-if="showLegacySellerOption" :value="form.userId">
                        Vendedor atual (nao listado)
                      </option>
                      <option v-for="seller in sellers" :key="seller.id" :value="seller.id">
                        {{ seller.nome }}{{ seller.ativo === false ? ' (inativo)' : '' }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Data da Acao -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Data e horário da ação *
                  </label>
                  <input
                    v-model="form.data"
                    type="datetime-local"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div v-if="form.actionType === 'atendimento_online'">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    🔗 Link da reuniao online
                  </label>
                  <input
                    v-model="form.meetingLink"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      :disabled="isFindingNextSlot || !form.userId"
                      class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      @click="suggestNextAvailableSlot"
                    >
                      {{ isFindingNextSlot ? 'Buscando horario...' : 'Proximo horario disponivel' }}
                    </button>
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Abrir Meet
                    </a>
                  </div>
                  <p class="mt-1 text-[11px] text-slate-500">
                    Abra o Meet, copie o link da sala e cole aqui.
                  </p>
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
                  <div
                    v-if="
                      form.actionType === 'venda_fisica' ||
                      form.actionType === 'venda_online' ||
                      form.actionType === 'venda_telefone'
                    "
                    class="space-y-4 bg-emerald-50 rounded-xl p-4 border border-emerald-200"
                  >
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
                              {{ item.quantidade }}x {{ formatCurrency(item.precoUnitario) }} =
                              <span class="font-semibold text-emerald-700">{{
                                formatCurrency(item.quantidade * item.precoUnitario)
                              }}</span>
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
                            {{
                              produto.categoria === 'oculos'
                                ? '👓'
                                : produto.categoria === 'relogio'
                                  ? '⌚'
                                  : produto.categoria === 'semijoia'
                                    ? '💍'
                                    : '🎁'
                            }}
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
                          :disabled="
                            !novoProduto.produtoId || !novoProduto.quantidade || !novoProduto.preco
                          "
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
            <div
              class="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3 justify-end flex-shrink-0"
            >
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
  initialActionType?:
    | 'visita_fisica'
    | 'atendimento_online'
    | 'ligacao'
    | 'venda_fisica'
    | 'venda_online'
    | 'venda_telefone'
  defaultUserId?: string
  evento?: any // Evento existente para edição
}

type NovoEventoPayload = {
  id?: string
  data: string
  descricao?: string
  tipo:
    | 'visita_fisica'
    | 'ligacao'
    | 'atendimento_online'
    | 'venda_fisica'
    | 'venda_online'
    | 'venda_telefone'
  userId: string
  items?: Array<{ produtoId: string; nome: string; quantidade: number; valorUnitario: number }>
  meetingLink?: string
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
const isLoadingSellers = ref(false)

const form = ref({
  data: new Date().toISOString().slice(0, 16),
  actionType: 'visita_fisica' as
    | 'visita_fisica'
    | 'atendimento_online'
    | 'ligacao'
    | 'venda_fisica'
    | 'venda_online'
    | 'venda_telefone',
  userId: '',
  descricao: '',
  valorVenda: 0,
  produtos: [] as Array<{
    produtoId: string
    nome: string
    quantidade: number
    precoUnitario: number
  }>,
  meetingLink: '',
  duracao: 30 as number | undefined,
  proximoContato: '',
})

const sellers = ref<Array<{ id: string; nome: string; ativo?: boolean }>>([])
const isFindingNextSlot = ref(false)

const novoProduto = ref({
  produtoId: '',
  quantidade: 1,
  preco: 0,
})

type SellerAgendaEvent = {
  tipo?: string
  data?: string
  duracao?: number
}

const SCHEDULED_PRESENTATION_TYPES = new Set(['visita_fisica', 'atendimento_online'])
const DEFAULT_SLOT_DURATION_MINUTES = 30
const SLOT_STEP_MINUTES = 30
const WORKDAY_START_HOUR = 8
const WORKDAY_END_HOUR = 18
const LOOKAHEAD_DAYS = 30

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
      return { label: 'Apresentação online', emoji: '💻', tipo: 'atendimento_online' as const }
    case 'visita_fisica':
    default:
      return { label: 'Apresentação presencial', emoji: '🧑‍💼', tipo: 'visita_fisica' as const }
  }
})

const hasSelectedSellerInOptions = computed(() => {
  const selectedSellerId = String(form.value.userId || '')
  if (!selectedSellerId) return false
  return sellers.value.some((seller) => seller.id === selectedSellerId)
})

const showLegacySellerOption = computed(() => {
  if (!props.evento) return false
  const selectedSellerId = String(form.value.userId || '')
  if (!selectedSellerId) return false
  if (!sellers.value.length) return false
  return !hasSelectedSellerInOptions.value
})

const loadSellers = async () => {
  if (!import.meta.client) return
  isLoadingSellers.value = true
  try {
    const res = await $fetch<{
      success: boolean
      data: Array<{ id: string; nome: string; ativo?: boolean }>
    }>(
      '/api/v1/users?role=vendedor'
    )
    sellers.value = Array.isArray(res.data) ? res.data : []

    const selectedSellerId = String(form.value.userId || '')
    const hasSelectedSeller = sellers.value.some((seller) => seller.id === selectedSellerId)

    if (!selectedSellerId || (!props.evento && !hasSelectedSeller)) {
      const activeSellers = sellers.value.filter((seller) => seller.ativo !== false)
      const preferredFromDefault = props.defaultUserId
        ? sellers.value.find((seller) => seller.id === props.defaultUserId)
        : null
      form.value.userId = preferredFromDefault?.id || activeSellers[0]?.id || sellers.value[0]?.id || ''
    }
  } catch (error) {
    console.error('Erro ao carregar vendedores:', error)
    sellers.value = []
  } finally {
    isLoadingSellers.value = false
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

watch(
  () => form.value.actionType,
  (tipo) => {
    const isVenda = tipo === 'venda_fisica' || tipo === 'venda_online' || tipo === 'venda_telefone'
    if (!isVenda) {
      form.value.valorVenda = 0
      form.value.produtos = []
    }
    if (tipo !== 'atendimento_online') {
      form.value.meetingLink = ''
    }
  }
)

watch(
  () => novoProduto.value.produtoId,
  (produtoId) => {
    if (produtoId) {
      const produto = produtos.value.find((p) => p.id === produtoId)
      if (produto) {
        novoProduto.value.preco = produto.valor
      }
    }
  }
)

const isFormValid = computed(() => {
  if (isLoadingSellers.value) return false
  if (!form.value.data) return false
  if (!form.value.userId) return false
  if (
    sellers.value.length > 0 &&
    !hasSelectedSellerInOptions.value &&
    !showLegacySellerOption.value
  ) {
    return false
  }
  const isVenda =
    form.value.actionType === 'venda_fisica' ||
    form.value.actionType === 'venda_online' ||
    form.value.actionType === 'venda_telefone'
  if (isVenda) {
    if (
      form.value.produtos.length === 0 &&
      (!form.value.valorVenda || form.value.valorVenda <= 0)
    ) {
      return false
    }
  }
  return true
})

function adicionarProduto() {
  if (!novoProduto.value.produtoId || !novoProduto.value.quantidade || !novoProduto.value.preco)
    return

  const produto = produtos.value.find((p) => p.id === novoProduto.value.produtoId)
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

function normalizeMeetingLink(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function toDateTimeLocalInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function addMinutes(date: Date, minutes: number) {
  const next = new Date(date)
  next.setMinutes(next.getMinutes() + minutes)
  return next
}

function isWeekend(date: Date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

function roundUpToSlot(date: Date, slotMinutes = SLOT_STEP_MINUTES) {
  const rounded = new Date(date)
  rounded.setSeconds(0, 0)
  const minutes = rounded.getMinutes()
  const remainder = minutes % slotMinutes
  if (remainder > 0) {
    rounded.setMinutes(minutes + (slotMinutes - remainder))
  }
  return rounded
}

function nextBusinessStart(base: Date) {
  const next = new Date(base)
  next.setHours(WORKDAY_START_HOUR, 0, 0, 0)
  while (isWeekend(next)) {
    next.setDate(next.getDate() + 1)
    next.setHours(WORKDAY_START_HOUR, 0, 0, 0)
  }
  return next
}

function toBusyIntervals(events: SellerAgendaEvent[], now: Date) {
  return events
    .filter((event) => SCHEDULED_PRESENTATION_TYPES.has(String(event?.tipo || '')))
    .map((event) => {
      const start = new Date(String(event?.data || ''))
      if (Number.isNaN(start.getTime())) return null
      const durationRaw = Number(event?.duracao)
      const durationMinutes =
        Number.isFinite(durationRaw) && durationRaw > 0
          ? durationRaw
          : DEFAULT_SLOT_DURATION_MINUTES
      const end = addMinutes(start, durationMinutes)
      return { start, end }
    })
    .filter((interval): interval is { start: Date; end: Date } => !!interval && interval.end > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

function findNextAvailableSlot(
  busyIntervals: Array<{ start: Date; end: Date }>,
  durationMinutes: number,
  baseDate: Date
) {
  let candidate = roundUpToSlot(baseDate)
  const searchDeadline = addMinutes(baseDate, LOOKAHEAD_DAYS * 24 * 60)

  for (let guard = 0; guard < 2000; guard += 1) {
    if (candidate > searchDeadline) return null

    if (isWeekend(candidate)) {
      const nextDay = new Date(candidate)
      nextDay.setDate(nextDay.getDate() + 1)
      candidate = nextBusinessStart(nextDay)
      continue
    }

    const dayStart = new Date(candidate)
    dayStart.setHours(WORKDAY_START_HOUR, 0, 0, 0)
    const dayEnd = new Date(candidate)
    dayEnd.setHours(WORKDAY_END_HOUR, 0, 0, 0)

    if (candidate < dayStart) {
      candidate = new Date(dayStart)
    }

    candidate = roundUpToSlot(candidate)
    const slotEnd = addMinutes(candidate, durationMinutes)

    if (slotEnd > dayEnd) {
      const nextDay = new Date(candidate)
      nextDay.setDate(nextDay.getDate() + 1)
      candidate = nextBusinessStart(nextDay)
      continue
    }

    const conflict = busyIntervals.find(
      (interval) => interval.end > candidate && interval.start < slotEnd
    )
    if (conflict) {
      candidate = roundUpToSlot(conflict.end)
      continue
    }

    return candidate
  }

  return null
}

async function suggestNextAvailableSlot() {
  if (!import.meta.client) return
  if (!form.value.userId) return

  isFindingNextSlot.value = true
  try {
    const now = new Date()
    const query = new URLSearchParams({
      userId: String(form.value.userId),
      from: now.toISOString(),
      limit: '500',
    })
    const res = await $fetch<{ success: boolean; data: SellerAgendaEvent[] }>(
      `/api/v1/historico-cliente?${query.toString()}`
    )

    const events = Array.isArray(res?.data) ? res.data : []
    const busyIntervals = toBusyIntervals(events, now)
    const durationRaw = Number(form.value.duracao)
    const durationMinutes =
      Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : DEFAULT_SLOT_DURATION_MINUTES
    const nextSlot = findNextAvailableSlot(busyIntervals, durationMinutes, now)

    if (!nextSlot) {
      alert('Não encontrei horário livre nos próximos 30 dias para este vendedor.')
      return
    }

    form.value.data = toDateTimeLocalInput(nextSlot)
    if (!form.value.duracao) {
      form.value.duracao = durationMinutes
    }
  } catch (error) {
    console.error('Erro ao sugerir próximo horário disponível:', error)
    alert('Não foi possível buscar o próximo horário disponível agora.')
  } finally {
    isFindingNextSlot.value = false
  }
}

function handleSubmit() {
  if (!isFormValid.value) return

  const isVenda =
    form.value.actionType === 'venda_fisica' ||
    form.value.actionType === 'venda_online' ||
    form.value.actionType === 'venda_telefone'

  // Calcular o total dos produtos
  const totalProdutos = form.value.produtos.reduce(
    (sum, p) => sum + p.quantidade * p.precoUnitario,
    0
  )

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
  const descricaoPrefix =
    form.value.actionType === 'atendimento_online'
      ? 'Apresentação online'
      : form.value.actionType === 'visita_fisica'
        ? 'Apresentação presencial'
        : ''
  const descricao =
    descricaoBase && descricaoPrefix
      ? `${descricaoPrefix} - ${descricaoBase}`
      : descricaoBase || descricaoPrefix || undefined

  const payload: NovoEventoPayload = {
    data: new Date(form.value.data).toISOString(),
    descricao,
    tipo: actionMeta.value.tipo,
    userId: form.value.userId,
    items,
    meetingLink:
      form.value.actionType === 'atendimento_online'
        ? normalizeMeetingLink(form.value.meetingLink)
        : undefined,
    duracao: form.value.duracao,
    proximoContato: form.value.proximoContato
      ? new Date(form.value.proximoContato).toISOString()
      : undefined,
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
    meetingLink: '',
    duracao: DEFAULT_SLOT_DURATION_MINUTES,
    proximoContato: '',
  }
}

// Reset form when modal closes
watch(
  () => props.isOpen,
  (isOpen) => {
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
          meetingLink: props.evento.meetingLink || '',
          duracao:
            typeof props.evento.duracao === 'number' && props.evento.duracao > 0
              ? props.evento.duracao
              : DEFAULT_SLOT_DURATION_MINUTES,
          proximoContato: props.evento.proximoContato
            ? new Date(props.evento.proximoContato).toISOString().slice(0, 16)
            : '',
        }
      } else {
        resetForm()
      }
      loadSellers()
      loadProducts()
      return
    }
    resetForm()
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
