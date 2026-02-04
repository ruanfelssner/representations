import { useRuntimeConfig } from '#imports'
import { createError } from 'h3'
import { MongoClient } from 'mongodb'

type MongoState = {
  client: MongoClient
  connecting?: Promise<MongoClient>
  connected?: boolean
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoState: MongoState | undefined
}

function getMongoState(): MongoState {
  if (!globalThis.__mongoState) {
    const config = useRuntimeConfig()
    if (!config.mongoUri) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Mongo não configurado (NUXT_MONGO_URI).',
    })
    }
    globalThis.__mongoState = { client: new MongoClient(config.mongoUri) }
  }
  return globalThis.__mongoState
}

export async function getMongoDb() {
  const config = useRuntimeConfig()
  if (!config.mongoDbName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Mongo não configurado (NUXT_MONGO_DB_NAME).',
    })
  }

  const state = getMongoState()
  if (!state.connected) {
    state.connecting ||= state.client.connect()
    await state.connecting
    state.connected = true
  }
  return state.client.db(config.mongoDbName)
}
