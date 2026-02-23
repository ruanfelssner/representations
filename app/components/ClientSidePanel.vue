<template>
  <Transition name="slide">
    <aside
      v-if="isOpen"
      class="relative h-full w-full overflow-visible rounded-2xl border border-gray-100 bg-white shadow-lg"
    >
      <div class="flex h-full flex-col">
        <div class="bg-gradient-to-r from-sky-400 to-violet-400 px-4 py-3 space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <NTypo as="h2" size="base" weight="bold" class="text-white leading-tight truncate">
                {{ clientData?.nome || 'Selecione um cliente' }}
              </NTypo>

              <div v-if="clientData" class="mt-1 flex items-center gap-2">
                <NTypo
                  v-if="clientData?.cnpj"
                  as="span"
                  size="xs"
                  weight="semibold"
                  class="tabular-nums text-white/90"
                >
                  {{ clientData.cnpj }}
                </NTypo>
                <span
                  class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                  :class="statusMeta.chipClass"
                >
                  <span class="h-2 w-2 rounded-full" :class="statusMeta.dotClass" />
                  {{ statusMeta.emoji }} {{ statusMeta.label }}
                </span>
              </div>
              <NTypo v-if="clientData?.endereco" size="xs" class="text-white/90 mt-1">
                {{ clientData.endereco }}
              </NTypo>

              <NTypo v-if="clientData?.email" size="xs" class="text-white/90 mt-1">
                {{ clientData.email }}
              </NTypo>

              <NTypo v-if="clientData?.telefone" size="xs" class="text-white/90 mt-1">
                {{ clientData.telefone }}
              </NTypo>
            </div>
          </div>

          <div class="flex flex-wrap gap-1">
            <NButton
              v-if="clientData?.telefone"
              @click="abrirWhatsApp"
              variant="success"
              size="xs"
              leading-icon="mdi:whatsapp"
            />

            <template v-if="!isProspect">
              <NButton
                @click="removerCliente"
                variant="danger"
                size="xs"
                leading-icon="mdi:trash-can-outline"
              />
              <NButton
                @click="$emit('edit-client')"
                leading-icon="mdi:pencil"
                size="xs"
                variant="secondary"
              />
              <div class="relative">
                <NButton
                  variant="primary"
                  size="xs"
                  leading-icon="mdi:plus"
                  label="Acao"
                  @click="toggleActionMenu"
                />
                <NLayer
                  v-if="isActionMenuOpen"
                  variant="solid"
                  size="xs"
                  radius="soft"
                  class="absolute right-0 z-30 mt-2 w-48 border border-[color:var(--layer-border)] bg-[color:var(--layer-solid)] p-2 shadow-lg"
                >
                  <button
                    class="w-full rounded-lg px-3 py-2 text-left text-sm text-[color:var(--ntypo-default)] hover:bg-[color:var(--layer-muted)]"
                    @click="selectAction('visita_fisica')"
                  >
                    Agendar apresentação presencial
                  </button>
                  <button
                    class="w-full rounded-lg px-3 py-2 text-left text-sm text-[color:var(--ntypo-default)] hover:bg-[color:var(--layer-muted)]"
                    @click="selectAction('atendimento_online')"
                  >
                    Agendar apresentação online
                  </button>
                  <button
                    class="w-full rounded-lg px-3 py-2 text-left text-sm text-[color:var(--ntypo-default)] hover:bg-[color:var(--layer-muted)]"
                    @click="selectAction('ligacao')"
                  >
                    Ligacao
                  </button>
                  <button
                    class="w-full rounded-lg px-3 py-2 text-left text-sm text-[color:var(--ntypo-default)] hover:bg-[color:var(--layer-muted)]"
                    @click="selectAction('venda_fisica')"
                  >
                    Venda fisica
                  </button>
                  <button
                    class="w-full rounded-lg px-3 py-2 text-left text-sm text-[color:var(--ntypo-default)] hover:bg-[color:var(--layer-muted)]"
                    @click="selectAction('venda_online')"
                  >
                    Venda online
                  </button>
                  <button
                    class="w-full rounded-lg px-3 py-2 text-left text-sm text-[color:var(--ntypo-default)] hover:bg-[color:var(--layer-muted)]"
                    @click="selectAction('venda_telefone')"
                  >
                    Venda por telefone
                  </button>
                </NLayer>
              </div>
            </template>
          </div>
        </div>

        <div v-if="!clientData" class="px-4 py-5">
          <NTypo size="sm" tone="muted">Clique em um pin no mapa para ver detalhes.</NTypo>
        </div>

        <div v-else class="flex-1 min-h-0 flex flex-col">
          <!-- Prospecto: apenas informações básicas -->
          <div v-if="isProspect" class="p-4 space-y-3">
            <NLayer variant="paper" size="sm" radius="soft">
              <NTypo size="xs" tone="muted" weight="semibold" class="mb-2">Informações</NTypo>
              <div class="space-y-2">
                <div v-if="clientData.segmento">
                  <NTypo size="xs" tone="muted">Segmento</NTypo>
                  <NTypo size="sm" weight="medium">{{ clientData.segmento }}</NTypo>
                </div>
                <div v-if="clientData.cidade">
                  <NTypo size="xs" tone="muted">Cidade</NTypo>
                  <NTypo size="sm" weight="medium">{{ clientData.cidade }}</NTypo>
                </div>
                <div v-if="clientData.estado">
                  <NTypo size="xs" tone="muted">Estado</NTypo>
                  <NTypo size="sm" weight="medium">{{ clientData.estado }}</NTypo>
                </div>
                <div v-if="clientData._metadata?.porte">
                  <NTypo size="xs" tone="muted">Porte</NTypo>
                  <NTypo size="sm" weight="medium">{{ clientData._metadata.porte }}</NTypo>
                </div>
              </div>
            </NLayer>

            <NLayer variant="paper" size="sm" radius="soft" class="bg-blue-50 border-blue-100">
              <NTypo size="xs" weight="semibold" class="text-blue-900 mb-1">💡 Dica</NTypo>
              <NTypo size="xs" class="text-blue-800">
                Este é um prospecto importado. Entre em contato para transformá-lo em cliente!
              </NTypo>
            </NLayer>
          </div>

          <!-- Cliente real: histórico completo -->
          <template v-else>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <NBigNumber
                  :value="ultimaVisitaFormatted"
                  label="Último contato"
                  :description="ultimaVisitaHoraFormatted"
                  icon="mdi:calendar"
                  compact
                />
                <NBigNumber
                  :value="proximaVisitaFormatted"
                  label="Próxima"
                  :description="proximaVisitaHoraFormatted"
                  icon="mdi:calendar"
                  compact
                />
                <NBigNumber
                  :value="produtoMaisConsumido || '--'"
                  label="Produto top"
                  description=""
                  icon="mdi:shopping"
                  compact
                />
                <NBigNumber
                  :value="formatCurrency(totalVendido90Dias)"
                  label="90 dias"
                  description=""
                  icon="mdi:currency-usd"
                  compact
                />
              </div>

              <!-- Seletor de Templates WhatsApp -->
              <WhatsAppTemplateSelector
                v-if="clientData.telefone && whatsappTemplates.length > 0"
                :client="clientData"
                :templates="whatsappTemplates"
              />
            </div>

            <div class="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
              <NTypo as="h3" size="sm" weight="bold">Histórico</NTypo>
              <NTypo as="div" size="xs" tone="muted" class="tabular-nums">
                {{ sortedEventos.length }}
              </NTypo>
            </div>

            <div class="flex-1 min-h-0 overflow-auto px-4 pb-4 space-y-3">
              <div v-if="isLoadingHistorico" class="text-center py-4">
                <NTypo size="sm" tone="muted">Carregando histórico...</NTypo>
              </div>

              <div v-else-if="historicoErrorMessage" class="text-center py-4">
                <NTypo size="sm" tone="danger">{{ historicoErrorMessage }}</NTypo>
              </div>

              <div v-else-if="!sortedEventos.length" class="text-center py-4">
                <NTypo size="sm" tone="muted">Nenhum evento registrado ainda</NTypo>
              </div>

              <div
                v-for="evento in sortedEventos"
                :key="evento.id"
                class="rounded-xl border bg-white p-3 hover:shadow-sm transition-shadow"
              >
                <div class="flex justify-between items-center gap-1.5 shrink-0">
                  <NTypo
                    as="span"
                    size="xs"
                    weight="semibold"
                    :class="[
                      'px-2 py-1 rounded-full text-[11px]',
                      isVenda(evento.tipo)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800',
                    ]"
                  >
                    {{ labelTipo(evento.tipo) }}
                  </NTypo>
                  <div>
                    <button
                      @click="handleEditEvento(evento)"
                      class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <NIcon name="mdi:pencil" class="w-3.5 h-3.5" />
                    </button>
                    <button
                      @click="handleDeleteEvento(evento.id)"
                      class="p-1.5 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <NIcon name="mdi:trash-can" class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <NTypo size="sm" weight="semibold" class="tabular-nums">
                      {{ formatDate(evento.data) }}
                    </NTypo>
                    <NTypo size="xs" tone="muted" class="mt-1">
                      Vendedor: {{ sellerLabelForEvent(evento) }}
                    </NTypo>
                    <NTypo v-if="evento.descricao" size="xs" tone="muted" class="mt-1 clamp-2">
                      {{ evento.descricao }}
                    </NTypo>
                    <NTypo v-if="evento.duracao" size="xs" tone="muted" class="mt-1">
                      ⏱️ {{ evento.duracao }} min
                    </NTypo>
                  </div>
                </div>

                <div v-if="isVenda(evento.tipo)" class="mt-2 space-y-2">
                  <NTypo
                    v-if="evento.totalVenda"
                    size="sm"
                    weight="semibold"
                    class="text-green-700 tabular-nums"
                  >
                    💵 {{ formatCurrency(evento.totalVenda) }}
                  </NTypo>

                  <NTypo
                    v-else-if="evento.items && evento.items.length"
                    size="xs"
                    weight="semibold"
                    class="text-green-700"
                  >
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
          </template>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useHistoricoClienteApi } from '~/composables/useHistoricoClienteApi'
import { useWhatsAppTemplates } from '~/composables/useWhatsAppTemplates'
import type { Cliente } from '~/types/client'
import type { WhatsAppTemplateDto } from '~/types/schemas'

interface Props {
  isOpen: boolean
  clientData: Cliente | null
  showClose?: boolean
}

interface Emits {
  (e: 'close'): void
  (
    e: 'add-action',
    action:
      | 'visita_fisica'
      | 'atendimento_online'
      | 'ligacao'
      | 'venda_fisica'
      | 'venda_online'
      | 'venda_telefone'
  ): void
  (e: 'edit-client'): void
  (e: 'remove-client'): void
  (e: 'edit-evento', evento: any): void
  (e: 'delete-evento', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { fetchHistorico } = useHistoricoClienteApi()
const { fetchTemplates } = useWhatsAppTemplates()
const { metaForClient } = useClientEngagementStatus()
const historico = ref<any[]>([])
const isLoadingHistorico = ref(false)
const historicoErrorMessage = ref('')
const whatsappTemplates = ref<WhatsAppTemplateDto[]>([])
const isActionMenuOpen = ref(false)
const usersById = ref<Record<string, { nome: string; ativo?: boolean }>>({})
const isLoadingUsers = ref(false)

const isProspect = computed(() => (props.clientData as any)?._isProspect === true)

const statusMeta = computed(() => {
  if (isProspect.value) {
    return {
      emoji: '🎯',
      label: 'Prospecto',
      chipClass: 'bg-gray-100 border-gray-200 text-gray-700',
      dotClass: 'bg-gray-400',
      colorHex: '#9CA3AF',
    }
  }
  return metaForClient(props.clientData)
})

// Carregar templates WhatsApp
async function loadWhatsAppTemplates() {
  try {
    whatsappTemplates.value = await fetchTemplates({ active: true })
  } catch (error) {
    console.error('Erro ao carregar templates WhatsApp:', error)
    whatsappTemplates.value = []
  }
}

async function loadUsersLookup() {
  if (!import.meta.client) return
  if (isLoadingUsers.value) return
  if (Object.keys(usersById.value).length > 0) return

  isLoadingUsers.value = true
  try {
    const res = await $fetch<{
      success: boolean
      data: Array<{ id: string; nome: string; ativo?: boolean }>
    }>('/api/v1/users')
    const map: Record<string, { nome: string; ativo?: boolean }> = {}
    for (const user of Array.isArray(res.data) ? res.data : []) {
      const id = String(user?.id || '').trim()
      if (!id) continue
      map[id] = {
        nome: String(user?.nome || 'Usuário sem nome'),
        ativo: user?.ativo,
      }
    }
    usersById.value = map
  } catch (error) {
    console.error('Erro ao carregar usuários para histórico:', error)
  } finally {
    isLoadingUsers.value = false
  }
}

// Carregar templates ao montar componente
if (import.meta.client) {
  loadUsersLookup()
  loadWhatsAppTemplates()
}

watch(
  () => [props.clientData?.id, props.clientData?.updatedAt],
  async ([clientId]) => {
    if (import.meta.server) return
    isActionMenuOpen.value = false
    if (!clientId || isProspect.value) {
      historico.value = []
      historicoErrorMessage.value = ''
      return
    }
    isLoadingHistorico.value = true
    historicoErrorMessage.value = ''
    try {
      void loadUsersLookup()
      historico.value = await fetchHistorico(clientId, { limit: 200 })
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err)
      historico.value = []
      historicoErrorMessage.value =
        err?.data?.statusMessage ||
        err?.data?.message ||
        err?.message ||
        'Falha ao carregar histórico.'
    } finally {
      isLoadingHistorico.value = false
    }
  },
  { immediate: true }
)

function sellerLabelForEvent(evento: any): string {
  const rawUserId = typeof evento?.userId === 'string' ? evento.userId : ''
  const userId = rawUserId.trim()
  if (!userId) return 'Sem vendedor'
  const user = usersById.value[userId]
  if (user?.nome) return user.nome
  return 'Vendedor não listado'
}

function getTotalItens(evento: any) {
  const items = Array.isArray(evento?.items) ? evento.items : []
  return items.reduce((sum: number, p: any) => sum + (Number(p?.quantidade) || 0), 0)
}

const toggleActionMenu = () => {
  isActionMenuOpen.value = !isActionMenuOpen.value
}

const selectAction = (
  action:
    | 'visita_fisica'
    | 'atendimento_online'
    | 'ligacao'
    | 'venda_fisica'
    | 'venda_online'
    | 'venda_telefone'
) => {
  isActionMenuOpen.value = false
  emit('add-action', action)
}

const handleEditEvento = (evento: any) => {
  emit('edit-evento', evento)
}

const handleDeleteEvento = async (id: string) => {
  if (!confirm('Deseja realmente excluir este evento do histórico?')) return
  emit('delete-evento', id)
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

const PRESENTATION_TYPES = new Set(['visita_fisica', 'atendimento_online'])

function parseValidDate(value: unknown): Date | null {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

const ultimaVisitaDate = computed<Date | null>(() => {
  if (!sortedEventos.value.length) return null
  return parseValidDate(sortedEventos.value[0]?.data)
})

const ultimaVisitaFormatted = computed(() => {
  if (!ultimaVisitaDate.value) return '--'
  return formatDate(ultimaVisitaDate.value.toISOString())
})

const ultimaVisitaHoraFormatted = computed(() => {
  if (!ultimaVisitaDate.value) return ''
  return `às ${formatTime(ultimaVisitaDate.value.toISOString())}`
})

const proximaVisitaDate = computed<Date | null>(() => {
  const now = new Date()
  const candidates: Date[] = []

  const salesNextAction = parseValidDate(props.clientData?.sales?.nextActionAt)
  if (salesNextAction && salesNextAction >= now) {
    candidates.push(salesNextAction)
  }

  for (const evento of sortedEventos.value as any[]) {
    const nextContact = parseValidDate(evento?.proximoContato)
    if (nextContact && nextContact >= now) {
      candidates.push(nextContact)
    }

    const tipo = String(evento?.tipo || '')
    if (!PRESENTATION_TYPES.has(tipo)) continue

    const scheduledPresentation = parseValidDate(evento?.data)
    if (scheduledPresentation && scheduledPresentation >= now) {
      candidates.push(scheduledPresentation)
    }
  }

  if (!candidates.length) return null

  return candidates.reduce((closest, current) =>
    current.getTime() < closest.getTime() ? current : closest
  )
})

const proximaVisitaFormatted = computed(() => {
  if (!proximaVisitaDate.value) return 'Não agendada'
  return formatDate(proximaVisitaDate.value.toISOString())
})

const proximaVisitaHoraFormatted = computed(() => {
  if (!proximaVisitaDate.value) return ''
  return `às ${formatTime(proximaVisitaDate.value.toISOString())}`
})

const totalVendido90Dias = computed(() => {
  const dias90Atras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  return sortedEventos.value
    .filter(
      (e: any) =>
        (e.tipo === 'venda_fisica' || e.tipo === 'venda_online' || e.tipo === 'venda_telefone') &&
        new Date(e.data) >= dias90Atras
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
  return tipo === 'venda_fisica' || tipo === 'venda_online' || tipo === 'venda_telefone'
}

function labelTipo(tipo: string) {
  if (tipo === 'venda_fisica') return 'Venda física'
  if (tipo === 'venda_online') return 'Venda online'
  if (tipo === 'venda_telefone') return 'Venda por telefone'
  if (tipo === 'visita_fisica') return 'Apresentação presencial'
  if (tipo === 'ligacao') return 'Ligação'
  if (tipo === 'atendimento_online') return 'Apresentação online'
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

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
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
