<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">Categorias de Kits</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">Organização das linhas de kit exibidas na home.</NTypo>
        </div>

        <div class="flex items-center gap-2">
          <NButton
            variant="outline"
            leading-icon="mdi:format-list-checks"
            :loading="seeding"
            :label="seeding ? 'Criando...' : 'Criar padrão'"
            @click="seedDefaults"
          />
          <NButton as="NuxtLink" to="/admin/kits-categorias/new" leading-icon="mdi:plus" label="Nova" />
        </div>
      </div>
      <div class="mt-4">
        <input
          v-model="q"
          type="text"
          placeholder="Buscar por nome ou slug..."
          class="w-full px-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
        />
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-0 overflow-hidden">
      <div class="p-4 border-b flex items-center justify-between">
        <NTypo size="sm" weight="bold">Lista</NTypo>
        <div class="flex items-center gap-2">
          <NTypo size="xs" tone="muted" class="tabular-nums">{{ filtered.length }}</NTypo>
          <NButton variant="outline" size="zs" leading-icon="mdi:refresh" label="Atualizar" @click="refresh()" />
        </div>
      </div>

      <div v-if="pending" class="p-6 text-center">
        <NTypo size="sm" tone="muted">Carregando...</NTypo>
      </div>
      <div v-else-if="error" class="p-6">
        <NTypo size="sm" tone="danger">Falha ao carregar categorias.</NTypo>
      </div>
      <div v-else class="divide-y">
        <NuxtLink
          v-for="category in filtered"
          :key="category.id"
          :to="`/admin/kits-categorias/${encodeURIComponent(category.id)}`"
          class="block px-4 py-3 hover:bg-slate-50"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <NTypo weight="bold" class="truncate">{{ category.nome }}</NTypo>
              <NTypo size="xs" tone="muted" class="truncate">{{ category.slug }}</NTypo>
            </div>
            <div class="flex items-center gap-2">
              <NTypo size="xs" tone="muted" class="tabular-nums">#{{ category.ordem }}</NTypo>
              <NTypo
                size="xs"
                weight="semibold"
                :class="
                  category.ativo
                    ? 'rounded-full bg-emerald-100 px-2 py-1 text-emerald-700'
                    : 'rounded-full bg-gray-100 px-2 py-1 text-gray-500'
                "
              >
                {{ category.ativo ? 'Ativa' : 'Inativa' }}
              </NTypo>
            </div>
          </div>
        </NuxtLink>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { KitCategoryDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const q = ref('')
const seeding = ref(false)

const CategoriesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(KitCategoryDtoSchema),
})

const { data, pending, error, refresh } = await useFetch('/api/v1/kit-categories', {
  transform: (res) => CategoriesResponseSchema.parse(res).data,
})

const filtered = computed(() => {
  const source = data.value || []
  const query = q.value.trim().toLowerCase()
  if (!query) return source
  return source.filter(
    (category) =>
      category.nome.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query)
  )
})

async function seedDefaults() {
  seeding.value = true
  try {
    await $fetch('/api/v1/kit-categories/seed', { method: 'POST' })
    await refresh()
  } finally {
    seeding.value = false
  }
}
</script>
