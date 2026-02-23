<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <NTypo as="h1" size="lg" weight="bold">Regiões comerciais</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">
            Gerencie zonas geográficas e vínculo com representantes.
          </NTypo>
        </div>
        <NButton as="NuxtLink" to="/admin/regioes/new" variant="primary" leading-icon="mdi:plus">
          Nova região
        </NButton>
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex flex-col gap-3 sm:flex-row">
        <NInput
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nome..."
          class="sm:max-w-sm"
        />
        <NButton variant="outline" leading-icon="mdi:refresh" @click="refresh()">Atualizar</NButton>
      </div>

      <div v-if="pending" class="py-10 text-center">
        <NTypo size="sm" tone="muted">Carregando regiões...</NTypo>
      </div>

      <div v-else-if="error" class="py-10 text-center">
        <NTypo size="sm" tone="danger">Falha ao carregar regiões.</NTypo>
      </div>

      <div v-else-if="!filtered.length" class="py-10 text-center">
        <NTypo size="sm" tone="muted">Nenhuma região encontrada.</NTypo>
      </div>

      <div v-else class="mt-4 divide-y rounded-lg border border-gray-100 bg-white overflow-hidden">
        <div
          v-for="region in filtered"
          :key="region.id"
          class="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div class="min-w-0">
            <NTypo weight="bold" class="truncate">{{ region.nome }}</NTypo>
            <NTypo size="xs" tone="muted" class="mt-1">
              {{ region.stateIds?.length || 0 }} estados • prioridade {{ region.priority || 0 }}
            </NTypo>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="region.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'"
            >
              {{ region.ativo ? 'Ativa' : 'Inativa' }}
            </span>
            <NButton
              as="NuxtLink"
              :to="`/admin/regioes/${region.id}`"
              variant="outline"
              size="xs"
              leading-icon="mdi:pencil"
            >
              Editar
            </NButton>
            <NButton
              variant="danger"
              size="xs"
              leading-icon="mdi:trash-can-outline"
              @click="removeRegion(region.id)"
            >
              Excluir
            </NButton>
          </div>
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { TerritoryRegionDtoSchema } from '~/types/schemas'

definePageMeta({
  layout: 'admin',
})

const searchQuery = ref('')

const RegionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(TerritoryRegionDtoSchema),
})

const { data, pending, error, refresh } = await useFetch('/api/v1/regions?withGeometry=false&limit=500', {
  transform: (res) => RegionsResponseSchema.parse(res).data,
})

const filtered = computed(() => {
  const list = data.value || []
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return list
  return list.filter((region) => region.nome.toLowerCase().includes(query))
})

async function removeRegion(id: string) {
  const ok = confirm('Deseja remover esta região?')
  if (!ok) return
  await $fetch(`/api/v1/regions/${encodeURIComponent(id)}`, { method: 'DELETE' })
  await refresh()
}
</script>
