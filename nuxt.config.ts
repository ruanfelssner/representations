import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  extends: ['./layers/network', './layers/admin', './layers/public'],
  modules: process.env.NUXT_ENABLE_ESLINT === 'true' ? ['@nuxt/eslint'] : [],
  css: ['~/assets/css/main.css'],
  alias: {
    '@core': fileURLToPath(new URL('./', import.meta.url)),
  },
  runtimeConfig: {
    googleMapsServerApiKey:
      process.env.NUXT_GOOGLE_MAPS_API_KEY || process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    mongoUri: process.env.NUXT_MONGO_URI || '',
    mongoDbName: process.env.NUXT_MONGO_DB_NAME || '',
    public: {
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
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
