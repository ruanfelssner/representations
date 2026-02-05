import { z } from 'zod'
import type { Cliente } from '~/types/client'
import { ClientDtoSchema } from '~/types/schemas'

type ApiResponse<T> = { success: boolean; data: T }

const SalesTotalsSchema = z.object({
  month: z.number(),
  monthPrev: z.number().optional(),
  monthPrevYear: z.number().optional(),
  quarter: z.number(),
  quarterPrev: z.number().optional(),
  quarterPrevYear: z.number().optional(),
  year: z.number(),
  yearPrevYear: z.number().optional(),
})

export function useClientsApi() {
  const fetchClients = async (opts?: {
    scope?: 'all' | 'portfolio'
    exclude?: Array<'ativo' | 'potencial' | 'inativo'>
  }) => {
    const params = new URLSearchParams()
    if (opts?.scope) params.set('scope', opts.scope)
    for (const v of opts?.exclude || []) params.append('exclude', v)
    const query = params.size ? `?${params.toString()}` : ''
    const res = await $fetch<
      ApiResponse<{
        clients: unknown
        mapSettings: any
        salesTotals?: unknown
        contactsThisMonth?: unknown
        contactsPrevMonth?: unknown
      }>
    >(`/api/v1/clients${query}`)
    const parsed = z
      .object({
        clients: z.array(ClientDtoSchema),
        mapSettings: z.any(),
        salesTotals: SalesTotalsSchema.optional(),
        contactsThisMonth: z.number().optional(),
        contactsPrevMonth: z.number().optional(),
      })
      .parse(res.data)
    return parsed as {
      clients: Cliente[]
      mapSettings: any
      salesTotals?: {
        month: number
        monthPrev?: number
        monthPrevYear?: number
        quarter: number
        quarterPrev?: number
        quarterPrevYear?: number
        year: number
        yearPrevYear?: number
      }
      contactsThisMonth?: number
      contactsPrevMonth?: number
    }
  }

  const createClient = async (payload: {
    nome: string
    endereco_completo: string
    telefone?: string
    email?: string
    cidade?: string
    estado?: string
    status?: 'ativo' | 'potencial' | 'inativo'
    segmento?: string
    cnpj?: string
  }) => {
    const res = await $fetch<ApiResponse<unknown>>('/api/v1/clients', { method: 'POST', body: payload })
    return ClientDtoSchema.parse(res.data) as Cliente
  }

  const patchClient = async (id: string, updates: Partial<Cliente> & { endereco_completo?: string }) => {
    console.log('🔧 COMPOSABLE - patchClient chamado com:', { id, updates: JSON.stringify(updates) })
    const res = await $fetch<ApiResponse<unknown>>(`/api/v1/clients/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: updates,
    })
    console.log('🔧 COMPOSABLE - Resposta recebida:', res)
    return ClientDtoSchema.parse(res.data) as Cliente
  }

  const deleteClient = async (id: string) => {
    await $fetch<ApiResponse<unknown>>(`/api/v1/clients/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  return { fetchClients, createClient, patchClient, deleteClient }
}
