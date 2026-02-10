/**
 * Utilitários para WhatsApp
 */

/**
 * Normaliza número de telefone para formato WhatsApp
 * - Remove caracteres não numéricos
 * - Adiciona DDI +55 se não tiver
 * - Valida formato mínimo (10-11 dígitos)
 */
export function normalizePhoneBR(phone: string | undefined): string | null {
  if (!phone) return null

  // Remove tudo que não é número
  const clean = phone.replace(/\D/g, '')

  // Se já tem DDI (55), usa direto
  if (clean.startsWith('55') && clean.length >= 12) {
    return `+${clean}`
  }

  // Se não tem DDI, adiciona +55
  if (clean.length >= 10 && clean.length <= 11) {
    return `+55${clean}`
  }

  // Formato inválido
  return null
}

/**
 * Mapeia variáveis disponíveis de um cliente
 */
export function extractClientVariables(client: any): Record<string, string> {
  const vars: Record<string, string> = {
    nome: client?.nome || '',
    empresa: client?.nome || '',
    cidade: client?.endereco?.cidade || client?.cidade || '',
    estado: client?.endereco?.uf || client?.estado || '',
    atendente: 'Marcus', // Default - pode vir de user futuramente
    linha: 'alianças e joias',
  }

  // Última compra
  if (client?.sales?.lastSaleAt) {
    const date = new Date(client.sales.lastSaleAt)
    vars.ultimaCompraData = date.toLocaleDateString('pt-BR')
  }

  if (client?.sales?.lastSaleItems) {
    vars.ultimaCompraItens = client.sales.lastSaleItems
  }

  return vars
}

/**
 * Resolve placeholders {{variavel}} em um template
 */
export function resolveTemplateVars(template: string, variables: Record<string, string>): string {
  let resolved = template

  // Substituir cada variável
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    resolved = resolved.replace(regex, value || '')
  }

  // Limpar variáveis não resolvidas (fallback vazio)
  resolved = resolved.replace(/\{\{[^}]+\}\}/g, '')

  return resolved.trim()
}

/**
 * Constrói link wa.me
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const normalizedPhone = normalizePhoneBR(phone)
  if (!normalizedPhone) {
    throw new Error('Telefone inválido')
  }

  // Remove o + do telefone para wa.me
  const phoneNumber = normalizedPhone.replace('+', '')
  
  // URL encode da mensagem
  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}

/**
 * Resolve template completo: escolhe variação + substitui vars + gera link
 */
export function resolveWhatsAppTemplate(
  template: { messageBody: string; variations?: string[] },
  client: any,
  variationIndex?: number
): { message: string; waLink: string; variables: Record<string, string> } {
  // Escolher texto (variação ou principal)
  let text = template.messageBody
  if (
    variationIndex !== undefined &&
    template.variations &&
    template.variations[variationIndex]
  ) {
    text = template.variations[variationIndex]
  }

  // Extrair variáveis
  const variables = extractClientVariables(client)

  // Resolver template
  const message = resolveTemplateVars(text, variables)

  // Gerar link
  const waLink = buildWhatsAppLink(client.telefone, message)

  return { message, waLink, variables }
}
