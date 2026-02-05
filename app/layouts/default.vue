<template>
  <div class="min-h-screen bg-slate-50">
    <NAppHeader logo-link="/">
      <template #actions>
        <NButton as="NuxtLink" to="/admin/dashboard" variant="outline" size="xs" leading-icon="mdi:shield-account">
          Admin
        </NButton>
      </template>
      <template #mobileActions>
        <NButton as="NuxtLink" to="/admin/dashboard" variant="ghost" size="xs">
          <NIcon name="mdi:shield-account" class="w-5 h-5" />
        </NButton>
      </template>
    </NAppHeader>

    <slot />
  </div>
</template>

<script setup lang="ts">
// Layout padrão do app
</script>