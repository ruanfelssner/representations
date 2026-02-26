import { z } from 'zod'

export const IsoDateTimeSchema = z.string().datetime()

export const GeoJsonPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
})

export const GeoJsonPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))).min(1),
})

export const GeoJsonMultiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(z.tuple([z.number(), z.number()])))).min(1),
})

export const GeoJsonGeometrySchema = z.union([
  GeoJsonPointSchema,
  GeoJsonPolygonSchema,
  GeoJsonMultiPolygonSchema,
])

export const MapCentroidSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

export const ClientSalesStageSchema = z.enum([
  'lead',
  'ativo',
  'negociacao',
  'perdido',
  'reativacao',
])

export const ClientNextActionTypeSchema = z.enum(['ligar', 'visitar', 'enviar_catalogo', 'cobrar'])

export const ClientStatusSchema = z.enum(['ativo', 'inativo', 'potencial'])
export const ClientStoreProductSchema = z.enum([
  'joia',
  'relogio',
  'oculos',
  'caneta',
  'perfume',
  'prata',
])

export const ClientFirstContactChannelSchema = z.enum(['whatsapp', 'telefone'])
export const ClientFirstContactOutcomeSchema = z.enum([
  'agendado_online',
  'agendado_presencial',
  'sem_retorno',
  'nao_tem_interesse',
])

export const TerritoryStateSchema = z.object({
  _id: z.string(),
  uf: z.string().trim().toUpperCase().length(2),
  nome: z.string().min(1),
  geometry: z.union([GeoJsonPolygonSchema, GeoJsonMultiPolygonSchema]).optional(),
  centroid: MapCentroidSchema.optional(),
  ativo: z.boolean().default(true),
  createdAt: IsoDateTimeSchema.optional(),
  updatedAt: IsoDateTimeSchema.optional(),
})

export type TerritoryState = z.infer<typeof TerritoryStateSchema>

export const TerritoryStateDtoSchema = TerritoryStateSchema.omit({ _id: true }).extend({
  id: z.string(),
})
export type TerritoryStateDto = z.infer<typeof TerritoryStateDtoSchema>

export const TerritoryCitySchema = z.object({
  _id: z.string(),
  stateId: z.string(),
  nome: z.string().min(1),
  normalizedName: z.string().optional(),
  ibgeCode: z.string().optional(),
  geometry: z.union([GeoJsonPolygonSchema, GeoJsonMultiPolygonSchema]).optional(),
  centroid: MapCentroidSchema.optional(),
  ativo: z.boolean().default(true),
  createdAt: IsoDateTimeSchema.optional(),
  updatedAt: IsoDateTimeSchema.optional(),
})

export type TerritoryCity = z.infer<typeof TerritoryCitySchema>

export const TerritoryCityDtoSchema = TerritoryCitySchema.omit({ _id: true }).extend({
  id: z.string(),
})
export type TerritoryCityDto = z.infer<typeof TerritoryCityDtoSchema>

export const TerritoryRegionSchema = z.object({
  _id: z.string(),
  nome: z.string().min(1),
  stateIds: z.array(z.string()).default([]),
  cityIds: z.array(z.string()).default([]),
  geometry: z.union([GeoJsonPolygonSchema, GeoJsonMultiPolygonSchema]),
  color: z.string().optional(),
  priority: z.number().int().min(0).default(0),
  representanteUserId: z.string().optional(),
  ativo: z.boolean().default(true),
  createdAt: IsoDateTimeSchema.optional(),
  updatedAt: IsoDateTimeSchema.optional(),
})

export type TerritoryRegion = z.infer<typeof TerritoryRegionSchema>

export const TerritoryRegionDtoSchema = TerritoryRegionSchema.omit({ _id: true }).extend({
  id: z.string(),
})
export type TerritoryRegionDto = z.infer<typeof TerritoryRegionDtoSchema>

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
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  regionId: z.string().optional(),

  company: z
    .object({
      nomeFantasia: z.string().optional(),
    })
    .optional(),

  buyerContact: z
    .object({
      contatado: z.boolean().default(false),
      nome: z.string().optional(),
      telefone: z.string().optional(),
    })
    .optional(),

  storeProducts: z.array(ClientStoreProductSchema).optional(),

  social: z
    .object({
      instagram: z.string().optional(),
    })
    .optional(),

  serviceFlow: z
    .object({
      firstContact: z
        .object({
          channel: ClientFirstContactChannelSchema.optional(),
          outcome: ClientFirstContactOutcomeSchema.optional(),
          happenedAt: IsoDateTimeSchema.optional(),
          notes: z.string().optional(),
        })
        .optional(),
    })
    .optional(),

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
  visitas: z.array(z.unknown()).optional(),
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

export const ProdutoLinhaSchema = z.enum([
  'steel-and-gold',
  'silver-and-gold',
  'gold-10k',
  'gold-18k',
])
export type ProdutoLinha = z.infer<typeof ProdutoLinhaSchema>

export const ProdutoSchema = z.object({
  _id: z.string(),
  codigo: z.string().min(1),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  /** Descrição curta exibida no card da home */
  descricaoRapida: z.string().optional(),
  /** Descrição completa exibida no modal da home */
  descricaoCompleta: z.string().optional(),
  valor: z.number().min(0),
  categoria: z.string().optional(),
  /** Linha comercial (para filtro na home) */
  linha: ProdutoLinhaSchema.optional(),
  /** URL da imagem de thumbnail (card da home) */
  thumbnailUrl: z.string().optional(),
  /** URLs da galeria de imagens (modal) */
  galleryUrls: z.array(z.string()).optional(),
  /** URL do PDF do catálogo */
  catalogPdfUrl: z.string().optional(),
  /** Alt text para imagens */
  imagemAlt: z.string().optional(),
  /** Dimensões do produto (ex: "2,00 mm x 4,30 mm") */
  dimensoes: z.string().optional(),
  /** Peso unitário em gramas */
  pesoUnitario: z.number().optional(),
  /** Nota/observação exibida no modal */
  nota: z.string().optional(),
  /** Preço de referência do equivalente em ouro 18k (para comparação) */
  precoOuro18kReferencia: z.number().optional(),
  /** Exibir na home como destaque */
  destaque: z.boolean().optional(),
  ativo: z.boolean().default(true),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})

export type Produto = z.infer<typeof ProdutoSchema>

export const ProdutoDtoSchema = ProdutoSchema.omit({ _id: true }).extend({ id: z.string() })
export type ProdutoDto = z.infer<typeof ProdutoDtoSchema>

export const KitCategorySlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug inválido. Use minúsculas, números e hífen (ex: aco-e-ouro).'
  )

export const DefaultKitCategories = [
  { slug: 'aco-e-ouro', nome: 'Aço e Ouro', ordem: 10 },
  { slug: 'prata-e-ouro', nome: 'Prata e Ouro', ordem: 20 },
  { slug: 'prata', nome: 'Prata', ordem: 30 },
  { slug: 'ouro', nome: 'Ouro', ordem: 40 },
  { slug: 'ouro-e-diamante', nome: 'Ouro e Diamante', ordem: 50 },
] as const

export const KitCategorySchema = z.object({
  _id: z.string(),
  slug: KitCategorySlugSchema,
  nome: z.string().min(1),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})

export type KitCategory = z.infer<typeof KitCategorySchema>

export const KitCategoryDtoSchema = KitCategorySchema.omit({ _id: true }).extend({ id: z.string() })
export type KitCategoryDto = z.infer<typeof KitCategoryDtoSchema>

export const KitCategoryRefSchema = z.object({
  id: z.string(),
  slug: KitCategorySlugSchema,
  nome: z.string(),
})

export type KitCategoryRef = z.infer<typeof KitCategoryRefSchema>

export const KitSchema = z.object({
  _id: z.string(),
  codigo: z.string().min(1),
  nome: z.string().min(1),
  categoriaId: z.string().min(1),
  produtoReferenciaId: z.string().optional(),
  descricaoRapida: z.string().optional(),
  descricaoCompleta: z.string().optional(),
  precoUnitario: z.number().min(0),
  tamanhosDisponiveis: z.array(z.string().min(1)).default([]),
  destaque: z.boolean().default(false),
  ativo: z.boolean().default(true),
  imagemAlt: z.string().optional(),
  dimensoes: z.string().optional(),
  pesoUnitario: z.number().min(0).optional(),
  nota: z.string().optional(),
  fotoDestaqueFileId: z.string().optional(),
  galeriaFileIds: z.array(z.string()).default([]),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})

export type Kit = z.infer<typeof KitSchema>

export const KitDtoSchema = KitSchema.omit({
  _id: true,
  fotoDestaqueFileId: true,
  galeriaFileIds: true,
}).extend({
  id: z.string(),
  fotoDestaqueUrl: z.string().optional(),
  galeriaUrls: z.array(z.string()).optional(),
  categoria: KitCategoryRefSchema.optional(),
})

export type KitDto = z.infer<typeof KitDtoSchema>

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
  'atendimento_online',
  'venda_fisica',
  'venda_online',
  'venda_telefone',
])

export const HistoricoClienteResultadoSchema = z.enum(['sucesso', 'pendente', 'fracasso'])

export const HistoricoClienteSchema = z.object({
  _id: z.union([z.string(), z.any()]).optional(),
  clientId: z.string(),
  userId: z.string(),
  tipo: HistoricoClienteTipoSchema,
  data: IsoDateTimeSchema,
  descricao: z.string().optional(),
  pedidoCodigo: z.string().min(1).nullish(),

  items: z.array(HistoricoClienteItemSchema).optional().default([]),

  resultado: HistoricoClienteResultadoSchema.default('pendente'),
  feedback: z.string().optional(),
  meetingLink: z.string().trim().optional(),

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

// WhatsApp Templates
export const TriggerTypeSchema = z.enum([
  'FIRST_CONTACT',
  'LAST_SALE_90D',
  'LAST_CONTACT_180D',
  'REACTIVATION',
  'DATE_CAMPAIGN',
  'BUDGET_FOLLOWUP',
  'RELATIONSHIP',
])

export type TriggerType = z.infer<typeof TriggerTypeSchema>

export const WhatsAppTemplateSchema = z.object({
  _id: z.union([z.string(), z.any()]), // ObjectId ou string
  name: z.string().min(1, 'Nome é obrigatório'),
  triggerType: TriggerTypeSchema,
  isActive: z.boolean().default(true),
  messageBody: z.string().min(1, 'Mensagem é obrigatória').max(800, 'Máximo 800 caracteres'),
  variations: z.array(z.string().max(800)).max(3).default([]),
  language: z.string().default('pt-BR'),
  variablesAllowed: z.array(z.string()).default([]),
  createdAt: z.union([z.string().datetime(), z.date()]),
  updatedAt: z.union([z.string().datetime(), z.date()]),
  createdBy: z.string().optional(),
})

export type WhatsAppTemplate = z.infer<typeof WhatsAppTemplateSchema>

export const WhatsAppTemplateDtoSchema = WhatsAppTemplateSchema.extend({
  id: z.string(),
}).omit({ _id: true })

export type WhatsAppTemplateDto = z.infer<typeof WhatsAppTemplateDtoSchema>

export const WhatsAppTemplateCreateSchema = WhatsAppTemplateSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
})

export type WhatsAppTemplateCreate = z.infer<typeof WhatsAppTemplateCreateSchema>

export const WhatsAppTemplateUpdateSchema = WhatsAppTemplateCreateSchema.partial()

export type WhatsAppTemplateUpdate = z.infer<typeof WhatsAppTemplateUpdateSchema>

export const WhatsAppPreviewRequestSchema = z.object({
  clientId: z.string(),
  templateId: z.string(),
  variationIndex: z.number().min(0).max(2).optional(),
})

export type WhatsAppPreviewRequest = z.infer<typeof WhatsAppPreviewRequestSchema>

export const WhatsAppPreviewResponseSchema = z.object({
  message: z.string(),
  waLink: z.string(),
  variables: z.record(z.string(), z.string()),
})

export type WhatsAppPreviewResponse = z.infer<typeof WhatsAppPreviewResponseSchema>
