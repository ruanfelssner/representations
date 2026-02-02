<template>
  <Transition name="slide">
    <aside
      v-if="isOpen"
      class="w-full max-w-[400px] bg-white p-4 overflow-auto rounded-lg shadow"
    >
      <!-- Botão Fechar -->
      <button
        @click="$emit('close')"
        class="absolute top-2 right-2 z-10 p-2 hover:bg-white/80 rounded-lg transition-colors flex items-center justify-center bg-white/50 backdrop-blur"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 -mx-4 -mt-4 px-4 py-2 text-white mb-3">
        <h2 class="text-base font-bold mb-0.5">{{ clientData?.nome }}</h2>
        <p class="text-blue-100 text-[10px]">{{ clientData?.endereco }}</p>
        <p class="text-blue-100 text-[10px]">
          {{ clientData?.cidade }} - {{ clientData?.estado }}
        </p>
        <div v-if="clientData?.telefone" class="mt-1 flex items-center gap-1 text-[10px]">
          <span class="text-xs">📞</span>
          <span>{{ clientData.telefone }}</span>
        </div>
      </div>

      <!-- Conteúdo -->
      <div class="p-3 space-y-2 text-xs compact-numbers">
            <!-- BigNumbers Grid - 2 colunas -->
            <div class="grid grid-cols-2 gap-2">
              <NBigNumber
                :value="ultimaVisitaFormatted"
                label="Última Visita"
                description=""
                icon="📅"
                color="blue"
              />
              <NBigNumber
                :value="proximaVisitaFormatted"
                label="Próxima Visita"
                description=""
                icon="🗓️"
                color="purple"
              />
              <NBigNumber
                :value="diasAteProximaFormatted"
                label="Dias até Próxima"
                description=""
                icon="⏰"
                color="cyan"
              />
              <NBigNumber
                :value="formatCurrency(totalVendidoMes)"
                label="Vendido Último Mês"
                description=""
                icon="💰"
                color="green"
              />
              <NBigNumber
                :value="formatCurrency(totalVendido90Dias)"
                label="Vendido 90 Dias"
                description=""
                icon="💵"
                color="emerald"
              />
              <NBigNumber
                :value="formatCurrency(totalVendidoAno)"
                label="Vendido no Ano"
                description=""
                icon="📊"
                color="teal"
              />
            </div>

            <!-- Produto Mais Consumido -->
            <div
              v-if="produtoMaisConsumido"
              class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2 border border-amber-200"
            >
              <div class="flex items-center gap-2">
                <span class="text-xl">🏆</span>
                <div>
                  <div class="text-[10px] font-medium text-amber-800">Produto Mais Consumido</div>
                  <div class="text-xs font-bold text-amber-900">{{ produtoMaisConsumido }}</div>
                </div>
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="$emit('edit-client')"
                class="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-1 text-[10px]"
              >
                <span class="text-sm">✏️</span>
                <span>Editar</span>
              </button>
              
              <button
                @click="$emit('add-visit')"
                class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-1 text-[10px]"
              >
                <span class="text-sm">➕</span>
                <span>Nova Visita</span>
              </button>
            </div>

            <button
              v-if="clientData?.telefone"
              @click="abrirWhatsApp"
              class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-1 text-[10px]"
            >
              <span class="text-sm">📱</span>
              <span>Enviar WhatsApp</span>
            </button>

            <button
              @click="removerCliente"
              class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-1 text-[10px]"
            >
              <span class="text-sm">🗑️</span>
              <span>Remover Cliente</span>
            </button>

        <!-- Timeline de Visitas -->
        <div class="space-y-2">
          <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>📋</span>
            <span>Histórico de Visitas</span>
          </h3>

          <div v-if="!sortedVisitas.length" class="text-center py-8 text-gray-500">
            Nenhuma visita registrada ainda
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="visita in sortedVisitas"
              :key="visita.id"
              class="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">
                    {{ visita.vendeuAlgo ? '✅' : '📝' }}
                  </span>
                  <div>
                    <div class="font-semibold text-gray-900">
                      {{ formatDate(visita.data) }}
                    </div>
                    <div v-if="visita.duracao" class="text-xs text-gray-500">
                      Duração: {{ visita.duracao }} min
                    </div>
                  </div>
                </div>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    visita.vendeuAlgo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ visita.vendeuAlgo ? 'Venda Realizada' : 'Sem Venda' }}
                </span>
              </div>

              <p class="text-sm text-gray-700 mb-2">{{ visita.descricao }}</p>

              <div v-if="visita.vendeuAlgo" class="space-y-2">
                <div
                  v-if="visita.valorVenda"
                  class="flex items-center gap-2 text-sm font-semibold text-green-700"
                >
                  <span>💵</span>
                  <span>{{ formatCurrency(visita.valorVenda) }}</span>
                </div>

                <div v-if="visita.produtos && visita.produtos.length" class="flex flex-wrap gap-2">
                  <span
                    v-for="(produto, idx) in visita.produtos"
                    :key="idx"
                    class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                  >
                    {{ produto.quantidade }}x {{ produto.nome }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import type { Cliente } from '~/types/client'

interface Props {
  isOpen: boolean
  clientData: Cliente | null
}

interface Emits {
  (e: 'close'): void
  (e: 'add-visit'): void
  (e: 'edit-client'): void
  (e: 'remove-client'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function abrirWhatsApp() {
  if (!props.clientData?.telefone) return
  
  const telefone = props.clientData.telefone.replace(/\D/g, '')
  const mensagem = encodeURIComponent(`Olá ${props.clientData.nome}! Sou representante comercial e gostaria de falar com você.`)
  const url = `https://wa.me/55${telefone}?text=${mensagem}`
  window.open(url, '_blank')
}

function removerCliente() {
  if (!props.clientData) return
  
  const confirmar = confirm(`Tem certeza que deseja remover o cliente ${props.clientData.nome}? Esta ação não pode ser desfeita.`)
  if (confirmar) {
    emit('remove-client')
  }
}

const sortedVisitas = computed(() => {
  if (!props.clientData?.visitas) return []
  return [...props.clientData.visitas].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )
})

const ultimaVisitaFormatted = computed(() => {
  if (!sortedVisitas.value.length) return '--'
  const ultima = sortedVisitas.value[0]
  if (!ultima) return '--'
  return formatDate(ultima.data)
})

const proximaVisitaFormatted = computed(() => {
  if (!props.clientData?.proximaVisita) return 'Não agendada'
  return formatDate(props.clientData.proximaVisita)
})

const diasAteProximaFormatted = computed(() => {
  if (!props.clientData?.proximaVisita) return '--'
  const hoje = new Date()
  const proxima = new Date(props.clientData.proximaVisita)
  const dias = Math.ceil((proxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  if (dias < 0) return 'Atrasada'
  if (dias === 0) return 'Hoje'
  return `${dias} dias`
})

const totalVendidoMes = computed(() => {
  if (!props.clientData?.visitas) return 0
  const mesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  return props.clientData.visitas
    .filter((v) => v.vendeuAlgo && new Date(v.data) >= mesAtras)
    .reduce((sum, v) => sum + (v.valorVenda || 0), 0)
})

const totalVendido90Dias = computed(() => {
  if (!props.clientData?.visitas) return 0
  const dias90Atras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  return props.clientData.visitas
    .filter((v) => v.vendeuAlgo && new Date(v.data) >= dias90Atras)
    .reduce((sum, v) => sum + (v.valorVenda || 0), 0)
})

const totalVendidoAno = computed(() => {
  if (!props.clientData?.visitas) return 0
  const anoAtras = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  return props.clientData.visitas
    .filter((v) => v.vendeuAlgo && new Date(v.data) >= anoAtras)
    .reduce((sum, v) => sum + (v.valorVenda || 0), 0)
})

const produtoMaisConsumido = computed(() => {
  if (!props.clientData?.visitas) return null
  const produtosCount: Record<string, number> = {}

  props.clientData.visitas.forEach((visita) => {
    visita.produtos?.forEach((produto) => {
      // Agora produto é ProdutoVendido, não string
      const key = produto.nome || String(produto)
      produtosCount[key] = (produtosCount[key] || 0) + (typeof produto === 'object' ? produto.quantidade : 1)
    })
  })

  let maxProduto: string | null = null
  let maxCount = 0
  Object.entries(produtosCount).forEach(([produto, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxProduto = produto
    }
  })

  return maxProduto
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from > div:last-child,
.slide-leave-to > div:last-child {
  transform: translateX(100%);
}

/* Reduzir tamanhos no NBigNumber */
.compact-numbers :deep(.text-3xl),
.compact-numbers :deep(.text-2xl),
.compact-numbers :deep(.text-xl) {
  font-size: 0.75rem !important;
  line-height: 1rem !important;
}

.compact-numbers :deep(.text-lg) {
  font-size: 0.65rem !important;
  line-height: 0.9rem !important;
}

.compact-numbers :deep(.text-base),
.compact-numbers :deep(.text-sm) {
  font-size: 0.625rem !important;
  line-height: 0.875rem !important;
}
</style>
