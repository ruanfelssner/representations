import { defineEventHandler, readBody } from 'h3'
import { getMongoDb } from '../../utils/mongo'
import { z } from 'zod'

const UpdateSettingsSchema = z.object({
  commissionRate: z.number().min(0).max(1), // 0 a 100% (representado como 0.0 a 1.0)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = UpdateSettingsSchema.parse(body)

    const db = await getMongoDb()
    const settingsCollection = db.collection('settings')

    // Atualizar ou inserir documento de configurações globais
    await settingsCollection.updateOne(
      { _id: 'global' } as any,
      {
        $set: {
          commissionRate: validated.commissionRate,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return {
      success: true,
      message: 'Configurações atualizadas com sucesso',
      data: {
        commissionRate: validated.commissionRate,
      },
    }
  } catch (err: any) {
    console.error('[settings.post] Erro ao salvar configurações:', err)
    
    if (err.name === 'ZodError') {
      return {
        success: false,
        error: 'Dados inválidos',
        details: err.errors,
      }
    }

    return {
      success: false,
      error: 'Erro ao salvar configurações',
    }
  }
})
