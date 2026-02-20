<template>
  <NModal v-model="isOpen" title="Calculadora Ouro" size="md">
    <div class="space-y-3">
      <NLayer variant="paper" size="sm" radius="soft" class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <NTypo size="sm" weight="semibold">Cotacao XAU/BRL</NTypo>
            <NTypo size="xs" tone="muted">Fonte AwesomeAPI</NTypo>
          </div>
          <div class="flex items-center gap-2">
            <div class="rounded-full border border-stone-200 bg-stone-50 px-2 py-1">
              <NTypo size="xs" weight="semibold">
                {{
                  goldQuote
                    ? `${formatCurrency(goldQuote.bid)} / onca`
                    : isLoadingQuote
                      ? 'Carregando onca...'
                      : '-- / onca'
                }}
              </NTypo>
            </div>
            <div class="rounded-full border border-stone-200 bg-stone-50 px-2 py-1">
              <NTypo size="xs" weight="semibold">
                {{
                  goldQuote
                    ? `${formatCurrency(goldPricePerGram24k)} / g 24k`
                    : isLoadingQuote
                      ? 'Carregando grama...'
                      : '-- / g 24k'
                }}
              </NTypo>
            </div>
            <NButton
              variant="outline"
              size="xs"
              leading-icon="mdi:refresh"
              :loading="isLoadingQuote"
              @click="loadQuote"
            >
              Atualizar
            </NButton>
          </div>
        </div>

        <div v-if="quoteError" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <NTypo size="sm" tone="danger">{{ quoteError }}</NTypo>
        </div>

        <div
          v-else-if="isLoadingQuote && !goldQuote"
          class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
        >
          <NTypo size="sm" tone="muted">Buscando cotacao...</NTypo>
        </div>

        <div v-else-if="goldQuote">
          <NTypo size="xs" tone="muted"> Cotacao fonte: {{ goldQuote.sourceDate || '--' }} </NTypo>
        </div>
      </NLayer>

      <NLayer variant="paper" size="sm" radius="soft" class="space-y-2">
        <div class="grid gap-2 sm:grid-cols-3">
          <NInput
            v-model="gramsInput"
            type="number"
            min="0"
            step="0.01"
            label="Gramas"
            placeholder="Ex.: 12.5"
          />
          <NSelect v-model="karatSelection" label="Quilate" :options="karatOptions" />
          <NSelect v-model="marginPercentInput" label="Margem (lucro)" :options="marginOptions" />
        </div>

        <NInput
          v-if="showCustomKaratInput"
          v-model="customKaratInput"
          type="number"
          min="0.1"
          max="24"
          step="0.1"
          label="Quilate personalizado"
          placeholder="Entre 0.1 e 24"
        />

        <label
          for="purify-gold-material"
          class="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
        >
          <input
            id="purify-gold-material"
            v-model="shouldApplyPurification"
            type="checkbox"
            class="h-4 w-4 rounded border-stone-300 text-stone-700 focus:ring-stone-300"
          />
          <NTypo size="sm">Purificar material (-10%)</NTypo>
        </label>

        <div
          v-if="validationMessage"
          class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
        >
          <NTypo size="sm" tone="muted">{{ validationMessage }}</NTypo>
        </div>
      </NLayer>

      <NLayer variant="paper" size="sm" radius="soft" class="space-y-2">
        <div class="grid gap-2 sm:grid-cols-3">
          <div class="rounded-xl border border-stone-200 bg-white px-3 py-2">
            <NTypo size="xs" tone="muted">Ouro puro</NTypo>
            <NTypo size="sm" weight="bold">{{ formatNumber(pureGoldGrams, 4) }} g</NTypo>
          </div>
          <div class="rounded-xl border border-stone-200 bg-white px-3 py-2">
            <NTypo size="xs" tone="muted">Base fabrica</NTypo>
            <NTypo size="sm" weight="bold">{{ formatCurrency(baseGoldValue) }}</NTypo>
          </div>
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
            <NTypo size="xs" tone="muted">Oferta de compra</NTypo>
            <NTypo size="sm" weight="bold" class="text-emerald-700">
              {{ formatCurrency(finalOfferValue) }}
            </NTypo>
          </div>
        </div>
        <NTypo size="xs" tone="muted">
          Lucro da margem: {{ formatCurrency(profitValue) }} ({{ formatNumber(marginPercent, 0) }}%)
        </NTypo>

        <div class="flex items-center justify-between gap-2">
          <NTypo size="sm" weight="semibold">Oferta pronta</NTypo>
          <NButton
            variant="outline"
            size="xs"
            leading-icon="mdi:content-copy"
            :disabled="!canGenerateOffer"
            @click="copyOfferText"
          >
            Copiar
          </NButton>
        </div>

        <div class="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
          <NTypo size="sm">
            {{ offerText || 'Preencha os campos para gerar a oferta.' }}
          </NTypo>
        </div>

        <NTypo v-if="copyFeedbackMessage" size="xs" tone="muted">{{ copyFeedbackMessage }}</NTypo>
      </NLayer>
    </div>
  </NModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { z } from 'zod'

const TROY_OUNCE_GRAMS = 31.1034768
const PURIFICATION_FACTOR = 0.9

const GoldQuoteResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    pair: z.string(),
    name: z.string(),
    bid: z.number().positive(),
    ask: z.number().positive(),
    high: z.number().positive(),
    low: z.number().positive(),
    sourceTimestamp: z.string(),
    sourceDate: z.string(),
    fetchedAt: z.string(),
  }),
})

type KaratOptionValue = '8' | '10' | '12' | '18' | '24' | 'other'

const karatOptions = [
  { value: '8', label: '8k' },
  { value: '10', label: '10k' },
  { value: '12', label: '12k' },
  { value: '18', label: '18k' },
  { value: '24', label: '24k' },
  { value: 'other', label: 'Outro' },
]

const marginOptions = Array.from({ length: 20 }, (_, index) => {
  const value = (index + 1) * 10
  return { value: String(value), label: `${value}%` }
})

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: boolean): void }>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const isLoadingQuote = ref(false)
const quoteError = ref('')
const goldQuote = ref<z.infer<typeof GoldQuoteResponseSchema>['data'] | null>(null)

const gramsInput = ref('')
const karatSelection = ref<KaratOptionValue>('18')
const customKaratInput = ref('18')
const marginPercentInput = ref('30')
const shouldApplyPurification = ref(true)
const copyFeedback = ref<'idle' | 'copied' | 'error'>('idle')

const showCustomKaratInput = computed(() => karatSelection.value === 'other')

function parseInputNumber(value: string) {
  const normalized = String(value || '')
    .trim()
    .replace(',', '.')
  if (!normalized) return null

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

const grams = computed(() => {
  const parsed = parseInputNumber(gramsInput.value)
  return parsed && parsed > 0 ? parsed : 0
})

const customKarat = computed(() => {
  const parsed = parseInputNumber(customKaratInput.value)
  if (parsed === null) return null
  return parsed
})

const karatValue = computed(() => {
  if (karatSelection.value !== 'other') {
    return Number(karatSelection.value)
  }
  if (customKarat.value === null) return 0
  return customKarat.value
})

const karatLabel = computed(() => {
  if (!showCustomKaratInput.value) return `${karatValue.value}k`
  if (karatValue.value <= 0) return 'quilate custom'
  return `${formatNumber(karatValue.value, 1)}k`
})

const isKaratValid = computed(() => karatValue.value > 0 && karatValue.value <= 24)
const marginPercent = computed(() => {
  const parsed = parseInputNumber(marginPercentInput.value)
  if (!parsed) return 10
  return Math.min(200, Math.max(10, parsed))
})

const purityFactor = computed(() => karatValue.value / 24)
const materialFactor = computed(() => (shouldApplyPurification.value ? PURIFICATION_FACTOR : 1))

const goldPricePerGram24k = computed(() => {
  if (!goldQuote.value) return 0
  return goldQuote.value.bid / TROY_OUNCE_GRAMS
})

const pureGoldGrams = computed(() => {
  if (!isKaratValid.value) return 0
  return grams.value * purityFactor.value * materialFactor.value
})

const baseGoldValue = computed(() => pureGoldGrams.value * goldPricePerGram24k.value)
const finalOfferValue = computed(() =>
  Math.max(0, baseGoldValue.value * (1 - marginPercent.value / 100))
)
const profitValue = computed(() => Math.max(0, baseGoldValue.value - finalOfferValue.value))

const canGenerateOffer = computed(() => {
  return Boolean(
    goldQuote.value && grams.value > 0 && isKaratValid.value && finalOfferValue.value > 0
  )
})

const validationMessage = computed(() => {
  if (!goldQuote.value && !isLoadingQuote.value && !quoteError.value) {
    return 'Atualize a cotacao para calcular.'
  }
  if (grams.value <= 0) return 'Informe a quantidade em gramas.'
  if (!isKaratValid.value) return 'Informe um quilate valido entre 0.1 e 24.'
  if (marginPercent.value >= 100) return 'Margem muito alta: a oferta final fica zerada.'
  return ''
})

const offerText = computed(() => {
  const quote = goldQuote.value
  if (!quote || !canGenerateOffer.value) return ''

  return `Para sua peca de ${formatNumber(grams.value, 2)}g no quilate ${karatLabel.value}, com base na cotacao atual do ouro (${formatCurrency(quote.bid)} / onca | ${formatCurrency(goldPricePerGram24k.value)} / g 24k), minha oferta e ${formatCurrency(finalOfferValue.value)}.`
})

const copyFeedbackMessage = computed(() => {
  if (copyFeedback.value === 'copied') return 'Texto copiado.'
  if (copyFeedback.value === 'error') return 'Nao foi possivel copiar automaticamente.'
  return ''
})

async function loadQuote() {
  isLoadingQuote.value = true
  quoteError.value = ''
  copyFeedback.value = 'idle'

  try {
    const rawResponse = await $fetch<unknown>('/api/v1/gold-price')
    const parsed = GoldQuoteResponseSchema.safeParse(rawResponse)
    if (!parsed.success) {
      throw new Error('Resposta invalida da cotacao do ouro.')
    }

    goldQuote.value = parsed.data.data
  } catch (error: any) {
    quoteError.value =
      error?.data?.statusMessage || error?.message || 'Nao foi possivel carregar a cotacao do ouro.'
    goldQuote.value = null
  } finally {
    isLoadingQuote.value = false
  }
}

async function copyOfferText() {
  if (!offerText.value || !import.meta.client) return

  try {
    await navigator.clipboard.writeText(offerText.value)
    copyFeedback.value = 'copied'
  } catch (error) {
    console.error('Erro ao copiar oferta de ouro:', error)
    copyFeedback.value = 'error'
  }
}

function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    copyFeedback.value = 'idle'
    shouldApplyPurification.value = true
    void loadQuote()
  }
)
</script>
