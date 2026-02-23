import { z } from 'zod'
import {
  TerritoryCityDtoSchema,
  TerritoryRegionDtoSchema,
  TerritoryStateDtoSchema,
} from '~/types/schemas'

type ApiResponse<T> = { success: boolean; data: T }

const normalizeLimit = (limit: number | undefined, max: number): number | undefined => {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return undefined
  return Math.min(max, Math.max(1, Math.trunc(limit)))
}

export function useTerritoryApi() {
  const fetchStates = async (opts?: {
    uf?: string
    ids?: string[]
    active?: boolean
    withGeometry?: boolean
    limit?: number
  }) => {
    const params = new URLSearchParams()
    if (opts?.uf) params.set('uf', opts.uf)
    if (opts?.ids?.length) params.set('ids', opts.ids.join(','))
    if (typeof opts?.active === 'boolean') params.set('active', String(opts.active))
    if (typeof opts?.withGeometry === 'boolean')
      params.set('withGeometry', String(opts.withGeometry))
    const limit = normalizeLimit(opts?.limit, 500)
    if (typeof limit === 'number') params.set('limit', String(limit))
    const query = params.size ? `?${params.toString()}` : ''
    const res = await $fetch<ApiResponse<unknown>>(`/api/v1/states${query}`)
    return z.array(TerritoryStateDtoSchema).parse(res.data)
  }

  const fetchCities = async (opts?: {
    stateId?: string
    ids?: string[]
    search?: string
    active?: boolean
    withGeometry?: boolean
    limit?: number
  }) => {
    const params = new URLSearchParams()
    if (opts?.stateId) params.set('stateId', opts.stateId)
    if (opts?.ids?.length) params.set('ids', opts.ids.join(','))
    if (opts?.search) params.set('search', opts.search)
    if (typeof opts?.active === 'boolean') params.set('active', String(opts.active))
    if (typeof opts?.withGeometry === 'boolean')
      params.set('withGeometry', String(opts.withGeometry))
    const limit = normalizeLimit(opts?.limit, 10000)
    if (typeof limit === 'number') params.set('limit', String(limit))
    const query = params.size ? `?${params.toString()}` : ''
    const res = await $fetch<ApiResponse<unknown>>(`/api/v1/cities${query}`)
    return z.array(TerritoryCityDtoSchema).parse(res.data)
  }

  const fetchRegions = async (opts?: {
    stateId?: string
    representativeUserId?: string
    search?: string
    active?: boolean
    withGeometry?: boolean
    limit?: number
  }) => {
    const params = new URLSearchParams()
    if (opts?.stateId) params.set('stateId', opts.stateId)
    if (opts?.representativeUserId) params.set('representativeUserId', opts.representativeUserId)
    if (opts?.search) params.set('search', opts.search)
    if (typeof opts?.active === 'boolean') params.set('active', String(opts.active))
    if (typeof opts?.withGeometry === 'boolean')
      params.set('withGeometry', String(opts.withGeometry))
    const limit = normalizeLimit(opts?.limit, 1000)
    if (typeof limit === 'number') params.set('limit', String(limit))
    const query = params.size ? `?${params.toString()}` : ''
    const res = await $fetch<ApiResponse<unknown>>(`/api/v1/regions${query}`)
    const rawRows = z.array(z.unknown()).parse(res.data)

    return rawRows
      .map((row) => {
        const strict = TerritoryRegionDtoSchema.safeParse(row)
        if (strict.success) return strict.data
        if (!row || typeof row !== 'object') return null

        const raw = row as Record<string, unknown>
        const id = String(raw.id || raw._id || '').trim()
        if (!id) return null

        return {
          id,
          nome: String(raw.nome || '').trim() || id,
          stateIds: Array.isArray(raw.stateIds) ? raw.stateIds.map((v) => String(v)) : [],
          cityIds: Array.isArray(raw.cityIds) ? raw.cityIds.map((v) => String(v)) : [],
          geometry: raw.geometry,
          color: typeof raw.color === 'string' ? raw.color : undefined,
          priority: Number.isFinite(Number(raw.priority)) ? Number(raw.priority) : 0,
          representanteUserId:
            typeof raw.representanteUserId === 'string' ? raw.representanteUserId : undefined,
          ativo: raw.ativo !== false,
          createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
          updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
        } as any
      })
      .filter((row): row is any => !!row)
  }

  return { fetchStates, fetchCities, fetchRegions }
}
