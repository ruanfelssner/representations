export interface ProdutoVendido {
  produtoId: string
  nome: string
  quantidade: number
  precoUnitario: number
}

export interface Visita {
  id: string
  data: string // ISO date
  descricao: string
  vendeuAlgo: boolean
  valorVenda?: number
  produtos?: ProdutoVendido[]
  duracao?: number // em minutos
}

export type TipoRecorrencia = 'semanal' | 'quinzenal' | 'mensal' | 'bimestral' | 'trimestral'
export type SegmentoCliente = 'otica' | 'relojoaria' | 'semijoia' | 'multimarcas'
export type PorteCliente = 'pequeno' | 'medio' | 'grande'
export type PotencialCliente = 'baixo' | 'medio' | 'alto'

export interface Recorrencia {
  tipo: TipoRecorrencia
  diaPreferido?: number // 1-7 para semanal (seg-dom), 1-31 para mensal
  ativo: boolean
}

export interface Cliente {
  id: string
  nome: string
  lat: number
  lng: number
  endereco: string
  cidade: string
  estado: string
  telefone?: string
  email?: string
  visitas: Visita[]
  proximaVisita?: string // ISO date
  createdAt: string
  updatedAt: string
  color: string
  tipo: 'cliente' | 'prospecto' | 'inativo'
  segmento: SegmentoCliente
  porte?: PorteCliente
  potencial?: PotencialCliente
  recorrencia?: Recorrencia
  observacoes?: string
}

export interface ClienteStats {
  totalClientes: number
  clientesAtivos: number
  faturamentoMensal: number
  faturamentoAnual: number
  ultimaVisita?: string
  proximaVisita?: string
  diasAteProxima?: number
  totalVendidoUltimoMes: number
  totalVendido90Dias: number
  totalVendidoAno: number
  produtoMaisConsumido?: string
}
