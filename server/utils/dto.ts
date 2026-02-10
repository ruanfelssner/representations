import { z } from 'zod'
import { ObjectId } from 'mongodb'

const EmailSchema = z.string().email()

function toNumber(v: any): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  if (v && typeof v === 'object') {
    // Mongo Decimal128, etc.
    if (typeof v.toString === 'function') {
      const n = Number(v.toString())
      return Number.isFinite(n) ? n : undefined
    }
  }
  return undefined
}

function toIsoDateTime(v: any): string | undefined {
  if (!v) return undefined
  if (v instanceof Date) return v.toISOString()
  if (typeof v === 'string') {
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
  }
  if (typeof v === 'object' && typeof v.toString === 'function') {
    const s = v.toString()
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
  }
  return undefined
}

function normalizeStatus(v: any): 'ativo' | 'inativo' | 'potencial' {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : ''
  if (s === 'ativo' || s === 'inativo' || s === 'potencial') return s
  if (s === 'at' || s === 'ativo ') return 'ativo'
  return 'potencial'
}

function normalizeEmail(v: any): string | undefined {
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  if (!s) return undefined
  return EmailSchema.safeParse(s).success ? s : undefined
}

function oneOf<T extends string>(v: any, allowed: readonly T[]): T | undefined {
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  return (allowed as readonly string[]).includes(s) ? (s as T) : undefined
}

export function toClientApi(doc: any) {
  if (!doc) return doc
  const { _id, color: _color, ...rest } = doc

  const nome = typeof doc?.nome === 'string' && doc.nome.trim() ? doc.nome.trim() : '(Sem nome)'

  const coords = Array.isArray(doc?.localizacao?.geo?.coordinates)
    ? doc.localizacao.geo.coordinates
    : undefined
  const latFromCoords = coords?.length === 2 ? toNumber(coords[1]) : undefined
  const lngFromCoords = coords?.length === 2 ? toNumber(coords[0]) : undefined

  const lat = toNumber(doc?.localizacao?.latitude) ?? toNumber(doc?.lat) ?? latFromCoords
  const lng = toNumber(doc?.localizacao?.longitude) ?? toNumber(doc?.lng) ?? lngFromCoords

  const enderecoCompleto =
    typeof doc?.endereco?.endereco_completo === 'string'
      ? doc.endereco.endereco_completo
      : typeof doc?.endereco_completo === 'string'
        ? doc.endereco_completo
        : undefined

  const endereco =
    typeof doc?.endereco?.rua === 'string' && doc.endereco.rua.trim()
      ? doc.endereco.rua
      : typeof doc?.endereco === 'string'
        ? doc.endereco
        : enderecoCompleto

  const cidade =
    typeof doc?.endereco?.cidade === 'string'
      ? doc.endereco.cidade
      : typeof doc?.cidade === 'string'
        ? doc.cidade
        : undefined

  const estado =
    typeof doc?.endereco?.uf === 'string'
      ? doc.endereco.uf
      : typeof doc?.estado === 'string'
        ? doc.estado
        : undefined

  const nowIso = new Date().toISOString()
  const createdAt = toIsoDateTime(doc?.createdAt) || nowIso
  const updatedAt = toIsoDateTime(doc?.updatedAt) || createdAt

  const objectives =
    doc?.objectives && typeof doc.objectives === 'object'
      ? {
          mesAberto: toNumber((doc.objectives as any).mesAberto),
          mesTarget: toNumber((doc.objectives as any).mesTarget),
          semestreTarget: toNumber((doc.objectives as any).semestreTarget),
          anoTarget: toNumber((doc.objectives as any).anoTarget),
        }
      : undefined

  const salesStage = oneOf(doc?.sales?.stage, ['lead', 'ativo', 'negociacao', 'perdido', 'reativacao'] as const)
  const nextActionType = oneOf(doc?.sales?.nextActionType, ['ligar', 'visitar', 'enviar_catalogo', 'cobrar'] as const)
  const salesPriorityRaw = toNumber(doc?.sales?.priorityScore)
  const salesPriorityScore =
    typeof salesPriorityRaw === 'number'
      ? Math.max(0, Math.min(100, Math.round(salesPriorityRaw)))
      : undefined

  const sales =
    doc?.sales && typeof doc.sales === 'object'
      ? {
          stage: salesStage,
          ownerUserId: typeof doc.sales.ownerUserId === 'string' ? doc.sales.ownerUserId : undefined,
          nextActionAt: toIsoDateTime(doc.sales.nextActionAt),
          nextActionType,
          lastContactAt: toIsoDateTime(doc.sales.lastContactAt),
          priorityScore: salesPriorityScore,
          total90d: toNumber(doc.sales.total90d),
          total12m: toNumber(doc.sales.total12m),
          totalAllTime: toNumber(doc.sales.totalAllTime),
        }
      : undefined

  const localizacao =
    typeof lat === 'number' && typeof lng === 'number'
      ? {
          latitude: lat,
          longitude: lng,
          geo: { type: 'Point' as const, coordinates: [lng, lat] as [number, number] },
        }
      : undefined

  const explicitStatus = typeof doc?.status === 'string' ? normalizeStatus(doc.status) : undefined
  const legacyTipo = typeof doc?.tipo === 'string' ? doc.tipo.trim().toLowerCase() : ''
  const visitasCount = Array.isArray(doc?.visitas) ? doc.visitas.length : 0
  const mesAberto = typeof objectives?.mesAberto === 'number' ? objectives.mesAberto : 0
  const inferredStatus: 'ativo' | 'inativo' | 'potencial' =
    legacyTipo === 'inativo'
      ? 'inativo'
      : visitasCount > 0
        ? 'ativo'
        : mesAberto > 0 || salesStage === 'ativo'
          ? 'ativo'
          : 'potencial'

  return {
    ...rest,
    id: String(_id),
    nome,
    cnpj: typeof doc?.cnpj === 'string' && doc.cnpj.trim() ? doc.cnpj : typeof _id === 'string' ? _id : undefined,
    email: normalizeEmail(doc?.email),
    telefone: typeof doc?.telefone === 'string' && doc.telefone.trim() ? doc.telefone : undefined,
    segmento: typeof doc?.segmento === 'string' && doc.segmento.trim() ? doc.segmento : undefined,
    objectives,
    sales,
    status: explicitStatus ?? inferredStatus,
    createdAt,
    updatedAt,
    localizacao,
    lat,
    lng,
    endereco_completo: enderecoCompleto,
    endereco,
    cidade,
    estado,
  }
}

export function toSimpleIdApi(doc: any) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return { ...rest, id: String(_id) }
}

/**
 * Busca cliente por ID (ObjectID, _id ou CNPJ)
 * Tenta 3 formas:
 * 1. Por ObjectId (se o id tiver 24 caracteres hex)
 * 2. Por _id direto (string)
 * 3. Por CNPJ
 */
export async function resolveClientDoc(db: any, id: string) {
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    const byObjectId = await db.collection('clients').findOne({ _id: new ObjectId(id) })
    if (byObjectId) return byObjectId
  }
  const byId = await db.collection('clients').findOne({ _id: id })
  if (byId) return byId
  const byCnpj = await db.collection('clients').findOne({ cnpj: id })
  if (byCnpj) return byCnpj
  return null
}
