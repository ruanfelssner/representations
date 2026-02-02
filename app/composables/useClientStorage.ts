import type { Cliente, Visita, ClienteStats } from '~/types/client'

const STORAGE_KEY = 'representations_clients'

export function useClientStorage() {
  // Função para calcular próxima visita baseada na recorrência
  const calcularProximaVisita = (cliente: Cliente): string | undefined => {
    if (!cliente.visitas.length) return undefined

    const ultimaVisita = [...cliente.visitas].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    )[0]

    if (!ultimaVisita) return undefined

    const dataUltimaVisita = new Date(ultimaVisita.data)
    const proximaVisita = new Date(dataUltimaVisita)

    // Se tem recorrência configurada, usa ela
    if (cliente.recorrencia) {
      switch (cliente.recorrencia.tipo) {
        case 'semanal':
          proximaVisita.setDate(proximaVisita.getDate() + 7)
          break
        case 'quinzenal':
          proximaVisita.setDate(proximaVisita.getDate() + 15)
          break
        case 'mensal':
          proximaVisita.setMonth(proximaVisita.getMonth() + 1)
          break
        case 'bimestral':
          proximaVisita.setMonth(proximaVisita.getMonth() + 2)
          break
        case 'trimestral':
          proximaVisita.setMonth(proximaVisita.getMonth() + 3)
          break
      }
    } else {
      // Sem recorrência configurada: assume mensal (30 dias) como padrão
      proximaVisita.setDate(proximaVisita.getDate() + 30)
    }

    return proximaVisita.toISOString()
  }

  // Função para calcular cor baseada na próxima visita
  const getClientColor = (proximaVisita?: string): string => {
    if (!proximaVisita) return '#3b82f6' // Azul padrão se não tiver próxima visita

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataProxima = new Date(proximaVisita)
    dataProxima.setHours(0, 0, 0, 0)
    const diasRestantes = Math.ceil((dataProxima.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

    console.log('🎨 Calculando cor:', { proximaVisita, diasRestantes, hoje: hoje.toISOString(), proxima: dataProxima.toISOString() })

    if (diasRestantes < 0) {
      return '#ef4444' // Vermelho - visita atrasada
    } else if (diasRestantes <= 3) {
      return '#eab308' // Amarelo - visita próxima (3 dias ou menos)
    } else {
      return '#3b82f6' // Azul - dentro do prazo
    }
  }

  const getClients = (): Cliente[] => {
    if (import.meta.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        // Atualizar cores e próximas visitas baseadas na recorrência
        const clients = JSON.parse(stored) as Cliente[]
        return clients.map(client => {
          const proximaVisita = calcularProximaVisita(client) || client.proximaVisita
          return {
            ...client,
            proximaVisita,
            color: getClientColor(proximaVisita)
          }
        })
      }
    }
    return []
  }

  const saveClient = (client: Cliente): void => {
    if (import.meta.client) {
      const clients = getClients()
      const index = clients.findIndex((c) => c.id === client.id)
      if (index >= 0) {
        clients[index] = { ...client, updatedAt: new Date().toISOString() }
      } else {
        clients.push(client)
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
    }
  }

  const updateClient = (clientId: string, updates: Partial<Cliente>): void => {
    if (import.meta.client) {
      const clients = getClients()
      const index = clients.findIndex((c) => c.id === clientId)
      if (index >= 0 && clients[index]) {
        clients[index] = { ...clients[index], ...updates, updatedAt: new Date().toISOString() } as Cliente
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
      }
    }
  }

  const removeClient = (clientId: string): void => {
    if (import.meta.client) {
      const clients = getClients().filter((c) => c.id !== clientId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
    }
  }

  const addVisita = (clientId: string, visita: Visita): void => {
    if (import.meta.client) {
      const clients = getClients()
      const cliente = clients.find((c) => c.id === clientId)
      if (cliente) {
        cliente.visitas.push(visita)
        cliente.updatedAt = new Date().toISOString()
        // Recalcular próxima visita baseada na recorrência
        cliente.proximaVisita = calcularProximaVisita(cliente) || cliente.proximaVisita
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
      }
    }
  }

  const getClientStats = (clients: Cliente[]): ClienteStats => {
    const now = new Date()
    const mesAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dias90Atras = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const anoAtras = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    let totalVendidoUltimoMes = 0
    let totalVendido90Dias = 0
    let totalVendidoAno = 0
    const clientesComVenda90Dias = new Set<string>()
    const produtosConsumidos: Record<string, number> = {}

    clients.forEach((cliente) => {
      cliente.visitas.forEach((visita) => {
        const dataVisita = new Date(visita.data)
        if (visita.vendeuAlgo && visita.valorVenda) {
          if (dataVisita >= mesAtras) {
            totalVendidoUltimoMes += visita.valorVenda
          }
          if (dataVisita >= dias90Atras) {
            totalVendido90Dias += visita.valorVenda
            clientesComVenda90Dias.add(cliente.id)
          }
          if (dataVisita >= anoAtras) {
            totalVendidoAno += visita.valorVenda
          }

          // Contar produtos - agora é ProdutoVendido[]
          visita.produtos?.forEach((produto) => {
            const nomeProduto = typeof produto === 'object' ? produto.nome : String(produto)
            const quantidade = typeof produto === 'object' ? produto.quantidade : 1
            produtosConsumidos[nomeProduto] = (produtosConsumidos[nomeProduto] || 0) + quantidade
          })
        }
      })
    })

    // Produto mais consumido
    let produtoMaisConsumido: string | undefined
    let maxCount = 0
    Object.entries(produtosConsumidos).forEach(([produto, count]) => {
      if (count > maxCount) {
        maxCount = count
        produtoMaisConsumido = produto
      }
    })

    // Última e próxima visita
    let ultimaVisitaDate: Date | undefined = undefined
    let proximaVisitaDate: Date | undefined = undefined

    clients.forEach((cliente) => {
      cliente.visitas.forEach((visita) => {
        const dataVisita = new Date(visita.data)
        if (dataVisita <= now && (!ultimaVisitaDate || dataVisita > ultimaVisitaDate)) {
          ultimaVisitaDate = dataVisita
        }
      })

      if (cliente.proximaVisita) {
        const proxVisita = new Date(cliente.proximaVisita)
        if (proxVisita > now && (!proximaVisitaDate || proxVisita < proximaVisitaDate)) {
          proximaVisitaDate = proxVisita
        }
      }
    })

    const diasAteProxima = proximaVisitaDate
      ? Math.ceil((proximaVisitaDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    return {
      totalClientes: clients.length,
      clientesAtivos: clientesComVenda90Dias.size,
      faturamentoMensal: totalVendidoUltimoMes,
      faturamentoAnual: totalVendidoAno,
      ultimaVisita: ultimaVisitaDate?.toISOString(),
      proximaVisita: proximaVisitaDate?.toISOString(),
      diasAteProxima,
      totalVendidoUltimoMes,
      totalVendido90Dias,
      totalVendidoAno,
      produtoMaisConsumido,
    }
  }

  return {
    getClients,
    saveClient,
    updateClient,
    removeClient,
    addVisita,
    getClientStats,
    getClientColor,
  }
}

// Dados mock (vazio - usuário vai cadastrar do zero)
function getMockClients(): Cliente[] {
  return []
}
