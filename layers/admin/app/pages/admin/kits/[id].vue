<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">{{ isNew ? 'Novo kit' : 'Editar kit' }}</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">{{ id }}</NTypo>
        </div>
        <div class="flex items-center gap-2">
          <NButton as="NuxtLink" to="/admin/kits" variant="outline" leading-icon="mdi:arrow-left" label="Voltar" />
          <NButton v-if="!isNew" variant="danger" leading-icon="mdi:trash-can-outline" label="Excluir" @click="handleDelete" />
        </div>
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <NTypo size="sm" weight="bold" class="mb-4">Identificação, categoria e preço</NTypo>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Código *</label>
          <input
            v-model="form.codigo"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            placeholder="Ex: AEX0100"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nome *</label>
          <input
            v-model="form.nome"
            required
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            placeholder="Ex: Kit Aço + Ouro 4,3mm"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Categoria *</label>
          <select
            v-model="form.categoriaId"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          >
            <option value="">Selecione...</option>
            <option v-for="category in categories || []" :key="category.id" :value="category.id">
              {{ category.nome }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Produto referência
            <span class="ml-1 text-xs font-normal text-gray-400">opcional</span>
          </label>
          <select
            v-model="form.produtoReferenciaId"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          >
            <option value="">Sem referência</option>
            <option v-for="product in products || []" :key="product.id" :value="product.id">
              {{ product.codigo }} · {{ product.nome }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Preço unitário (R$) *</label>
          <input
            v-model.number="form.precoUnitario"
            required
            type="number"
            min="0"
            step="0.01"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Tamanhos disponíveis
            <span class="ml-1 text-xs font-normal text-gray-400">separar por vírgula</span>
          </label>
          <input
            v-model="tamanhosInput"
            placeholder="Ex: 14, 15, 16, 17, 18"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          />
          <div class="mt-2 flex justify-end">
            <button
              type="button"
              class="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-sky-400 hover:text-sky-700"
              @click="useStandardSizes"
            >
              Usar tamanhos padrão (10 ao 35)
            </button>
          </div>
        </div>
        <div class="flex items-center gap-6 pt-1">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.ativo" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-500 focus:ring-sky-400" />
            <span class="text-sm font-semibold text-gray-700">Ativo</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.destaque" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400" />
            <span class="text-sm font-semibold text-gray-700">Destaque na home</span>
          </label>
        </div>
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <NTypo size="sm" weight="bold" class="mb-4">Conteúdo do kit</NTypo>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Descrição rápida</label>
          <input
            v-model="form.descricaoRapida"
            placeholder="Texto curto do card da home"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Descrição completa</label>
          <textarea
            v-model="form.descricaoCompleta"
            rows="3"
            placeholder="Detalhes exibidos no modal da home"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Alt text da imagem</label>
            <input
              v-model="form.imagemAlt"
              placeholder="Ex: Kit AEX0100 aliança aço e ouro"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Dimensões</label>
            <input
              v-model="form.dimensoes"
              placeholder="Ex: 2,00 mm x 4,30 mm"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Peso unitário (g)</label>
            <input
              v-model.number="form.pesoUnitario"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nota</label>
            <input
              v-model="form.nota"
              placeholder="Observação adicional exibida na home"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>
        </div>
      </div>
    </NLayer>

    <NLayer v-if="!isNew" variant="paper" size="base" radius="soft" class="p-5">
      <NTypo size="sm" weight="bold" class="mb-4">Mídia</NTypo>

      <div class="mb-6">
        <p class="text-sm font-semibold text-gray-700 mb-2">
          Foto destaque
          <span class="text-xs font-normal text-gray-400">JPEG / PNG / WebP, máx 8 MB</span>
        </p>
        <div class="flex flex-wrap items-start gap-4">
          <div v-if="currentData?.fotoDestaqueUrl" class="relative">
            <img
              :src="currentData.fotoDestaqueUrl"
              :alt="currentData.imagemAlt || 'Foto destaque'"
              class="h-28 w-28 rounded-lg border border-gray-200 object-cover shadow-sm"
            />
            <button
              type="button"
              class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
              :disabled="uploadingCover"
              @click="deleteCoverImage"
            >
              <NIcon name="mdi:close" class="h-3.5 w-3.5" />
            </button>
          </div>
          <div v-else class="flex h-28 w-28 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-300">
            <NIcon name="mdi:image-outline" class="h-8 w-8" />
          </div>
          <label class="cursor-pointer">
            <div class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50">
              <NIcon name="mdi:upload" class="h-4 w-4" />
              {{ uploadingCover ? 'Enviando...' : 'Enviar foto destaque' }}
            </div>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden" :disabled="uploadingCover" @change="uploadMedia('cover', $event)" />
          </label>
        </div>
      </div>

      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">
          Galeria
          <span class="text-xs font-normal text-gray-400">imagens adicionais (máx 8 MB cada)</span>
        </p>
        <div class="flex flex-wrap gap-3">
          <div v-for="(url, idx) in currentData?.galeriaUrls ?? []" :key="url" class="relative">
            <img :src="url" :alt="`Galeria ${idx + 1}`" class="h-24 w-24 rounded-lg border border-gray-200 object-cover shadow-sm" />
            <button
              type="button"
              class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
              :disabled="uploadingGallery"
              @click="deleteGalleryImage(url)"
            >
              <NIcon name="mdi:close" class="h-3.5 w-3.5" />
            </button>
          </div>
          <label class="cursor-pointer">
            <div class="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-sky-400 hover:text-sky-400">
              <NIcon name="mdi:plus" class="h-6 w-6" />
              <span class="text-xs">Adicionar</span>
            </div>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden" :disabled="uploadingGallery" multiple @change="uploadMedia('gallery', $event)" />
          </label>
        </div>
        <p v-if="uploadingGallery" class="mt-2 text-xs text-sky-600">Enviando imagens...</p>
      </div>

      <p v-if="mediaError" class="mt-3 text-xs text-red-600">{{ mediaError }}</p>
    </NLayer>

    <div v-if="isNew" class="flex items-center gap-2 px-1 text-xs text-gray-500">
      <NIcon name="mdi:information-outline" class="h-4 w-4" />
      Salve o kit primeiro para enviar foto destaque e galeria.
    </div>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-center justify-end gap-2">
        <NButton variant="outline" leading-icon="mdi:refresh" label="Recarregar" @click.prevent="load()" />
        <NButton :loading="saving" leading-icon="mdi:content-save" label="Salvar" @click="handleSave" />
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { KitCategoryDtoSchema, KitDtoSchema, ProdutoDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')
const isNew = computed(() => id === 'new')
const saving = ref(false)
const mediaError = ref('')
const uploadingCover = ref(false)
const uploadingGallery = ref(false)

const form = ref({
  codigo: '',
  nome: '',
  categoriaId: '',
  produtoReferenciaId: '',
  precoUnitario: 0,
  destaque: false,
  ativo: true,
  descricaoRapida: '',
  descricaoCompleta: '',
  imagemAlt: '',
  dimensoes: '',
  pesoUnitario: undefined as number | undefined,
  nota: '',
})

const tamanhosInput = ref('')
const RING_SIZE_MIN = 10
const RING_SIZE_MAX = 35
const standardSizes = Array.from(
  { length: RING_SIZE_MAX - RING_SIZE_MIN + 1 },
  (_, index) => String(index + RING_SIZE_MIN)
)

const currentData = ref<z.infer<typeof KitDtoSchema> | null>(null)

const KitResponseSchema = z.object({
  success: z.boolean(),
  data: KitDtoSchema,
})

const KitCategoriesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(KitCategoryDtoSchema),
})

const ProductsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProdutoDtoSchema),
})

const { data: categories } = await useFetch('/api/v1/kit-categories', {
  transform: (res) => KitCategoriesResponseSchema.parse(res).data,
})

const { data: products } = await useFetch('/api/v1/produtos', {
  transform: (res) => ProductsResponseSchema.parse(res).data,
})

function parseSizesInput(input: string) {
  return Array.from(
    new Set(
      input
        .split(/[,\n;|]+/g)
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value))
        .map((value) => Math.floor(value))
        .filter((value) => value >= RING_SIZE_MIN && value <= RING_SIZE_MAX)
        .sort((a, b) => a - b)
        .map((value) => String(value))
    )
  )
}

function useStandardSizes() {
  tamanhosInput.value = standardSizes.join(', ')
}

function extractFileIdFromMediaUrl(url: string) {
  const marker = '/api/v1/kits/media/'
  const index = url.indexOf(marker)
  if (index < 0) return ''
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0] || '')
}

async function load() {
  if (isNew.value) return
  const res = await $fetch(`/api/v1/kits/${encodeURIComponent(id)}`)
  const kit = KitResponseSchema.parse(res).data
  currentData.value = kit
  form.value = {
    codigo: kit.codigo,
    nome: kit.nome,
    categoriaId: kit.categoriaId,
    produtoReferenciaId: kit.produtoReferenciaId || '',
    precoUnitario: kit.precoUnitario,
    destaque: kit.destaque,
    ativo: kit.ativo,
    descricaoRapida: kit.descricaoRapida || '',
    descricaoCompleta: kit.descricaoCompleta || '',
    imagemAlt: kit.imagemAlt || '',
    dimensoes: kit.dimensoes || '',
    pesoUnitario: kit.pesoUnitario,
    nota: kit.nota || '',
  }
  tamanhosInput.value = parseSizesInput((kit.tamanhosDisponiveis || []).join(', ')).join(', ')
}

onMounted(load)

async function handleSave() {
  saving.value = true
  try {
    const normalizedPesoUnitario =
      typeof form.value.pesoUnitario === 'number' && Number.isFinite(form.value.pesoUnitario)
        ? form.value.pesoUnitario
        : undefined

    const payload: Record<string, unknown> = {
      codigo: form.value.codigo.trim(),
      nome: form.value.nome.trim(),
      categoriaId: form.value.categoriaId,
      produtoReferenciaId: form.value.produtoReferenciaId.trim(),
      precoUnitario: Number(form.value.precoUnitario) || 0,
      tamanhosDisponiveis: parseSizesInput(tamanhosInput.value),
      destaque: form.value.destaque,
      ativo: form.value.ativo,
      descricaoRapida: form.value.descricaoRapida.trim(),
      descricaoCompleta: form.value.descricaoCompleta.trim(),
      imagemAlt: form.value.imagemAlt.trim(),
      dimensoes: form.value.dimensoes.trim(),
      pesoUnitario: normalizedPesoUnitario,
      nota: form.value.nota.trim(),
    }

    if (isNew.value) {
      const created = await $fetch('/api/v1/kits', { method: 'POST', body: payload })
      const parsedCreated = KitResponseSchema.parse(created).data
      await router.push(`/admin/kits/${encodeURIComponent(parsedCreated.id)}`)
      return
    }

    if (normalizedPesoUnitario === undefined) {
      payload.pesoUnitario = null
    }

    await $fetch(`/api/v1/kits/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload })
    await load()
  } finally {
    saving.value = false
  }
}

async function uploadMedia(type: 'cover' | 'gallery', event: Event) {
  if (isNew.value) return
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return

  mediaError.value = ''
  if (type === 'cover') uploadingCover.value = true
  else uploadingGallery.value = true

  try {
    for (const file of files) {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('file', file)
      await $fetch(`/api/v1/kits/${encodeURIComponent(id)}/media`, {
        method: 'POST',
        body: formData,
      })
    }
    await load()
  } catch (err: any) {
    mediaError.value = err?.data?.statusMessage || 'Erro ao enviar imagem.'
  } finally {
    if (type === 'cover') uploadingCover.value = false
    else uploadingGallery.value = false
    input.value = ''
  }
}

async function deleteCoverImage() {
  mediaError.value = ''
  try {
    await $fetch(`/api/v1/kits/${encodeURIComponent(id)}/media`, {
      method: 'DELETE',
      body: { type: 'cover' },
    })
    await load()
  } catch (err: any) {
    mediaError.value = err?.data?.statusMessage || 'Erro ao remover imagem destaque.'
  }
}

async function deleteGalleryImage(url: string) {
  const fileId = extractFileIdFromMediaUrl(url)
  if (!fileId) return

  mediaError.value = ''
  try {
    await $fetch(`/api/v1/kits/${encodeURIComponent(id)}/media`, {
      method: 'DELETE',
      body: { type: 'gallery', fileId },
    })
    await load()
  } catch (err: any) {
    mediaError.value = err?.data?.statusMessage || 'Erro ao remover imagem da galeria.'
  }
}

async function handleDelete() {
  if (isNew.value) return
  const ok = confirm('Excluir este kit? Esta ação não pode ser desfeita.')
  if (!ok) return
  await $fetch(`/api/v1/kits/${encodeURIComponent(id)}`, { method: 'DELETE' })
  await router.push('/admin/kits')
}
</script>
