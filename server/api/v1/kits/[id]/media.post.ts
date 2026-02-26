import { createError } from 'h3'
import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import { getMongoDb } from '../../../../utils/mongo'
import { getKitMediaBucket, parseGridFsFileId, toKitMediaUrl } from '../../../../utils/kits'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8 MB

async function uploadImageFile(
  bucket: ReturnType<typeof getKitMediaBucket>,
  file: NonNullable<Awaited<ReturnType<typeof readMultipartFormData>>>[number],
  metadata: Record<string, any>
) {
  const ext = extname(file.filename || '').toLowerCase() || '.jpg'
  const filename = `${Date.now()}-${randomUUID()}${ext}`

  return await new Promise<string>((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      contentType: file.type || 'application/octet-stream',
      metadata,
    })

    stream.on('error', reject)
    stream.on('finish', () => resolve(String(stream.id)))
    stream.end(file.data)
  })
}

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const existing = await db.collection('kits').findOne({ _id: id })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kit não encontrado.' })

  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado.' })
  }

  const typeField = parts.find((part) => part.name === 'type')
  const uploadType = typeField ? Buffer.from(typeField.data).toString().trim() : ''
  if (!['cover', 'gallery'].includes(uploadType)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo inválido. Use: cover ou gallery.' })
  }

  const imageFiles = parts.filter((part) => part.name === 'file' && part.filename && part.data?.length)
  if (!imageFiles.length) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo de imagem é obrigatório.' })
  }

  if (uploadType === 'cover' && imageFiles.length > 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A foto destaque aceita apenas 1 arquivo por envio.',
    })
  }

  for (const file of imageFiles) {
    const mimeType = (file.type || '').toLowerCase()
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      throw createError({
        statusCode: 415,
        statusMessage: 'Imagem deve ser JPEG, PNG ou WebP.',
      })
    }
    if (file.data.length > MAX_IMAGE_BYTES) {
      throw createError({ statusCode: 413, statusMessage: 'Arquivo muito grande. Máximo: 8 MB.' })
    }
  }

  const bucket = getKitMediaBucket(db)
  const now = new Date().toISOString()
  const uploadedFileIds: string[] = []

  for (const file of imageFiles) {
    const fileId = await uploadImageFile(bucket, file, {
      kitId: id,
      type: uploadType,
      uploadedAt: now,
    })
    uploadedFileIds.push(fileId)
  }

  if (uploadType === 'cover') {
    const currentCoverId = (existing as any).fotoDestaqueFileId
    if (typeof currentCoverId === 'string' && currentCoverId) {
      try {
        await bucket.delete(parseGridFsFileId(currentCoverId))
      } catch {
        // ignore missing previous file
      }
    }

    await db.collection('kits').updateOne(
      { _id: id },
      {
        $set: { fotoDestaqueFileId: uploadedFileIds[0], updatedAt: now },
      }
    )
  } else {
    await db.collection('kits').updateOne(
      { _id: id },
      {
        $push: { galeriaFileIds: { $each: uploadedFileIds } } as any,
        $set: { updatedAt: now },
      }
    )
  }

  return {
    success: true,
    data: uploadedFileIds.map((fileId) => ({
      fileId,
      url: toKitMediaUrl(fileId),
    })),
  }
})
