import { createError, sendStream, setHeader } from 'h3'
import { getMongoDb } from '../../../../utils/mongo'
import { getKitMediaBucket, parseGridFsFileId } from '../../../../utils/kits'

export default defineEventHandler(async (event) => {
  const { fileId } = getRouterParams(event)
  if (!fileId) throw createError({ statusCode: 400, statusMessage: 'fileId é obrigatório.' })

  const db = await getMongoDb()
  const bucket = getKitMediaBucket(db)
  const objectId = parseGridFsFileId(fileId)

  const files = await bucket.find({ _id: objectId }).limit(1).toArray()
  const file = files[0]
  if (!file) throw createError({ statusCode: 404, statusMessage: 'Imagem não encontrada.' })

  setHeader(event, 'Content-Type', file.contentType || 'application/octet-stream')
  setHeader(event, 'Content-Length', String(file.length || 0))
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return sendStream(event, bucket.openDownloadStream(objectId))
})
