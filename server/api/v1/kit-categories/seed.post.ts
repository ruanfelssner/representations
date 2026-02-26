import { randomUUID } from 'node:crypto'
import { getMongoDb } from '../../../utils/mongo'
import { DefaultKitCategories } from '~/types/schemas'
import { toKitCategoryApi } from '../../../utils/kits'

export default defineEventHandler(async () => {
  const db = await getMongoDb()
  const now = new Date().toISOString()

  for (const item of DefaultKitCategories) {
    await db.collection('kitCategories').updateOne(
      { slug: item.slug },
      {
        $set: {
          nome: item.nome,
          ordem: item.ordem,
          ativo: true,
          updatedAt: now,
        },
        $setOnInsert: {
          _id: `kit-category-${randomUUID()}`,
          createdAt: now,
        },
      },
      { upsert: true }
    )
  }

  const categories = await db
    .collection('kitCategories')
    .find({})
    .sort({ ordem: 1, nome: 1 })
    .toArray()

  return { success: true, data: categories.map(toKitCategoryApi) }
})
