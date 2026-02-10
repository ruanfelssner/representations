<template>
  <div class="min-h-screen bg-slate-50">
    <NAppHeader logo-link="/">
      <template #actions>
        <div class="flex items-center gap-2">
          <NButton
            variant="outline"
            size="xs"
            leading-icon="mdi:file-pdf-box"
            @click="isPdfImporterOpen = true"
          >
            Importar PDF
          </NButton>
          <NButton
            as="NuxtLink"
            to="/admin/dashboard"
            variant="outline"
            size="xs"
            leading-icon="mdi:shield-account"
          >
            Admin
          </NButton>
        </div>
      </template>
      <template #mobileActions>
        <div class="flex items-center gap-1">
          <NButton variant="ghost" size="xs" @click="isPdfImporterOpen = true">
            <NIcon name="mdi:file-pdf-box" class="w-5 h-5" />
          </NButton>
          <NButton as="NuxtLink" to="/admin/dashboard" variant="ghost" size="xs">
            <NIcon name="mdi:shield-account" class="w-5 h-5" />
          </NButton>
        </div>
      </template>
    </NAppHeader>

    <slot />

    <ModalImportarPdfVenda v-model="isPdfImporterOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isPdfImporterOpen = ref(false)
</script>