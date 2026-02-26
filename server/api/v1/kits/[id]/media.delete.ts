import { createError } from 'h3'
import { z } from 'zod'
import { getMongoDb } from '../../../../utils/mongo'
import { getKitMediaBucket, parseGridFsFileId } from '../../../../utils/kits'

const DeleteMediaSchema = z.object({
  type: z.enum(['cover', 'gallery']),
  fileId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const body = (await readBody(event).catch(() => ({}))) as unknown
  const validated = DeleteMediaSchema.safeParse(body)
  if (!validated.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validated.error.issues[0]?.message || 'Payload inválido.',
      data: { issues: validated.error.issues },
    })
  }

  const db = await getMongoDb()
  const existing = await db.collection('kits').findOne({ _id: id })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kit não encontrado.' })

  const bucket = getKitMediaBucket(db)
  const now = new Date().toISOString()

  if (validated.data.type === 'cover') {
    const coverId = (existing as any).fotoDestaqueFileId
    if (typeof coverId === 'string' && coverId) {
      try {
        await bucket.delete(parseGridFsFileId(coverId))
      } catch {
        // ignore if file does not exist
      }
    }

    await db.collection('kits').updateOne(
      { _id: id },
      { $unset: { fotoDestaqueFileId: '' }, $set: { updatedAt: now } }
    )
    return { success: true }
  }

  const fileId = validated.data.fileId
  if (!fileId) {
    throw createError({ statusCode: 400, statusMessage: 'fileId é obrigatório para galeria.' })
  }

  const galleryIds = (Array.isArray((existing as any).galeriaFileIds)
    ? (existing as any).galeriaFileIds
    : []) as string[]

  if (!galleryIds.includes(fileId)) {
    throw createError({ statusCode: 404, statusMessage: 'Imagem de galeria não encontrada no kit.' })
  }

  try {
    await bucket.delete(parseGridFsFileId(fileId))
  } catch {
    // ignore if file does not exist
  }

  await db.collection('kits').updateOne(
    { _id: id },
    { $pull: { galeriaFileIds: fileId } as any, $set: { updatedAt: now } }
  )

  return { success: true }
})
