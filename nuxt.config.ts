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
  app: {
    head: {
      title: 'Alerta de Oferta',
      titleTemplate: '%s · Alerta de Oferta',
      htmlAttrs: {
        lang: 'pt-BR',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Comunidades por nicho com ofertas publicadas e curadoria diária.',
        },
        { name: 'application-name', content: 'Alerta de Oferta' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'icon', type: 'image/x-icon', href: '/assets/favicon-alertaoferta.ico' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600&display=swap',
        },
      ],
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
