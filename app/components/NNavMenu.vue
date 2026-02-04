<template>
  <nav>
    <!-- Mobile: Drawer overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen && !isDesktop"
        @click="$emit('close')"
        class="fixed inset-0 bg-black/30 z-40 lg:hidden"
      />
    </Transition>

    <!-- Mobile: Drawer -->
    <Transition name="slide-right">
      <aside
        v-if="isOpen && !isDesktop"
        class="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
      >
        <div class="p-4 border-b flex items-center justify-between">
          <NTypo as="h2" size="lg" weight="bold">Menu</NTypo>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <NIcon name="x" class="w-5 h-5" />
          </button>
        </div>
        <div class="p-4">
          <slot />
        </div>
      </aside>
    </Transition>

    <!-- Desktop: Sidebar -->
    <aside v-if="isDesktop" class="hidden lg:block">
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <slot />
      </NLayer>
    </aside>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  isOpen?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const windowWidth = ref(0)

const isDesktop = computed(() => windowWidth.value >= 1024)

function updateWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(-100%);
}
</style>
