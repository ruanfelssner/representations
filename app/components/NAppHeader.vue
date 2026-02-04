<template>
  <header class="sticky top-0 z-50 border-b bg-white shadow-sm">
    <NContainer class="py-3">
      <div class="flex items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink :to="logoLink" class="flex-shrink-0">
          <img 
            src="/logo.webp" 
            alt="Felssner Representações" 
            class="h-10 lg:h-12"
          />
        </NuxtLink>

        <!-- Desktop Actions -->
        <div v-if="$slots.actions" class="hidden lg:flex items-center gap-2">
          <slot name="actions" />
        </div>

        <!-- Mobile Menu Button -->
        <button
          v-if="showMenuButton"
          @click="$emit('toggle-menu')"
          class="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Menu"
        >
          <NIcon :name="menuOpen ? 'x' : 'menu'" class="w-6 h-6" />
        </button>

        <!-- Mobile Actions (optional) -->
        <div v-if="$slots.mobileActions" class="lg:hidden flex items-center gap-2">
          <slot name="mobileActions" />
        </div>
      </div>
    </NContainer>
  </header>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    logoLink?: string
    menuOpen?: boolean
    showMenuButton?: boolean
  }>(),
  {
    logoLink: '/',
    menuOpen: false,
    showMenuButton: false,
  }
)

defineEmits<{
  (e: 'toggle-menu'): void
}>()
</script>
