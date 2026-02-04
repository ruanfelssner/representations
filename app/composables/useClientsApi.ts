import { z } from 'zod'
import type { Cliente } from '~/types/client'
import { ClientDtoSchema } from '~/types/schemas'

type ApiResponse<T> = { success: boolean; data: T }

const SalesTotalsSchema = z.object({
  month: z.number(),
  quarter: z.number(),
  year: z.number(),
})

export function useClientsApi() {
  const fetchClients = async () => {
    const res = await $fetch<ApiResponse<{ clients: unknown; mapSettings: any; salesTotals?: unknown }>>('/api/v1/clients')
    const parsed = z
      .object({
        clients: z.array(ClientDtoSchema),
        mapSettings: z.any(),
        salesTotals: SalesTotalsSchema.optional(),
      })
      .parse(res.data)
    return parsed as { clients: Cliente[]; mapSettings: any; salesTotals?: { month: number; quarter: number; year: number } }
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
    const res = await $fetch<ApiResponse<unknown>>(`/api/v1/clients/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: updates,
    })
    return ClientDtoSchema.parse(res.data) as Cliente
  }

  const deleteClient = async (id: string) => {
    await $fetch<ApiResponse<unknown>>(`/api/v1/clients/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  return { fetchClients, createClient, patchClient, deleteClient }
}
