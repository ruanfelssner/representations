// @ts-check
import fs from 'node:fs'
import path from 'node:path'

const nuxtEslintConfigPath = path.resolve(process.cwd(), '.nuxt/eslint.config.mjs')
const withNuxt = fs.existsSync(nuxtEslintConfigPath)
  ? (await import(nuxtEslintConfigPath)).default
  : (config) => config

const nuxtConfig = withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
  },
})

const nuxtConfigArray = Array.isArray(nuxtConfig) ? nuxtConfig : [nuxtConfig]

export default [{ ignores: ['.nuxt/**', 'node_modules/**', 'dist/**', '.output/**'] }, ...nuxtConfigArray]
