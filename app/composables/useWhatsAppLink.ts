import type { WhatsAppPreviewResponse } from '~/types/schemas'
import { WhatsAppPreviewResponseSchema } from '~/types/schemas'

type ApiResponse<T> = { success: boolean; data: T }

export function useWhatsAppLink() {
  /**
   * Gera preview da mensagem com variáveis resolvidas
   */
  const generatePreview = async (
    clientId: string,
    templateId: string,
    variationIndex?: number
  ): Promise<WhatsAppPreviewResponse> => {
    const res = await $fetch<ApiResponse<unknown>>('/api/v1/whatsapp/preview', {
      method: 'POST',
      body: {
        clientId,
        templateId,
        variationIndex,
      },
    })
    
    // Validar estrutura antes de parsear
    if (!res.data || typeof res.data !== 'object') {
      throw new Error('Resposta inválida do servidor')
    }
    
    const parsed = WhatsAppPreviewResponseSchema.safeParse(res.data)
    
    if (!parsed.success) {
      throw new Error('Dados de resposta inválidos')
    }
    
    return parsed.data
  }

  /**
   * Abre WhatsApp em nova aba
   */
  const openWhatsApp = (waLink: string) => {
    window.open(waLink, '_blank')
  }

  return {
    generatePreview,
    openWhatsApp,
  }
}
