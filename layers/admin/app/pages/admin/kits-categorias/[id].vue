<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">
            {{ isNew ? 'Nova categoria de kit' : 'Editar categoria de kit' }}
          </NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">{{ id }}</NTypo>
        </div>
        <div class="flex items-center gap-2">
          <NButton
            as="NuxtLink"
            to="/admin/kits-categorias"
            variant="outline"
            leading-icon="mdi:arrow-left"
            label="Voltar"
          />
          <NButton
            v-if="!isNew"
            variant="danger"
            leading-icon="mdi:trash-can-outline"
            label="Excluir"
            @click="handleDelete"
          />
        </div>
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <form class="space-y-4" @submit.prevent="handleSave">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
            <input
              v-model="form.nome"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Ex: Aço e Ouro"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Slug *</label>
            <input
              v-model="form.slug"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Ex: aco-e-ouro"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Ordem</label>
            <input
              v-model.number="form.ordem"
              type="number"
              min="0"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Ativa</label>
            <select v-model="form.ativo" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <NButton
            variant="outline"
            leading-icon="mdi:refresh"
            label="Recarregar"
            @click.prevent="load()"
          />
          <NButton :loading="saving" leading-icon="mdi:content-save" label="Salvar" type="submit" />
        </div>
      </form>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { KitCategoryDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')
const isNew = computed(() => id === 'new')
const saving = ref(false)

const form = ref({
  nome: '',
  slug: '',
  ordem: 0,
  ativo: true,
})

const CategoryResponseSchema = z.object({
  success: z.boolean(),
  data: KitCategoryDtoSchema,
})

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

watch(
  () => form.value.nome,
  (nextName, prevName) => {
    if (!isNew.value) return

    const currentSlug = form.value.slug.trim()
    const previousAutoSlug = slugify(prevName || '')
    const shouldAutoUpdate = !currentSlug || currentSlug === previousAutoSlug

    if (shouldAutoUpdate) {
      form.value.slug = slugify(nextName)
    }
  }
)

async function load() {
  if (isNew.value) return
  const res = await $fetch(`/api/v1/kit-categories/${encodeURIComponent(id)}`)
  const category = CategoryResponseSchema.parse(res).data
  form.value = {
    nome: category.nome,
    slug: category.slug,
    ordem: category.ordem,
    ativo: category.ativo,
  }
}

onMounted(load)

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      nome: form.value.nome.trim(),
      slug: form.value.slug.trim(),
      ordem: Number(form.value.ordem) || 0,
      ativo: form.value.ativo,
    }

    if (isNew.value) {
      await $fetch('/api/v1/kit-categories', { method: 'POST', body: payload })
      await router.push('/admin/kits-categorias')
    } else {
      await $fetch(`/api/v1/kit-categories/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: payload,
      })
      await load()
    }
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (isNew.value) return
  const ok = confirm('Excluir esta categoria? Kits vinculados precisam ser realocados antes.')
  if (!ok) return
  await $fetch(`/api/v1/kit-categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
  await router.push('/admin/kits-categorias')
}
</script>
