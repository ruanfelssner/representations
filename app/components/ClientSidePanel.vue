<template>
  <Transition name="slide">
    <aside
      v-if="isOpen"
      class="h-full w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
    >
      <div class="flex h-full flex-col">
        <div class="bg-gradient-to-r from-sky-400 to-violet-400 px-4 py-3 space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <NTypo as="h2" size="base" weight="bold" class="text-white leading-tight truncate">
                {{ clientData?.nome || 'Selecione um cliente' }}
                <NTypo
                  v-if="clientData?.cnpj"
                  as="span"
                  size="xs"
                  weight="semibold"
                  class="tabular-nums"
                >
                  {{ clientData.cnpj }}
                </NTypo>
              </NTypo>
              <NTypo v-if="clientData?.endereco" size="xs" class="text-white/90 truncate mt-1">
                {{ clientData.endereco }}
              </NTypo>
            </div>
          </div>

          <div class="flex gap-2">
            <NButton
              v-if="clientData?.telefone"
              @click="abrirWhatsApp"
              variant="success"
              leading-icon="mdi:whatsapp"
            >
              {{ clientData.telefone }}
            </NButton>

            <NButton @click="removerCliente" variant="danger" leading-icon="mdi:trash-can-outline" />
            <NButton @click="$emit('edit-client')" leading-icon="mdi:pencil" variant="secondary" />

            <NButton variant="primary" @click="$emit('add-visit')" leading-icon="mdi:plus" label="Visita" />
          </div>
        </div>

        <div v-if="!clientData" class="flex-1 flex items-center justify-center p-6">
          <NTypo size="sm" tone="muted">Clique em um pin no mapa para ver detalhes.</NTypo>
        </div>

        <div v-else class="flex-1 min-h-0 flex flex-col">
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <NBigNumber :value="ultimaVisitaFormatted" label="Último contato" description="" icon="mdi:calendar" />
              <NBigNumber :value="proximaVisitaFormatted" label="Próxima" description="" icon="mdi:calendar" />
              <NBigNumber :value="produtoMaisConsumido || '--'" label="Produto top" description="" icon="mdi:shopping" />
              <NBigNumber :value="formatCurrency(totalVendido90Dias)" label="90 dias" description="" icon="mdi:currency-usd" />
            </div>
          </div>

          <div class="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
            <NTypo as="h3" size="sm" weight="bold">Histórico</NTypo>
            <NTypo as="div" size="xs" tone="muted" class="tabular-nums">
              {{ sortedEventos.length }}
            </NTypo>
          </div>

          <div class="flex-1 min-h-0 overflow-auto px-4 pb-4 space-y-3">
            <div v-if="isLoadingHistorico" class="text-center py-10">
              <NTypo size="sm" tone="muted">Carregando histórico...</NTypo>
            </div>

            <div v-else-if="historicoErrorMessage" class="text-center py-10">
              <NTypo size="sm" tone="danger">{{ historicoErrorMessage }}</NTypo>
            </div>

            <div v-else-if="!sortedEventos.length" class="text-center py-10">
              <NTypo size="sm" tone="muted">Nenhum evento registrado ainda</NTypo>
            </div>

            <div
              v-for="evento in sortedEventos"
              :key="evento.id"
              class="rounded-xl border bg-white p-3 hover:shadow-sm transition-shadow"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <NTypo size="sm" weight="semibold" class="tabular-nums">
                    {{ formatDate(evento.data) }}
                  </NTypo>
                  <NTypo v-if="evento.descricao" size="xs" tone="muted" class="mt-1 clamp-2">
                    {{ evento.descricao }}
                  </NTypo>
                  <NTypo v-if="evento.duracao" size="xs" tone="muted" class="mt-1">
                    ⏱️ {{ evento.duracao }} min
                  </NTypo>
                </div>

                <NTypo
                  as="span"
                  size="xs"
                  weight="semibold"
                  :class="[
                    'shrink-0 px-2 py-1 rounded-full text-[11px]',
                    isVenda(evento.tipo) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ labelTipo(evento.tipo) }}
                </NTypo>
              </div>

              <div v-if="isVenda(evento.tipo)" class="mt-2 space-y-2">
                <NTypo v-if="evento.totalVenda" size="sm" weight="semibold" class="text-green-700 tabular-nums">
                  💵 {{ formatCurrency(evento.totalVenda) }}
                </NTypo>

                <NTypo v-else-if="evento.items && evento.items.length" size="xs" weight="semibold" class="text-green-700">
                  🧾 {{ getTotalItens(evento) }} itens (sem valor)
                </NTypo>

                <div v-if="evento.items && evento.items.length" class="flex flex-wrap gap-1.5">
                  <NTypo
                    v-for="(item, idx) in evento.items"
                    :key="`${evento.id}-${idx}`"
                    as="span"
                    size="xs"
                    weight="medium"
                    class="rounded bg-blue-50 px-2 py-1 text-[11px] text-blue-700"
                  >
                    {{ item.quantidade }}x {{ item.nome }}
                  </NTypo>
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
import { computed, ref, watch } from 'vue'
import { useHistoricoClienteApi } from '~/composables/useHistoricoClienteApi'
import type { Cliente } from '~/types/client'

interface Props {
  isOpen: boolean
  clientData: Cliente | null
  showClose?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'add-visit'): void
  (e: 'edit-client'): void
  (e: 'remove-client'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { fetchHistorico } = useHistoricoClienteApi()
const historico = ref<any[]>([])
const isLoadingHistorico = ref(false)
const historicoErrorMessage = ref('')

watch(
  () => [props.clientData?.id, props.clientData?.updatedAt],
  async ([clientId]) => {
    if (import.meta.server) return
    if (!clientId) {
      historico.value = []
      historicoErrorMessage.value = ''
      return
    }
    isLoadingHistorico.value = true
    historicoErrorMessage.value = ''
    try {
      historico.value = await fetchHistorico(clientId, { limit: 200 })
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err)
      historico.value = []
      historicoErrorMessage.value =
        err?.data?.statusMessage || err?.data?.message || err?.message || 'Falha ao carregar histórico.'
    } finally {
      isLoadingHistorico.value = false
    }
  },
  { immediate: true }
)

function getTotalItens(evento: any) {
  const items = Array.isArray(evento?.items) ? evento.items : []
  return items.reduce((sum: number, p: any) => sum + (Number(p?.quantidade) || 0), 0)
}

function abrirWhatsApp() {
  if (!props.clientData?.telefone) return

  const telefone = props.clientData.telefone.replace(/\D/g, '')
  const mensagem = encodeURIComponent(
    `Olá ${props.clientData.nome}! Sou representante comercial e gostaria de falar com você.`
  )
  const url = `https://wa.me/55${telefone}?text=${mensagem}`
  window.open(url, '_blank')
}

function removerCliente() {
  if (!props.clientData) return

  const confirmar = confirm(
    `Tem certeza que deseja remover o cliente ${props.clientData.nome}? Esta ação não pode ser desfeita.`
  )
  if (confirmar) emit('remove-client')
}

const sortedEventos = computed(() => {
  return Array.isArray(historico.value)
    ? [...historico.value].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    : []
})

const ultimaVisitaFormatted = computed(() => {
  if (!sortedEventos.value.length) return '--'
  return formatDate(sortedEventos.value[0].data)
})

const proximaVisitaFormatted = computed(() => {
  const next =
    props.clientData?.sales?.nextActionAt ||
    sortedEventos.value.find((e: any) => e?.proximoContato)?.proximoContato
  if (!next) return 'Não agendada'
  return formatDate(next)
})

const totalVendido90Dias = computed(() => {
  const dias90Atras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  return sortedEventos.value
    .filter(
      (e: any) =>
        (e.tipo === 'venda_fisica' || e.tipo === 'venda_ligacao') && new Date(e.data) >= dias90Atras
    )
    .reduce((sum: number, e: any) => sum + (Number(e.totalVenda) || 0), 0)
})

const produtoMaisConsumido = computed(() => {
  if (!sortedEventos.value.length) return null
  const produtosCount: Record<string, number> = {}

  sortedEventos.value.forEach((evento: any) => {
    const items = Array.isArray(evento.items) ? evento.items : []
    items.forEach((item: any) => {
      const key = String(item?.nome || item?.produtoId || '')
      if (!key) return
      produtosCount[key] = (produtosCount[key] || 0) + (Number(item?.quantidade) || 0)
    })
  })

  let maxProduto: string | null = null
  let maxCount = 0
  for (const [produto, count] of Object.entries(produtosCount)) {
    if (count > maxCount) {
      maxCount = count
      maxProduto = produto
    }
  }
  return maxProduto
})

function isVenda(tipo: string) {
  return tipo === 'venda_fisica' || tipo === 'venda_ligacao'
}

function labelTipo(tipo: string) {
  if (tipo === 'venda_fisica' || tipo === 'venda_ligacao') return 'Venda'
  if (tipo === 'visita_fisica') return 'Visita'
  if (tipo === 'ligacao') return 'Ligação'
  if (tipo === 'agendamento') return 'Agendamento'
  if (tipo === 'feedback') return 'Feedback'
  return tipo
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
