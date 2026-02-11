import { defineEventHandler } from 'h3'
import { getMongoDb } from '../../utils/mongo'

export default defineEventHandler(async (event) => {
  try {
    const db = await getMongoDb()
    const settingsCollection = db.collection('settings')

    // Buscar configurações globais (documento único com _id "global")
    let settings = await settingsCollection.findOne({ _id: 'global' } as any)

    // Se não existir, criar com valores padrão
    if (!settings) {
      settings = {
        _id: 'global',
        commissionRate: 0.15, // 15% padrão
        updatedAt: new Date(),
      }
      await settingsCollection.insertOne(settings)
    }

    return {
      success: true,
      data: {
        commissionRate: settings.commissionRate || 0.15,
        monthlyGoals: settings.monthlyGoals || {},
      },
    }
  } catch (err) {
    console.error('[settings.get] Erro ao buscar configurações:', err)
    return {
      success: false,
      error: 'Erro ao buscar configurações',
      data: {
        commissionRate: 0.15, // fallback
        monthlyGoals: {},
      },
    }
  }
})
