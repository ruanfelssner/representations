import { z } from 'zod'

export const IsoDateTimeSchema = z.string().datetime()

export const GeoJsonPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
})

export const ClientSalesStageSchema = z.enum([
  'lead',
  'ativo',
  'negociacao',
  'perdido',
  'reativacao',
])

export const ClientNextActionTypeSchema = z.enum([
  'ligar',
  'visitar',
  'enviar_catalogo',
  'cobrar',
])

export const ClientStatusSchema = z.enum(['ativo', 'inativo', 'potencial'])

// DB schema (segmento é livre no banco; UI pode usar um enum próprio)
export const ClientSchema = z.object({
  _id: z.string(), // CNPJ como id
  nome: z.string().min(1),
  cnpj: z.string().optional(),
  email: z.string().email().optional(),
  segmento: z.string().optional(),

  endereco: z
    .object({
      rua: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string(),
      cep: z.string().optional(),
      uf: z.string().length(2),
      endereco_completo: z.string().optional(),
    })
    .optional(),

  localizacao: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      geo: GeoJsonPointSchema.optional(),
    })
    .optional(),

  telefone: z.string().optional(),

  objectives: z
    .object({
      mesAberto: z.number().optional(),
      mesTarget: z.number().optional(),
      semestreTarget: z.number().optional(),
      anoTarget: z.number().optional(),
    })
    .optional(),

  sales: z
    .object({
      stage: ClientSalesStageSchema.optional(),
      ownerUserId: z.string().optional(),
      nextActionAt: IsoDateTimeSchema.optional(),
      nextActionType: ClientNextActionTypeSchema.optional(),
      lastContactAt: IsoDateTimeSchema.optional(),
      priorityScore: z.number().min(0).max(100).optional(),
      total90d: z.number().min(0).optional(),
      total12m: z.number().min(0).optional(),
      totalAllTime: z.number().min(0).optional(),
    })
    .optional(),

  status: ClientStatusSchema.default('ativo'),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})

export type Client = z.infer<typeof ClientSchema>

// DTOs (respostas da API) — Nuxt/Front prefere `id` ao invés de `_id`
export const ClientDtoSchema = ClientSchema.omit({ _id: true }).extend({
  id: z.string(),
  // Compat (campos flat usados pela UI atual; não são fonte de verdade)
  lat: z.number().optional(),
  lng: z.number().optional(),
  endereco: z.string().optional(),
  endereco_completo: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})
export type ClientDto = z.infer<typeof ClientDtoSchema>

export const UserRoleSchema = z.enum(['vendedor', 'gerente', 'admin', 'supervisor'])

export const UserSchema = z.object({
  _id: z.string(),
  nome: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().optional(),
  role: UserRoleSchema.default('vendedor'),
  ativo: z.boolean().default(true),
  dataAdmissao: IsoDateTimeSchema,

  password: z.string().optional(),
  permissions: z.array(z.string()).optional(),

  meta: z
    .object({
      mesAberto: z.number().optional(),
      trimestre: z.number().optional(),
      ano: z.number().optional(),
    })
    .optional(),

  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})

export type User = z.infer<typeof UserSchema>

export const UserDtoSchema = UserSchema.omit({ _id: true }).extend({ id: z.string() })
export type UserDto = z.infer<typeof UserDtoSchema>

export const ProdutoSchema = z.object({
  _id: z.string(),
  codigo: z.string().min(1),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  valor: z.number().min(0),
  categoria: z.string().optional(),
  ativo: z.boolean().default(true),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})

export type Produto = z.infer<typeof ProdutoSchema>

export const ProdutoDtoSchema = ProdutoSchema.omit({ _id: true }).extend({ id: z.string() })
export type ProdutoDto = z.infer<typeof ProdutoDtoSchema>

export const HistoricoValorSchema = z.object({
  _id: z.union([z.string(), z.any()]).optional(),
  produtoId: z.string(),
  data: IsoDateTimeSchema,
  valor: z.number().min(0),
  createdAt: IsoDateTimeSchema,
})

export type HistoricoValor = z.infer<typeof HistoricoValorSchema>

export const HistoricoClienteItemSchema = z.object({
  produtoId: z.string(),
  nome: z.string(),
  quantidade: z.number().min(1),
  valorUnitario: z.number().min(0),
})

export type HistoricoClienteItem = z.infer<typeof HistoricoClienteItemSchema>

export const HistoricoClienteTipoSchema = z.enum([
  'visita_fisica',
  'ligacao',
  'venda_ligacao',
  'venda_fisica',
  'agendamento',
  'feedback',
])

export const HistoricoClienteResultadoSchema = z.enum(['sucesso', 'pendente', 'fracasso'])

export const HistoricoClienteSchema = z.object({
  _id: z.union([z.string(), z.any()]).optional(),
  clientId: z.string(),
  userId: z.string(),
  tipo: HistoricoClienteTipoSchema,
  data: IsoDateTimeSchema,
  descricao: z.string().optional(),

  items: z.array(HistoricoClienteItemSchema).optional().default([]),

  resultado: HistoricoClienteResultadoSchema.default('pendente'),
  feedback: z.string().optional(),

  totalVenda: z.number().min(0).default(0),
  duracao: z.number().min(0).optional(),
  proximoContato: IsoDateTimeSchema.optional(),

  createdAt: IsoDateTimeSchema.optional(),
  updatedAt: IsoDateTimeSchema.optional(),
})

export type HistoricoCliente = z.infer<typeof HistoricoClienteSchema>

export const HistoricoClienteDtoSchema = HistoricoClienteSchema.extend({
  id: z.string(),
}).omit({ _id: true })
export type HistoricoClienteDto = z.infer<typeof HistoricoClienteDtoSchema>

export const TimelineEventTipoSchema = z.enum([
  'visita',
  'contato',
  'venda',
  'agendamento',
  'acao_sugerida',
])

export const TimelineEventSchema = z.object({
  id: z.string(),
  data: IsoDateTimeSchema,
  tipo: TimelineEventTipoSchema,
  titulo: z.string(),
  descricao: z.string().optional(),
})

export type TimelineEvent = z.infer<typeof TimelineEventSchema>
