import { getMongoDb } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  const db = await getMongoDb()
  const clients = await db
    .collection('clients')
    .find({}, { projection: { rawOrders: 0 } })
    .toArray()

  const mapped = clients.map((c: any) => {
    const { _id, ...rest } = c
    return { ...rest, id: _id }
  })

  const center = mapped.reduce(
    (acc: { lat: number; lng: number; n: number }, c: any) => {
      if (typeof c.lat === 'number' && typeof c.lng === 'number') {
        acc.lat += c.lat
        acc.lng += c.lng
        acc.n += 1
      }
      return acc
    },
    { lat: 0, lng: 0, n: 0 }
  )

  const mapSettings =
    center.n > 0
      ? { center: { lat: center.lat / center.n, lng: center.lng / center.n }, zoom: 7 }
      : { center: { lat: -27.5954, lng: -48.548 }, zoom: 7 }

  return { success: true, data: { clients: mapped, mapSettings } }
})
