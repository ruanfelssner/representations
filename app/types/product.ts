export type CategoriaSegmento = 'oculos' | 'relogio' | 'semijoia' | 'acessorio'

export interface Produto {
  id: string
  nome: string
  categoria: CategoriaSegmento
  preco: number
  codigo?: string // SKU
  descricao?: string
}

export const PRODUTOS_MOCK: Produto[] = [
  // Óculos
  {
    id: 'oc-001',
    nome: 'Óculos de Sol Ray-Ban Aviador',
    categoria: 'oculos',
    preco: 450,
    codigo: 'RB-AVI-001',
    descricao: 'Modelo clássico aviador com proteção UV',
  },
  {
    id: 'oc-002',
    nome: 'Armação Oakley Sport',
    categoria: 'oculos',
    preco: 380,
    codigo: 'OAK-SPT-002',
    descricao: 'Armação esportiva de alto desempenho',
  },
  {
    id: 'oc-003',
    nome: 'Óculos de Grau Prada Feminino',
    categoria: 'oculos',
    preco: 890,
    codigo: 'PRD-FEM-003',
    descricao: 'Armação premium feminina italiana',
  },
  {
    id: 'oc-004',
    nome: 'Óculos de Sol Polarizado',
    categoria: 'oculos',
    preco: 280,
    codigo: 'POL-SOL-004',
    descricao: 'Lente polarizada anti-reflexo',
  },
  {
    id: 'oc-005',
    nome: 'Armação Infantil Disney',
    categoria: 'oculos',
    preco: 180,
    codigo: 'DIS-INF-005',
    descricao: 'Linha infantil com personagens Disney',
  },

  // Relógios
  {
    id: 'rel-001',
    nome: 'Relógio Casio G-Shock',
    categoria: 'relogio',
    preco: 650,
    codigo: 'CSO-GSH-001',
    descricao: 'Resistente a água e impactos',
  },
  {
    id: 'rel-002',
    nome: 'Relógio Orient Automático',
    categoria: 'relogio',
    preco: 1200,
    codigo: 'ORI-AUT-002',
    descricao: 'Movimento automático japonês',
  },
  {
    id: 'rel-003',
    nome: 'Smartwatch Samsung Galaxy Watch',
    categoria: 'relogio',
    preco: 1800,
    codigo: 'SAM-GAL-003',
    descricao: 'Smartwatch com monitor cardíaco',
  },
  {
    id: 'rel-004',
    nome: 'Relógio Technos Masculino',
    categoria: 'relogio',
    preco: 450,
    codigo: 'TEC-MAS-004',
    descricao: 'Design clássico social',
  },
  {
    id: 'rel-005',
    nome: 'Relógio Feminino Seculus',
    categoria: 'relogio',
    preco: 320,
    codigo: 'SEC-FEM-005',
    descricao: 'Delicado com pulseira de couro',
  },

  // Semi-joias
  {
    id: 'sj-001',
    nome: 'Colar Folheado Ouro 18k',
    categoria: 'semijoia',
    preco: 120,
    codigo: 'FOL-COL-001',
    descricao: 'Corrente veneziana 45cm',
  },
  {
    id: 'sj-002',
    nome: 'Brinco Argola Média Dourada',
    categoria: 'semijoia',
    preco: 85,
    codigo: 'ARG-BRI-002',
    descricao: 'Argola 3cm banho ouro',
  },
  {
    id: 'sj-003',
    nome: 'Anel Solitário Zircônia',
    categoria: 'semijoia',
    preco: 95,
    codigo: 'ZIR-ANE-003',
    descricao: 'Anel com pedra zircônia cúbica',
  },
  {
    id: 'sj-004',
    nome: 'Pulseira Riviera Folheada',
    categoria: 'semijoia',
    preco: 150,
    codigo: 'RIV-PUL-004',
    descricao: 'Pulseira com zircônias',
  },
  {
    id: 'sj-005',
    nome: 'Conjunto Colar + Brinco Prata',
    categoria: 'semijoia',
    preco: 180,
    codigo: 'CON-PRA-005',
    descricao: 'Set completo banho prata',
  },

  // Acessórios
  {
    id: 'ac-001',
    nome: 'Estojo Rígido para Óculos',
    categoria: 'acessorio',
    preco: 35,
    codigo: 'EST-RIG-001',
    descricao: 'Proteção premium para armações',
  },
  {
    id: 'ac-002',
    nome: 'Pulseira Extra para Relógio',
    categoria: 'acessorio',
    preco: 80,
    codigo: 'PUL-REL-002',
    descricao: 'Pulseira intercambiável em couro',
  },
  {
    id: 'ac-003',
    nome: 'Kit Limpeza Premium',
    categoria: 'acessorio',
    preco: 45,
    codigo: 'LIM-KIT-003',
    descricao: 'Spray + flanela microfibra',
  },
  {
    id: 'ac-004',
    nome: 'Expositor para Joias',
    categoria: 'acessorio',
    preco: 120,
    codigo: 'EXP-JOI-004',
    descricao: 'Display acrílico para vitrine',
  },
]

export const CATEGORIAS_SEGMENTO = [
  { value: 'oculos', label: '👓 Óculos' },
  { value: 'relogio', label: '⌚ Relógios' },
  { value: 'semijoia', label: '💍 Semi-joias' },
  { value: 'acessorio', label: '🎁 Acessórios' },
]
