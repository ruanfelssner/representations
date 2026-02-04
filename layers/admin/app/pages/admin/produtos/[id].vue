<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">{{ isNew ? 'Novo produto' : 'Editar produto' }}</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">{{ id }}</NTypo>
        </div>
        <div class="flex items-center gap-2">
          <NButton as="NuxtLink" to="/admin/produtos" variant="outline" leading-icon="mdi:arrow-left" label="Voltar" />
          <NButton v-if="!isNew" variant="danger" leading-icon="mdi:trash-can-outline" label="Excluir" @click="handleDelete" />
        </div>
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <form class="space-y-4" @submit.prevent="handleSave">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Código *</label>
            <input v-model="form.codigo" required class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
            <input v-model="form.nome" required class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Valor *</label>
            <input v-model.number="form.valor" required type="number" min="0" step="0.01" class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
            <input v-model="form.categoria" class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
            <textarea v-model="form.descricao" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Ativo</label>
            <select v-model="form.ativo" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <NButton variant="outline" leading-icon="mdi:refresh" label="Recarregar" @click.prevent="load()" />
          <NButton :loading="saving" leading-icon="mdi:content-save" label="Salvar" type="submit" />
        </div>
      </form>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { ProdutoDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')
const isNew = computed(() => id === 'new')
const saving = ref(false)

const form = ref({
  codigo: '',
  nome: '',
  valor: 0,
  categoria: '',
  descricao: '',
  ativo: true,
})

const ProdutoResponseSchema = z.object({ success: z.boolean(), data: ProdutoDtoSchema })

async function load() {
  if (isNew.value) return
  const res = await $fetch(`/api/v1/produtos/${encodeURIComponent(id)}`)
  const produto = ProdutoResponseSchema.parse(res).data
  form.value = {
    codigo: produto.codigo,
    nome: produto.nome,
    valor: produto.valor,
    categoria: produto.categoria || '',
    descricao: produto.descricao || '',
    ativo: produto.ativo,
  }
}

onMounted(load)

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      codigo: form.value.codigo.trim(),
      nome: form.value.nome.trim(),
      valor: Number(form.value.valor) || 0,
      categoria: form.value.categoria.trim() || undefined,
      descricao: form.value.descricao.trim() || undefined,
      ativo: form.value.ativo,
    }
    if (isNew.value) {
      await $fetch('/api/v1/produtos', { method: 'POST', body: payload })
      await router.push('/admin/produtos')
    } else {
      await $fetch(`/api/v1/produtos/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload })
      await load()
    }
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (isNew.value) return
  const ok = confirm('Excluir este produto?')
  if (!ok) return
  await $fetch(`/api/v1/produtos/${encodeURIComponent(id)}`, { method: 'DELETE' })
  await router.push('/admin/produtos')
}
</script>

