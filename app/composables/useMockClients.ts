/**
 * Composable para carregar e gerenciar dados de clientes mock
 * Usado para visualização de empresas importadas do CSV
 */

import type { ClientDto } from '~/types/schemas'

export function useMockClients() {
  const clients = useState<ClientDto[]>('mockClients', () => [])
  const loading = useState('mockClientsLoading', () => false)
  const error = useState<Error | null>('mockClientsError', () => null)

  const loadMockClients = async () => {
    if (clients.value.length > 0) {
      // Já carregado
      return clients.value
    }

    loading.value = true
    error.value = null

    try {
      // Carrega arquivo mock-clients.json
      const response = await fetch('/mock-clients.json')
      if (!response.ok) {
        throw new Error(`Erro ao carregar mock-clients.json: ${response.statusText}`)
      }

      const data = await response.json()
      clients.value = data

      console.log(`✅ ${clients.value.length} clientes mock carregados`)
      return clients.value
    }
    catch (err) {
      error.value = err as Error
      console.error('Erro ao carregar clientes mock:', err)
      return []
    }
    finally {
      loading.value = false
    }
  }

  const getClientsByCidade = (cidade: string) => {
    return clients.value.filter(c => c.cidade?.toLowerCase() === cidade.toLowerCase())
  }

  const getClientsBySegmento = (segmento: string) => {
    return clients.value.filter(c => c.segmento === segmento)
  }

  const stats = computed(() => {
    const porSegmento: Record<string, number> = {}
    const porCidade: Record<string, number> = {}

    for (const client of clients.value) {
      if (client.segmento) {
        porSegmento[client.segmento] = (porSegmento[client.segmento] || 0) + 1
      }
      if (client.cidade) {
        porCidade[client.cidade] = (porCidade[client.cidade] || 0) + 1
      }
    }

    return {
      total: clients.value.length,
      porSegmento,
      porCidade,
      topCidades: Object.entries(porCidade)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
    }
  })

  return {
    clients: readonly(clients),
    loading: readonly(loading),
    error: readonly(error),
    loadMockClients,
    getClientsByCidade,
    getClientsBySegmento,
    stats,
  }
}
