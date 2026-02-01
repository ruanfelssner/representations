import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  extends: ['./layers/network', './layers/admin', './layers/public'],
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  alias: {
    '@core': fileURLToPath(new URL('./', import.meta.url)),
  },
  runtimeConfig: {
    public: {
      googleMapsApiKey: 'AIzaSyBXp8T4K9jP5YvN7Qm6Lw3XzRdFgHcJkT0',
      siteUrl: 'http://localhost:3000',
      siteName: 'Representations',
      defaultTitle: 'Representations',
    },
  },
  nitro: {
    alias: {
      '@core': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
