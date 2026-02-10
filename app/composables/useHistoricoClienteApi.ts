import { z } from 'zod'
import type { HistoricoClienteDto } from '~/types/schemas'
import { HistoricoClienteDtoSchema } from '~/types/schemas'

type ApiResponse<T> = { success: boolean; data: T }

export type CreateHistoricoPayload = {
  clientId: string
  userId: string
  tipo:
    | 'visita_fisica'
    | 'ligacao'
    | 'venda_ligacao'
    | 'venda_fisica'
    | 'agendamento'
    | 'feedback'
  data: string
  descricao?: string
  pedidoCodigo?: string
  items?: Array<{ produtoId: string; nome: string; quantidade: number; valorUnitario: number }>
  resultado?: 'sucesso' | 'pendente' | 'fracasso'
  feedback?: string
  duracao?: number
  proximoContato?: string
}

export function useHistoricoClienteApi() {
  const fetchHistorico = async (clientId: string, opts?: { limit?: number }) => {
    const query = new URLSearchParams({ clientId })
    if (opts?.limit) query.set('limit', String(opts.limit))
    const res = await $fetch<ApiResponse<unknown>>(`/api/v1/historico-cliente?${query.toString()}`)
    return z.array(HistoricoClienteDtoSchema).parse(res.data) as HistoricoClienteDto[]
  }

  const createEvento = async (payload: CreateHistoricoPayload) => {
    const res = await $fetch<ApiResponse<unknown>>('/api/v1/historico-cliente', {
      method: 'POST',
      body: payload,
    })
    return HistoricoClienteDtoSchema.parse(res.data) as HistoricoClienteDto
  }

  return { fetchHistorico, createEvento }
}

