import { createError } from 'h3'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { getMongoDb } from '../../../../utils/mongo'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_PDF_TYPE = 'application/pdf'
const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8 MB
const MAX_PDF_BYTES = 32 * 1024 * 1024 // 32 MB

/**
 * POST /api/v1/produtos/:id/upload
 * Multipart form-data fields:
 *   - type: "thumbnail" | "gallery" | "catalog"
 *   - file: the file to upload
 */
export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const existing = await db.collection('produtos').findOne({ _id: id })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado.' })

  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0)
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado.' })

  const typeField = parts.find((p) => p.name === 'type')
  const fileField = parts.find((p) => p.name === 'file' && p.filename)

  if (!typeField || !fileField)
    throw createError({ statusCode: 400, statusMessage: 'Campos "type" e "file" são obrigatórios.' })

  const uploadType = Buffer.from(typeField.data).toString()
  if (!['thumbnail', 'gallery', 'catalog'].includes(uploadType))
    throw createError({ statusCode: 400, statusMessage: 'Tipo inválido. Use: thumbnail, gallery ou catalog.' })

  const mime = fileField.type || ''
  const isImage = ALLOWED_IMAGE_TYPES.includes(mime)
  const isPdf = mime === ALLOWED_PDF_TYPE

  if (uploadType === 'catalog' && !isPdf)
    throw createError({ statusCode: 415, statusMessage: 'Catálogo deve ser um arquivo PDF.' })

  if ((uploadType === 'thumbnail' || uploadType === 'gallery') && !isImage)
    throw createError({ statusCode: 415, statusMessage: 'Imagem deve ser JPEG, PNG ou WebP.' })

  const maxBytes = uploadType === 'catalog' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES
  if (fileField.data.length > maxBytes)
    throw createError({ statusCode: 413, statusMessage: `Arquivo muito grande. Máximo: ${maxBytes / 1024 / 1024} MB.` })

  const ext = extname(fileField.filename || '').toLowerCase() || (isPdf ? '.pdf' : '.jpg')
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_')
  const timestamp = Date.now()
  const filename = `${timestamp}${ext}`

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'produtos', safeId)
  await mkdir(uploadDir, { recursive: true })

  const filePath = join(uploadDir, filename)
  await writeFile(filePath, fileField.data)

  const publicUrl = `/uploads/produtos/${safeId}/${filename}`
  const now = new Date().toISOString()

  if (uploadType === 'thumbnail') {
    await db.collection('produtos').updateOne({ _id: id }, { $set: { thumbnailUrl: publicUrl, updatedAt: now } })
  } else if (uploadType === 'gallery') {
    await db.collection('produtos').updateOne(
      { _id: id },
      { $push: { galleryUrls: publicUrl } as any, $set: { updatedAt: now } }
    )
  } else if (uploadType === 'catalog') {
    await db.collection('produtos').updateOne({ _id: id }, { $set: { catalogPdfUrl: publicUrl, updatedAt: now } })
  }

  return { success: true, url: publicUrl }
})
