<template>
  <div class="space-y-4">
    <!-- Header -->
    <NLayer variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <NTypo as="h1" size="lg" weight="bold">{{ isNew ? 'Novo Cliente' : 'Editar Cliente' }}</NTypo>
          <NTypo v-if="!isNew" size="sm" tone="muted" class="mt-1">{{ id }}</NTypo>
        </div>
        <NButton as="NuxtLink" to="/admin/clients" variant="outline" leading-icon="mdi:arrow-left">
          Voltar
        </NButton>
      </div>
    </NLayer>

    <!-- Loading Estado -->
    <NLayer v-if="!isNew && pendingClient" variant="paper" size="base" radius="soft" class="p-5">
      <div class="text-center py-6">
        <NTypo size="sm" tone="muted">Carregando cliente...</NTypo>
      </div>
    </NLayer>

    <!-- Erro ao carregar -->
    <NLayer v-else-if="!isNew && clientError" variant="paper" size="base" radius="soft" class="p-5">
      <div class="text-center py-6">
        <NTypo size="sm" tone="danger">Cliente não encontrado.</NTypo>
      </div>
    </NLayer>

    <!-- Formulário -->
    <NLayer v-else variant="paper" size="base" radius="soft" class="p-5">
      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- Nome -->
       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            Nome do Cliente *
          </NTypo>
          <NInput v-model="nome" v-bind="nomeAttrs" type="text" placeholder="Ex: Ótica Visão Clara" required />
          <NTypo v-if="errors.nome" size="xs" class="text-red-600 mt-1">{{ errors.nome }}</NTypo>
        </div>
        
          <div>
            <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
              Segmento *
            </NTypo>
            <NSelect v-model="segmento" v-bind="segmentoAttrs" required>
              <option value="otica">👓 Ótica</option>
              <option value="relojoaria">⌚ Relojoaria</option>
              <option value="semijoia">💍 Semi-joias</option>
              <option value="multimarcas">🏪 Multimarcas</option>
            </NSelect>
          </div>
       </div>

        <!-- Contato -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
              Telefone
            </NTypo>
            <NInput v-model="telefone" v-bind="telefoneAttrs" type="tel" placeholder="(48) 99999-9999" />
          </div>

          <div>
            <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
              Email
            </NTypo>
            <NInput v-model="email" v-bind="emailAttrs" type="email" placeholder="contato@exemplo.com" />
          </div>
        </div>

        <!-- CNPJ -->
        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            CNPJ
          </NTypo>
          <NInput v-model="cnpj" v-bind="cnpjAttrs" type="text" placeholder="00.000.000/0000-00" />
        </div>

        <!-- Endereço Completo -->
        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            Endereço Completo *
          </NTypo>
          <NInput
            v-model="endereco_completo"
            v-bind="enderecoAttrs"
            type="text"
            placeholder="Rua, número, bairro, cidade - SC"
            required
          />
          <NTypo v-if="errors.endereco_completo" size="xs" class="text-red-600 mt-1">{{ errors.endereco_completo }}</NTypo>
          <NTypo size="xs" tone="muted" class="mt-1">
            Este endereço será geocodificado automaticamente
          </NTypo>
        </div>

        <!-- Cidade (opcional, extraído do geocoding) -->
        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            Cidade
          </NTypo>
          <NInput v-model="cidade" v-bind="cidadeAttrs" type="text" placeholder="Ex: Florianópolis" />
        </div>

        <!-- Observações -->
        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            Observações
          </NTypo>
          <NTextArea
            v-model="observacoes"
            v-bind="observacoesAttrs"
            rows="3"
            placeholder="Informações adicionais sobre o cliente..."
          />
        </div>

        <!-- Feedback -->
        <div v-if="submitError" class="p-3 rounded-lg border border-red-200 bg-red-50">
          <NTypo size="sm" weight="medium" class="text-red-700">❌ {{ submitError }}</NTypo>
        </div>

        <div v-if="submitSuccess" class="p-3 rounded-lg border border-green-200 bg-green-50">
          <NTypo size="sm" weight="medium" class="text-green-700">✅ {{ submitSuccess }}</NTypo>
        </div>

        <!-- Ações -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <NButton
            type="submit"
            variant="primary"
            :disabled="isBusy"
            class="flex-1"
          >
            {{ isSubmitting ? '⏳ Salvando...' : isNew ? '📝 Criar Cliente' : '💾 Salvar Alterações' }}
          </NButton>
          <NButton
            v-if="!isNew && client?.status !== 'inativo'"
            @click="handleInativar"
            variant="danger"
            :disabled="isBusy"
            class="flex-1"
          >
            ⏸️ Inativar Cliente
          </NButton>
          <NButton
            v-if="!isNew && client?.status === 'inativo'"
            @click="handleReativar"
            variant="success"
            :disabled="isBusy"
            class="flex-1"
          >
            ✅ Reativar Cliente
          </NButton>
          <NButton
            as="NuxtLink"
            to="/admin/clients"
            variant="outline"
            :disabled="isBusy"
          >
            Cancelar
          </NButton>
        </div>
      </form>
    </NLayer>

    <!-- Plano de ação (orientação do vendedor) -->
    <NLayer v-if="!isNew && client && task" variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <NTypo as="h3" size="sm" weight="bold">Plano de ação</NTypo>

          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
              :class="statusMeta.chipClass"
            >
              <span class="h-2 w-2 rounded-full" :class="statusMeta.dotClass" />
              {{ statusMeta.emoji }} {{ statusMeta.label }}
            </span>
            <span class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {{ task.priority }}
            </span>
            <span v-if="task.valueMetric > 0" class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {{ task.valueMetricLabel }}
            </span>
          </div>

          <NTypo size="sm" weight="bold" class="mt-3">
            {{ task.suggestedActionLabel }}
          </NTypo>
          <NTypo v-if="task.reasons.length" size="xs" tone="muted" class="mt-1">
            {{ task.reasons.join(' · ') }}
          </NTypo>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <NButton
            v-if="client.telefone"
            variant="success"
            size="zs"
            leading-icon="mdi:whatsapp"
            :href="whatsAppUrl(client.telefone, client.nome || '')"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </NButton>
          <NButton variant="outline" size="zs" :leading-icon="task.suggestedIcon" @click="refreshHistorico()">
            Atualizar
          </NButton>
        </div>
      </div>
    </NLayer>

    <!-- Histórico (apenas para edição) -->
    <NLayer v-if="!isNew && client" variant="paper" size="base" radius="soft" class="p-5">
      <div class="flex items-center justify-between">
        <NTypo as="h3" size="sm" weight="bold">Histórico</NTypo>
        <NButton variant="outline" size="xs" leading-icon="mdi:refresh" @click="refreshHistorico()">
          Atualizar
        </NButton>
      </div>
      <div v-if="pendingHistorico" class="text-center py-6">
        <NTypo size="sm" tone="muted">Carregando...</NTypo>
      </div>
      <div v-else-if="historicoError" class="text-center py-6">
        <NTypo size="sm" tone="danger">Falha ao carregar histórico.</NTypo>
      </div>
      <div v-else class="mt-4 space-y-2">
        <div v-if="!historico?.length" class="text-center py-6">
          <NTypo size="sm" tone="muted">Sem eventos.</NTypo>
        </div>
        <div v-for="e in historico" :key="e.id" class="rounded-xl border bg-white p-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <NTypo size="sm" weight="bold" class="tabular-nums">{{ formatDate(e.data) }}</NTypo>
              <NTypo size="xs" tone="muted" class="truncate">{{ e.descricao || '--' }}</NTypo>
            </div>
            <NTypo size="xs" class="px-2 py-1 rounded-full bg-slate-100 text-slate-700">{{ e.tipo }}</NTypo>
          </div>
          <div v-if="e.totalVenda" class="mt-2">
            <NTypo size="xs" weight="bold" class="text-emerald-700 tabular-nums">{{ formatCurrency(e.totalVenda) }}</NTypo>
          </div>
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ClientDtoSchema, HistoricoClienteDtoSchema } from '~/types/schemas'
import { useClientsApi } from '~/composables/useClientsApi'

definePageMeta({
  layout: 'admin',
  key: (route) => String(route.params.id || 'new'),
})

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')
const isNew = id === 'new'

const { createClient, patchClient } = useClientsApi()

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const ClientForm = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório'),
  segmento: z.enum(['otica', 'relojoaria', 'semijoia', 'multimarcas']),
  status: z.enum(['ativo', 'potencial', 'inativo']),
  telefone: z.preprocess(emptyToUndefined, z.string().optional()),
  email: z.preprocess(emptyToUndefined, z.string().email('Email inválido').optional()),
  cnpj: z.preprocess(emptyToUndefined, z.string().optional()),
  endereco_completo: z.string().trim().min(1, 'Endereço é obrigatório'),
  cidade: z.preprocess(emptyToUndefined, z.string().optional()),
  observacoes: z.preprocess(emptyToUndefined, z.string().optional()),
})

export type ClientForm = z.infer<typeof ClientForm>

const ClientFormSchema = toTypedSchema(ClientForm)

const isMutating = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

const ClientResponseSchema = z.object({ success: z.boolean(), data: ClientDtoSchema })
const HistoricoResponseSchema = z.object({ success: z.boolean(), data: z.array(HistoricoClienteDtoSchema) })

const { data: client, pending: pendingClient, error: clientError, refresh: refreshClient } = await useFetch(
  `/api/v1/clients/${id}`,
  {
    immediate: !isNew,
    transform: (res) => ClientResponseSchema.parse(res).data,
  }
)

const {
  data: historico,
  pending: pendingHistorico,
  error: historicoError,
  refresh: refreshHistorico,
} = await useFetch(`/api/v1/historico-cliente?clientId=${id}&limit=200`,
  {
    immediate: !isNew,
    transform: (res) => HistoricoResponseSchema.parse(res).data,
  }
)

const { handleSubmit, errors, isSubmitting, defineField, resetForm, meta } = useForm({
  validationSchema: ClientFormSchema,
  initialValues: {
    nome: '',
    segmento: 'otica' as any,
    status: 'potencial' as any,
    telefone: '',
    email: '',
    cnpj: '',
    endereco_completo: '',
    cidade: '',
    observacoes: '',
  },
})

const [nome, nomeAttrs] = defineField('nome')
const [segmento, segmentoAttrs] = defineField('segmento')
const [status, statusAttrs] = defineField('status')
const [telefone, telefoneAttrs] = defineField('telefone')
const [email, emailAttrs] = defineField('email')
const [cnpj, cnpjAttrs] = defineField('cnpj')
const [endereco_completo, enderecoAttrs] = defineField('endereco_completo')
const [cidade, cidadeAttrs] = defineField('cidade')
const [observacoes, observacoesAttrs] = defineField('observacoes')

const { metaForClient } = useClientEngagementStatus()
const statusMeta = computed(() => metaForClient(client.value))

const { taskForClient } = useSellerActionPlan()
const task = computed(() => (client.value ? taskForClient(client.value) : null))

const isBusy = computed(() => isSubmitting.value || isMutating.value)
const mapClientToFormValues = (value: typeof client.value) => ({
  nome: value?.nome ?? '',
  segmento: (value?.segmento ?? 'otica') as any,
  status: (value?.status ?? 'potencial') as any,
  telefone: value?.telefone ?? '',
  email: value?.email ?? '',
  cnpj: value?.cnpj ?? '',
  endereco_completo: value?.endereco_completo ?? '',
  cidade: value?.cidade ?? '',
  observacoes: value?.observacoes ?? '',
})

watch(
  () => client.value,
  (value) => {
    if (!value) return
    if (meta.value.dirty) return
    resetForm({ values: mapClientToFormValues(value) })
  },
  { immediate: true }
)

const normalizeOptional = (value: string | undefined) => {
  const normalized = (value ?? '').trim()
  return normalized ? normalized : undefined
}

const onSubmit = handleSubmit(async (values) => {
  submitError.value = ''
  submitSuccess.value = ''

  try {
    if (isNew) {
      const novoCliente = await createClient({
        nome: values.nome.trim(),
        segmento: values.segmento,
        status: values.status,
        telefone: normalizeOptional(values.telefone),
        email: normalizeOptional(values.email),
        cnpj: normalizeOptional(values.cnpj),
        endereco_completo: values.endereco_completo.trim(),
        cidade: normalizeOptional(values.cidade),
        observacoes: normalizeOptional(values.observacoes),
      })

      submitSuccess.value = `Cliente "${novoCliente.nome}" criado com sucesso!`

      setTimeout(() => {
        router.push(`/admin/clients/${novoCliente.id}`)
      }, 1500)
    } else {
      const updates: Record<string, unknown> = {}
      const nextNome = values.nome.trim()
      const nextEndereco = values.endereco_completo.trim()
      const nextTelefone = normalizeOptional(values.telefone)
      const nextEmail = normalizeOptional(values.email)
      const nextCnpj = normalizeOptional(values.cnpj)
      const nextCidade = normalizeOptional(values.cidade)
      const nextObservacoes = normalizeOptional(values.observacoes)

      if (nextNome !== (client.value?.nome ?? '')) updates.nome = nextNome
      if (values.segmento !== client.value?.segmento) updates.segmento = values.segmento
      if (values.status !== client.value?.status) updates.status = values.status
      if (nextTelefone !== (client.value?.telefone ?? undefined)) updates.telefone = nextTelefone
      if (nextEmail !== (client.value?.email ?? undefined)) updates.email = nextEmail
      if (nextCnpj !== (client.value?.cnpj ?? undefined)) updates.cnpj = nextCnpj
      if (nextEndereco !== (client.value?.endereco_completo ?? '')) updates.endereco_completo = nextEndereco
      if (nextCidade !== (client.value?.cidade ?? undefined)) updates.cidade = nextCidade
      if (nextObservacoes !== (client.value?.observacoes ?? undefined)) updates.observacoes = nextObservacoes

      if (Object.keys(updates).length === 0) {
        submitError.value = 'Nenhuma alteração detectada'
        return
      }

      await patchClient(id, updates)
      await refreshClient()

      submitSuccess.value = 'Cliente atualizado com sucesso!'

      setTimeout(() => {
        submitSuccess.value = ''
      }, 3000)
    }
  } catch (error: any) {
    console.error('Erro ao salvar cliente:', error)
    submitError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.message ||
      'Erro ao salvar cliente. Tente novamente.'
  }
})

function formatDate(iso: string | undefined) {
  if (!iso) return '--'
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
  } catch (e) {
    console.warn('Invalid date:', iso)
    return '--'
  }
}
function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function whatsAppUrl(telefoneRaw: string, nome: string) {
  const telefone = String(telefoneRaw || '').replace(/\D/g, '')
  if (!telefone) return '#'
  const mensagem = encodeURIComponent(`Olá ${nome}! Sou representante comercial e gostaria de falar com você.`)
  return `https://wa.me/55${telefone}?text=${mensagem}`
}

async function handleInativar() {
  if (!client.value) return
  
  const confirmar = confirm(`Tem certeza que deseja inativar o cliente "${client.value.nome}"?`)
  if (!confirmar) return

  isMutating.value = true
  submitError.value = ''
  submitSuccess.value = ''

  try {
    await patchClient(id, { status: 'inativo' })
    
    // Recarregar cliente do servidor
    await refreshClient()
    
    submitSuccess.value = 'Cliente inativado com sucesso!'
    
    // Recarregar histórico
    await refreshHistorico()
    
    setTimeout(() => {
      submitSuccess.value = ''
    }, 3000)
  } catch (error: any) {
    console.error('Erro ao inativar cliente:', error)
    submitError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.message ||
      'Erro ao inativar cliente. Tente novamente.'
  } finally {
    isMutating.value = false
  }
}

async function handleReativar() {
  if (!client.value) return
  
  const confirmar = confirm(`Tem certeza que deseja reativar o cliente "${client.value.nome}"?`)
  if (!confirmar) return

  isMutating.value = true
  submitError.value = ''
  submitSuccess.value = ''

  try {
    await patchClient(id, { status: 'ativo' })
    
    // Recarregar cliente do servidor
    await refreshClient()
    
    submitSuccess.value = 'Cliente reativado com sucesso!'
    
    // Recarregar histórico
    await refreshHistorico()
    
    setTimeout(() => {
      submitSuccess.value = ''
    }, 3000)
  } catch (error: any) {
    console.error('Erro ao reativar cliente:', error)
    submitError.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.message ||
      'Erro ao reativar cliente. Tente novamente.'
  } finally {
    isMutating.value = false
  }
}
</script>
