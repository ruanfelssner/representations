<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">Usuários</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">Cadastro e gestão de roles.</NTypo>
        </div>

        <NButton as="NuxtLink" to="/admin/users/new" leading-icon="mdi:plus" label="Novo" />
      </div>
      <div class="mt-4">
        <input
          v-model="q"
          type="text"
          placeholder="Buscar por nome ou email..."
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
        <NTypo size="sm" tone="danger">Falha ao carregar usuários.</NTypo>
      </div>
      <div v-else class="divide-y">
        <NuxtLink
          v-for="u in filtered"
          :key="u.id"
          :to="`/admin/users/${encodeURIComponent(u.id)}`"
          class="block px-4 py-3 hover:bg-slate-50"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <NTypo weight="bold" class="truncate">{{ u.nome }}</NTypo>
              <NTypo size="xs" tone="muted" class="truncate">{{ u.email }}</NTypo>
            </div>
            <NTypo size="xs" weight="semibold" class="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              {{ u.role }}
            </NTypo>
          </div>
        </NuxtLink>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { UserDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const q = ref('')

const UsersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserDtoSchema),
})

const { data, pending, error, refresh } = await useFetch('/api/v1/users', {
  transform: (res) => UsersResponseSchema.parse(res).data,
})

const filtered = computed(() => {
  const users = data.value || []
  const query = q.value.trim().toLowerCase()
  if (!query) return users
  return users.filter((u) => u.nome.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
})
</script>

