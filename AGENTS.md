![Nuxt Layers Agent](public/agent-cover.svg)

# AGENTS

Este documento padroniza **boas práticas de uso do Nuxt 4** neste repositório, com foco em:

- Arquitetura por **layers**
- Reaproveitamento e organização de **componentes**
- Convenções de **composables**, **API server**, **config** e **estilo**

## Contexto do projeto (estrutura atual)

- App (Nuxt “app directory”): `app/`
  - Páginas: `app/pages/`
  - Componentes: `app/components/`
  - Composables: `app/composables/`
  - Tipos: `app/types/`
- API (Nitro): `server/api/v1/*.ts`
- Layers: `layers/admin`, `layers/network`, `layers/public`

O root `nuxt.config.ts` estende layers nesta ordem:

```ts
extends: ['./layers/network', './layers/admin', './layers/public']
```

Regra: **layers mais “genéricas” primeiro, mais “específicas” depois**. O último tende a ganhar em conflitos.

---

## 1) Boas práticas Nuxt 4 (padrões recomendados)

### 1.1 Rotas e páginas

- Páginas ficam em `app/pages/`.
- Evite lógica de dados pesada dentro da página; extraia para composables (ex.: `useVisitedPlaces()`, `useCommercialPoints()`).
- Prefira “page composition”:
  - Página: orquestra fluxo e layout
  - Componentes: render e interação
  - Composables: estado, fetch e regras reutilizáveis

### 1.2 SSR, fetch e cache

- Como `ssr: true` está habilitado, pense sempre em:
  - O que precisa rodar no servidor vs. no cliente
  - Chaves de cache / revalidação
- Prefira `useFetch`/`$fetch` para chamadas ao backend do próprio app.
- APIs internas devem ficar em `server/api/` (Nitro) e **não** em componentes.

### 1.3 Runtime config (segurança e deploy)

- Use `runtimeConfig` para valores de ambiente.
- Tudo em `runtimeConfig.public` vai para o client.

Recomendação: **não versionar chaves reais** (ex.: Google Maps) no `nuxt.config.ts`. Use `.env`/variáveis de ambiente:

```bash
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

E consuma via:

```ts
const {
  public: { googleMapsApiKey },
} = useRuntimeConfig()
```

---

## 2) Layers: como usar bem

### 2.1 O que vai em layer vs. root

Use layers para separar “fatias” do produto por contexto (ex.: admin, público, rede) ou por pacote funcional.

- Root (`/`):
  - Integração e orquestração (ordem de `extends`, módulos comuns, tailwind, aliases)
  - Padrões globais (ex.: CSS global)
- Layer (`layers/<nome>`):
  - Páginas e componentes específicos daquele contexto
  - Configuração que só faz sentido ali (ex.: defaults de layout, middlewares, assets)

### 2.2 Regra de dependência

- Um layer **não deve** depender de outro layer “mais específico” (evite ciclo mental e acoplamento).
- Se algo é comum, suba para o root ou crie um “core layer” (se fizer sentido no futuro).

### 2.3 Overlays/precedência

Com `extends`, o Nuxt faz merge de configurações e também resolve arquivos pelo overlay. Padrão recomendado:

- Se um arquivo existir em múltiplos lugares, o que estiver no layer mais “ao final” do `extends` tende a prevalecer.
- Evite “brigar” por nomes iguais sem intenção (principalmente em componentes e páginas).

### 2.4 Checklist ao criar um novo layer

1. Criar `layers/<novo>/nuxt.config.ts`.
2. Colocar páginas em `layers/<novo>/app/pages/...` (ou estrutura equivalente, se adotarem).
3. Colocar componentes específicos em `layers/<novo>/app/components/...`.
4. Se precisar de config, adicionar apenas o mínimo no `defineNuxtConfig({ ... })` do layer.
5. Registrar no `extends` do root na ordem correta.

---

## 3) Componentes: reaproveitamento e padrões

Este repo já tem uma base de componentes em `app/components/`.

### 3.1 Convenção de “Design System” local

Componentes prefixados com `N*` (ex.: `NButton`, `NInput`, `NModal`, `NTypo`) devem seguir regras mais rígidas:

- Sem regras de domínio (não “saber” sobre clientes, visitas, mapas etc.)
- Props consistentes (ex.: `variant`, `size`, `disabled`, `loading` quando aplicável)
- Slots previsíveis (`default`, `icon`, `footer`, etc. quando fizer sentido)
- Estilo via Tailwind (preferir classes utilitárias, evitar CSS ad-hoc repetido)

Sugestão de taxonomia prática:

- **Base UI**: `NButton`, `NInput`, `NSelect`, `NModal`, `NToggle`, `NTypo`...
- **Layout**: `NContainer`, `NLayer`, `PageHeader`...
- **Domínio**: `BrokerMaps`, `ClientSidePanel`, `ModalNovaVisita`, `ModalEditarCliente`...

### 3.2 Evitar duplicação (padrões de extração)

Quando perceber repetição:

- Repetição de UI: extraia para um `N*` (base) ou componente “shared” sem domínio.
- Repetição de regra (ex.: cálculo/normalização): extraia para `app/composables/` ou `app/utils/` (se criarem).
- Repetição de fetch: extraia composable com `useFetch` (ou wrapper com `$fetch`).

### 3.3 Estabilidade de API de componentes

- Mudanças em componentes `N*` devem ser retrocompatíveis sempre que possível.
- Prefira adicionar props novas ao invés de trocar o significado de props existentes.
- Se precisar quebrar API: faça migração em duas etapas (deprecar → remover).

---

## 4) Composables: regras e naming

Em `app/composables/`:

- Nome sempre começa com `use`.
- Um composable deve ter:
  - Uma responsabilidade clara
  - Retorno previsível (ex.: `{ data, pending, error, refresh }`)
- Evite side effects globais implícitos.

`useClientStorage.ts` e `useToast.ts` são bons candidatos a virar padrão para:

- Persistência simples (localStorage) encapsulada
- Feedback de UI padronizado

---

## 5) Server API (Nitro) – padrões

Rotas em `server/api/v1/`:

- Nomes consistentes com o recurso (ex.: `maps.get.ts`, `visited-places.get.ts`).
- Validação e tratamento de erro: padronize retornos (HTTP status + mensagem).
- Não vaze detalhes internos (stack trace) para o client.

Quando uma resposta for usada em múltiplas telas, preferir modelar DTOs e tipar a resposta no client (ex.: em `app/types/`).

---

## 6) Estilo (ESLint + TS + Tailwind)

### 6.1 Tipagem com Zod (padrão)

Padrão do projeto: **Zod como fonte de verdade** (schema) e TypeScript apenas como **type inference**.
Isso evita “tipar no papel” sem validar em runtime.

- Sempre que for um dado que cruza fronteira (API, `useFetch`, localStorage, query params), crie um `z.object(...)`.
- Gere tipos a partir do schema com `z.infer<typeof MeuSchema>`.
- Evite criar `interface`/`type` manual para entidades de domínio quando existir schema (sem duplicação).
- Valide entradas na API (`server/api/*`) com `safeParse` e retorne erro 400 com mensagem clara.
- Valide respostas no client quando o payload vier de fora (ex.: APIs, arquivos, armazenamento local) para evitar bugs silenciosos.

Exemplo (schema + tipo inferido):

```ts
import { z } from 'zod'

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  city: z.string().optional(),
})

export type Client = z.infer<typeof ClientSchema>
```

- Mantenha tipagem em `app/types/` para entidades do domínio.
- Prefira `runtimeConfig` ao invés de constantes soltas para dados de ambiente.
- Tailwind: mantenha classes próximas ao template; se ficar grande, extraia para componentes.
- Evite “mega componentes”: se um `.vue` passar de ~250–300 linhas, normalmente vale refatorar.

---

## 7) Convenções de contribuição (rápidas)

- Pequenos PRs/commits: foco em uma mudança por vez.
- Nomeie coisas por intenção (ex.: `visitedPlaces`, `commercialPoints`).
- Sempre que criar algo “base UI”, prefira colocar em `app/components/N*` e usar em todo lugar.
