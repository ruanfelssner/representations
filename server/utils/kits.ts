import { createError } from 'h3'
import { GridFSBucket, ObjectId } from 'mongodb'
import { KitCategorySlugSchema } from '~/types/schemas'

export const KIT_MEDIA_BUCKET_NAME = 'kitMedia'

function toIsoDateTime(value: unknown) {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  if (typeof value === 'object' && typeof (value as any).toString === 'function') {
    const raw = (value as any).toString()
    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  return undefined
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const normalized = value.trim().replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  if (value && typeof value === 'object' && typeof (value as any).toString === 'function') {
    const parsed = Number((value as any).toString())
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === 'string' ? item : typeof item === 'number' ? String(item) : ''))
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

function optionalString(value: unknown) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function resolveCategorySlug(inputSlug: string | undefined, nome: string) {
  const slug = slugify(inputSlug || nome)
  const parsed = KitCategorySlugSchema.safeParse(slug)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message || 'Slug inválido.',
      data: { issues: parsed.error.issues },
    })
  }
  return parsed.data
}

export function normalizeSizes(input: unknown): string[] {
  const raw = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(/[,\n;|]+/g)
      : []

  const normalized = raw
    .map((v) => (typeof v === 'number' ? String(v) : typeof v === 'string' ? v : ''))
    .map((v) => v.trim())
    .filter(Boolean)

  return Array.from(new Set(normalized))
}

export function toKitMediaUrl(fileId: string) {
  return `/api/v1/kits/media/${encodeURIComponent(fileId)}`
}

export function getKitMediaBucket(db: any) {
  return new GridFSBucket(db, { bucketName: KIT_MEDIA_BUCKET_NAME })
}

export function parseGridFsFileId(fileId: string) {
  if (!ObjectId.isValid(fileId)) {
    throw createError({ statusCode: 400, statusMessage: 'fileId inválido.' })
  }
  return new ObjectId(fileId)
}

export function toKitCategoryApi(doc: any) {
  if (!doc) return doc
  const nowIso = new Date().toISOString()
  const normalizedSlug = optionalString(doc.slug) || slugify(optionalString(doc.nome) || 'sem-slug')
  return {
    id: String(doc._id),
    slug: normalizedSlug || 'sem-slug',
    nome: optionalString(doc.nome) || 'Sem nome',
    ordem: toNumber(doc.ordem) ?? 0,
    ativo: doc.ativo !== false,
    createdAt: toIsoDateTime(doc.createdAt) || nowIso,
    updatedAt: toIsoDateTime(doc.updatedAt) || toIsoDateTime(doc.createdAt) || nowIso,
  }
}

export function toKitApi(doc: any, categoriesById?: Map<string, any>) {
  if (!doc) return doc
  const nowIso = new Date().toISOString()
  const fotoDestaqueFileId =
    doc.fotoDestaqueFileId !== undefined && doc.fotoDestaqueFileId !== null
      ? String(doc.fotoDestaqueFileId)
      : undefined
  const galeriaFileIds = Array.isArray(doc.galeriaFileIds)
    ? doc.galeriaFileIds
        .map((id: unknown) => (id !== undefined && id !== null ? String(id) : ''))
        .filter(Boolean)
    : []
  const category = categoriesById?.get(String(doc.categoriaId))
  const normalizedCodigo = optionalString(doc.codigo) || String(doc._id)
  const normalizedNome = optionalString(doc.nome) || normalizedCodigo
  const normalizedCategoriaId =
    optionalString(doc.categoriaId) || (category ? String(category._id) : 'sem-categoria')

  return {
    id: String(doc._id),
    codigo: normalizedCodigo,
    nome: normalizedNome,
    categoriaId: normalizedCategoriaId,
    produtoReferenciaId: optionalString(doc.produtoReferenciaId),
    descricaoRapida: optionalString(doc.descricaoRapida),
    descricaoCompleta: optionalString(doc.descricaoCompleta),
    precoUnitario: toNumber(doc.precoUnitario) ?? 0,
    tamanhosDisponiveis: normalizeStringArray(doc.tamanhosDisponiveis),
    destaque: doc.destaque === true,
    ativo: doc.ativo !== false,
    imagemAlt: optionalString(doc.imagemAlt),
    dimensoes: optionalString(doc.dimensoes),
    pesoUnitario: toNumber(doc.pesoUnitario),
    nota: optionalString(doc.nota),
    createdAt: toIsoDateTime(doc.createdAt) || nowIso,
    updatedAt: toIsoDateTime(doc.updatedAt) || toIsoDateTime(doc.createdAt) || nowIso,
    fotoDestaqueUrl:
      typeof fotoDestaqueFileId === 'string' && fotoDestaqueFileId
        ? toKitMediaUrl(fotoDestaqueFileId)
        : undefined,
    galeriaUrls: galeriaFileIds.map((id) => toKitMediaUrl(id)),
    categoria: category
      ? {
          id: String(category._id),
          slug: optionalString(category.slug) || '',
          nome: optionalString(category.nome) || '',
        }
      : undefined,
  }
}
