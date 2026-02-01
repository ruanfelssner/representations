# Migração para Estrutura MVP

## ✅ Concluído

### Configurações
- ✅ Nuxt config atualizado com `@tailwindcss/vite`
- ✅ ESLint configurado com regras do MVP
- ✅ Prettier configurado (.prettierrc)
- ✅ TypeScript configurado com paths `@core/*`
- ✅ Scripts de lint e format adicionados

### Dependências Instaladas
- ✅ `@tailwindcss/vite` - Tailwind CSS v4
- ✅ `prettier` - Formatação de código
- ✅ `tsx` - TypeScript executor
- ✅ `@iconify/vue` - Sistema de ícones
- ✅ `@vee-validate/zod` - Validação de formulários
- ✅ `zod` - Schema validation
- ✅ `bullmq`, `ioredis` - Job queue (preparação futura)
- ✅ `mongodb`, `jose` - Database e auth (preparação futura)

### Componentes Copiados
Todos os componentes do design system foram copiados:
- ✅ `NBigNumber.vue`
- ✅ `NButton.vue`
- ✅ `NContainer.vue`
- ✅ `NEmptyState.vue`
- ✅ `NIcon.vue`
- ✅ `NInput.vue`
- ✅ `NLayer.vue`
- ✅ `NModal.vue`
- ✅ `NSelect.vue`
- ✅ `NStepper.vue`
- ✅ `NTextArea.vue`
- ✅ `NToggle.vue`
- ✅ `NTypo.vue`
- ✅ `PageHeader.vue`

### Estrutura de Layers
```
layers/
├── admin/
│   ├── app/
│   ├── server/
│   └── nuxt.config.ts
├── network/
│   ├── app/
│   ├── server/
│   └── nuxt.config.ts
├── public/
│   ├── app/
│   ├── server/
│   └── nuxt.config.ts
└── core/
    ├── app/
    └── server/
```

### Composables
- ✅ `useToast.ts` - Sistema de notificações

### Arquivos de Configuração
- ✅ `.prettierrc` - Configuração Prettier
- ✅ `eslint.config.mjs` - Configuração ESLint
- ✅ `tsconfig.json` - Paths TypeScript
- ✅ `nuxt.config.ts` - Configuração Nuxt com layers

## 🔄 Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento
pnpm build        # Build produção
pnpm preview      # Preview build
pnpm lint         # Verificar código
pnpm lint:fix     # Corrigir automaticamente
pnpm format       # Formatar com Prettier
```

## 📦 Próximos Passos

1. Configurar variáveis de ambiente em `.env`
2. Implementar funcionalidades nas layers (admin, network, public)
3. Adicionar middleware de autenticação
4. Configurar MongoDB quando necessário
5. Implementar job queues com BullMQ

## 🎯 Padrões Seguidos

- Single quotes, sem ponto-e-vírgula
- 2 espaços de indentação
- 100 caracteres por linha
- Estrutura modular com Nuxt Layers
- Design system com prefixo `N`
- Composables reutilizáveis
