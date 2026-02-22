import { createError } from 'h3'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { getMongoDb } from '../../../../utils/mongo'

/**
 * DELETE /api/v1/produtos/:id/upload
 * Body: { type: "thumbnail" | "gallery" | "catalog", url?: string }
 * For gallery, url is required to identify which image to remove.
 */
export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id é obrigatório.' })

  const db = await getMongoDb()
  const existing = await db.collection('produtos').findOne({ _id: id })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado.' })

  const body = (await readBody(event).catch(() => ({}))) as { type?: string; url?: string }
  const { type, url } = body

  if (!type || !['thumbnail', 'gallery', 'catalog'].includes(type))
    throw createError({ statusCode: 400, statusMessage: 'Tipo inválido.' })

  const now = new Date().toISOString()

  async function tryDeleteFile(fileUrl: string) {
    if (!fileUrl.startsWith('/uploads/')) return
    try {
      const filePath = join(process.cwd(), 'public', fileUrl)
      await unlink(filePath)
    } catch {
      // ignore if file doesn't exist
    }
  }

  if (type === 'thumbnail') {
    const current = (existing as any).thumbnailUrl
    if (current) await tryDeleteFile(current)
    await db.collection('produtos').updateOne({ _id: id }, { $unset: { thumbnailUrl: '' }, $set: { updatedAt: now } })
  } else if (type === 'catalog') {
    const current = (existing as any).catalogPdfUrl
    if (current) await tryDeleteFile(current)
    await db.collection('produtos').updateOne({ _id: id }, { $unset: { catalogPdfUrl: '' }, $set: { updatedAt: now } })
  } else if (type === 'gallery') {
    if (!url) throw createError({ statusCode: 400, statusMessage: 'url é obrigatório para remoção de galeria.' })
    await tryDeleteFile(url)
    await db.collection('produtos').updateOne(
      { _id: id },
      { $pull: { galleryUrls: url } as any, $set: { updatedAt: now } }
    )
  }

  return { success: true }
})
