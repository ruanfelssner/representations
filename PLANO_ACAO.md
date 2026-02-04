# Plano de Ação: Refatoração Completa da Estrutura de Dados e Análises

**Data:** Fevereiro 2026  
**Objetivo:** Separar collections, criar referências de vendedores e produtos, e implementar análises inteligentes com timeline de ações

---

## 📋 Sumário Executivo

Este documento detalha a refatoração completa do sistema, passando de uma estrutura monolítica (visitas dentro de clients) para uma arquitetura mais robusta e escalável com:

- ✅ **5 collections persistidas** (clients, users, historicoCliente, produtos, historicoValores)
- ✅ **Zero duplicação** - vendas e visitas (tipos) extraídas de historicoCliente
- ✅ **Importação de dados** da planilha "Plano de Ouro"
- ✅ **Sistema de users/roles** (vendedor, gerente, admin, supervisor) com autenticação preparada
- ✅ **Análises on-demand** - agregações rápidas + previsões com cache Redis opcional
- ✅ **Timeline simples** - historicoCliente ordenado, sem collection separada

**Arquitetura:**

- Fewer collections = menos overhead, mais simples
- Source of truth único (historicoCliente) = zero desincronização
- On-demand computation = sempre fresco, flexível para mudanças

---

## ⚠️ Pontos de atenção (ajustes antes de construir em cima)

### 1) Inconsistência no número de collections

No sumário existia “4 collections”, mas eram listadas 5. O plano foi alinhado para **5 collections persistidas**:
`clients`, `users`, `historicoCliente`, `produtos`, `historicoValores`.

### 2) “visitas” vs “historicoCliente” (ambiguidade)

Decisão adotada neste plano (Opção A): **não existe collection `visitas`**.  
“Visita” vira um **tipo** dentro de `historicoCliente`:
- `visita_fisica` (sem venda)
- `venda_fisica` (com venda)

Isso evita arquitetura “meio a meio” e elimina risco de desincronização.

### 3) Migração: atenção a `clients_backup_*`

MongoDB não resolve wildcard em `db.collection('clients_backup_*')`.  
Se a estratégia de migração renomear a collection para backup, o script deve **guardar o nome real gerado** (ex.: `clients_backup_1700000000000`) e usar exatamente esse nome nas leituras.

### 4) Índice geoespacial (MongoDB)

Para geo-query real (raio, near, clusters), padronizar:
- `clients.localizacao.geo` em GeoJSON (`{ type: "Point", coordinates: [lng, lat] }`)
- índice `2dsphere` em `clients.localizacao.geo`

`latitude`/`longitude` continuam existindo como conveniência/UI, mas o índice de mapa deve ser no GeoJSON.

---

## ⚠️ REQUISITOS CRÍTICOS

### Geo Referenciamento

**O sistema ATUAL JÁ POSSUI geolocalização de clientes. ISSO DEVE SER PRESERVADO E EXPANDIDO.**

Cada cliente deve manter/ter:

- `localizacao.latitude` (number): Coordenada de latitude
- `localizacao.longitude` (number): Coordenada de longitude
- `localizacao.geo` (GeoJSON Point): `{ type: "Point", coordinates: [lng, lat] }` (campo indexado `2dsphere`)
- `endereco.endereco_completo` (string): Endereço formatado para geocodificação

**Status Atual:**

- ✅ Todos os clientes têm `lat` e `lng` preenchidos
- ✅ Todos os clientes têm `endereco_completo`
- ✅ Isso é essencial para os mapas funcionarem

**Isso é ESSENCIAL para:**

- Visualizar clientes no mapa (BrokerMaps)
- Calcular rotas otimizadas de visitas
- Análises geográficas de concentração de vendas
- Sugerir próximos clientes por proximidade

---

## 🏗️ FASE 0: Planejamento e Modelagem de Dados

### 0.1 Diagrama Atual vs Proposto

**ATUAL (Estado Real do Banco):**

```json
{
  "_id": "17987609000107",
  "nome": "SARA DE OLIVEIRA",
  "cnpj": "17987609000107",
  "email": "exemplo@hotmail.com",
  "telefone": "4832761536",
  "segmento": "otica",
  "cidade": "ALFREDO WAGNER",
  "estado": "SC",
  "endereco": "R. Hercílio Luz - ...",
  "endereco_completo": "RUA HERCILIO LUZ, CENTRO, ...",
  "lat": -27.7002587,              ⭐ PRESERVAR COMO localizacao.latitude
  "lng": -49.3348321,              ⭐ PRESERVAR COMO localizacao.longitude
  "color": "#3b82f6",              ❌ REMOVER (UI concern)
  "visitas": [...]                 ❌ MOVER PARA `historicoCliente` (tipo=visita_fisica|venda_fisica)
}
```

**PROPOSTO (Schema Normalizado):**

**Nota:** não existe collection `visitas`. Toda interação/visita/venda vira evento em `historicoCliente`.

```txt
clients {
  _id: string (CNPJ)

  nome: string
  cnpj: string
  email: string (opcional)
  segmento: string (ex: 'otica', 'joalheria')
  telefone: string (opcional)

  endereco: {
    rua: string
    bairro: string
    cidade: string
    cep: string
    uf: string (2 chars)
    endereco_completo: string (referência histórica)
  }

  localizacao: {              ⭐ CRÍTICO - GEO REFERENCIAMENTO
    latitude: number
    longitude: number
    geo: { type: "Point", coordinates: [longitude, latitude] }  ⭐ índice 2dsphere
  }

  objectives: {
    mesAberto?: number
    mesTarget?: number
    semestreTarget?: number
    anoTarget?: number
  }

  sales: { // ⭐ Camada comercial (alavanca de vendas)
    stage: 'lead' | 'ativo' | 'negociacao' | 'perdido' | 'reativacao'
    ownerUserId?: string
    nextActionAt?: datetime
    nextActionType?: 'ligar' | 'visitar' | 'enviar_catalogo' | 'cobrar'
    lastContactAt?: datetime
    priorityScore?: number (0-100)
  }

  status: 'ativo' | 'inativo' | 'potencial'
  createdAt: datetime
  updatedAt: datetime
}

historicoCliente { // ⭐ NOVA - Histórico completo de interações com cliente
\_id (ObjectId)
clientId (ref)
userId (ref)
tipo: 'visita_fisica' | 'ligacao' | 'venda_ligacao' | 'venda_fisica' | 'agendamento' | 'feedback'
data: datetime
descricao: string

// Itens/produtos (apenas se venda)
items: [
{
produtoId (ref)
nome: string
quantidade: number
valorUnitario: number (valor daquela data)
total: number
}
]

resultado: 'sucesso' | 'pendente' | 'fracasso'
feedback: string (opcional)
totalVenda: number (0 se não houver venda)
duracao: number (minutos, opcional)
proximoContato: datetime (sugestão)

createdAt: datetime
updatedAt: datetime
}

users { // ⭐ Genérico: vendedor, gerente, admin, supervisor
\_id
nome: string
email: string
telefone: string (opcional)
role: 'vendedor' | 'gerente' | 'admin' | 'supervisor'
ativo: boolean
dataAdmissao: datetime

// Futuro: autenticação e permissões
password: string (opcional, hash)
permissions: [ 'view_clients', 'create_visita', ... ]

meta: { mesAberto?, trimestre?, ano? }
createdAt: datetime
updatedAt: datetime
}

produtos {
\_id
codigo: string (ex: 'AEX0113')
nome: string
descricao: string
valor: number (Reais - preço atual)
categoria: string
ativo: boolean
createdAt: datetime
updatedAt: datetime
}

historicoValores { // ⭐ NOVA COLLECTION
\_id (ObjectId)
produtoId (ref)
data: datetime
valor: number
createdAt: datetime
}

// ⚠️ DTOs (não são collections) — respostas de API computadas on-demand (ver seção 0.2.2)
analyticsResponse {
  periodo: 'mes' | 'semestre' | 'ano'
  ano: number
  mes?: number (1-12)

  totalVisitas: number         // tipo in ['visita_fisica','venda_fisica']
  totalVendas: number          // tipo in ['venda_fisica','venda_ligacao']
  totalFaturamento: number     // soma de totalVenda (vendas)
  ticketMedio: number

  produtosTopVendidos: [ { produtoId, qtd, faturamento } ]

  // Previsões (inteligência)
  previsaoFaturamentoMesAtual: number
  previsaoFaturamentoProxMes: number
  previsaoFaturamentoProxTrimestre: number
  previsaoFaturamentoAno: number
  probabilidadeAtingirMeta: percentage

  proximasAcoes: [
    {
      tipo: 'ligar' | 'oferecer' | 'agendamento'
      descricao: string
      prioridade: 'alta' | 'media' | 'baixa'
      dataRecomendada: datetime
      razao: string
    }
  ]

  computedAt: datetime
}

timelineResponse {
  clientId: string
  events: [
    {
      id: string
      data: datetime
      tipo: 'visita' | 'contato' | 'venda' | 'agendamento' | 'acao_sugerida'
      titulo: string
      descricao?: string
    }
  ]
}
```

### 0.2 Estrutura de Dados: Schemas Zod

Será criado arquivo `app/types/schemas.ts` com validação em runtime.

---

## 🔄 Mapeamento de Transformação de Dados

### De campos atuais para nova estrutura:

| Campo Atual | Novo Campo | Ação | Observação |
|---|---|---|---|
| `_id` | `_id` | ✅ MANTER | Continua sendo CNPJ |
| `nome` | `nome` | ✅ MANTER | Sem alteração |
| `cnpj` | `cnpj` | ✅ MANTER | Sem alteração |
| `email` | `email` | ✅ MANTER | Sem alteração |
| `telefone` | `telefone` | ✅ MANTER | Sem alteração |
| `segmento` | `segmento` | ✅ MANTER | ex: 'otica', 'joalheria' |
| `lat` | `localizacao.latitude` | ♻️ REMAPEAR | Renomear e estruturar |
| `lng` | `localizacao.longitude` | ♻️ REMAPEAR | Renomear e estruturar |
| `endereco` | `endereco.rua` | ♻️ DECOMPOR | Extrair rua da string |
| `endereco_completo` | `endereco.endereco_completo` | ♻️ DECOMPOR | Manter para ref. reversa |
| `cidade` | `endereco.cidade` | ♻️ DECOMPOR | Mover para endereco |
| `estado` | `endereco.uf` | ♻️ DECOMPOR | Renomear e mover para endereco |
| `cep` | `endereco.cep` | ♻️ DECOMPOR | Mover para endereco |
| `color` | ❌ REMOVER | 🗑️ DELETAR | UI concern - usar CSS/Tailwind |
| `tipo` | ❌ REMOVER | 🗑️ DELETAR | Redundante - já é da collection clients |
| `visitas` | `collection: historicoCliente` | ➡️ MOVER | Histórico completo de interações (visita_fisica, ligacao, venda_ligacao, venda_fisica) |
| `createdAt` | `createdAt` | ✅ MANTER | Sem alteração |
| `updatedAt` | `updatedAt` | ✅ MANTER | Atualizar ao migrar |

---

### 0.2.1 Resumo: Estratégia de Vendas (Sem Duplicação)

**Pergunta:** Collection separada para vendas, ou extrair do `historicoCliente`?

**Resposta:** **Extrair do `historicoCliente`** - Hybrid Approach sem duplicação.

**Modelo:**

```
historicoCliente (Source of Truth Único)
├─ Todos os eventos: visita_fisica, ligacao, venda_ligacao, venda_fisica, agendamento, feedback
├─ Imutável (registro de auditoria)
└─ Query simples para vendas: find({ tipo: { $in: ['venda_fisica', 'venda_ligacao'] } })

cache (Redis opcional)
├─ Agregações: totalVendas, totalFaturamento, produtosTopVendidos
├─ Previsões: regressão linear para próximos períodos
├─ Atualizado 1x/dia (ou em tempo real para vendas críticas)
└─ Nunca é fonte de verdade dos dados brutos
```

**Por quê?**
- ✅ Zero duplicação (historicoCliente é a única fonte)
- ✅ Consistência garantida (impossível desincronizar)
- ✅ Auditoria completa (historicoCliente nunca é alterado/deletado)
- ✅ Simples (menos código, menos pontos de falha)

Detalhes completos em **[1.2.5.1 Estratégia de Vendas](#1251-estratégia-de-vendas-hybrid-approach-sem-duplicação)**.

### 0.2.2 Analytics e Timeline: On-Demand vs Collections

**Pergunta:** Analytics e Timeline devem ser collections persistidas, ou computadas on-demand?

**Resposta:** **On-demand via API** (+ cache opcional em Redis)

**Comparação:**

| Aspecto | Analytics Collection | On-Demand API |
|---|---|---|
| Duplicação | ❌ Redundante | ✅ Zero |
| Sincronização | ❌ Precisa sync | ✅ Sempre fresco |
| Frescor | ❌ Desatualiza | ✅ Sempre atual |
| Queries | ✅ Super rápido | ❌ Mais CPU |
| Manutenção | ❌ Complex | ✅ Simples |
| Storage | ❌ Mais uso | ✅ Menos |
| Collections | ❌ +2 | ✅ 0 |

**Modelo Final:**

```
historicoCliente (Source of Truth)
├─ Todos os eventos brutos
└─ Imutável (auditoria)

API Endpoints (On-Demand)
├─ GET /analytics/[clientId] → count+sum+previsões
└─ GET /timeline/[clientId]  → find().sort(data: -1)

Redis Cache (Opcional)
├─ TTL 6-12h
├─ Previsões custosas (regressão linear)
└─ Recalculado 1x/dia em background
```

**Benefícios:**
✅ 5 collections ao invés de 7
✅ Zero duplicação
✅ Sempre sincronizado
✅ Simples (agregação vs sincronização)
✅ Flexível (mudar lógica sem migração)

---

## 🔧 FASE 1: Preparação do Backend

### 1.1 Criar Schemas Zod para Validação

**Arquivo:** `app/types/schemas.ts`

```typescript
import { z } from 'zod'

// CLIENTES - Adaptado à estrutura real do banco
export const ClientSchema = z.object({
  _id: z.string(),            // CNPJ como ID
  nome: z.string().min(1),
  cnpj: z.string().min(14).max(18),
  email: z.string().email().optional(),
  segmento: z.string().optional(),  // 'otica', 'joalheria', etc

  endereco: z.object({
    rua: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string(),
    cep: z.string().optional(),
    uf: z.string().length(2),
    endereco_completo: z.string().optional(),
  }).optional(),

  // ⭐ GEO REFERENCIAMENTO - CRÍTICO PARA MAPAS
  // Preservado de lat/lng antigos, agora estruturado
  localizacao: z.object({
    latitude: z.number(),
    longitude: z.number(),
    // GeoJSON para índice 2dsphere (queries de proximidade/raio)
    geo: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    }).optional(),
  }).optional(),

  telefone: z.string().optional(),

  objectives: z.object({
    mesAberto: z.number().optional(),
    mesTarget: z.number().optional(),
    semestreTarget: z.number().optional(),
    anoTarget: z.number().optional(),
  }).optional(),

  // ⭐ Camada comercial (alavanca de vendas)
  sales: z.object({
    stage: z.enum(['lead', 'ativo', 'negociacao', 'perdido', 'reativacao']).optional(),
    ownerUserId: z.string().optional(),
    nextActionAt: z.string().datetime().optional(),
    nextActionType: z.enum(['ligar', 'visitar', 'enviar_catalogo', 'cobrar']).optional(),
    lastContactAt: z.string().datetime().optional(),
    priorityScore: z.number().min(0).max(100).optional(),
  }).optional(),

  status: z.enum(['ativo', 'inativo', 'potencial']).default('ativo'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Client = z.infer<typeof ClientSchema>

// USERS - Genérico para vendedor, gerente, admin, supervisor
// Preparado para futuro com password e permissions
export const UserSchema = z.object({
  _id: z.string(),
  nome: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().optional(),
  role: z.enum(['vendedor', 'gerente', 'admin', 'supervisor']).default('vendedor'),
  ativo: z.boolean().default(true),
  dataAdmissao: z.string().datetime(),

  // Futuro: campos de autenticação e permissões
  password: z.string().optional(),
  permissions: z.array(z.string()).optional(),

  meta: z.object({
    mesAberto: z.number().optional(),
    trimestre: z.number().optional(),
    ano: z.number().optional(),
  }).optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type User = z.infer<typeof UserSchema>

// PRODUTOS
export const ProdutoSchema = z.object({
  _id: z.string(),
  codigo: z.string().min(1),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  valor: z.number().min(0),  // Apenas valor atual
  categoria: z.string().optional(),
  ativo: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Produto = z.infer<typeof ProdutoSchema>

// HISTÓRICO DE VALORES - Em collection separada
export const HistoricoValorSchema = z.object({
  _id: z.string().optional(),
  produtoId: z.string(),
  data: z.string().datetime(),
  valor: z.number().min(0),
  createdAt: z.string().datetime(),
})
export type HistoricoValor = z.infer<typeof HistoricoValorSchema>

// VISITA - Item de histórico de cliente (venda, ligação, visita física)
export const VisitaItemSchema = z.object({
  produtoId: z.string(),
  nome: z.string(),
  quantidade: z.number().min(1),
  valorUnitario: z.number().min(0),  // Valor daquela data
})

// HISTÓRICO DO CLIENTE - Evento/interação com cliente
export const HistoricoClienteSchema = z.object({
  _id: z.string().optional(),
  clientId: z.string(),
  userId: z.string(),
  tipo: z.enum([
    'visita_fisica',
    'ligacao',
    'venda_ligacao',
    'venda_fisica',
    'agendamento',
    'feedback',
  ]),
  data: z.string().datetime(),
  descricao: z.string().optional(),

  // Itens (apenas se tipo include 'venda')
  items: z.array(VisitaItemSchema).optional().default([]),

  // Status e feedback
  resultado: z.enum(['sucesso', 'pendente', 'fracasso']).default('pendente'),
  feedback: z.string().optional(),

  // Totais e métricas
  totalVenda: z.number().min(0).default(0),
  duracao: z.number().min(0).optional(),  // minutos
  proximoContato: z.string().datetime().optional(),

  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})
export type HistoricoCliente = z.infer<typeof HistoricoClienteSchema>

// ⚠️ NOTA: Analytics e Timeline NÃO são schemas de collection
// São computados on-demand. Ver seções 0.2.2 e 1.2.6/1.2.7 para implementação
```

### 1.2 Criar Endpoints API

#### 1.2.1 Users (Vendedores, Gerentes, Admins)

**Arquivo:** `server/api/v1/users.get.ts`

```typescript
// GET - Listar todos os users (com filtro opcional por role)
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = await getMongoDb()

  const filter: Record<string, any> = {}
  if (query.role) filter.role = query.role
  if (query.ativo !== undefined) filter.ativo = query.ativo === 'true'

  const users = await db.collection('users').find(filter).toArray()
  return users
})
```

**Arquivo:** `server/api/v1/users.post.ts`

```typescript
// POST - Criar novo user
export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const body = await readBody(event)
  const validated = UserSchema.pick({
    nome: true,
    email: true,
    telefone: true,
    role: true,
    dataAdmissao: true,
    meta: true,
  }).parse(body)

  const user = {
    _id: `user-${Date.now()}`,
    ...validated,
    ativo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('users').insertOne(user)
  return { success: true, data: user }
})
```

#### 1.2.2 Produtos e Histórico de Valores

**Arquivo:** `server/api/v1/produtos.get.ts`

```typescript
// GET - Listar todos os produtos
export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const produtos = await db.collection('produtos').find({}).toArray()
  return produtos
})
```

**Arquivo:** `server/api/v1/produtos.post.ts`

```typescript
// POST - Criar novo produto
export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const body = await readBody(event)
  const validated = ProdutoSchema.pick({
    codigo: true,
    nome: true,
    descricao: true,
    valor: true,
    categoria: true,
  }).parse(body)

  const produto = {
    _id: `produto-${validated.codigo}`,
    ...validated,
    ativo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('produtos').insertOne(produto)

  // Criar primeiro registro de histórico
  await db.collection('historicoValores').insertOne({
    produtoId: produto._id,
    data: new Date().toISOString(),
    valor: validated.valor,
    createdAt: new Date().toISOString(),
  })

  return { success: true, data: produto }
})
```

#### 1.2.4 Histórico Cliente (Visitas, Ligações, Vendas)

**Arquivo:** `server/api/v1/historico-cliente.get.ts`

```typescript
// GET - Listar histórico de um cliente com filtros opcionais
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = await getMongoDb()

  const filter: Record<string, any> = {}
  if (query.clientId) filter.clientId = query.clientId
  if (query.userId) filter.userId = query.userId
  if (query.tipo) filter.tipo = query.tipo
  if (query.periodo) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    filter.data = { $gte: start.toISOString() }
  }

  const historico = await db
    .collection('historicoCliente')
    .find(filter)
    .sort({ data: -1 })
    .toArray()
  return historico
})
```

**Arquivo:** `server/api/v1/historico-cliente.post.ts`

```typescript
// POST - Criar novo evento no histórico (visita, ligação, venda, etc)
export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const body = await readBody(event)

  const validated = HistoricoClienteSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  }).parse(body)

  // Calcular totalVenda a partir dos items
  const totalVenda =
    validated.items?.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0) || 0

  const evento = {
    _id: new ObjectId(),
    ...validated,
    totalVenda,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('historicoCliente').insertOne(evento)

  // Atualizar stats do client
  await updateClientStats(db, validated.clientId)

  // ⭐ Camada comercial (FASE 8 - recomendado)
  // - Atualizar clients.sales.lastContactAt (ex.: validated.data)
  // - Persistir/validar nextActionAt (ex.: validated.proximoContato) para não deixar cliente sem follow-up

  return { success: true, data: evento }
})

async function updateClientStats(db: any, clientId: string) {
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const eventos = await db
    .collection('historicoCliente')
    .find({
      clientId,
      data: { $gte: thisMonth.toISOString() },
      tipo: { $in: ['venda_fisica', 'venda_ligacao'] },
    })
    .toArray()

  const faturamento = eventos.reduce((sum, e) => sum + e.totalVenda, 0)

  await db.collection('clients').updateOne(
    { _id: clientId },
    {
      $set: {
        'objectives.mesAberto': faturamento,
        updatedAt: new Date().toISOString(),
      },
    }
  )
}
```

**Arquivo:** `server/api/v1/historico-cliente/[clientId].get.ts`

```typescript
// GET - Obter histórico completo de um cliente
export default defineEventHandler(async (event) => {
  const { clientId } = getRouterParams(event)
  const db = await getMongoDb()

  const historico = await db
    .collection('historicoCliente')
    .find({ clientId })
    .sort({ data: -1 })
    .toArray()

  return { clientId, total: historico.length, eventos: historico }
})
```

**Nota (decisão do plano):** não criar collection `visitas` nem endpoints que gravam em `visitas`.  
Se precisar da UX/rota “visitas” no front, trate como **alias de leitura** em cima de `historicoCliente`:

```ts
// Exemplo: visitas = eventos físicos no historicoCliente
const visitas = await db
  .collection('historicoCliente')
  .find({ clientId, tipo: { $in: ['visita_fisica', 'venda_fisica'] } })
  .sort({ data: -1 })
  .toArray()
```

#### 1.2.5.1 Estratégia de Vendas: Hybrid Approach (SEM Duplicação)

**Decisão Arquitetural Importante:** Não existe collection separada de "vendas". Em vez disso:

**1) Source of Truth Único: historicoCliente**

- Todos os eventos (visitas, ligações, vendas, feedback) vivem em `historicoCliente`
- Registro imutável de auditoria
- Para extrair vendas, simples filtro:

```typescript
// Queries para extrair vendas
const vendas = await db
  .collection('historicoCliente')
  .find({
    clientId: '...',
    tipo: { $in: ['venda_fisica', 'venda_ligacao'] },
  })
  .toArray()

// Para contar vendas (agregação eficiente)
const totalVendas = await db.collection('historicoCliente').countDocuments({
  clientId: '...',
  tipo: { $in: ['venda_fisica', 'venda_ligacao'] },
})
```

**2) Cache de Analytics (Redis opcional)**

- Cache opcional para previsões/agregações custosas (TTL 6–12h)
- Chave sugerida: `analytics:${clientId}:${periodo}:${ano}:${mes?}`
- O payload cacheado é a própria resposta do endpoint `/api/v1/analytics/[clientId]`

```typescript
{
  clientId,
  periodo: 'mes' | 'semestre' | 'ano',
  ano: 2026,
  mes: 2,

  // Métricas computadas a partir de historicoCliente
  totalVendas: 15,           // COUNT de historicoCliente tipo=venda*
  totalFaturamento: 45000,   // SUM de valores de venda
  ticketMedio: 3000,         // totalFaturamento / totalVendas
  produtosTopVendidos: [
    { produtoId: "...", qtd: 5, faturamento: 15000 },
    { produtoId: "...", qtd: 3, faturamento: 9000 }
  ],

  // Previsões (regressão linear ou similar)
  previsaoFaturamentoMesAtual: 60000,
  previsaoFaturamentoProxMes: 55000,
  previsaoFaturamentoProxTrimestre: 165000,
  previsaoFaturamentoAno: 720000,

  probabilidadeAtingirMeta: 85,  // %
  proximasAcoes: [...]
}
```

**3) Benefícios Dessa Abordagem**
✅ **Zero duplicação** - Uma única fonte de verdade (historicoCliente)
✅ **Consistência garantida** - Impossível ter desincronização entre collections
✅ **Sem risco de bugs** - Não há chance de venda deletada em um lugar e ainda existir em outro
✅ **Performance** - Agregações on-demand ou cache Redis para previsões custosas
✅ **Auditoria completa** - historicoCliente é imutável, nunca é alterado/deletado
✅ **Simplicidade** - Menos collections, menos pontos de sincronização
✅ **Flexibilidade** - Mudar lógica de analytics não requer migração de dados

**4) Estratégia: On-Demand + Cache Opcional (Redis)**

- **Analytics básicas (vendas, faturamento):** Computadas on-demand via agregação (rápido)
- **Previsões (regressão linear):** Cache em Redis TTL 6-12h, recalculado 1x/dia
- **Timeline:** Simples find().sort() - não precisa cache

**Vantagem:** Balanço perfeito entre frescor dos dados e performance.

**Nota:** Essa abordagem on-demand também aplica a `timeline` e outros analytics. Ver seção [0.2.2](#022-analytics-e-timeline-on-demand-vs-collections).

---

#### 1.2.6 Analytics (On-Demand)

**Arquivo:** `server/api/v1/analytics/[clientId].get.ts`

```typescript
// GET - Obter analytics de um cliente (computado on-demand)
export default defineEventHandler(async (event) => {
  const { clientId } = getRouterParams(event)
  const db = await getMongoDb()
  const redis = useRedis() // Opcional

  // 1. Buscar vendas direto de historicoCliente
  const vendas = await db
    .collection('historicoCliente')
    .find({ clientId, tipo: { $in: ['venda_fisica', 'venda_ligacao'] } })
    .toArray()

  const totalVendas = vendas.length
  const totalFaturamento = vendas.reduce((sum, v) => sum + v.totalVenda, 0)

  // 2. Produtos top vendidos
  const produtosMap = new Map()
  vendas.forEach((v) => {
    v.items?.forEach((item) => {
      const key = item.produtoId
      produtosMap.set(key, (produtosMap.get(key) || 0) + item.quantidade)
    })
  })
  const produtosTopVendidos = Array.from(produtosMap.entries())
    .map(([produtoId, qtd]) => ({ produtoId, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5)

  // 3. Previsões (opcional: busca do Redis, senão computa)
  let previsoes = null
  const cacheKey = `previsoes:${clientId}`
  previsoes = await redis?.get(cacheKey)
  if (!previsoes) {
    previsoes = calcularPrevisoes(vendas)
    // Salva em Redis com TTL 12h para reuse
    await redis?.setex(cacheKey, 43200, JSON.stringify(previsoes))
  }

  return {
    clientId,
    totalVendas,
    totalFaturamento,
    ticketMedio: totalVendas > 0 ? totalFaturamento / totalVendas : 0,
    produtosTopVendidos,
    previsoes,
    computedAt: new Date().toISOString(),
  }
})

function calcularPrevisoes(vendas: any[]) {
  // Regressão linear simples
  // TODO: Implementar regressão linear ou similar
  return {
    previsaoMesAtual: 0,
    previsaoProxMes: 0,
    probabilidadeAtingirMeta: 0,
  }
}
```

#### 1.2.7 Timeline (On-Demand)

**Arquivo:** `server/api/v1/timeline/[clientId].get.ts`

```typescript
// GET - Obter timeline de um cliente (historicoCliente ordenado)
export default defineEventHandler(async (event) => {
  const { clientId } = getRouterParams(event)
  const db = await getMongoDb()

  const events = await db
    .collection('historicoCliente')
    .find({ clientId })
    .sort({ data: -1 })
    .limit(100) // Últimos 100 eventos
    .toArray()

  return {
    clientId,
    events,
    total: events.length,
  }
})
```

---

## 🔁 FASE 1.5: Migração de Dados Existentes

### 1.5.1 Visão Geral da Migração

**Objetivo:** Migrar dados existentes da estrutura monolítica para a arquitetura normalizada, preservando **100% dos dados** e **geolocalizações**.

**Fontes de Dados:**

1. **Banco de dados atual** (representations.clients) → ~47,754 clientes com visitas embedded
2. **Planilha "Plano de Ouro"** → ~70,000 linhas de vendas históricas

**Destino:**

- `clients` (normalizado)
- `historicoCliente` (eventos de interação)
- `produtos` (catálogo)
- `historicoValores` (preços históricos)
- `users` (criado manualmente após migração)

---

### 1.5.2 Dados Atuais: O Que Temos

**Estrutura Atual em `representations.clients`:**

```json
{
  "_id": "17987609000107",
  "nome": "SARA DE OLIVEIRA",
  "cnpj": "17987609000107",
  "email": "exemplo@hotmail.com",
  "telefone": "4832761536",
  "segmento": "otica",
  "cidade": "ALFREDO WAGNER",
  "estado": "SC",
  "endereco": "R. Hercílio Luz - Centro",
  "endereco_completo": "RUA HERCILIO LUZ, CENTRO, ALFREDO WAGNER, SC",
  "lat": -27.7002587,
  "lng": -49.3348321,
  "color": "#3b82f6",
  "visitas": [
    {
      "data": "2025-01-15T14:30:00.000Z",
      "descricao": "Visita de apresentação",
      "vendeuAlgo": true,
      "items": [
        {
          "produto": "Óculos Ray-Ban",
          "quantidade": 2,
          "valor": 450.0
        }
      ],
      "feedback": "Cliente interessado em novos modelos",
      "totalVenda": 900.0
    }
  ],
  "createdAt": "2024-06-10T10:00:00.000Z",
  "updatedAt": "2025-01-15T14:35:00.000Z"
}
```

**Contagem:**

- ✅ 47,754 clientes
- ✅ Todos têm `lat` e `lng`
- ⚠️ Alguns têm array `visitas` vazio, outros com múltiplas visitas

---

### 1.5.3 Mapeamento Detalhado: Clients

**Transformação `clients` (atual → novo):**

| Campo Atual         | Campo Novo                   | Transformação                | Exemplo                                       |
| ------------------- | ---------------------------- | ---------------------------- | --------------------------------------------- |
| `_id`               | `_id`                        | Manter como CNPJ             | `"17987609000107"`                            |
| `nome`              | `nome`                       | Manter                       | `"SARA DE OLIVEIRA"`                          |
| `cnpj`              | `cnpj`                       | Manter                       | `"17987609000107"`                            |
| `email`             | `email`                      | Manter (pode ser null)       | `"exemplo@hotmail.com"`                       |
| `telefone`          | `telefone`                   | Manter (pode ser null)       | `"4832761536"`                                |
| `segmento`          | `segmento`                   | Manter                       | `"otica"`                                     |
| `endereco`          | `endereco.rua`               | Extrair rua                  | `"R. Hercílio Luz"`                           |
| -                   | `endereco.bairro`            | Extrair de endereco_completo | `"Centro"`                                    |
| `cidade`            | `endereco.cidade`            | Mover para objeto            | `"ALFREDO WAGNER"`                            |
| `estado`            | `endereco.uf`                | Mover para objeto            | `"SC"`                                        |
| -                   | `endereco.cep`               | Null (não temos)             | `null`                                        |
| `endereco_completo` | `endereco.endereco_completo` | Preservar referência         | `"RUA HERCILIO LUZ..."`                       |
| `lat`               | `localizacao.latitude`       | ⭐ CRÍTICO - Renomear        | `-27.7002587`                                 |
| `lng`               | `localizacao.longitude`      | ⭐ CRÍTICO - Renomear        | `-49.3348321`                                 |
| `color`             | ❌ DELETAR                   | Remover (UI concern)         | -                                             |
| `visitas`           | ➡️ `historicoCliente`        | MOVER para collection        | Ver 1.5.4                                     |
| `createdAt`         | `createdAt`                  | Manter                       | `"2024-06-10T10:00:00.000Z"`                  |
| `updatedAt`         | `updatedAt`                  | Atualizar timestamp          | `new Date().toISOString()`                    |
| -                   | `objectives`                 | Criar defaults               | `{ mesTarget: 5000, ... }`                    |
| -                   | `status`                     | Definir baseado em visitas   | `"ativo"` se tem visitas, senão `"potencial"` |

---

### 1.5.4 Mapeamento Detalhado: Visitas → historicoCliente

**Cada item do array `visitas` vira 1 documento em `historicoCliente`:**

| Campo Visita Atual | Campo historicoCliente | Transformação        | Lógica                                                                 |
| ------------------ | ---------------------- | -------------------- | ---------------------------------------------------------------------- |
| -                  | `_id`                  | Gerar ObjectId       | `new ObjectId()`                                                       |
| -                  | `clientId`             | Referenciar cliente  | `client._id` (CNPJ)                                                    |
| -                  | `userId`               | Placeholder          | `"user-migracao-automatica"`                                           |
| `vendeuAlgo`       | `tipo`                 | Detectar tipo        | Se `vendeuAlgo === true` → `"venda_fisica"`, senão → `"visita_fisica"` |
| `data`             | `data`                 | Manter               | `"2025-01-15T14:30:00.000Z"`                                           |
| `descricao`        | `descricao`            | Manter               | `"Visita de apresentação"`                                             |
| `items`            | `items`                | Transformar produtos | Ver mapeamento abaixo                                                  |
| `vendeuAlgo`       | `resultado`            | Mapear               | `true` → `"sucesso"`, `false` → `"pendente"`                           |
| `feedback`         | `feedback`             | Manter               | `"Cliente interessado..."`                                             |
| `totalVenda`       | `totalVenda`           | Manter (ou calcular) | `900.00`                                                               |
| -                  | `duracao`              | Null                 | Não temos essa info                                                    |
| -                  | `proximoContato`       | Null                 | Não temos essa info                                                    |
| `data`             | `createdAt`            | Usar data da visita  | `"2025-01-15T14:30:00.000Z"`                                           |
| -                  | `updatedAt`            | Timestamp migração   | `new Date().toISOString()`                                             |

**Transformação de `items` (produtos):**

```typescript
// Atual (dentro de visitas):
{
  "produto": "Óculos Ray-Ban",
  "quantidade": 2,
  "valor": 450.00
}

// Novo (em historicoCliente.items):
{
  "produtoId": "produto-RAYBAN-001",  // Criar produto se não existir
  "nome": "Óculos Ray-Ban",           // ⭐ NOVO - preservar nome
  "quantidade": 2,
  "valorUnitario": 450.00,            // Renomear de "valor"
  "total": 900.00                     // Calcular: quantidade * valorUnitario
}
```

**Regras Especiais:**

- Se `visitas` array vazio → não criar nada em historicoCliente
- Se `vendeuAlgo === undefined/null` → assumir `false`
- Se `items` vazio mas `totalVenda > 0` → criar item genérico "Venda sem detalhes"

---

### 1.5.5 Script de Migração: PASSO 1 - Migrar Clients

**Arquivo:** `scripts/migrate_step1_clients.ts`

**Nota (repo atual):** já existe `scripts/migrate_clients_structure.ts` com a normalização básica (in-place).  
Este passo pode ser implementado criando `migrate_step1_clients.ts` como descrito abaixo **ou** adaptando o script existente para também preencher `localizacao.geo` e criar o índice `2dsphere`.

```typescript
import { getMongoDb } from '../server/utils/mongo'

interface ClienteAntigo {
  _id: string
  nome: string
  cnpj: string
  email?: string
  telefone?: string
  segmento?: string
  cidade: string
  estado: string
  endereco: string
  endereco_completo: string
  lat: number
  lng: number
  color?: string
  visitas?: any[]
  createdAt: string
  updatedAt: string
}

async function migrateClients() {
  const db = await getMongoDb()

  console.log('🚀 Iniciando migração de clients...')

  // 1. Backup collection atual
  console.log('📦 Criando backup...')
  const backupName = `clients_backup_${Date.now()}`
  await db.collection('clients').rename(backupName)
  console.log(`📦 Backup criado: ${backupName}`)

  // 2. Buscar todos os clientes antigos
  const clientesAntigos = await db.collection<ClienteAntigo>(backupName).find({}).toArray()

  console.log(`📊 Total de clientes: ${clientesAntigos.length}`)

  let migrados = 0
  let comGeo = 0
  let semGeo = 0

  for (const clienteAntigo of clientesAntigos) {
    // ⭐ VALIDAÇÃO CRÍTICA - GEO
    if (!clienteAntigo.lat || !clienteAntigo.lng) {
      console.warn(`⚠️  Cliente ${clienteAntigo._id} SEM geolocalização!`)
      semGeo++
      continue // PULAR - não migrar sem geo
    }

    comGeo++

    // Extrair bairro do endereco (simplificado)
    const bairroMatch = clienteAntigo.endereco_completo?.match(/,\s*([^,]+),\s*\w+,\s*\w+$/)
    const bairro = bairroMatch ? bairroMatch[1].trim() : ''

    // Detectar status baseado em visitas
    const temVisitas = clienteAntigo.visitas && clienteAntigo.visitas.length > 0
    const status = temVisitas ? 'ativo' : 'potencial'

    const clienteNovo = {
      _id: clienteAntigo._id, // CNPJ
      nome: clienteAntigo.nome,
      cnpj: clienteAntigo.cnpj,
      email: clienteAntigo.email || null,
      telefone: clienteAntigo.telefone || null,
      segmento: clienteAntigo.segmento || null,

      endereco: {
        rua: clienteAntigo.endereco,
        bairro: bairro || null,
        cidade: clienteAntigo.cidade,
        cep: null, // Não temos
        uf: clienteAntigo.estado,
        endereco_completo: clienteAntigo.endereco_completo,
      },

      // ⭐ CRÍTICO - GEO REFERENCIAMENTO
      localizacao: {
        latitude: clienteAntigo.lat,
        longitude: clienteAntigo.lng,
        geo: { type: 'Point', coordinates: [clienteAntigo.lng, clienteAntigo.lat] },
      },

      objectives: {
        mesAberto: 0,
        mesTarget: 5000,
        semestreTarget: 30000,
        anoTarget: 60000,
      },

      status,
      createdAt: clienteAntigo.createdAt,
      updatedAt: new Date().toISOString(),
    }

    await db.collection('clients').insertOne(clienteNovo)
    migrados++

    if (migrados % 1000 === 0) {
      console.log(`  ✓ Migrados: ${migrados}/${clientesAntigos.length}`)
    }
  }

  console.log(`\n✅ Migração de clients concluída!`)
  console.log(`  📊 Total: ${clientesAntigos.length}`)
  console.log(`  ✓ Migrados com sucesso: ${migrados}`)
  console.log(`  ⭐ Com geolocalização: ${comGeo}`)
  console.log(`  ⚠️  SEM geolocalização: ${semGeo}`)

  // 3. Criar índices
  console.log('\n🔍 Criando índices...')
  await db.collection('clients').createIndex({ cnpj: 1 })
  await db.collection('clients').createIndex({ 'localizacao.geo': '2dsphere' })
  console.log('✅ Índices criados!')
}

migrateClients().catch(console.error)
```

---

### 1.5.6 Script de Migração: PASSO 2 - Migrar Visitas → historicoCliente

**Arquivo:** `scripts/migrate_step2_historico.ts`

**Nota (repo atual):** existe `scripts/migrate_visitas_to_collection.ts`, mas ele atende a **Opção B** (collection `visitas`).  
Como este plano adotou **Opção A**, este passo deve inserir em `historicoCliente` (como no script abaixo) e depois remover `visitas` de `clients`.

```typescript
import { getMongoDb } from '../server/utils/mongo'
import { ObjectId } from 'mongodb'

interface VisitaAntiga {
  data: string
  descricao?: string
  vendeuAlgo: boolean
  items?: Array<{
    produto: string
    quantidade: number
    valor: number
  }>
  feedback?: string
  totalVenda?: number
}

async function migrateHistorico() {
  const db = await getMongoDb()

  console.log('🚀 Iniciando migração de visitas → historicoCliente...')

  // Buscar clientes da collection fonte (por padrão: 'clients').
  // Se você fez rename para backup no PASSO 1, passe via env:
  // CLIENTS_SOURCE_COLLECTION="clients_backup_1700000000000"
  const sourceCollection =
    process.env.CLIENTS_SOURCE_COLLECTION || process.env.CLIENTS_BACKUP_COLLECTION || 'clients'
  console.log(`📥 Lendo clientes de: ${sourceCollection}`)

  const clientesComVisitas = await db
    .collection(sourceCollection)
    .find({ visitas: { $exists: true, $ne: [] } })
    .toArray()

  console.log(`📊 Clientes com visitas: ${clientesComVisitas.length}`)

  let totalVisitas = 0
  let totalEventos = 0
  const produtosMap = new Map<string, string>() // nome → _id

  for (const cliente of clientesComVisitas) {
    const visitas = cliente.visitas || []

    for (const visita of visitas) {
      // Determinar tipo de evento
      const tipo = visita.vendeuAlgo === true ? 'venda_fisica' : 'visita_fisica'

      // Processar items (produtos)
      const itemsNormalizados = []

      if (visita.items && visita.items.length > 0) {
        for (const item of visita.items) {
          // Criar produto se não existir
          let produtoId = produtosMap.get(item.produto)

          if (!produtoId) {
            // Gerar ID baseado no nome (simplificado)
            produtoId = `produto-${slugify(item.produto)}`

            const produtoExiste = await db.collection('produtos').findOne({ _id: produtoId })

            if (!produtoExiste) {
              await db.collection('produtos').insertOne({
                _id: produtoId,
                codigo: slugify(item.produto),
                nome: item.produto,
                descricao: '',
                valor: item.valor,
                categoria: 'Geral',
                ativo: true,
                createdAt: visita.data,
                updatedAt: new Date().toISOString(),
              })

              // Criar histórico de valor inicial
              await db.collection('historicoValores').insertOne({
                _id: new ObjectId(),
                produtoId,
                data: visita.data,
                valor: item.valor,
                createdAt: visita.data,
              })
            }

            produtosMap.set(item.produto, produtoId)
          }

          itemsNormalizados.push({
            produtoId,
            nome: item.produto, // ⭐ Preservar nome
            quantidade: item.quantidade,
            valorUnitario: item.valor,
            total: item.quantidade * item.valor,
          })
        }
      } else if (visita.vendeuAlgo && visita.totalVenda > 0) {
        // Venda sem detalhes - criar item genérico
        itemsNormalizados.push({
          produtoId: 'produto-generico',
          nome: 'Venda sem detalhes',
          quantidade: 1,
          valorUnitario: visita.totalVenda,
          total: visita.totalVenda,
        })
      }

      // Criar documento historicoCliente
      const evento = {
        _id: new ObjectId(),
        clientId: cliente._id,
        userId: 'user-migracao-automatica', // Placeholder
        tipo,
        data: visita.data,
        descricao: visita.descricao || '',
        items: itemsNormalizados,
        resultado: visita.vendeuAlgo ? 'sucesso' : 'pendente',
        feedback: visita.feedback || '',
        totalVenda: visita.totalVenda || 0,
        duracao: null,
        proximoContato: null,
        createdAt: visita.data,
        updatedAt: new Date().toISOString(),
      }

      await db.collection('historicoCliente').insertOne(evento)
      totalEventos++
    }

    totalVisitas += visitas.length

    if (totalEventos % 500 === 0) {
      console.log(`  ✓ Eventos migrados: ${totalEventos}`)
    }
  }

  console.log(`\n✅ Migração de histórico concluída!`)
  console.log(`  📊 Clientes processados: ${clientesComVisitas.length}`)
  console.log(`  📋 Total de visitas: ${totalVisitas}`)
  console.log(`  ✓ Eventos criados: ${totalEventos}`)
  console.log(`  🏷️  Produtos criados: ${produtosMap.size}`)

  // Criar índices
  console.log('\n🔍 Criando índices...')
  await db.collection('historicoCliente').createIndex({ clientId: 1, data: -1 })
  await db.collection('historicoCliente').createIndex({ userId: 1 })
  await db.collection('historicoCliente').createIndex({ tipo: 1 })
  await db.collection('historicoCliente').createIndex({ data: -1 })
  console.log('✅ Índices criados!')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

migrateHistorico().catch(console.error)
```

---

### 1.5.7 Ordem de Execução da Migração

**⚠️ IMPORTANTE: Fazer backup completo antes de começar!**

```bash
# 0. Backup do banco completo
mongodump --uri="mongodb://..." --out=./backup-pre-migracao

# 1. Migrar clients (normalizar estrutura)
tsx scripts/migrate_step1_clients.ts
# ⚠️ Anote o backupName impresso no log (ex.: clients_backup_1700000000000)

# 2. Validar migração de clients
# - Verificar que todos têm lat/lng
# - Confirmar contagem correta

# 3. Migrar visitas → historicoCliente
CLIENTS_SOURCE_COLLECTION="clients_backup_1700000000000" tsx scripts/migrate_step2_historico.ts
# (Se você não renomeou a collection no PASSO 1, pode rodar sem env var: tsx scripts/migrate_step2_historico.ts)

# 4. Validar migração de histórico
# - Confirmar contagem de eventos
# - Verificar produtos criados

# 5. (Próxima fase) Importar Plano de Ouro
tsx scripts/import_plano_ouro.ts
```

---

### 1.5.8 Validações Pós-Migração

**Checklist de Validação:**

```bash
# 1. Contar registros
db.clients.countDocuments()              # Deve ser ~47,754
db.historicoCliente.countDocuments()     # Deve ser soma de todas as visitas
db.produtos.countDocuments()             # Verificar quantidade criada

# 2. Validar geolocalização (CRÍTICO)
db.clients.countDocuments({
  "localizacao.latitude": { $exists: true },
  "localizacao.longitude": { $exists: true }
})
# Deve ser = total de clients

# 2.1 Validar GeoJSON (para queries 2dsphere)
db.clients.countDocuments({
  "localizacao.geo": { $exists: true },
  "localizacao.geo.type": "Point"
})

# 3. Validar referências
db.historicoCliente.aggregate([
  {
    $lookup: {
      from: "clients",
      localField: "clientId",
      foreignField: "_id",
      as: "cliente"
    }
  },
  { $match: { cliente: { $size: 0 } } }
])
# Deve retornar 0 (nenhum órfão)

# 4. Validar vendas
db.historicoCliente.aggregate([
  { $match: { tipo: { $in: ["venda_fisica", "venda_ligacao"] } } },
  { $group: { _id: null, total: { $sum: "$totalVenda" } } }
])
# Conferir se bate com total esperado
```

---

### 1.5.9 Rollback (Se Necessário)

Se algo der errado durante a migração:

```bash
# Restaurar backup
mongorestore --uri="mongodb://..." --drop ./backup-pre-migracao

# Ou renomear collections de volta
# Troque pelo backupName impresso no PASSO 1
db.getCollection("clients_backup_1700000000000").renameCollection("clients", true)
```

---

## 📊 FASE 2: Importação de Dados da Planilha "Plano de Ouro"

### 2.1 Visão Geral dos Dados da Planilha

**Fonte:** `data/Plano de ouro.xlsx - aco-e-ouro.normalized.csv`

**Estrutura do CSV:**

```csv
NOME,CNPJ,DDD,TELEFONE,EMAIL,ENDERECO,BAIRRO,CEP,CIDADE,UF,MES_ANO,PRODUTO,VALOR,QTD,TOTAL
JOAO DA SILVA OTICA,12345678000100,48,99999999,joao@otica.com,"R. Principal 123",Centro,88000-000,Florianópolis,SC,2024-01,AEX0113,"R$ 250,00",2,"R$ 500,00"
MARIA COSTA JOIAS,98765432000100,47,88888888,maria@joias.com,"Av. Central 456",Centro,89000-000,Blumenau,SC,2024-01,AEX0114,"R$ 320,00",1,"R$ 320,00"
...
```

**Características:**

- 📊 ~70,000 linhas (registros de vendas)
- 🏢 ~47,000 CNPJs únicos (clientes)
- 📦 Múltiplos produtos por cliente
- 📅 Histórico mensal de 2023-2024
- 💰 Valores em formato brasileiro (R$ e vírgula decimal)

---

### 2.2 Estratégia de Importação

**O QUE Vamos Fazer:**

1. ✅ **Match com clientes existentes** via CNPJ
2. ✅ **Criar historicoCliente** com tipo `venda_fisica` para cada venda
3. ✅ **Criar/atualizar produtos** com códigos da planilha
4. ✅ **Criar historicoValores** para rastrear preços ao longo do tempo
5. ⚠️ **NÃO sobrescrever** dados de geolocalização existentes

**O QUE NÃO Vamos Fazer:**

- ❌ Criar novos clientes (apenas completar dados de existentes)
- ❌ Sobrescrever endereços com geolocalização
- ❌ Duplicar vendas já migradas da FASE 1.5

---

### 2.3 Mapeamento: Planilha → historicoCliente

**Cada linha do CSV vira 1 evento em `historicoCliente`:**

| Campo CSV                   | Campo historicoCliente | Transformação                                                      |
| --------------------------- | ---------------------- | ------------------------------------------------------------------ |
| `CNPJ`                      | `clientId`             | Match com clients.\_id                                             |
| -                           | `userId`               | `"user-importacao-plano-ouro"` (placeholder)                       |
| -                           | `tipo`                 | `"venda_fisica"` (todas são vendas)                                |
| `MES_ANO`                   | `data`                 | Converter "2024-01" → `"2024-01-15T12:00:00.000Z"` (dia 15 do mês) |
| -                           | `descricao`            | `"Venda histórica - Plano de Ouro"`                                |
| `PRODUTO` + `QTD` + `VALOR` | `items[]`              | Ver tabela abaixo                                                  |
| -                           | `resultado`            | `"sucesso"` (todas são vendas concluídas)                          |
| -                           | `feedback`             | `""` (vazio)                                                       |
| `TOTAL`                     | `totalVenda`           | Converter "R$ 500,00" → `500.00`                                   |
| -                           | `duracao`              | `null`                                                             |
| -                           | `proximoContato`       | `null`                                                             |
| `MES_ANO`                   | `createdAt`            | Mesma data                                                         |
| -                           | `updatedAt`            | Timestamp da importação                                            |

**Transformação de items (produtos):**

| Campo CSV | Campo items[]   | Lógica                                            |
| --------- | --------------- | ------------------------------------------------- |
| `PRODUTO` | `produtoId`     | Criar produto se não existir com código = PRODUTO |
| `PRODUTO` | `nome`          | Nome do produto (ex: "AEX0113")                   |
| `QTD`     | `quantidade`    | Parse int de "2"                                  |
| `VALOR`   | `valorUnitario` | Parse "R$ 250,00" → `250.00`                      |
| `TOTAL`   | Não usado       | Calculado: quantidade \* valorUnitario            |

---

### 2.4 Regras de Negócio Especiais

**1. Match de Clientes:**

```typescript
// Buscar cliente por CNPJ
const cliente = await db.collection('clients').findOne({ _id: row.CNPJ })

if (!cliente) {
  console.warn(`⚠️  CNPJ ${row.CNPJ} não encontrado - PULAR linha`)
  continue // NÃO criar cliente novo
}
```

**2. Agrupamento por Mês:**

Vendas do mesmo cliente no mesmo mês são **agrupadas em 1 evento**:

```typescript
// CNPJ: 12345678000100, MES_ANO: 2024-01
// Linha 1: Produto A, Qtd 2
// Linha 2: Produto B, Qtd 1
// ↓
// 1 evento historicoCliente com items = [Produto A, Produto B]
```

**3. Criação de Produtos:**

```typescript
// Se produto não existe
const produtoId = `produto-${row.PRODUTO}` // Ex: "produto-AEX0113"

await db.collection('produtos').insertOne({
  _id: produtoId,
  codigo: row.PRODUTO,
  nome: `Produto ${row.PRODUTO}`, // Nome genérico
  descricao: '',
  valor: parseFloat(row.VALOR.replace('R$ ', '').replace(',', '.')),
  categoria: 'Plano de Ouro',
  ativo: true,
  createdAt: dataVenda,
  updatedAt: new Date().toISOString(),
})
```

**4. Histórico de Valores:**

```typescript
// Para cada venda, registrar preço do produto naquela data
await db.collection('historicoValores').insertOne({
  _id: new ObjectId(),
  produtoId: `produto-${row.PRODUTO}`,
  data: dataVenda, // "2024-01-15T12:00:00.000Z"
  valor: parseFloat(row.VALOR.replace('R$ ', '').replace(',', '.')),
  createdAt: dataVenda,
})
```

---

### 2.5 Script de Importação Completo

**Arquivo:** `scripts/import_plano_ouro.ts`

```typescript
import fs from 'fs'
import csv from 'csv-parser'
import { getMongoDb } from '../server/utils/mongo'
import { ObjectId } from 'mongodb'

interface PlanoOuroRow {
  NOME: string
  CNPJ: string
  DDD?: string
  TELEFONE?: string
  EMAIL?: string
  ENDERECO?: string
  BAIRRO?: string
  CEP?: string
  CIDADE?: string
  UF?: string
  MES_ANO: string // "2024-01"
  PRODUTO: string // "AEX0113"
  VALOR: string // "R$ 250,00"
  QTD: string // "2"
  TOTAL: string // "R$ 500,00"
}

// Agrupar vendas por cliente + mês
interface VendaAgrupada {
  clientId: string
  mesAno: string
  items: Array<{
    produtoId: string
    nome: string
    quantidade: number
    valorUnitario: number
    total: number
  }>
  totalVenda: number
}

function parseValor(valor: string): number {
  return parseFloat(valor.replace('R$ ', '').replace('.', '').replace(',', '.'))
}

function parseData(mesAno: string): Date {
  const [ano, mes] = mesAno.split('-').map(Number)
  return new Date(ano, mes - 1, 15, 12, 0, 0) // Dia 15 do mês às 12h
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function importPlanoOuro() {
  const db = await getMongoDb()

  console.log('📊 Iniciando importação do Plano de Ouro...')

  // 1. Ler CSV
  const rows: PlanoOuroRow[] = []
  const csvPath = 'data/Plano de ouro.xlsx - aco-e-ouro.normalized.csv'

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject)
  })

  console.log(`📄 Lidas ${rows.length} linhas do CSV`)

  // 2. Agrupar vendas por CNPJ + MES_ANO
  const vendasAgrupadas = new Map<string, VendaAgrupada>()

  for (const row of rows) {
    const key = `${row.CNPJ}|${row.MES_ANO}`

    if (!vendasAgrupadas.has(key)) {
      vendasAgrupadas.set(key, {
        clientId: row.CNPJ,
        mesAno: row.MES_ANO,
        items: [],
        totalVenda: 0,
      })
    }

    const venda = vendasAgrupadas.get(key)!
    const produtoId = `produto-${row.PRODUTO}`
    const valorUnitario = parseValor(row.VALOR)
    const quantidade = parseInt(row.QTD)
    const total = valorUnitario * quantidade

    venda.items.push({
      produtoId,
      nome: `Produto ${row.PRODUTO}`,
      quantidade,
      valorUnitario,
      total,
    })

    venda.totalVenda += total
  }

  console.log(`🔢 ${vendasAgrupadas.size} vendas agrupadas (CNPJ + mês)`)

  // 3. Processar cada venda agrupada
  let clientesNaoEncontrados = 0
  let produtosCriados = 0
  let historicoInseridos = 0
  let histValoresInseridos = 0
  const produtosExistentes = new Set<string>()

  for (const [key, venda] of vendasAgrupadas.entries()) {
    // 3.1 Verificar se cliente existe
    const clienteExiste = await db.collection('clients').findOne({ _id: venda.clientId })

    if (!clienteExiste) {
      console.warn(`⚠️  Cliente ${venda.clientId} não encontrado - PULANDO`)
      clientesNaoEncontrados++
      continue
    }

    const dataVenda = parseData(venda.mesAno)

    // 3.2 Criar produtos se não existirem
    for (const item of venda.items) {
      if (!produtosExistentes.has(item.produtoId)) {
        const produtoExiste = await db.collection('produtos').findOne({ _id: item.produtoId })

        if (!produtoExiste) {
          // Extrair código do produto (remove "produto-" prefix)
          const codigo = item.produtoId.replace('produto-', '')

          await db.collection('produtos').insertOne({
            _id: item.produtoId,
            codigo,
            nome: item.nome,
            descricao: 'Produto importado do Plano de Ouro',
            valor: item.valorUnitario,
            categoria: 'Plano de Ouro',
            ativo: true,
            createdAt: dataVenda.toISOString(),
            updatedAt: new Date().toISOString(),
          })

          produtosCriados++
        }

        produtosExistentes.add(item.produtoId)
      }

      // 3.3 Criar histórico de valores
      await db.collection('historicoValores').insertOne({
        _id: new ObjectId(),
        produtoId: item.produtoId,
        data: dataVenda.toISOString(),
        valor: item.valorUnitario,
        createdAt: dataVenda.toISOString(),
      })

      histValoresInseridos++
    }

    // 3.4 Criar evento em historicoCliente
    await db.collection('historicoCliente').insertOne({
      _id: new ObjectId(),
      clientId: venda.clientId,
      userId: 'user-importacao-plano-ouro', // Placeholder
      tipo: 'venda_fisica',
      data: dataVenda.toISOString(),
      descricao: 'Venda histórica - Plano de Ouro',
      items: venda.items,
      resultado: 'sucesso',
      feedback: '',
      totalVenda: venda.totalVenda,
      duracao: null,
      proximoContato: null,
      createdAt: dataVenda.toISOString(),
      updatedAt: new Date().toISOString(),
    })

    historicoInseridos++
  }

  // 4. Relatório final
  console.log('\n✅ Importação concluída!')
  console.log(`📦 Produtos criados: ${produtosCriados}`)
  console.log(`📈 Histórico de valores inseridos: ${histValoresInseridos}`)
  console.log(`📝 Eventos de histórico inseridos: ${historicoInseridos}`)
  console.log(`⚠️  Clientes não encontrados: ${clientesNaoEncontrados}`)

  // 5. Validação
  const totalVendas = await db.collection('historicoCliente').countDocuments({
    tipo: 'venda_fisica',
    descricao: 'Venda histórica - Plano de Ouro',
  })

  console.log(`\n🔍 Validação: ${totalVendas} vendas do Plano de Ouro em historicoCliente`)
}

// Executar
importPlanoOuro()
  .then(() => {
    console.log('🎉 Importação finalizada!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro na importação:', error)
    process.exit(1)
  })
```

---

### 2.6 Validação Pós-Importação

**Queries de validação (MongoDB):**

```javascript
// 1. Contar vendas importadas do Plano de Ouro
db.historicoCliente.countDocuments({
  tipo: 'venda_fisica',
  descricao: 'Venda histórica - Plano de Ouro',
})
// Esperado: ~70,000

// 2. Verificar produtos criados
db.produtos.countDocuments({
  categoria: 'Plano de Ouro',
})
// Esperado: quantidade de produtos únicos no CSV

// 3. Verificar histórico de valores
db.historicoValores.countDocuments({})
// Esperado: >= número de linhas do CSV (1 por produto vendido)

// 4. Validar que não há vendas duplicadas (mesmo cliente + mês)
db.historicoCliente.aggregate([
  {
    $match: {
      tipo: 'venda_fisica',
      descricao: 'Venda histórica - Plano de Ouro',
    },
  },
  {
    $group: {
      _id: {
        clientId: '$clientId',
        mes: { $substr: ['$data', 0, 7] }, // "2024-01"
      },
      count: { $sum: 1 },
    },
  },
  {
    $match: { count: { $gt: 1 } },
  },
])
// Esperado: [] (array vazio - sem duplicatas)

// 5. Validar integridade referencial (produtos)
db.historicoCliente.aggregate([
  { $unwind: '$items' },
  {
    $lookup: {
      from: 'produtos',
      localField: 'items.produtoId',
      foreignField: '_id',
      as: 'produto',
    },
  },
  { $match: { produto: { $size: 0 } } },
  { $count: 'produtosOrfaos' },
])
// Esperado: { produtosOrfaos: 0 }

// 6. Top 10 produtos mais vendidos (Plano de Ouro)
db.historicoCliente.aggregate([
  {
    $match: {
      tipo: 'venda_fisica',
      descricao: 'Venda histórica - Plano de Ouro',
    },
  },
  { $unwind: '$items' },
  {
    $group: {
      _id: '$items.produtoId',
      totalQuantidade: { $sum: '$items.quantidade' },
      totalValor: { $sum: '$items.total' },
    },
  },
  { $sort: { totalQuantidade: -1 } },
  { $limit: 10 },
])
```

---

### 2.7 Ordem de Execução (FASE 1.5 + FASE 2)

**Sequência recomendada:**

```bash
# FASE 1.5 - Migrar dados atuais
✅ 1. Executar scripts/migrate_clients_structure.ts (ou scripts/migrate_step1_clients.ts)
✅ 2. Validar clients (geolocalização)
✅ 3. Executar scripts/migrate_step2_historico.ts (Opção A)
✅ 4. Validar historicoCliente (integridade)

# FASE 2 - Importar Plano de Ouro
✅ 5. Executar import_plano_ouro.ts
✅ 6. Validar vendas importadas
✅ 7. Verificar produtos e valores

# Rollback (se necessário)
❌ Restaurar backup: `mongorestore --drop` (recomendado) **ou** renomear usando o backupName real (ex.: `clients_backup_1700000000000`)
❌ Truncar: historicoCliente, produtos, historicoValores
```

**⚠️ IMPORTANTE:**

- Executar FASE 1.5 ANTES de FASE 2 (dependência)
- FASE 2 assume que clients já está migrado
- FASE 2 NÃO cria novos clientes (apenas completa histórico)

```typescript
import fs from 'fs'
import csv from 'csv-parser'
import { getMongoDb } from '../server/utils/mongo'
import { ObjectId } from 'mongodb'

interface PlanoOuroRow {
  NOME: string
  CNPJ: string
  DDD: string
  TELEFONE: string
  EMAIL: string
  ENDERECO: string
  BAIRRO: string
  CEP: string
  CIDADE: string
  UF: string
  MES_ANO: string
  PRODUTO: string
  VALOR: string
  QTD: string
  TOTAL: string
}

async function importPlanoOuro() {
  const db = await getMongoDb()

  // 1. Ler CSV
  const rows: PlanoOuroRow[] = []

  fs.createReadStream('data/Plano de ouro.xlsx - aco-e-ouro.normalized.csv')
    .pipe(csv())
    .on('data', (row) => rows.push(row))
    .on('end', async () => {
      console.log(`📖 Lido ${rows.length} linhas`)

      // 2. Agrupar por CNPJ (único cliente)
      const clientsMap = new Map<
        string,
        {
          nome: string
          cnpj: string
          ddd: string
          telefone: string
          email: string
          endereco: string
          bairro: string
          cep: string
          cidade: string
          uf: string
          vendas: Array<{
            mesAno: string
            produto: string
            valor: number
            qtd: number
            total: number
          }>
        }
      >()

      rows.forEach((row) => {
        const valor = parseFloat(row.VALOR.replace('R$ ', '').replace(',', '.'))
        const qtd = parseInt(row.QTD, 10)
        const total = parseFloat(row.TOTAL.replace('R$ ', '').replace(',', '.'))

        if (!clientsMap.has(row.CNPJ)) {
          clientsMap.set(row.CNPJ, {
            nome: row.NOME,
            cnpj: row.CNPJ,
            ddd: row.DDD,
            telefone: row.TELEFONE,
            email: row.EMAIL,
            endereco: row.ENDERECO,
            bairro: row.BAIRRO,
            cep: row.CEP,
            cidade: row.CIDADE,
            uf: row.UF,
            vendas: [],
          })
        }

        clientsMap.get(row.CNPJ)!.vendas.push({
          mesAno: row.MES_ANO,
          produto: row.PRODUTO,
          valor,
          qtd,
          total,
        })
      })

      console.log(`👥 ${clientsMap.size} clientes únicos`)

      // 3. Obter ou criar produtos
      const produtosMap = new Map<string, string>() // codigo -> _id
      const produtosSet = new Set<string>()

      clientsMap.forEach((client) => {
        client.vendas.forEach((venda) => {
          produtosSet.add(venda.produto)
        })
      })

      for (const codigo of produtosSet) {
        const existing = await db.collection('produtos').findOne({ codigo })
        if (existing) {
          produtosMap.set(codigo, existing._id)
        } else {
          const produto = {
            _id: `produto-${codigo}`,
            codigo,
            nome: `Produto ${codigo}`,
            descricao: '',
            valorAtual: 0, // Será atualizado com o histórico
            categoria: 'AEX',
            historicoValores: [],
            ativo: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          await db.collection('produtos').insertOne(produto)
          produtosMap.set(codigo, produto._id)
        }
      }
      console.log(`📦 ${produtosMap.size} produtos processados`)

      // 4. Criar/atualizar clients e visitas
      let eventosCount = 0

      for (const [cnpj, clientData] of clientsMap) {
        // Upsert client
        const clientId = `client-${cnpj}`
        const clientDoc = {
          _id: clientId,
          name: clientData.nome,
          cnpj: clientData.cnpj,
          contact: {
            ddd: clientData.ddd,
            telefone: clientData.telefone,
            email: clientData.email,
          },
          address: {
            rua: clientData.endereco,
            bairro: clientData.bairro,
            cep: clientData.cep,
            cidade: clientData.cidade,
            uf: clientData.uf,
          },
          status: 'ativo',
          objectives: {
            mesAberto: 0,
            mesTarget: 5000,
            semestreTarget: 30000,
            anoTarget: 60000,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        await db
          .collection('clients')
          .updateOne({ _id: clientId }, { $set: clientDoc }, { upsert: true })

        // Criar eventos em historicoCliente (vendas históricas)
        // Agrupar vendas por mês
        const ventasPorMes = new Map<string, any[]>()
        clientData.vendas.forEach((venda) => {
          if (!ventasPorMes.has(venda.mesAno)) {
            ventasPorMes.set(venda.mesAno, [])
          }
          ventasPorMes.get(venda.mesAno)!.push(venda)
        })

        for (const [mesAno, vendas] of ventasPorMes) {
          const [ano, mes] = mesAno.split('-')
          const data = new Date(parseInt(ano), parseInt(mes) - 1, 15, 10, 0, 0)

          const items = vendas.map((v) => ({
            produtoId: produtosMap.get(v.produto)!,
            nome: v.produto,
            quantidade: v.qtd,
            valorUnitario: v.valor,
            total: v.total,
          }))

          const totalVenda = vendas.reduce((sum, v) => sum + v.total, 0)

          const evento = {
            _id: new ObjectId(),
            clientId,
            userId: 'user-importacao-plano-ouro', // placeholder
            tipo: 'venda_fisica',
            data: data.toISOString(),
            items,
            descricao: 'Venda histórica - Plano de Ouro',
            resultado: 'sucesso',
            feedback: '',
            totalVenda,
            duracao: null,
            proximoContato: null,
            createdAt: data.toISOString(),
            updatedAt: new Date().toISOString(),
          }

          await db.collection('historicoCliente').insertOne(evento)
          eventosCount++
        }

        // Atualizar histórico de valores dos produtos
        clientData.vendas.forEach(async (venda) => {
          const produtoId = produtosMap.get(venda.produto)!
          const [ano, mes] = venda.mesAno.split('-')
          const data = new Date(parseInt(ano), parseInt(mes) - 1, 15)

          await db.collection('historicoValores').insertOne({
            produtoId,
            data: data.toISOString(),
            valor: venda.valor,
            createdAt: new Date().toISOString(),
          })

          // Atualizar valor atual do produto se for mais recente
          const produto = await db.collection('produtos').findOne({ _id: produtoId })
          if (!produto || new Date(produto.updatedAt) < data) {
            await db
              .collection('produtos')
              .updateOne(
                { _id: produtoId },
                { $set: { valor: venda.valor, updatedAt: new Date().toISOString() } }
              )
          }
        })
      }

      console.log(`✅ ${eventosCount} eventos (vendas) importados`)
      console.log('🎉 Importação concluída!')
    })
}

importPlanoOuro().catch(console.error)
```

**Executar:**

```bash
tsx scripts/import_plano_ouro.ts
```

---

## 🎯 FASE 3: Geração de Analytics e Inteligência

### 3.1 Serviço de Analytics

**Arquivo:** `server/utils/analytics.ts`

```typescript
import { Db } from 'mongodb'

export interface AnalyticsResult {
  totalVisitas: number
  totalVendas: number
  totalFaturamento: number
  ticketMedio: number
  produtosTopVendidos: Array<{ produtoId: string; nome: string; qtd: number; faturamento: number }>
  previsaoFaturamentoMesAtual: number
  previsaoFaturamentoProxMes: number
  previsaoFaturamentoProxTrimestre: number
  previsaoFaturamentoAno: number
  probabilidadeAtingirMeta: number
  proximasAcoes: Array<{
    tipo: 'ligar' | 'oferecer' | 'agendamento'
    descricao: string
    prioridade: 'alta' | 'media' | 'baixa'
    dataRecomendada: string
    razao: string
  }>
}

export async function calculateAnalytics(
  db: Db,
  clientId: string,
  periodo: 'mes' | 'semestre' | 'ano' = 'mes'
): Promise<AnalyticsResult> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // 1. Determinar período
  let startDate: Date
  let endDate = new Date()

  switch (periodo) {
    case 'mes':
      startDate = new Date(year, month - 1, 1)
      break
    case 'semestre':
      startDate = new Date(year, month <= 6 ? 0 : 6, 1)
      endDate = new Date(year, month <= 6 ? 5 : 11, 30)
      break
    case 'ano':
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31)
      break
  }

  // 2. Buscar eventos do período (source of truth: historicoCliente)
  const eventos = await db
    .collection('historicoCliente')
    .find({
      clientId,
      data: { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
    })
    .toArray()

  const visitas = eventos.filter((e: any) => ['visita_fisica', 'venda_fisica'].includes(e.tipo))
  const vendas = eventos.filter((e: any) => ['venda_fisica', 'venda_ligacao'].includes(e.tipo))

  // 3. Calcular métricas básicas
  const totalVisitas = visitas.length
  const totalVendas = vendas.length
  const totalFaturamento = vendas.reduce((sum, v) => sum + (v.totalVenda || 0), 0)
  const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0

  // 4. Produtos top vendidos
  const produtosMap = new Map<string, { nome: string; qtd: number; faturamento: number }>()

  for (const venda of vendas) {
    for (const item of venda.items || []) {
      const produto = await db.collection('produtos').findOne({ _id: item.produtoId })
      const key = item.produtoId

      if (!produtosMap.has(key)) {
        produtosMap.set(key, { nome: produto?.nome || 'Desconhecido', qtd: 0, faturamento: 0 })
      }

      const current = produtosMap.get(key)!
      current.qtd += item.quantidade
      current.faturamento += item.quantidade * item.valorUnitario
    }
  }

  const produtosTopVendidos = Array.from(produtosMap.entries())
    .map(([produtoId, data]) => ({ produtoId, ...data }))
    .sort((a, b) => b.faturamento - a.faturamento)
    .slice(0, 5)

  // 5. Previsões (regressão linear simples)
  const previsoes = calculatePrevisoes(db, clientId, vendas, totalFaturamento, periodo)

  // 6. Próximas ações sugeridas
  const proximasAcoes = generateProximasAcoes(clientId, eventos, totalVendas, totalVisitas)

  return {
    totalVisitas,
    totalVendas,
    totalFaturamento,
    ticketMedio,
    produtosTopVendidos,
    ...(await previsoes),
    proximasAcoes,
  }
}

function calculatePrevisoes(
  db: Db,
  clientId: string,
  vendasPeriodo: any[],
  faturamentoAtual: number,
  periodo: string
): Promise<{
  previsaoFaturamentoMesAtual: number
  previsaoFaturamentoProxMes: number
  previsaoFaturamentoProxTrimestre: number
  previsaoFaturamentoAno: number
  probabilidadeAtingirMeta: number
}> {
  // Implementar regressão linear com histórico
  // Por enquanto, retornar valores baseados em tendências simples

  const now = new Date()
  const diaDoMes = now.getDate()
  const diasNoMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  // Extrapolação linear simples
  const previsaoMesAtual = faturamentoAtual * (diasNoMes / diaDoMes)
  const previsaoProxMes = previsaoMesAtual * 0.95 // Assume redução de 5%
  const previsaoProxTrimestre = previsaoProxMes * 3 * 0.9
  const previsaoAno = previsaoProxTrimestre * 4 * 0.85

  // Probabilidade de atingir meta (simplificado)
  const metaMesAtual = 5000 // TODO: vir do client.objectives
  const probabilidade = Math.min(100, (previsaoMesAtual / metaMesAtual) * 100)

  return Promise.resolve({
    previsaoFaturamentoMesAtual: previsaoMesAtual,
    previsaoFaturamentoProxMes: previsaoProxMes,
    previsaoFaturamentoProxTrimestre: previsaoProxTrimestre,
    previsaoFaturamentoAno: previsaoAno,
    probabilidadeAtingirMeta: Math.round(probabilidade),
  })
}

function generateProximasAcoes(
  clientId: string,
  eventos: any[],
  totalVendas: number,
  totalVisitas: number
): Array<{
  tipo: 'ligar' | 'oferecer' | 'agendamento'
  descricao: string
  prioridade: 'alta' | 'media' | 'baixa'
  dataRecomendada: string
  razao: string
}> {
  const acoes: any[] = []
  const now = new Date()

  // Se não houve visitas recentes
  if (totalVisitas === 0) {
    acoes.push({
      tipo: 'ligar',
      descricao: 'Ligar para cliente - nenhuma visita registrada',
      prioridade: 'alta',
      dataRecomendada: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      razao: 'Nenhuma visita registrada no período',
    })
  }

  // Se taxa de conversão baixa
  const taxaConversao = totalVisitas > 0 ? totalVendas / totalVisitas : 0
  if (taxaConversao < 0.3 && totalVisitas > 0) {
    acoes.push({
      tipo: 'oferecer',
      descricao: 'Oferecer produtos mais procurados',
      prioridade: 'media',
      dataRecomendada: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      razao: 'Taxa de conversão baixa - tentar novos produtos',
    })
  }

  // Agendamento de próxima visita
  const visitas = eventos.filter((e: any) => ['visita_fisica', 'venda_fisica'].includes(e.tipo))
  const ultimaVisita =
    visitas.length > 0
      ? new Date(
          visitas.reduce((max: string, e: any) => (e.data > max ? e.data : max), visitas[0].data)
        )
      : null
  if (!ultimaVisita || now.getTime() - ultimaVisita.getTime() > 14 * 24 * 60 * 60 * 1000) {
    acoes.push({
      tipo: 'agendamento',
      descricao: 'Agendar próxima visita',
      prioridade: 'alta',
      dataRecomendada: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      razao: 'Mais de 2 semanas sem contato',
    })
  }

  return acoes
}
```

### 3.2 Endpoint para Invalidar Cache de Analytics (Opcional)

**Arquivo:** `server/api/v1/analytics/[clientId]/refresh.post.ts`

```typescript
import { createError } from 'h3'
import { getMongoDb } from '../../../../../server/utils/mongo'
import { calculateAnalytics } from '../../../../../server/utils/analytics'

export default defineEventHandler(async (event) => {
  const { clientId } = getRouterParams(event)
  const query = getQuery(event)
  const periodo = (query.periodo || 'mes') as 'mes' | 'semestre' | 'ano'

  if (!clientId) throw createError({ statusCode: 400, statusMessage: 'clientId é obrigatório' })

  const db = await getMongoDb()
  const redis = useRedis?.() // Opcional

  // Verificar se cliente existe
  const client = await db.collection('clients').findOne({ _id: clientId })
  if (!client) throw createError({ statusCode: 404, statusMessage: 'Cliente não encontrado' })

  // Invalidar cache (se existir)
  await redis?.del(`previsoes:${clientId}`)

  // Recalcular analytics (on-demand)
  const analytics = await calculateAnalytics(db, clientId, periodo)

  return { success: true, data: analytics, refreshedAt: new Date().toISOString() }
})
```

---

## 📅 FASE 4: Timeline e Sugestões Inteligentes

### 4.1 Componente Timeline

**Arquivo:** `app/components/ClientTimeline.vue`

```vue
<template>
  <div class="space-y-4">
    <NLayer class="mb-6">
      <div class="flex justify-between items-center">
        <NTypo variant="heading-2">Timeline</NTypo>
        <NButton @click="refreshTimeline" variant="secondary" size="sm"> Atualizar </NButton>
      </div>
    </NLayer>

    <div v-if="!timeline || timeline.events.length === 0" class="text-center py-8">
      <NEmptyState title="Sem eventos ainda" description="Nenhuma ação registrada neste período" />
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="evento in timeline.events"
        :key="evento.id"
        class="border-l-4 pl-4 py-2"
        :class="borderColor(evento.tipo)"
      >
        <div class="flex justify-between items-start">
          <div>
            <NTypo variant="body-bold">{{ evento.titulo }}</NTypo>
            <p class="text-sm text-gray-600 mt-1">{{ evento.descricao }}</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold" :class="statusClass(evento.resultado)">
              {{ formatStatus(evento.resultado) }}
            </span>
            <p class="text-xs text-gray-500 mt-1">{{ formatDate(evento.data) }}</p>
          </div>
        </div>

        <div v-if="evento.proximoPassoRecomendado" class="mt-2 p-2 bg-blue-50 rounded text-sm">
          <strong>Próximo passo:</strong> {{ evento.proximoPassoRecomendado }}
        </div>
      </div>
    </div>

    <!-- Seção de Próximas Ações Sugeridas -->
    <NLayer v-if="proximasAcoes.length > 0" class="mt-8">
      <NTypo variant="heading-3" class="mb-4">Próximas Ações Recomendadas</NTypo>

      <div class="space-y-3">
        <div
          v-for="(acao, idx) in proximasAcoes"
          :key="idx"
          class="p-3 border rounded-lg"
          :class="priorityBg(acao.prioridade)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <NTypo variant="body-bold">{{ acao.descricao }}</NTypo>
              <p class="text-sm mt-1">{{ acao.razao }}</p>
            </div>
            <span class="text-xs font-semibold ml-2" :class="priorityBadge(acao.prioridade)">
              {{ acao.prioridade.toUpperCase() }}
            </span>
          </div>

          <div class="mt-3 flex gap-2">
            <NButton size="sm" variant="primary" @click="executarAcao(acao)">
              {{ actionButtonLabel(acao.tipo) }}
            </NButton>
          </div>
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface TimelineEvent {
  id: string
  data: string
  tipo: 'visita' | 'contato' | 'venda' | 'agendamento' | 'acao_sugerida'
  titulo: string
  descricao?: string
  userId?: string
  resultado: 'sucesso' | 'pendente' | 'fracasso'
  proximoPassoRecomendado?: string
  createdAt: string
}

interface ProxAcao {
  tipo: 'ligar' | 'oferecer' | 'agendamento'
  descricao: string
  prioridade: 'alta' | 'media' | 'baixa'
  dataRecomendada: string
  razao: string
}

const props = defineProps<{
  clientId: string
}>()

const timeline = ref<{ events: TimelineEvent[] } | null>(null)
const proximasAcoes = ref<ProxAcao[]>([])
const loading = ref(false)

const borderColor = (tipo: string) => {
  const colors: Record<string, string> = {
    visita: 'border-blue-500',
    venda: 'border-green-500',
    contato: 'border-yellow-500',
    agendamento: 'border-purple-500',
    acao_sugerida: 'border-orange-500',
  }
  return colors[tipo] || 'border-gray-300'
}

const statusClass = (resultado: string) => {
  const classes: Record<string, string> = {
    sucesso: 'text-green-700 bg-green-100 px-2 py-1 rounded',
    pendente: 'text-yellow-700 bg-yellow-100 px-2 py-1 rounded',
    fracasso: 'text-red-700 bg-red-100 px-2 py-1 rounded',
  }
  return classes[resultado] || ''
}

const formatStatus = (status: string) => {
  const labels: Record<string, string> = {
    sucesso: 'Sucesso',
    pendente: 'Pendente',
    fracasso: 'Fracasso',
  }
  return labels[status] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const priorityBg = (prioridade: string) => {
  const colors: Record<string, string> = {
    alta: 'bg-red-50 border-red-200',
    media: 'bg-yellow-50 border-yellow-200',
    baixa: 'bg-blue-50 border-blue-200',
  }
  return colors[prioridade] || ''
}

const priorityBadge = (prioridade: string) => {
  const classes: Record<string, string> = {
    alta: 'text-red-700 bg-red-100 px-2 py-1 rounded',
    media: 'text-yellow-700 bg-yellow-100 px-2 py-1 rounded',
    baixa: 'text-blue-700 bg-blue-100 px-2 py-1 rounded',
  }
  return classes[prioridade] || ''
}

const actionButtonLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    ligar: 'Ligar Agora',
    oferecer: 'Ver Produtos',
    agendamento: 'Agendar',
  }
  return labels[tipo] || 'Ação'
}

const loadTimeline = async () => {
  try {
    loading.value = true
    const response = await $fetch(`/api/v1/timeline/${props.clientId}`)
    timeline.value = response
  } catch (error) {
    console.error('Erro ao carregar timeline:', error)
  } finally {
    loading.value = false
  }
}

const loadAnalytics = async () => {
  try {
    const response = await $fetch(`/api/v1/analytics/${props.clientId}`)
    if (response?.proximasAcoes) {
      proximasAcoes.value = response.proximasAcoes
    }
  } catch (error) {
    console.error('Erro ao carregar analytics:', error)
  }
}

const refreshTimeline = async () => {
  await loadTimeline()
  await loadAnalytics()
}

const executarAcao = (acao: ProxAcao) => {
  // TODO: Implementar ações específicas
  console.log('Executar ação:', acao)
}

onMounted(() => {
  loadTimeline()
  loadAnalytics()
})
</script>
```

---

## 🎨 FASE 5: Componentes de Usuários e Produtos

### 5.1 Gerenciador de Usuários (vendedores/gerentes/admin)

**Arquivo:** `app/components/UsersManager.vue`

```vue
<template>
    <div class="space-y-4">
      <div class="flex justify-between items-center">
      <NTypo variant="heading-2">Usuários</NTypo>
      <NButton @click="showModalCreate = true">
        <NIcon name="plus" class="w-4 h-4 mr-2" />
        Novo Usuário
      </NButton>
    </div>

    <!-- Lista de Usuários -->
    <div v-if="vendedores.length === 0" class="text-center py-8">
      <NEmptyState title="Sem usuários" description="Crie o primeiro usuário" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NLayer v-for="vendedor in vendedores" :key="vendedor._id" class="p-4">
        <div class="flex justify-between items-start">
          <div>
            <NTypo variant="body-bold">{{ vendedor.nome }}</NTypo>
            <p class="text-sm text-gray-600">{{ vendedor.email }}</p>
            <p class="text-sm text-gray-600">{{ vendedor.telefone }}</p>
          </div>
          <span v-if="vendedor.ativo" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            Ativo
          </span>
          <span v-else class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"> Inativo </span>
        </div>

        <div v-if="vendedor.meta" class="mt-3 text-sm">
          <p>Meta: R$ {{ vendedor.meta.mesAberto || 0 }}/mês</p>
        </div>
      </NLayer>
    </div>

    <!-- Modal Criar/Editar -->
    <NModal v-model="showModalCreate" title="Novo Usuário">
      <form @submit.prevent="submitVendedor" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nome</label>
          <NInput v-model="formVendedor.nome" placeholder="Nome completo" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <NInput v-model="formVendedor.email" type="email" placeholder="email@example.com" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Telefone</label>
          <NInput v-model="formVendedor.telefone" placeholder="(48) 99999-9999" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Meta Mensal (R$)</label>
          <NInput v-model.number="formVendedor.meta.mesAberto" type="number" />
        </div>
        <div class="flex gap-2">
          <NButton type="submit" variant="primary">Salvar</NButton>
          <NButton @click="showModalCreate = false" variant="secondary">Cancelar</NButton>
        </div>
      </form>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Vendedor {
  _id: string
  nome: string
  email: string
  telefone?: string
  ativo: boolean
  dataAdmissao: string
  meta?: {
    mesAberto?: number
  }
}

const vendedores = ref<Vendedor[]>([])
const showModalCreate = ref(false)
const formVendedor = ref({
  nome: '',
  email: '',
  telefone: '',
  role: 'vendedor',
  dataAdmissao: new Date().toISOString(),
  meta: { mesAberto: 0 },
})

const loadVendedores = async () => {
  try {
    const response = await $fetch('/api/v1/users?role=vendedor')
    vendedores.value = response
  } catch (error) {
    console.error('Erro ao carregar vendedores:', error)
  }
}

const submitVendedor = async () => {
  try {
    await $fetch('/api/v1/users', {
      method: 'POST',
      body: formVendedor.value,
    })
    formVendedor.value = {
      nome: '',
      email: '',
      telefone: '',
      role: 'vendedor',
      dataAdmissao: new Date().toISOString(),
      meta: { mesAberto: 0 },
    }
    showModalCreate.value = false
    await loadVendedores()
  } catch (error) {
    console.error('Erro ao salvar vendedor:', error)
  }
}

onMounted(() => {
  loadVendedores()
})
</script>
```

### 5.2 Gerenciador de Produtos

**Arquivo:** `app/components/ProdutosManager.vue`

Similar ao VendedoresManager, mas para produtos com histórico de valores.

---

## 📈 FASE 6: Melhorias no Maps

### 6.1 Novos Componentes de Análise

**Arquivo:** `app/components/ClientAnalyticsPanel.vue`

```vue
<template>
  <div class="space-y-6">
    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <NLayer class="p-4 text-center">
        <p class="text-gray-600 text-sm">Total Visitas</p>
        <NBigNumber :value="analytics?.totalVisitas || 0" />
      </NLayer>

      <NLayer class="p-4 text-center">
        <p class="text-gray-600 text-sm">Total Vendas</p>
        <NBigNumber :value="analytics?.totalVendas || 0" />
      </NLayer>

      <NLayer class="p-4 text-center">
        <p class="text-gray-600 text-sm">Faturamento</p>
        <NBigNumber :value="`R$ ${(analytics?.totalFaturamento || 0).toLocaleString('pt-BR')}`" />
      </NLayer>

      <NLayer class="p-4 text-center">
        <p class="text-gray-600 text-sm">Meta Alcançada</p>
        <NBigNumber :value="`${analytics?.probabilidadeAtingirMeta || 0}%`" />
      </NLayer>
    </div>

    <!-- Previsões -->
    <NLayer class="p-4">
      <NTypo variant="heading-3" class="mb-4">Previsões de Faturamento</NTypo>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-600">Mês Atual</p>
          <p class="text-lg font-bold">
            R$ {{ (analytics?.previsaoFaturamentoMesAtual || 0).toLocaleString('pt-BR') }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Próximo Mês</p>
          <p class="text-lg font-bold">
            R$ {{ (analytics?.previsaoFaturamentoProxMes || 0).toLocaleString('pt-BR') }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Próximo Trimestre</p>
          <p class="text-lg font-bold">
            R$ {{ (analytics?.previsaoFaturamentoProxTrimestre || 0).toLocaleString('pt-BR') }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-600">Ano Completo</p>
          <p class="text-lg font-bold">
            R$ {{ (analytics?.previsaoFaturamentoAno || 0).toLocaleString('pt-BR') }}
          </p>
        </div>
      </div>
    </NLayer>

    <!-- Top Produtos -->
    <NLayer v-if="analytics?.produtosTopVendidos" class="p-4">
      <NTypo variant="heading-3" class="mb-4">Produtos Mais Vendidos</NTypo>
      <div class="space-y-2">
        <div
          v-for="produto in analytics.produtosTopVendidos"
          :key="produto.produtoId"
          class="flex justify-between"
        >
          <span>{{ produto.nome }}</span>
          <span class="font-bold"
            >{{ produto.qtd }}x - R$ {{ produto.faturamento.toLocaleString('pt-BR') }}</span
          >
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  clientId: string
}>()

const analytics = ref<any>(null)

const loadAnalytics = async () => {
  try {
    const response = await $fetch(`/api/v1/analytics/${props.clientId}`)
    analytics.value = response
  } catch (error) {
    console.error('Erro ao carregar analytics:', error)
  }
}

onMounted(() => {
  loadAnalytics()
})
</script>
```

---

## 🗺️ FASE 7: Integração no Maps

### 7.1 Atualizar Componente Maps

**Arquivo:** `app/components/BrokerMaps.vue` (seção de client card)

Adicionar:

- Faturamento total do período
- Previsão mensal
- Status da meta
- Botão para abrir timeline

---

## 💼 FASE 8: Processo Comercial (alavancar vendas)

### 8.1 Cadência (próxima ação)

Objetivo: transformar “dados” em rotina de venda com follow-up obrigatório.

**Campos mínimos por cliente (persistidos em `clients.sales`):**

- `stage`: lead / ativo / negociacao / perdido / reativacao
- `ownerUserId`: vendedor dono
- `nextActionAt` + `nextActionType`: ligar / visitar / enviar_catalogo / cobrar
- `lastContactAt`: último toque
- `priorityScore`: 0–100

**Regras operacionais simples:**

- Ao criar qualquer evento em `historicoCliente`, exigir/atualizar `nextActionAt` (não deixar cliente “sem follow-up”).
- Ao inserir evento (visita/ligação/venda), atualizar `clients.sales.lastContactAt`.
- “Lista Hoje”: clientes com `nextActionAt <= now`, ordenados por `priorityScore`.

### 8.2 Heurística de reposição (sem ML)

- Usar o histórico do Plano de Ouro + vendas novas para inferir frequência de recompra (por cliente/produto).
- Se passou **X dias** desde a última compra e a tendência histórica sugere recompra em **Y dias**, gerar “ação recomendada”:
  - Ex.: “Ligar e oferecer reposição do AEX0113”.

### 8.3 Segmentação que vira dinheiro

Segmentações sugeridas (começar simples e evoluir):

- **RFM (Recency, Frequency, Monetary):** VIP / Reativação / Nutrição
- **Curva ABC (faturamento):** A (visita + relacionamento), B (cadência mista), C (digital)
- **Geo-clusters:** agrupar por região para roteirizar dia de campo (menos custo, mais visitas)

### 8.4 Playbooks por segmento (ótica vs joalheria)

- **Ótica:** reposição, lançamentos, combos, exposição/vitrine
- **Joalheria:** mix premium, giro de coleção, datas sazonais

Entregáveis práticos:
- Templates de WhatsApp/e-mail por `nextActionType`
- Combos e recomendações por segmento/ABC

### 8.5 Rotina de gestão (painel do gerente)

KPIs por vendedor (semanal):
- visitas/contatos por semana
- taxa de conversão (contato → venda)
- ticket médio
- clientes em risco (sem contato há X dias / queda de compra)

Ritual recomendado: reunião semanal de 30 min com **top 10 riscos + top 10 oportunidades** por vendedor.

### 8.6 Roadmap pragmático

**Quick wins (1–2 semanas):**
- Próxima ação obrigatória ao salvar qualquer evento
- Lista “Hoje” do vendedor (nextActionAt vencido)
- Templates por tipo de ação (cobrança, catálogo, lançamento)

**Médio prazo (1–2 meses):**
- Sugestão de reposição (heurística)
- Ranking de produtos por região/segmento
- Mapa com rota do dia (próximos + prioridade)

**Longo prazo (3–6 meses):**
- Previsão de faturamento mais robusta (cache Redis ok)
- Churn risk (cliente “esfriando”)
- Recomendador simples (“quem compra A também compra B”, por segmento)

---

## ✅ Checklist de Implementação

### FASE 0 - Modelagem

- [ ] Revisar schemas Zod em `app/types/schemas.ts`
- [ ] **[CRÍTICO]** Validar que `latitude`, `longitude`, `localizacao.geo` e `endereco.endereco_completo` estão presentes em todos os clientes
- [ ] Documentar relações entre collections
- [ ] Planejar índices geoespaciais (2dsphere) para mapas

### FASE 1 - Backend

- [ ] Criar endpoints de users (vendedor, gerente, admin, supervisor)
- [ ] Criar endpoints de produtos
- [ ] Criar endpoints de `historicoCliente` (substitui visitas como collection)
- [ ] Criar endpoints de analytics (on-demand)
- [ ] Criar endpoints de timeline (on-demand)
- [ ] **[CRÍTICO]** Preservar campos de geo nos clientes (latitude, longitude, endereco.endereco_completo)
- [ ] Validar com Zod

### FASE 1.5 - Migração de Dados Existentes ⭐ CRÍTICO

- [ ] **[PRÉ-REQUISITO]** Fazer backup completo do banco de dados
- [ ] **[VALIDAÇÃO]** Verificar que TODOS os 47,754 clientes têm lat/lng preenchidos
- [ ] Executar `scripts/migrate_clients_structure.ts` (ou criar `scripts/migrate_step1_clients.ts`)
- [ ] Validar migração de clients:
  - [ ] Contagem correta (~47,754)
  - [ ] Todos têm `localizacao.latitude` e `localizacao.longitude`
  - [ ] Todos têm `localizacao.geo` (GeoJSON Point)
  - [ ] Campo `endereco` estruturado corretamente
  - [ ] Status definido (ativo/potencial)
- [ ] Executar `scripts/migrate_step2_historico.ts` (migrar visitas → historicoCliente; Opção A)
- [ ] Validar migração de histórico:
  - [ ] Contagem de eventos bate com soma de visitas
  - [ ] Produtos criados automaticamente
  - [ ] Referências clientId todas válidas
  - [ ] historicoValores criado para produtos
- [ ] Criar índices geoespaciais (2dsphere) em `clients.localizacao.geo`
- [ ] Validar queries geoespaciais funcionando
- [ ] **[ROLLBACK PREPARADO]** Manter backup até validação completa

### FASE 2 - Importação Planilha "Plano de Ouro"

- [ ] Executar script de importação
- [ ] Validar dados importados
- [ ] Verificar integridade referencial

### FASE 3 - Analytics

- [ ] Implementar `analytics.ts`
- [ ] Criar endpoint de refresh de analytics
- [ ] Testar cálculos de previsão
- [ ] Validar próximas ações sugeridas

### FASE 4 - Timeline

- [ ] Criar componente `ClientTimeline.vue`
- [ ] Integrar com dados de `historicoCliente`
- [ ] Implementar lógica de sugestões
- [ ] Adicionar página de detalhes

### FASE 5 - Gerenciadores

- [ ] Criar `UsersManager.vue` (vendedores, gerentes, admins, supervisores)
- [ ] Criar `ProdutosManager.vue`
- [ ] Integrar na navegação principal

### FASE 6 - Maps

- [ ] Criar `ClientAnalyticsPanel.vue`
- [ ] Integrar métricas no card de cliente
- [ ] Adicionar filtros de período
- [ ] Implementar gráficos de tendência

### FASE 7 - Testes

- [ ] Testar fluxo completo de evento (visita/venda/ligação)
- [ ] Validar analytics
- [ ] Testar importação de dados
- [ ] Verificar timeline

### FASE 8 - Comercial (alavancar vendas)

- [ ] Adicionar `clients.sales` (stage/owner/nextAction/score)
- [ ] Tornar `nextActionAt` obrigatório ao registrar evento
- [ ] Implementar “Lista Hoje” do vendedor (nextActionAt vencido)
- [ ] Implementar segmentação inicial (RFM/ABC/Geo) a partir do histórico
- [ ] Implementar painel do gerente (KPIs + clientes em risco/oportunidades)
- [ ] Criar templates por ação/segmento (WhatsApp/e-mail)

---

## 📝 Notas Importantes

1. **⭐ GEO REFERENCIAMENTO - CRÍTICO:** Preservar `latitude` e `longitude` de todos os clientes. Validar que estão preenchidos corretamente antes da migração. Isso é essencial para os mapas funcionarem.
2. **Migração de Dados Existentes:** Antes de deletar `visitas` do schema de clients, executar script de migração
3. **Indexes:** Criar indexes em MongoDB para:
   - `historicoCliente`: `clientId + data` (principal), `userId`, `tipo`
   - `clients`: `localizacao.geo` (índice `2dsphere`)
4. **Permissões:** Considerar controle de acesso baseado em vendedor
5. **Retenção:** Define política de retenção de dados históricos
6. **Backup:** Fazer backup antes de executar script de importação
7. **Idempotência:** Para importações/migrações, prefira `_id` determinístico ou índice `unique` (ex.: `clientId + tipo + data + origem`) para evitar duplicatas.

---

## 🚀 Próximos Passos Após Implementação

1. Integração com WhatsApp/SMS para alertas de próximas ações
2. Dashboard executivo com KPIs consolidados
3. Relatórios PDF automáticos
4. Integração com Google Calendar para agendamentos
5. Machine Learning para previsões mais precisas
