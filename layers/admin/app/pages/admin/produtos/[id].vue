<template>
  <div class="space-y-4">
    <!-- Header -->
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">{{ isNew ? 'Novo produto' : 'Editar produto' }}</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">{{ id }}</NTypo>
        </div>
        <div class="flex items-center gap-2">
          <NButton as="NuxtLink" to="/admin/produtos" variant="outline" leading-icon="mdi:arrow-left" label="Voltar" />
          <NButton v-if="!isNew" variant="danger" leading-icon="mdi:trash-can-outline" label="Excluir" @click="handleDelete" />
        </div>
      </div>
    </NLayer>

    <!-- Identificação & Preço -->
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <NTypo size="sm" weight="bold" class="mb-4">Identificação & Preço</NTypo>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Código *</label>
          <input v-model="form.codigo" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nome *</label>
          <input v-model="form.nome" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Valor unitário (R$) *</label>
          <input v-model.number="form.valor" required type="number" min="0" step="0.01" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Preço referência Ouro 18k (R$)
            <span class="ml-1 text-xs font-normal text-gray-400">para comparação na home</span>
          </label>
          <input v-model.number="form.precoOuro18kReferencia" type="number" min="0" step="0.01" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
          <p v-if="savingsPercent > 0" class="mt-1 text-xs text-emerald-600">
            Economia: {{ savingsPercent }}% menor que o equivalente em ouro 18k
          </p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Categoria</label>
          <input v-model="form.categoria" placeholder="Ex: Aliança" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Linha (filtro na home)</label>
          <select v-model="form.linha" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400">
            <option value="">Sem linha</option>
            <option value="steel-and-gold">Aço + Ouro</option>
            <option value="silver-and-gold">Prata + Ouro</option>
            <option value="gold-10k">Ouro 10k</option>
            <option value="gold-18k">Ouro 18k</option>
          </select>
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

    <!-- Textos -->
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <NTypo size="sm" weight="bold" class="mb-4">Textos</NTypo>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Descrição rápida <span class="text-xs font-normal text-gray-400">exibida no card da home</span>
          </label>
          <input v-model="form.descricaoRapida" placeholder="1 linha. Ex: Especial abaulada anatômica em aço e ouro 416 (10k)." class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Descrição completa <span class="text-xs font-normal text-gray-400">exibida no modal da home</span>
          </label>
          <textarea v-model="form.descricaoCompleta" rows="3" placeholder="Descrição técnica completa do produto..." class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            Descrição interna <span class="text-xs font-normal text-gray-400">uso interno / admin</span>
          </label>
          <textarea v-model="form.descricao" rows="2" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Dimensões <span class="text-xs font-normal text-gray-400">ex: 2,00 mm x 4,30 mm</span></label>
            <input v-model="form.dimensoes" placeholder="2,00 mm x 4,30 mm" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Peso unitário (g)</label>
            <input v-model.number="form.pesoUnitario" type="number" min="0" step="0.01" placeholder="2.42" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Alt text da imagem <span class="text-xs font-normal text-gray-400">acessibilidade / SEO</span></label>
            <input v-model="form.imagemAlt" placeholder="Ex: Kit AEX0100 aliança 4,3mm aço e ouro" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nota / observação <span class="text-xs font-normal text-gray-400">exibida no modal da home</span></label>
            <input v-model="form.nota" placeholder="Ex: Valores podem variar conforme aro e personalização." class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400" />
          </div>
        </div>
      </div>
    </NLayer>

    <!-- Mídia -->
    <NLayer v-if="!isNew" variant="paper" size="base" radius="soft" class="p-5">
      <NTypo size="sm" weight="bold" class="mb-4">Mídia</NTypo>

      <!-- Thumbnail -->
      <div class="mb-6">
        <p class="text-sm font-semibold text-gray-700 mb-2">Thumbnail <span class="text-xs font-normal text-gray-400">imagem principal do card (JPEG / PNG / WebP, máx 8 MB)</span></p>
        <div class="flex flex-wrap items-start gap-4">
          <div v-if="currentData?.thumbnailUrl" class="relative">
            <img :src="currentData.thumbnailUrl" alt="Thumbnail atual" class="h-28 w-28 rounded-lg border border-gray-200 object-cover shadow-sm" />
            <button
              type="button"
              class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
              :disabled="uploadingThumbnail"
              @click="deleteFile('thumbnail')"
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
              {{ uploadingThumbnail ? 'Enviando...' : 'Enviar thumbnail' }}
            </div>
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden" :disabled="uploadingThumbnail" @change="uploadFile('thumbnail', $event)" />
          </label>
        </div>
      </div>

      <!-- Galeria -->
      <div class="mb-6">
        <p class="text-sm font-semibold text-gray-700 mb-2">Galeria <span class="text-xs font-normal text-gray-400">imagens adicionais no modal (JPEG / PNG / WebP, máx 8 MB cada)</span></p>
        <div class="flex flex-wrap gap-3">
          <div v-for="(url, idx) in currentData?.galleryUrls ?? []" :key="url" class="relative">
            <img :src="url" :alt="`Galeria ${idx + 1}`" class="h-24 w-24 rounded-lg border border-gray-200 object-cover shadow-sm" />
            <button
              type="button"
              class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
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
            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden" :disabled="uploadingGallery" multiple @change="uploadFile('gallery', $event)" />
          </label>
        </div>
        <p v-if="uploadingGallery" class="mt-2 text-xs text-sky-600">Enviando imagens...</p>
      </div>

      <!-- PDF Catálogo -->
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Catálogo PDF <span class="text-xs font-normal text-gray-400">arquivo PDF do catálogo (máx 32 MB)</span></p>
        <div class="flex flex-wrap items-center gap-4">
          <div v-if="currentData?.catalogPdfUrl" class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
            <NIcon name="mdi:file-pdf-box" class="h-6 w-6 text-red-500" />
            <a :href="currentData.catalogPdfUrl" target="_blank" class="text-sm font-medium text-sky-600 underline hover:text-sky-800">Ver catálogo</a>
            <button type="button" class="ml-2 text-red-400 hover:text-red-600" @click="deleteFile('catalog')">
              <NIcon name="mdi:close" class="h-4 w-4" />
            </button>
          </div>
          <label class="cursor-pointer">
            <div class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50">
              <NIcon name="mdi:file-upload-outline" class="h-4 w-4" />
              {{ uploadingCatalog ? 'Enviando...' : (currentData?.catalogPdfUrl ? 'Substituir PDF' : 'Enviar PDF') }}
            </div>
            <input type="file" accept="application/pdf" class="hidden" :disabled="uploadingCatalog" @change="uploadFile('catalog', $event)" />
          </label>
        </div>
      </div>

      <p v-if="mediaError" class="mt-3 text-xs text-red-600">{{ mediaError }}</p>
    </NLayer>

    <p v-if="isNew" class="text-xs text-gray-400 pl-1">💡 Salve o produto primeiro para fazer upload de imagens e PDF.</p>

    <!-- Save -->
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
import { ProdutoDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')
const isNew = computed(() => id === 'new')
const saving = ref(false)
const mediaError = ref('')
const uploadingThumbnail = ref(false)
const uploadingGallery = ref(false)
const uploadingCatalog = ref(false)

const form = ref({
  codigo: '',
  nome: '',
  valor: 0,
  precoOuro18kReferencia: undefined as number | undefined,
  categoria: '',
  linha: '' as string,
  ativo: true,
  destaque: false,
  descricao: '',
  descricaoRapida: '',
  descricaoCompleta: '',
  dimensoes: '',
  pesoUnitario: undefined as number | undefined,
  imagemAlt: '',
  nota: '',
})

const currentData = ref<z.infer<typeof ProdutoDtoSchema> | null>(null)
const ProdutoResponseSchema = z.object({ success: z.boolean(), data: ProdutoDtoSchema })

const savingsPercent = computed(() => {
  const ref18k = form.value.precoOuro18kReferencia
  const val = form.value.valor
  if (!ref18k || !val || ref18k <= val) return 0
  return Math.round(((ref18k - val) / ref18k) * 100)
})

async function load() {
  if (isNew.value) return
  const res = await $fetch(`/api/v1/produtos/${encodeURIComponent(id)}`)
  const produto = ProdutoResponseSchema.parse(res).data
  currentData.value = produto
  form.value = {
    codigo: produto.codigo,
    nome: produto.nome,
    valor: produto.valor,
    precoOuro18kReferencia: produto.precoOuro18kReferencia,
    categoria: produto.categoria || '',
    linha: produto.linha || '',
    ativo: produto.ativo,
    destaque: produto.destaque ?? false,
    descricao: produto.descricao || '',
    descricaoRapida: produto.descricaoRapida || '',
    descricaoCompleta: produto.descricaoCompleta || '',
    dimensoes: produto.dimensoes || '',
    pesoUnitario: produto.pesoUnitario,
    imagemAlt: produto.imagemAlt || '',
    nota: produto.nota || '',
  }
}

onMounted(load)

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      codigo: form.value.codigo.trim(),
      nome: form.value.nome.trim(),
      valor: Number(form.value.valor) || 0,
      precoOuro18kReferencia: form.value.precoOuro18kReferencia || undefined,
      categoria: form.value.categoria.trim() || undefined,
      linha: form.value.linha || undefined,
      ativo: form.value.ativo,
      destaque: form.value.destaque,
      descricao: form.value.descricao.trim() || undefined,
      descricaoRapida: form.value.descricaoRapida.trim() || undefined,
      descricaoCompleta: form.value.descricaoCompleta.trim() || undefined,
      dimensoes: form.value.dimensoes.trim() || undefined,
      pesoUnitario: form.value.pesoUnitario || undefined,
      imagemAlt: form.value.imagemAlt.trim() || undefined,
      nota: form.value.nota.trim() || undefined,
    }
    if (isNew.value) {
      await $fetch('/api/v1/produtos', { method: 'POST', body: payload })
      await router.push('/admin/produtos')
    } else {
      await $fetch(`/api/v1/produtos/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload })
      await load()
    }
  } finally {
    saving.value = false
  }
}

async function uploadFile(type: 'thumbnail' | 'gallery' | 'catalog', event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length) return

  mediaError.value = ''
  if (type === 'thumbnail') uploadingThumbnail.value = true
  else if (type === 'gallery') uploadingGallery.value = true
  else uploadingCatalog.value = true

  try {
    for (const file of files) {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('file', file)
      await $fetch(`/api/v1/produtos/${encodeURIComponent(id)}/upload`, { method: 'POST', body: formData })
    }
    await load()
  } catch (err: any) {
    mediaError.value = err?.data?.statusMessage || 'Erro ao enviar arquivo.'
  } finally {
    if (type === 'thumbnail') uploadingThumbnail.value = false
    else if (type === 'gallery') uploadingGallery.value = false
    else uploadingCatalog.value = false
    input.value = ''
  }
}

async function deleteFile(type: 'thumbnail' | 'catalog') {
  mediaError.value = ''
  try {
    await $fetch(`/api/v1/produtos/${encodeURIComponent(id)}/upload`, { method: 'DELETE', body: { type } })
    await load()
  } catch (err: any) {
    mediaError.value = err?.data?.statusMessage || 'Erro ao remover arquivo.'
  }
}

async function deleteGalleryImage(url: string) {
  mediaError.value = ''
  try {
    await $fetch(`/api/v1/produtos/${encodeURIComponent(id)}/upload`, { method: 'DELETE', body: { type: 'gallery', url } })
    await load()
  } catch (err: any) {
    mediaError.value = err?.data?.statusMessage || 'Erro ao remover imagem.'
  }
}

async function handleDelete() {
  if (isNew.value) return
  const ok = confirm('Excluir este produto? Esta ação não pode ser desfeita.')
  if (!ok) return
  await $fetch(`/api/v1/produtos/${encodeURIComponent(id)}`, { method: 'DELETE' })
  await router.push('/admin/produtos')
}
</script>

