<template>
  <Transition name="slide">
    <aside
      v-if="isOpen"
      class="h-full w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
    >
      <!-- Header -->
      <div class="flex h-full flex-col">
        <div class="bg-gradient-to-r from-sky-400 to-violet-400 px-4 py-3 space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <NTypo as="h2" size="base" weight="bold" class="text-white leading-tight truncate">
                {{ clientData?.nome || 'Selecione um cliente' }} 
                <NTypo v-if="clientData?.cnpj" as="span" size="xs" weight="semibold" class="tabular-nums">
                  {{ clientData.cnpj }}
                </NTypo>
              </NTypo>
              <NTypo
                v-if="clientData?.endereco"
                size="xs"
                class="text-white/90 truncate mt-1"
              >
                {{ clientData.endereco }}
              </NTypo>
            </div>
          </div>
          <div class="flex gap-2">
            
            <NButton
              v-if="clientData?.telefone"
              @click="abrirWhatsApp"
              variant="success"
              leading-icon="mdi:whatsapp">
               {{ clientData.telefone }}
            </NButton>
            
            <NButton
              @click="removerCliente"
              variant="danger"
              leading-icon="mdi:trash-can-outline"/>
              <NButton
                @click="$emit('edit-client')" 
                leading-icon="mdi:pencil"
                variant="secondary" />

              <NButton
              variant="primary"
                @click="$emit('add-visit')" leading-icon="mdi:plus" label="Visita"/>
          </div>
        </div>

        <div v-if="!clientData" class="flex-1 flex items-center justify-center p-6">
          <NTypo size="sm" tone="muted">Clique em um pin no mapa para ver detalhes.</NTypo>
        </div>

        <div v-else class="flex-1 min-h-0 flex flex-col">
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <NBigNumber :value="ultimaVisitaFormatted" label="Última visita" description="" icon="mdi:calendar" />
              <NBigNumber :value="proximaVisitaFormatted" label="Próxima" description="" icon="mdi:calendar" />
              <NBigNumber :value="produtoMaisConsumido" label="Produto mais vendido" description="" icon="mdi:shopping" />
              <NBigNumber :value="formatCurrency(totalVendido90Dias)" label="90 dias" description="" icon="mdi:currency-usd" />
            </div>
          </div>

          <div class="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
            <NTypo as="h3" size="sm" weight="bold">Histórico</NTypo>
            <NTypo as="div" size="xs" tone="muted" class="tabular-nums">{{ sortedVisitas.length }}</NTypo>
          </div>

          <div class="flex-1 min-h-0 overflow-auto px-4 pb-4 space-y-3">
            <div v-if="!sortedVisitas.length" class="text-center py-10">
              <NTypo size="sm" tone="muted">Nenhuma visita registrada ainda</NTypo>
            </div>

            <div
              v-for="visita in sortedVisitas"
              :key="visita.id"
              class="rounded-xl border bg-white p-3 hover:shadow-sm transition-shadow"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <NTypo size="sm" weight="semibold" class="tabular-nums">
                    {{ formatDate(visita.data) }}
                  </NTypo>
                  <NTypo v-if="visita.descricao" size="xs" tone="muted" class="mt-1 clamp-2">
                    {{ visita.descricao }}
                  </NTypo>
                  <NTypo v-if="visita.duracao" size="xs" tone="muted" class="mt-1">
                    ⏱️ {{ visita.duracao }} min
                  </NTypo>
                </div>

                <NTypo
                  as="span"
                  size="xs"
                  weight="semibold"
                  :class="[
                    'shrink-0 px-2 py-1 rounded-full text-[11px]',
                    visita.vendeuAlgo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ visita.vendeuAlgo ? 'Venda' : 'Sem venda' }}
                </NTypo>
              </div>

              <div v-if="visita.vendeuAlgo" class="mt-2 space-y-2">
                <NTypo v-if="visita.valorVenda" size="sm" weight="semibold" class="text-green-700 tabular-nums">
                  💵 {{ formatCurrency(visita.valorVenda) }}
                </NTypo>

                <NTypo
                  v-else-if="visita.produtos && visita.produtos.length"
                  size="xs"
                  weight="semibold"
                  class="text-green-700"
                >
                  🧾 {{ getTotalItens(visita) }} itens (sem valor)
                </NTypo>

                <div v-if="visita.produtos && visita.produtos.length" class="flex flex-wrap gap-1.5">
                  <NTypo
                    v-for="(produto, idx) in visita.produtos"
                    :key="idx"
                    as="span"
                    size="xs"
                    weight="medium"
                    class="rounded bg-blue-50 px-2 py-1 text-[11px] text-blue-700"
                  >
                    {{ produto.quantidade }}x {{ produto.nome }}
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

const showClose = computed(() => Boolean(props.showClose))

function getTotalItens(visita: any) {
  const produtos = Array.isArray(visita?.produtos) ? visita.produtos : []
  return produtos.reduce((sum: number, p: any) => sum + (Number(p?.quantidade) || 0), 0)
}

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
