import { z } from 'zod'
import type { WhatsAppTemplateDto, WhatsAppTemplateCreate, WhatsAppTemplateUpdate, TriggerType } from '~/types/schemas'
import { WhatsAppTemplateDtoSchema } from '~/types/schemas'

type ApiResponse<T> = { success: boolean; data: T }

export function useWhatsAppTemplates() {
  const fetchTemplates = async (opts?: {
    triggerType?: TriggerType
    active?: boolean
  }) => {
    const params = new URLSearchParams()
    if (opts?.triggerType) params.set('triggerType', opts.triggerType)
    if (opts?.active !== undefined) params.set('active', String(opts.active))
    const query = params.size ? `?${params.toString()}` : ''

    const res = await $fetch<ApiResponse<unknown[]>>(`/api/v1/whatsapp-templates${query}`)
    const parsed = z.array(WhatsAppTemplateDtoSchema).parse(res.data)
    return parsed as WhatsAppTemplateDto[]
  }

  const createTemplate = async (payload: WhatsAppTemplateCreate) => {
    const res = await $fetch<ApiResponse<unknown>>('/api/v1/whatsapp-templates', {
      method: 'POST',
      body: payload,
    })
    return WhatsAppTemplateDtoSchema.parse(res.data) as WhatsAppTemplateDto
  }

  const updateTemplate = async (id: string, updates: WhatsAppTemplateUpdate) => {
    const res = await $fetch<ApiResponse<unknown>>(`/api/v1/whatsapp-templates/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: updates,
    })
    return WhatsAppTemplateDtoSchema.parse(res.data) as WhatsAppTemplateDto
  }

  const deleteTemplate = async (id: string) => {
    await $fetch<ApiResponse<unknown>>(`/api/v1/whatsapp-templates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateTemplate(id, { isActive })
  }

  return {
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleActive,
  }
}
