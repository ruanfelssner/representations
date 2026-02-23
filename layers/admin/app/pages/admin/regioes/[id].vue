<template>
  <div class="space-y-4">
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">{{ isNew ? 'Nova Região' : 'Editar Região' }}</NTypo>
          <NTypo v-if="!isNew" size="sm" tone="muted" class="mt-1">{{ id }}</NTypo>
        </div>
        <NButton as="NuxtLink" to="/admin/regioes" variant="outline" leading-icon="mdi:arrow-left">
          Voltar
        </NButton>
      </div>
    </NLayer>

    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <form class="space-y-4" @submit.prevent="saveRegion">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NInput v-model="form.nome" label="Nome *" required />
          <NInput v-model="form.color" label="Cor (hex)" placeholder="#8b5cf6" />
          <NInput
            v-model.number="form.priority"
            type="number"
            min="0"
            label="Prioridade"
            placeholder="0"
          />
          <NSelect v-model="form.representanteUserId" label="Representante">
            <option value="">(não vinculado)</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.nome }}
            </option>
          </NSelect>
          <NInput
            v-model="form.stateIdsInput"
            label="Estados (IDs separados por vírgula)"
            placeholder="SC,PR,SP..."
            class="md:col-span-2"
          />
          <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input v-model="form.ativo" type="checkbox" class="h-4 w-4" />
            Região ativa
          </label>
        </div>

        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            Geometria (GeoJSON Polygon/MultiPolygon) *
          </NTypo>
          <NTextArea
            v-model="form.geometryRaw"
            rows="12"
            placeholder='{"type":"Polygon","coordinates":[[[-48.6,-27.7],[-48.3,-27.7],[-48.3,-27.4],[-48.6,-27.4],[-48.6,-27.7]]]}'
          />
        </div>

        <div v-if="submitError" class="rounded-lg border border-red-200 bg-red-50 p-3">
          <NTypo size="sm" class="text-red-700">{{ submitError }}</NTypo>
        </div>

        <div class="flex flex-wrap gap-2">
          <NButton type="submit" variant="primary" :disabled="saving" leading-icon="mdi:content-save">
            {{ saving ? 'Salvando...' : 'Salvar região' }}
          </NButton>
          <NButton as="NuxtLink" to="/admin/regioes" variant="outline">Cancelar</NButton>
        </div>
      </form>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { TerritoryRegionDtoSchema, UserDtoSchema } from '~/types/schemas'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')
const isNew = id === 'new'

const form = ref({
  nome: '',
  color: '',
  priority: 0,
  representanteUserId: '',
  stateIdsInput: '',
  ativo: true,
  geometryRaw: '',
})

const submitError = ref('')
const saving = ref(false)

const RegionResponseSchema = z.object({
  success: z.boolean(),
  data: TerritoryRegionDtoSchema,
})

const UsersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserDtoSchema),
})

const { data: usersData } = await useFetch('/api/v1/users?role=vendedor&ativo=true', {
  transform: (res) => UsersResponseSchema.parse(res).data,
})
const users = computed(() => usersData.value || [])

const { data: regionData } = await useFetch(`/api/v1/regions/${encodeURIComponent(id)}`, {
  immediate: !isNew,
  transform: (res) => RegionResponseSchema.parse(res).data,
})

watch(
  () => regionData.value,
  (region) => {
    if (!region) return
    form.value = {
      nome: region.nome || '',
      color: region.color || '',
      priority: region.priority || 0,
      representanteUserId: region.representanteUserId || '',
      stateIdsInput: Array.isArray(region.stateIds) ? region.stateIds.join(',') : '',
      ativo: region.ativo !== false,
      geometryRaw: JSON.stringify((region as any).geometry || {}, null, 2),
    }
  },
  { immediate: true }
)

function parseGeometry() {
  try {
    const parsed = JSON.parse(form.value.geometryRaw || '{}')
    if (!parsed || typeof parsed !== 'object' || !parsed.type || !parsed.coordinates) {
      throw new Error('Geometria inválida.')
    }
    return parsed
  } catch {
    throw new Error('GeoJSON inválido.')
  }
}

async function saveRegion() {
  submitError.value = ''
  saving.value = true
  try {
    const geometry = parseGeometry()
    const stateIds = form.value.stateIdsInput
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)

    const payload = {
      nome: form.value.nome.trim(),
      color: form.value.color.trim() || undefined,
      priority: Number.isFinite(form.value.priority) ? form.value.priority : 0,
      representanteUserId: form.value.representanteUserId || undefined,
      stateIds,
      ativo: Boolean(form.value.ativo),
      geometry,
    }

    if (isNew) {
      const created = await $fetch<{ success: boolean; data: { id: string } }>('/api/v1/regions', {
        method: 'POST',
        body: payload,
      })
      router.push(`/admin/regioes/${created.data.id}`)
      return
    }

    await $fetch(`/api/v1/regions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: payload,
    })
    router.push('/admin/regioes')
  } catch (error: any) {
    submitError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.message ||
      'Falha ao salvar região.'
  } finally {
    saving.value = false
  }
}
</script>
