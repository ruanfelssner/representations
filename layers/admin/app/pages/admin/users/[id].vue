<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">{{ isNew ? 'Novo usuário' : 'Editar usuário' }}</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">{{ id }}</NTypo>
        </div>
        <div class="flex items-center gap-2">
          <NButton as="NuxtLink" to="/admin/users" variant="outline" leading-icon="mdi:arrow-left" label="Voltar" />
          <NButton v-if="!isNew" variant="danger" leading-icon="mdi:trash-can-outline" label="Excluir" @click="handleDelete" />
        </div>
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <form class="space-y-4" @submit.prevent="handleSave">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
            <input v-model="form.nome" required class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
            <input v-model="form.email" required type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
            <input v-model="form.telefone" class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Role</label>
            <select v-model="form.role" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
              <option value="vendedor">vendedor</option>
              <option value="gerente">gerente</option>
              <option value="admin">admin</option>
              <option value="supervisor">supervisor</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Ativo</label>
            <select v-model="form.ativo" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Data admissão</label>
            <input v-model="form.dataAdmissao" type="date" class="w-full px-4 py-3 border border-gray-300 rounded-lg" />
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
import { UserDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')
const isNew = computed(() => id === 'new')
const saving = ref(false)

const form = ref({
  nome: '',
  email: '',
  telefone: '',
  role: 'vendedor',
  ativo: true,
  dataAdmissao: new Date().toISOString().slice(0, 10),
})

const UserResponseSchema = z.object({ success: z.boolean(), data: UserDtoSchema })

async function load() {
  if (isNew.value) return
  const res = await $fetch(`/api/v1/users/${encodeURIComponent(id)}`)
  const user = UserResponseSchema.parse(res).data
  form.value = {
    nome: user.nome,
    email: user.email,
    telefone: user.telefone || '',
    role: user.role,
    ativo: user.ativo,
    dataAdmissao: user.dataAdmissao.slice(0, 10),
  }
}

onMounted(load)

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      nome: form.value.nome.trim(),
      email: form.value.email.trim(),
      telefone: form.value.telefone.trim() || undefined,
      role: form.value.role,
      ativo: form.value.ativo,
      dataAdmissao: new Date(`${form.value.dataAdmissao}T12:00:00.000Z`).toISOString(),
    }
    if (isNew.value) {
      await $fetch('/api/v1/users', { method: 'POST', body: payload })
      await router.push('/admin/users')
    } else {
      await $fetch(`/api/v1/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload })
      await load()
    }
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (isNew.value) return
  const ok = confirm('Excluir este usuário?')
  if (!ok) return
  await $fetch(`/api/v1/users/${encodeURIComponent(id)}`, { method: 'DELETE' })
  await router.push('/admin/users')
}
</script>

