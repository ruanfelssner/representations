<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">Painel Admin</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">Gestão de usuários, produtos e clientes.</NTypo>
        </div>
      </div>
    </NLayer>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <NuxtLink to="/admin/clients" class="rounded-2xl border bg-white p-4 hover:shadow-sm transition-shadow">
        <div class="flex items-center gap-3">
          <NIcon name="mdi:account-group" class="w-6 h-6 text-sky-600" />
          <div>
            <NTypo weight="bold">Clientes</NTypo>
            <NTypo size="xs" tone="muted">Listar e visualizar histórico.</NTypo>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink to="/admin/users" class="rounded-2xl border bg-white p-4 hover:shadow-sm transition-shadow">
        <div class="flex items-center gap-3">
          <NIcon name="mdi:account" class="w-6 h-6 text-violet-600" />
          <div>
            <NTypo weight="bold">Usuários</NTypo>
            <NTypo size="xs" tone="muted">Vendedor, gerente, admin, supervisor.</NTypo>
          </div>
        </div>
      </NuxtLink>

      <NuxtLink to="/admin/produtos" class="rounded-2xl border bg-white p-4 hover:shadow-sm transition-shadow">
        <div class="flex items-center gap-3">
          <NIcon name="mdi:package-variant" class="w-6 h-6 text-emerald-600" />
          <div>
            <NTypo weight="bold">Produtos</NTypo>
            <NTypo size="xs" tone="muted">Catálogo e preços atuais.</NTypo>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

