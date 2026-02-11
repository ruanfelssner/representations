<template>
  <div class="min-h-screen bg-slate-50">
    <NAppHeader 
      logo-link="/admin" 
      :menu-open="isMenuOpen"
      :show-menu-button="true"
      @toggle-menu="toggleMenu"
    >
      <template #actions>
        <NButton as="NuxtLink" to="/admin" variant="outline" size="xs" leading-icon="mdi:map">
          Mapa
        </NButton>
      </template>
      <template #mobileActions>
        <NButton as="NuxtLink" to="/admin" variant="ghost" size="xs">
          <NIcon name="mdi:map" class="w-5 h-5" />
        </NButton>
      </template>
    </NAppHeader>

    <NContainer class="py-4 lg:py-6">
      <div class="grid !grid-cols-1 md:!grid-cols-12 lg:!grid-cols-12 gap-4 lg:gap-6">
        <!-- Navigation Sidebar/Drawer -->
        <div class="md:!col-span-3 lg:!col-span-3">
          <NNavMenu :is-open="isMenuOpen" @close="closeMenu">
            <div class="space-y-1">
              <NNavItem 
                to="/admin" 
                icon="mdi:view-dashboard" 
                label="Dashboard" 
                @click="closeMenu"
              />
              <NNavItem 
                to="/admin/clients" 
                icon="mdi:account-group" 
                label="Clientes" 
                @click="closeMenu"
              />
              <NNavItem 
                to="/admin/historico" 
                icon="mdi:history" 
                label="Histórico" 
                @click="closeMenu"
              />
              <NNavItem 
                to="/admin/prospects" 
                icon="mdi:store-search" 
                label="Prospecção SC" 
                @click="closeMenu"
              />
              <NNavItem 
                to="/admin/users" 
                icon="mdi:account" 
                label="Usuários" 
                @click="closeMenu"
              />
              <NNavItem 
                to="/admin/produtos" 
                icon="mdi:package-variant" 
                label="Produtos" 
                @click="closeMenu"
              />
              <NNavItem 
                to="/admin/whatsapp-templates" 
                icon="mdi:whatsapp" 
                label="Templates WhatsApp" 
                @click="closeMenu"
              />
              <NNavItem 
                to="/admin/configuracoes" 
                icon="mdi:cog" 
                label="Configurações" 
                @click="closeMenu"
              />
            </div>
          </NNavMenu>
        </div>

        <main class="md:!col-span-9 lg:!col-span-9">
          <slot />
        </main>
      </div>
    </NContainer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

