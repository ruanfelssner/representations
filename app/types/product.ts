export type ProdutoCategoriaUi = 'oculos' | 'relogio' | 'semijoia' | 'acessorio'

export type ProdutoUi = {
  id: string
  nome: string
  categoria: ProdutoCategoriaUi
  valor: number
  codigo?: string
  descricao?: string
}

export const PRODUTOS_MOCK: ProdutoUi[] = [
  {
    id: 'oc-001',
    nome: 'Óculos de Sol Ray-Ban Aviador',
    categoria: 'oculos',
    valor: 450,
    codigo: 'RB-AVI-001',
    descricao: 'Modelo clássico aviador com proteção UV',
  },
  {
    id: 'rel-001',
    nome: 'Relógio Casio G-Shock',
    categoria: 'relogio',
    valor: 650,
    codigo: 'CSO-GSH-001',
    descricao: 'Resistente a água e impactos',
  },
  {
    id: 'sj-001',
    nome: 'Colar Folheado Ouro 18k',
    categoria: 'semijoia',
    valor: 120,
    codigo: 'FOL-COL-001',
    descricao: 'Corrente veneziana 45cm',
  },
  {
    id: 'ac-001',
    nome: 'Estojo Rígido para Óculos',
    categoria: 'acessorio',
    valor: 35,
    codigo: 'EST-RIG-001',
    descricao: 'Proteção premium para armações',
  },
]

