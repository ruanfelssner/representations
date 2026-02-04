<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b bg-white">
      <NContainer class="py-3 flex items-center justify-between gap-3">
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <NIcon name="mdi:shield-account" class="w-6 h-6 text-slate-700" />
          <NTypo as="span" size="sm" weight="bold" class="text-slate-800">Admin</NTypo>
        </NuxtLink>

        <div class="flex items-center gap-2">
          <NButton as="NuxtLink" to="/" variant="outline" size="xs" leading-icon="mdi:map" label="Mapa" />
        </div>
      </NContainer>
    </header>

    <NContainer class="py-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside class="lg:col-span-3">
          <div class="rounded-2xl border bg-white p-3">
            <div class="space-y-2">
              <NButton as="NuxtLink" to="/admin" variant="ghost" class="w-full justify-start" leading-icon="mdi:view-dashboard" label="Visão geral" />
              <NButton as="NuxtLink" to="/admin/clients" variant="ghost" class="w-full justify-start" leading-icon="mdi:account-group" label="Clientes" />
              <NButton as="NuxtLink" to="/admin/users" variant="ghost" class="w-full justify-start" leading-icon="mdi:account" label="Usuários" />
              <NButton as="NuxtLink" to="/admin/produtos" variant="ghost" class="w-full justify-start" leading-icon="mdi:package-variant" label="Produtos" />
            </div>
          </div>
        </aside>

        <main class="lg:col-span-9">
          <slot />
        </main>
      </div>
    </NContainer>
  </div>
</template>

