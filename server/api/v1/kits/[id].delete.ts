import { createError } from 'h3'
import { getMongoDb } from '../../../utils/mongo'
import { getKitMediaBucket, parseGridFsFileId } from '../../../utils/kits'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const existing = await db.collection('kits').findOne({ _id: id })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kit não encontrado.' })

  const fileIds = [
    ...((typeof (existing as any).fotoDestaqueFileId === 'string'
      ? [(existing as any).fotoDestaqueFileId]
      : []) as string[]),
    ...((Array.isArray((existing as any).galeriaFileIds) ? (existing as any).galeriaFileIds : []) as string[]),
  ]

  if (fileIds.length) {
    const bucket = getKitMediaBucket(db)
    for (const fileId of fileIds) {
      try {
        await bucket.delete(parseGridFsFileId(fileId))
      } catch {
        // ignore missing/corrupted file references
      }
    }
  }

  await db.collection('kits').deleteOne({ _id: id })
  return { success: true }
})
