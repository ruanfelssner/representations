<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">Clientes</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">Lista (carrega via /api/v1/clients).</NTypo>
        </div>
        <div class="flex items-center gap-2">
          <NButton 
            as="NuxtLink" 
            to="/admin/clients/new" 
            variant="primary" 
            leading-icon="mdi:plus" 
            size="sm"
          >
            Novo Cliente
          </NButton>
          <NButton variant="outline" leading-icon="mdi:refresh" size="sm" @click="refresh()">
            Atualizar
          </NButton>
        </div>
      </div>
      <div class="mt-4">
        <input
          v-model="q"
          type="text"
          placeholder="Buscar por nome, cidade ou CNPJ..."
          class="w-full px-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
        />
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-0 overflow-hidden">
      <div v-if="pending" class="p-6 text-center">
        <NTypo size="sm" tone="muted">Carregando...</NTypo>
      </div>
      <div v-else-if="error" class="p-6">
        <NTypo size="sm" tone="danger">Falha ao carregar clientes.</NTypo>
      </div>
      <div v-else class="divide-y">
        <NuxtLink
          v-for="c in filtered"
          :key="c.id"
          :to="`/admin/clients/${encodeURIComponent(c.cnpj || c.id)}`"
          class="block px-4 py-3 hover:bg-slate-50"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <NTypo weight="bold" class="truncate">{{ c.nome }}</NTypo>
              <NTypo size="xs" tone="muted" class="truncate">{{ c.cidade || c.endereco?.cidade || '' }}</NTypo>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                  :class="statusMeta(c).chipClass"
                >
                  <span class="h-2 w-2 rounded-full" :class="statusMeta(c).dotClass" />
                  {{ statusMeta(c).emoji }} {{ statusMeta(c).label }}
                </span>
              </div>
            </div>
            <NTypo size="xs" tone="muted" class="tabular-nums">{{ c.cnpj || c.id }}</NTypo>
          </div>
        </NuxtLink>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { ClientDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const q = ref('')
const ClientsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    clients: z.array(ClientDtoSchema),
    mapSettings: z.any(),
  }),
})

const { data, pending, error, refresh } = await useFetch('/api/v1/clients', {
  transform: (res) => ClientsResponseSchema.parse(res).data.clients,
})

const { metaForClient } = useClientEngagementStatus()
function statusMeta(c: any) {
  return metaForClient(c)
}

const filtered = computed(() => {
  const clients = data.value || []
  const query = q.value.trim().toLowerCase()
  if (!query) return clients.slice(0, 200)
  return clients
    .filter((c) => {
      const name = c.nome.toLowerCase()
      const city = (c.cidade || c.endereco?.cidade || '').toLowerCase()
      const digits = query.replace(/\D/g, '')
      return (
        name.includes(query) ||
        city.includes(query) ||
        (digits && (String(c.id).replace(/\D/g, '').includes(digits) || (c.cnpj || '').replace(/\D/g, '').includes(digits)))
      )
    })
    .slice(0, 200)
})
</script>
