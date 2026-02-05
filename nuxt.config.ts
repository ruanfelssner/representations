import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  extends: ['./layers/admin'],
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  alias: {
    '@core': fileURLToPath(new URL('./', import.meta.url)),
  },
  runtimeConfig: {
    googleMapsServerApiKey: '',
    mongoUri: '',
    mongoDbName: '',
    public: {
      googleMapsApiKey: '',
      siteName: 'Representations',
      defaultTitle: 'Representations',
    },
  },
  app: {
    head: {
      title: 'Felssner Representações',
      titleTemplate: '%s · Felssner Representações',
      htmlAttrs: {
        lang: 'pt-BR',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Sistema de gerenciamento para Felssner Representações',
        },
        { name: 'application-name', content: 'Felssner Representações' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'icon', type: 'image/x-icon', href: '/assets/favicon-felssner.ico' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600&display=swap',
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
