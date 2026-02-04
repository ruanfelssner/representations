<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">Cliente</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">{{ id }}</NTypo>
        </div>
        <NButton as="NuxtLink" to="/admin/clients" variant="outline" leading-icon="mdi:arrow-left" label="Voltar" />
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div v-if="pendingClient" class="text-center py-6">
        <NTypo size="sm" tone="muted">Carregando cliente...</NTypo>
      </div>
      <div v-else-if="clientError" class="text-center py-6">
        <NTypo size="sm" tone="danger">Cliente não encontrado.</NTypo>
      </div>
      <div v-else class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <NTypo as="h2" size="base" weight="bold">{{ client?.nome }}</NTypo>
          <span
            v-if="client"
            class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
            :class="statusMeta.chipClass"
          >
            <span class="h-2 w-2 rounded-full" :class="statusMeta.dotClass" />
            {{ statusMeta.emoji }} {{ statusMeta.label }}
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="rounded-xl border bg-white p-3">
            <NTypo size="xs" tone="muted">Contato</NTypo>
            <NTypo size="sm" class="mt-1">{{ client?.telefone || '--' }}</NTypo>
            <NTypo size="sm" class="mt-1">{{ client?.email || '--' }}</NTypo>
          </div>
          <div class="rounded-xl border bg-white p-3">
            <NTypo size="xs" tone="muted">Endereço</NTypo>
            <NTypo size="sm" class="mt-1">{{ client?.endereco_completo || client?.endereco?.endereco_completo || '--' }}</NTypo>
          </div>
        </div>
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-center justify-between">
        <NTypo as="h3" size="sm" weight="bold">Histórico</NTypo>
        <NButton variant="outline" size="zs" leading-icon="mdi:refresh" label="Atualizar" @click="refreshHistorico()" />
      </div>
      <div v-if="pendingHistorico" class="text-center py-6">
        <NTypo size="sm" tone="muted">Carregando...</NTypo>
      </div>
      <div v-else-if="historicoError" class="text-center py-6">
        <NTypo size="sm" tone="danger">Falha ao carregar histórico.</NTypo>
      </div>
      <div v-else class="mt-4 space-y-2">
        <div v-if="!historico?.length" class="text-center py-6">
          <NTypo size="sm" tone="muted">Sem eventos.</NTypo>
        </div>
        <div v-for="e in historico" :key="e.id" class="rounded-xl border bg-white p-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <NTypo size="sm" weight="bold" class="tabular-nums">{{ formatDate(e.data) }}</NTypo>
              <NTypo size="xs" tone="muted" class="truncate">{{ e.descricao || '--' }}</NTypo>
            </div>
            <NTypo size="xs" class="px-2 py-1 rounded-full bg-slate-100 text-slate-700">{{ e.tipo }}</NTypo>
          </div>
          <div v-if="e.totalVenda" class="mt-2">
            <NTypo size="xs" weight="bold" class="text-emerald-700 tabular-nums">{{ formatCurrency(e.totalVenda) }}</NTypo>
          </div>
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { ClientDtoSchema, HistoricoClienteDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const id = String(route.params.id || '')

const ClientResponseSchema = z.object({ success: z.boolean(), data: ClientDtoSchema })
const HistoricoResponseSchema = z.object({ success: z.boolean(), data: z.array(HistoricoClienteDtoSchema) })

const { data: client, pending: pendingClient, error: clientError } = await useFetch(
  `/api/v1/clients/${encodeURIComponent(id)}`,
  { transform: (res) => ClientResponseSchema.parse(res).data }
)

const { metaForClient } = useClientEngagementStatus()
const statusMeta = computed(() => metaForClient(client.value))

const {
  data: historico,
  pending: pendingHistorico,
  error: historicoError,
  refresh: refreshHistorico,
} = await useFetch(`/api/v1/historico-cliente?clientId=${encodeURIComponent(id)}&limit=200`, {
  transform: (res) => HistoricoResponseSchema.parse(res).data,
})

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}
function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
</script>
