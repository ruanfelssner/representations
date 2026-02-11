<template>
  <NLayer class="relative rounded-t-lg overflow-visible min-h-[400px] pb-6" :border="false">
    <!-- Imagem de Fundo (preenche 100%) -->
    <img 
      :src="imgSrc" 
      :alt="title || 'Produto'" 
      class="absolute inset-0 w-full h-full object-cover shadow-2xl rounded-t-lg"
    />

    <div class="absolute top-0 left-0 right-0 p-4 text-center space-y-1 z-10">
      <NTypo 
        v-if="title" 
        size="3xl" 
        weight="black" 
        class="text-gray-800 drop-shadow-lg"
      >
        {{ title }}
      </NTypo>
      <NTypo 
        v-if="description" 
        size="sm" 
        weight="black" 
      >
        {{ description }}
      </NTypo>
    </div>

    <div class="absolute bottom-0 left-0 right-0 px-6 z-10 transform translate-y-1/2">
      <NButton v-if="href" :href="href" trailing-icon="mdi:chevron-right" width-full>
        Ver Preço
      </NButton>
    </div>
  </NLayer>
</template>
<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
  imgSrc: string;
  href?: string;
}>();
</script>