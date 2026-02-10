<template>
  <NModal v-model="isOpen" title="Importar PDF" size="lg">
    <div class="space-y-6">
      <NLayer variant="paper" size="sm" radius="soft" class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <input
            ref="fileInput"
            type="file"
            accept="application/pdf"
            class="sr-only"
            @change="handleFileChange"
          />
          <NButton
            variant="primary"
            size="sm"
            leading-icon="mdi:file-pdf-box"
            :disabled="isParsing"
            @click="triggerFilePicker"
          >
            Selecionar PDF
          </NButton>
          <NTypo size="xs" tone="muted" class="truncate">
            {{ fileName || 'Nenhum arquivo selecionado' }}
          </NTypo>
        </div>
        <div v-if="parseError" class="rounded-xl border border-red-200 bg-red-50 p-3">
          <NTypo size="sm" tone="danger">{{ parseError }}</NTypo>
        </div>
        <div v-else-if="isParsing" class="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <NTypo size="sm" tone="muted">Lendo PDF...</NTypo>
        </div>
      </NLayer>

      <div v-if="parsed" class="space-y-4">
        <NLayer variant="paper" size="sm" radius="soft" class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <NTypo size="xs" tone="muted">Documento</NTypo>
            <NTypo size="sm" weight="semibold">{{ documentId || 'Nao encontrado' }}</NTypo>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <NTypo size="xs" tone="muted">Pedido</NTypo>
            <NInput v-model="pedidoCodigo" type="text" size="sm" class="max-w-[160px]" />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <NTypo size="xs" tone="muted">Data da venda</NTypo>
            <NInput v-model="saleDate" type="datetime-local" size="sm" class="max-w-[220px]" />
          </div>
        </NLayer>

        <NLayer variant="paper" size="sm" radius="soft" class="space-y-3">
          <div class="flex items-center justify-between">
            <NTypo size="sm" weight="semibold">Itens detectados</NTypo>
            <NTypo size="xs" tone="muted">{{ items.length }}</NTypo>
          </div>
          <div v-if="!items.length" class="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <NTypo size="sm" tone="muted">Nenhum item valido encontrado.</NTypo>
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(item, index) in items"
              :key="`${item.ref}-${index}`"
              class="rounded-lg border border-stone-200 bg-white p-3"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <NTypo size="sm" weight="semibold">{{ item.ref }}</NTypo>
                  <NTypo size="xs" tone="muted">{{ item.descricao }}</NTypo>
                </div>
                <div class="text-right">
                  <NTypo size="xs" tone="muted">Qtd</NTypo>
                  <NTypo size="sm" weight="semibold">{{ item.quantidade }}</NTypo>
                </div>
                <div class="text-right">
                  <NTypo size="xs" tone="muted">Total</NTypo>
                  <NTypo size="sm" weight="semibold">{{ formatCurrency(item.valorTotal) }}</NTypo>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
              <NTypo size="sm" weight="semibold">Total geral</NTypo>
              <NTypo size="sm" weight="semibold">{{ formatCurrency(totalGeral) }}</NTypo>
            </div>
          </div>
        </NLayer>

        <NLayer variant="paper" size="sm" radius="soft" class="space-y-3">
          <div class="flex items-center justify-between">
            <NTypo size="sm" weight="semibold">Cliente</NTypo>
            <NTypo v-if="client" size="xs" tone="muted">Encontrado</NTypo>
          </div>

          <div v-if="client" class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <NTypo size="sm" weight="semibold">{{ client.nome }}</NTypo>
            <NTypo size="xs" tone="muted">{{ client.cnpj }}</NTypo>
          </div>

          <div v-else class="space-y-3">
            <NTypo size="xs" tone="muted">
              Cliente nao encontrado. Preencha os dados para cadastrar.
            </NTypo>
            <div class="grid gap-3 sm:grid-cols-2">
              <NInput v-model="newClient.nome" label="Nome" />
              <NInput v-model="newClient.cnpj" label="CPF/CNPJ" disabled />
              <NInput v-model="newClient.telefone" label="Telefone" />
              <NInput v-model="newClient.email" label="Email" />
              <NInput v-model="newClient.cidade" label="Cidade" />
              <NInput v-model="newClient.estado" label="Estado" />
              <NInput v-model="newClient.segmento" label="Segmento" />
            </div>
            <NTextArea v-model="newClient.endereco_completo" label="Endereco completo" rows="2" />
          </div>
        </NLayer>

        <div v-if="saveError" class="rounded-xl border border-red-200 bg-red-50 p-3">
          <NTypo size="sm" tone="danger">{{ saveError }}</NTypo>
        </div>
        <div v-if="saveSuccess" class="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <NTypo size="sm" tone="success">Venda registrada com sucesso.</NTypo>
          <div class="flex flex-wrap gap-2">
            <NButton variant="outline" size="sm" @click="handleSuccessReset">Importar outro</NButton>
            <NButton variant="primary" size="sm" @click="handleSuccessClose">Fechar</NButton>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <NButton variant="outline" size="sm" @click="resetAll" :disabled="isParsing || isSaving">
        Limpar
      </NButton>
      <NButton
        variant="primary"
        size="sm"
        leading-icon="mdi:content-save"
        :disabled="!canRegister"
        @click="handleRegister"
      >
        Registrar venda
      </NButton>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Cliente } from '~/types/client'
import type { ProdutoDto } from '~/types/schemas'
import { useClientsApi } from '~/composables/useClientsApi'
import { useHistoricoClienteApi } from '~/composables/useHistoricoClienteApi'

type ParsedItem = {
  ref: string
  descricao: string
  quantidade: number
  valorTotal: number
}

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: boolean): void }>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const isParsing = ref(false)
const parseError = ref('')
const parsed = ref(false)
const documentId = ref('')
const pedidoCodigo = ref('')
const items = ref<ParsedItem[]>([])
const client = ref<Cliente | null>(null)
const products = ref<ProdutoDto[]>([])
const saleDate = ref(new Date().toISOString().slice(0, 16))

const isSaving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

const newClient = ref({
  nome: '',
  cnpj: '',
  endereco_completo: '',
  telefone: '',
  email: '',
  cidade: '',
  estado: 'SC',
  segmento: 'joalheria',
})

const { createClient } = useClientsApi()
const { createEvento } = useHistoricoClienteApi()

const totalGeral = computed(() =>
  items.value.reduce((sum, item) => sum + item.valorTotal, 0)
)

const canRegister = computed(() => {
  if (isParsing.value || isSaving.value) return false
  if (!parsed.value || !items.value.length) return false
  if (client.value) return true
  return Boolean(newClient.value.nome.trim() && newClient.value.endereco_completo.trim())
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetAll()
      loadProducts()
    }
  }
)

const triggerFilePicker = () => {
  fileInput.value?.click()
}

const resetAll = () => {
  fileName.value = ''
  isParsing.value = false
  parseError.value = ''
  parsed.value = false
  documentId.value = ''
  pedidoCodigo.value = ''
  items.value = []
  client.value = null
  saveError.value = ''
  saveSuccess.value = false
  saleDate.value = new Date().toISOString().slice(0, 16)
  newClient.value = {
    nome: '',
    cnpj: documentId.value,
    endereco_completo: '',
    telefone: '',
    email: '',
    cidade: '',
    estado: 'SC',
    segmento: 'joalheria',
  }
  if (fileInput.value) fileInput.value.value = ''
}

const loadProducts = async () => {
  if (!import.meta.client) return
  if (products.value.length) return
  try {
    const res = await $fetch<{ success: boolean; data: ProdutoDto[] }>('/api/v1/produtos')
    products.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
    products.value = []
  }
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  resetAll()
  fileName.value = file.name
  isParsing.value = true
  parseError.value = ''
  saveSuccess.value = false

  try {
    const lines = await extractPdfLines(file)
    const text = lines.join('\n')
    const docId = extractDocumentId(text)
    const saleDateFromPdf = extractSaleDate(text)
    const pedidoFromPdf = extractOrderCode(text, lines)

    if (!docId) {
      throw new Error('CPF/CNPJ nao encontrado no PDF.')
    }

    const parsedItems = extractItems(lines)
    if (!parsedItems.length) {
      throw new Error('Itens - Detalhado nao encontrado ou vazio.')
    }

    documentId.value = docId
    items.value = parsedItems
    parsed.value = true
    newClient.value.cnpj = docId
    if (saleDateFromPdf) saleDate.value = saleDateFromPdf
    if (pedidoFromPdf) pedidoCodigo.value = pedidoFromPdf

    await lookupClient(docId)
  } catch (error: any) {
    parseError.value = error?.message || 'Falha ao ler PDF.'
  } finally {
    isParsing.value = false
  }
}

const lookupClient = async (docId: string) => {
  try {
    const res = await $fetch<{ success: boolean; data: Cliente | null }>(
      `/api/v1/clients/lookup?cnpj=${encodeURIComponent(docId)}`
    )
    client.value = res.data
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    client.value = null
  }
}

const handleRegister = async () => {
  if (!canRegister.value) return
  saveError.value = ''
  saveSuccess.value = false
  isSaving.value = true

  try {
    let targetClient = client.value
    if (!targetClient) {
      targetClient = await createClient({
        nome: newClient.value.nome.trim(),
        endereco_completo: newClient.value.endereco_completo.trim(),
        telefone: newClient.value.telefone || undefined,
        email: newClient.value.email || undefined,
        cidade: newClient.value.cidade || undefined,
        estado: newClient.value.estado || undefined,
        segmento: newClient.value.segmento || undefined,
        cnpj: newClient.value.cnpj || undefined,
      })
      client.value = targetClient
    }

    const productsByCode = new Map(
      products.value
        .filter((p) => p.codigo)
        .map((p) => [String(p.codigo).toLowerCase(), p])
    )

    const mappedItems = items.value.map((item) => {
      const match = productsByCode.get(item.ref.toLowerCase())
      const valorUnitario = item.quantidade > 0 ? item.valorTotal / item.quantidade : 0
      return {
        produtoId: match?.id || item.ref,
        nome: match?.nome || item.ref,
        quantidade: item.quantidade,
        valorUnitario: roundTo(valorUnitario, 2),
      }
    })

    const saleDateValue = saleDate.value ? new Date(saleDate.value) : new Date()
    await createEvento({
      clientId: targetClient.id,
      userId: 'user-app',
      tipo: 'venda_fisica',
      data: saleDateValue.toISOString(),
      descricao: `Importacao PDF ${fileName.value || ''}`.trim(),
      pedidoCodigo: pedidoCodigo.value || undefined,
      items: mappedItems,
      resultado: 'sucesso',
    })

    saveSuccess.value = true
  } catch (error: any) {
    saveError.value = error?.message || 'Falha ao registrar venda.'
  } finally {
    isSaving.value = false
  }
}

const handleSuccessReset = () => {
  resetAll()
}

const handleSuccessClose = () => {
  resetAll()
  isOpen.value = false
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0)

const roundTo = (value: number, digits: number) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

const extractPdfLines = async (file: File) => {
  if (!import.meta.client) return [] as string[]
  const pdfjsLib = await import('pdfjs-dist/build/pdf')
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  ;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerUrl

  const data = await file.arrayBuffer()
  const pdf = await (pdfjsLib as any).getDocument({ data }).promise
  const allLines: string[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const lines = groupPdfTextLines(content.items as any[])
    allLines.push(...lines)
  }

  return allLines
}

const groupPdfTextLines = (items: Array<{ str?: string; transform?: number[] }>) => {
  const rows: Array<{ y: number; items: Array<{ x: number; text: string }> }> = []
  const tolerance = 2

  for (const item of items) {
    const text = String(item.str || '').trim()
    if (!text) continue
    const x = item.transform?.[4] ?? 0
    const y = item.transform?.[5] ?? 0

    let row = rows.find((r) => Math.abs(r.y - y) <= tolerance)
    if (!row) {
      row = { y, items: [] }
      rows.push(row)
    }
    row.items.push({ x, text })
  }

  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) =>
      row.items
        .sort((a, b) => a.x - b.x)
        .map((item) => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean)
}

const extractDocumentId = (text: string) => {
  const candidates = new Set<string>()
  const regexes = [
    /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,
    /\b\d{14}\b/g,
    /\b\d{11}\b/g,
  ]

  for (const regex of regexes) {
    for (const match of text.matchAll(regex)) {
      const digits = match[0].replace(/\D/g, '')
      if (digits.length === 11 || digits.length === 14) {
        candidates.add(digits)
      }
    }
  }

  if (candidates.size === 1) return Array.from(candidates)[0]
  if (candidates.size > 1) {
    throw new Error('Mais de um CPF/CNPJ encontrado no PDF.')
  }
  return ''
}

const extractItems = (lines: string[]) => {
  const normalizedLines = lines.map((line) => normalizeText(line))
  const startIndex = normalizedLines.findIndex(
    (line) => line.includes('itens - detalhado') || line.includes('itens detalhado')
  )
  if (startIndex < 0) return []

  const itemsOut: ParsedItem[] = []
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const rawLine = lines[i]
    const line = normalizedLines[i]

    if (line.includes('descricao') && line.includes('pec')) break
    if (line.startsWith('total') && line.includes('r$')) break
    if (line.includes('itens') && line.includes('detalhado')) continue

    const item = parseItemLine(rawLine)
    if (item) itemsOut.push(item)
  }

  return itemsOut
}

const extractSaleDate = (text: string) => {
  const match = text.match(/\bdata\s*:\s*(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\b/i)
  if (!match) return ''

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])

  const fullYear = year >= 70 ? 1900 + year : 2000 + year
  const date = new Date(fullYear, month - 1, day, hour, minute, second)
  if (Number.isNaN(date.getTime())) return ''
  return formatDateTimeLocal(date)
}

const extractOrderCode = (text: string, lines: string[]) => {
  const normalizedText = normalizeText(text)
  const inlineMatch = normalizedText.match(
    /(?:pedido de venda|codigo pedido de venda)\s*[:#-]?\s*(\d{3,})/
  )
  if (inlineMatch?.[1]) return inlineMatch[1]

  const normalized = lines.map((line) => normalizeText(line))
  const labelIndexes: number[] = []
  for (let idx = 0; idx < normalized.length; idx += 1) {
    const line = normalized[idx]
    const next = normalized[idx + 1] || ''
    const merged = `${line} ${next}`.trim()
    if (line.includes('codigo pedido de venda') || line.includes('pedido de venda')) {
      labelIndexes.push(idx)
      continue
    }
    if (merged.includes('codigo pedido de venda') || merged.includes('pedido de venda')) {
      labelIndexes.push(idx)
    }
  }

  const isStopLabel = (value: string) =>
    value.includes('vendedor') ||
    value.includes('cliente') ||
    value.includes('cpf') ||
    value.includes('cnpj')

  for (const headerIndex of labelIndexes) {
    for (let offset = 0; offset <= 4; offset += 1) {
      const candidate = normalized[headerIndex + offset] || ''
      if (offset > 0 && isStopLabel(candidate)) break
      const digits = candidate.match(/\b\d{3,}\b/)
      if (digits) return digits[0]
    }
  }

  for (let idx = 1; idx < normalized.length; idx += 1) {
    const line = normalized[idx]
    if (!/^\d{3,}$/.test(line)) continue
    const prev1 = normalized[idx - 1] || ''
    const prev2 = normalized[idx - 2] || ''
    const context = `${prev2} ${prev1}`
    if (context.includes('codigo pedido de venda') || context.includes('pedido de venda')) {
      return line
    }
  }

  return ''
}

const parseItemLine = (line: string): ParsedItem | null => {
  const refMatch = line.match(/[A-Z]{2,}\d{2,}[A-Z0-9]*/i)
  if (!refMatch) return null

  const currencyRegex = /\d{1,3}(?:\.\d{3})*,\d{2}|\d+\.\d{2}/
  const currencyMatches = [...line.matchAll(new RegExp(currencyRegex.source, 'g'))]
  if (!currencyMatches.length) return null

  const totalRaw = currencyMatches[currencyMatches.length - 1][0]
  const valorTotal = parseCurrency(totalRaw)
  if (valorTotal <= 0) return null

  const tokens = line.split(/\s+/)
  const currencyIndex = tokens.findIndex((token) => currencyRegex.test(token))
  if (currencyIndex < 0) return null

  let quantidade = 0
  for (let idx = currencyIndex - 1; idx >= 0; idx -= 1) {
    const token = tokens[idx].replace(/[^\d]/g, '')
    if (token && /^\d+$/.test(token)) {
      quantidade = Number(token)
      break
    }
  }
  if (!quantidade) return null

  const refToken = refMatch[0]
  const refIndex = tokens.findIndex((token) => token.includes(refToken))
  let endIndex = currencyIndex
  const unIndex = tokens.findIndex((token) => token.toLowerCase() === 'un')
  if (unIndex > refIndex) endIndex = Math.min(endIndex, unIndex)

  const descricao = tokens.slice(refIndex + 1, endIndex).filter((t) => t.toLowerCase() !== 'un').join(' ').trim()

  return {
    ref: refToken,
    descricao: descricao || refToken,
    quantidade,
    valorTotal,
  }
}

const parseCurrency = (value: string) => {
  const normalized = value.replace(/\./g, '').replace(/,/g, '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

const formatDateTimeLocal = (value: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const year = value.getFullYear()
  const month = pad(value.getMonth() + 1)
  const day = pad(value.getDate())
  const hour = pad(value.getHours())
  const minute = pad(value.getMinutes())
  return `${year}-${month}-${day}T${hour}:${minute}`
}
</script>
