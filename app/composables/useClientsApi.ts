import type { Cliente, Visita } from '~/types/client'

type ApiResponse<T> = { success: boolean; data: T }

export function useClientsApi() {
  const fetchClients = async () => {
    const res = await $fetch<ApiResponse<{ clients: Cliente[]; mapSettings: any }>>('/api/v1/clients')
    return res.data
  }

  const createClient = async (payload: {
    nome: string
    endereco_completo: string
    telefone?: string
    email?: string
    cidade?: string
    estado?: string
    tipo?: Cliente['tipo']
    segmento?: Cliente['segmento']
    cnpj?: string
  }) => {
    const res = await $fetch<ApiResponse<Cliente>>('/api/v1/clients', { method: 'POST', body: payload })
    return res.data
  }

  const patchClient = async (id: string, updates: Partial<Cliente> & { endereco_completo?: string }) => {
    const res = await $fetch<ApiResponse<Cliente>>(`/api/v1/clients/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: updates,
    })
    return res.data
  }

  const deleteClient = async (id: string) => {
    await $fetch<ApiResponse<unknown>>(`/api/v1/clients/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  const addVisitaApi = async (id: string, visita: Omit<Visita, 'id'>) => {
    const res = await $fetch<ApiResponse<Cliente>>(
      `/api/v1/clients/${encodeURIComponent(id)}/visitas`,
      { method: 'POST', body: visita }
    )
    return res.data
  }

  return { fetchClients, createClient, patchClient, deleteClient, addVisitaApi }
}

