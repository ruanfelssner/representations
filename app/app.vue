<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@import 'tailwindcss';

/* Transition: Slide Down */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

/* Transition: Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
