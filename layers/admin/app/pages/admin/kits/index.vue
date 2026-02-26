<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">Kits</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">
            Cadastro dos kits comerciais, preço unitário, tamanhos e mídias.
          </NTypo>
        </div>

        <div class="flex items-center gap-2">
          <NButton
            variant="outline"
            leading-icon="mdi:format-list-checks"
            :loading="seeding"
            :label="seeding ? 'Criando...' : 'Criar padrão'"
            @click="seedDefaults"
          />
          <NButton as="NuxtLink" to="/admin/kits/new" leading-icon="mdi:plus" label="Novo" />
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          v-model="q"
          type="text"
          placeholder="Buscar por nome ou código..."
          class="w-full px-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors md:col-span-2"
        />

        <select
          v-model="categoryFilter"
          class="w-full px-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
        >
          <option value="">Todas categorias</option>
          <option v-for="category in categories || []" :key="category.id" :value="category.id">
            {{ category.nome }}
          </option>
        </select>
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-0 overflow-hidden">
      <div class="p-4 border-b flex items-center justify-between">
        <NTypo size="sm" weight="bold">Lista</NTypo>
        <div class="flex items-center gap-2">
          <NTypo size="xs" tone="muted" class="tabular-nums">{{ filtered.length }}</NTypo>
          <NButton variant="outline" size="zs" leading-icon="mdi:refresh" label="Atualizar" @click="refreshAll" />
        </div>
      </div>

      <div v-if="pendingKits || pendingCategories" class="p-6 text-center">
        <NTypo size="sm" tone="muted">Carregando...</NTypo>
      </div>
      <div v-else-if="errorKits || errorCategories" class="p-6">
        <NTypo size="sm" tone="danger">Falha ao carregar kits.</NTypo>
        <NTypo v-if="loadErrorMessage" size="xs" tone="muted" class="mt-2">{{ loadErrorMessage }}</NTypo>
      </div>
      <div v-else class="divide-y">
        <NuxtLink
          v-for="kit in filtered"
          :key="kit.id"
          :to="`/admin/kits/${encodeURIComponent(kit.id)}`"
          class="block px-4 py-3 hover:bg-slate-50"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0 flex items-center gap-3">
              <div
                v-if="kit.fotoDestaqueUrl"
                class="h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-white"
              >
                <img :src="kit.fotoDestaqueUrl" :alt="kit.imagemAlt || kit.nome" class="h-full w-full object-cover" />
              </div>
              <div v-else class="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-300">
                <NIcon name="mdi:image-outline" class="h-5 w-5" />
              </div>

              <div class="min-w-0">
                <NTypo weight="bold" class="truncate">{{ kit.nome }}</NTypo>
                <NTypo size="xs" tone="muted" class="truncate">
                  {{ kit.codigo }} · {{ kit.categoria?.nome || 'Sem categoria' }}
                </NTypo>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <NTypo size="xs" weight="semibold" class="tabular-nums">
                {{ formatCurrency(kit.precoUnitario) }}
              </NTypo>
              <NTypo
                size="xs"
                weight="semibold"
                :class="
                  kit.ativo
                    ? 'rounded-full bg-emerald-100 px-2 py-1 text-emerald-700'
                    : 'rounded-full bg-gray-100 px-2 py-1 text-gray-500'
                "
              >
                {{ kit.ativo ? 'Ativo' : 'Inativo' }}
              </NTypo>
              <NTypo
                v-if="kit.destaque"
                size="xs"
                weight="semibold"
                class="rounded-full bg-amber-100 px-2 py-1 text-amber-700"
              >
                Destaque
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
import { KitCategoryDtoSchema, KitDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const q = ref('')
const categoryFilter = ref('')
const seeding = ref(false)

const KitsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(KitDtoSchema),
})

const KitCategoriesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(KitCategoryDtoSchema),
})

const {
  data: kits,
  pending: pendingKits,
  error: errorKits,
  refresh: refreshKits,
} = await useFetch('/api/v1/kits', {
  transform: (res) => KitsResponseSchema.parse(res).data,
})

const {
  data: categories,
  pending: pendingCategories,
  error: errorCategories,
  refresh: refreshCategories,
} = await useFetch('/api/v1/kit-categories', {
  transform: (res) => KitCategoriesResponseSchema.parse(res).data,
})

const filtered = computed(() => {
  const source = kits.value || []
  const query = q.value.trim().toLowerCase()

  return source.filter((kit) => {
    if (categoryFilter.value && kit.categoriaId !== categoryFilter.value) return false
    if (!query) return true
    return kit.nome.toLowerCase().includes(query) || kit.codigo.toLowerCase().includes(query)
  })
})

const loadErrorMessage = computed(() => {
  const candidate = errorKits.value || errorCategories.value
  if (!candidate) return ''
  return (
    (candidate as any)?.data?.statusMessage ||
    (candidate as any)?.statusMessage ||
    (candidate as any)?.message ||
    ''
  )
})

async function refreshAll() {
  await Promise.all([refreshKits(), refreshCategories()])
}

async function seedDefaults() {
  seeding.value = true
  try {
    await $fetch('/api/v1/kits/seed', { method: 'POST' })
    await refreshAll()
  } finally {
    seeding.value = false
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
