import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { toKitApi } from '../../../utils/kits'

type DefaultKitSeed = {
  codigo: string
  nome: string
  categoriaSlug: string
  descricaoRapida: string
  descricaoCompleta: string
  dimensoes: string
  pesoUnitario: number
  precoUnitario: number
  imagemAlt: string
}

const DEFAULT_SIZES = Array.from({ length: 18 }, (_, index) => String(index + 14))

const DEFAULT_KITS: DefaultKitSeed[] = [
  {
    codigo: 'AEX0100',
    nome: 'Kit Aço + Ouro 4,3mm',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 4,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensoes: '2,00 mm x 4,30 mm',
    pesoUnitario: 2.42,
    precoUnitario: 340,
    imagemAlt: 'Kit AEX0100 aliança 4,3mm aço e ouro',
  },
  {
    codigo: 'AEX0101',
    nome: 'Kit Aço + Ouro 5,3mm',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 5,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensoes: '2,00 mm x 5,30 mm',
    pesoUnitario: 2.35,
    precoUnitario: 390,
    imagemAlt: 'Kit AEX0101 aliança 5,3mm aço e ouro',
  },
  {
    codigo: 'AEX0102',
    nome: 'Kit Aço + Ouro 6,3mm',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 6,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensoes: '2,00 mm x 6,30 mm',
    pesoUnitario: 2.84,
    precoUnitario: 450,
    imagemAlt: 'Kit AEX0102 aliança 6,3mm aço e ouro',
  },
  {
    codigo: 'AEX0105',
    nome: 'Kit Aço + Ouro 7,3mm',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 7,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensoes: '2,00 mm x 7,30 mm',
    pesoUnitario: 3.19,
    precoUnitario: 510,
    imagemAlt: 'Kit AEX0105 aliança 7,3mm aço e ouro',
  },
  {
    codigo: 'AEX0112',
    nome: 'Kit Aço + Ouro 5,3mm Chanfrada',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial reta chanfrada (desquinada) anatômica em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 5,3mm, envelopada aço e ouro 416 (10k) chanfrada anatômica.',
    dimensoes: '2,00 mm x 5,30 mm',
    pesoUnitario: 2.35,
    precoUnitario: 390,
    imagemAlt: 'Kit AEX0112 aliança 5,3mm chanfrada aço e ouro',
  },
  {
    codigo: 'AEX0113',
    nome: 'Kit Aço + Ouro 3,3mm',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 3,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensoes: '1,90 mm x 3,30 mm',
    pesoUnitario: 1.54,
    precoUnitario: 310,
    imagemAlt: 'Kit AEX0113 aliança 3,3mm aço e ouro',
  },
  {
    codigo: 'AEX0114',
    nome: 'Kit Aço + Ouro 6mm Reta',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial reta anatômica em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 6mm, envelopada aço e ouro 416 (10k) reta anatômica.',
    dimensoes: '1,90 mm x 6,00 mm',
    pesoUnitario: 2.84,
    precoUnitario: 450,
    imagemAlt: 'Kit AEX0114 aliança 6mm reta aço e ouro',
  },
  {
    codigo: 'AEX0117',
    nome: 'Kit Aço + Ouro 4mm Reta',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial reta anatômica em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 4mm, envelopada aço e ouro 416 (10k) reta anatômica.',
    dimensoes: '2,00 mm x 4,00 mm',
    pesoUnitario: 1.76,
    precoUnitario: 340,
    imagemAlt: 'Kit AEX0117 aliança 4mm reta aço e ouro',
  },
  {
    codigo: 'AEX0213',
    nome: 'Kit Aço + Ouro 3mm Reta',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial reta anatômica em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 3mm, envelopada aço e ouro 416 (10k) reta anatômica.',
    dimensoes: '1,90 mm x 3,00 mm',
    pesoUnitario: 2.24,
    precoUnitario: 310,
    imagemAlt: 'Kit AEX0213 aliança 3mm reta aço e ouro',
  },
  {
    codigo: 'AEX0214',
    nome: 'Kit Aço + Ouro 4mm Friso Central',
    categoriaSlug: 'aco-e-ouro',
    descricaoRapida: 'Especial reta anatômica com friso central em aço e ouro 416 (10k).',
    descricaoCompleta: 'Aliança 4mm, envelopada aço e ouro 416 (10k) com friso central anatômica.',
    dimensoes: '2,00 mm x 4,00 mm',
    pesoUnitario: 2.34,
    precoUnitario: 362,
    imagemAlt: 'Kit AEX0214 aliança 4mm com friso central aço e ouro',
  },
]

export default defineEventHandler(async () => {
  const db = await getMongoDb()
  const now = new Date().toISOString()

  const categories = await db.collection('kitCategories').find({ ativo: true }).toArray()
  const categoriesBySlug = new Map(
    categories.map((category) => [String((category as any).slug), String((category as any)._id)])
  )

  const missingCategories = Array.from(
    new Set(
      DEFAULT_KITS
        .map((kit) => kit.categoriaSlug)
        .filter((slug) => !categoriesBySlug.has(slug))
    )
  )

  if (missingCategories.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Categorias ausentes para seed de kits: ${missingCategories.join(', ')}.`,
    })
  }

  const products = await db
    .collection('produtos')
    .find({ codigo: { $in: DEFAULT_KITS.map((kit) => kit.codigo) } })
    .toArray()
  const productIdByCode = new Map(
    products.map((product) => [String((product as any).codigo), String((product as any)._id)])
  )

  let inserted = 0

  for (const seed of DEFAULT_KITS) {
    const categoriaId = categoriesBySlug.get(seed.categoriaSlug)!
    const produtoReferenciaId = productIdByCode.get(seed.codigo)

    const insertDoc: Record<string, any> = {
      _id: `kit-${seed.codigo.toLowerCase()}`,
      codigo: seed.codigo,
      nome: seed.nome,
      categoriaId,
      descricaoRapida: seed.descricaoRapida,
      descricaoCompleta: seed.descricaoCompleta,
      precoUnitario: seed.precoUnitario,
      tamanhosDisponiveis: DEFAULT_SIZES,
      destaque: false,
      ativo: true,
      imagemAlt: seed.imagemAlt,
      dimensoes: seed.dimensoes,
      pesoUnitario: seed.pesoUnitario,
      nota: 'Valores unitários e peso podem variar levemente conforme acabamento, aro e personalização.',
      galeriaFileIds: [],
      createdAt: now,
      updatedAt: now,
    }

    if (produtoReferenciaId) {
      insertDoc.produtoReferenciaId = produtoReferenciaId
    }

    const result = await db.collection('kits').updateOne(
      { codigo: seed.codigo },
      { $setOnInsert: insertDoc },
      { upsert: true }
    )

    if (result.upsertedCount > 0) {
      inserted += 1
    }
  }

  const kits = await db
    .collection('kits')
    .find({ codigo: { $in: DEFAULT_KITS.map((kit) => kit.codigo) } })
    .sort({ codigo: 1 })
    .toArray()

  const categoryIds = Array.from(
    new Set(kits.map((kit) => String((kit as any).categoriaId)).filter(Boolean))
  )
  const categoriesForResponse =
    categoryIds.length > 0
      ? await db.collection('kitCategories').find({ _id: { $in: categoryIds } }).toArray()
      : []
  const categoriesById = new Map(
    categoriesForResponse.map((category) => [String((category as any)._id), category])
  )

  return {
    success: true,
    meta: {
      totalDefault: DEFAULT_KITS.length,
      inserted,
      skipped: DEFAULT_KITS.length - inserted,
    },
    data: kits.map((kit) => toKitApi(kit, categoriesById)),
  }
})
