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
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Nome -->
        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            Nome do Cliente *
          </NTypo>
          <NInput
            v-model="form.nome"
            type="text"
            placeholder="Ex: Ótica Visão Clara"
            required
          />
          <NTypo v-if="errors.nome" size="xs" class="text-red-600 mt-1">{{ errors.nome }}</NTypo>
        </div>

        <!-- Segmento e Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
              Segmento *
            </NTypo>
            <NSelect v-model="form.segmento" required>
              <option value="otica">👓 Ótica</option>
              <option value="relojoaria">⌚ Relojoaria</option>
              <option value="semijoia">💍 Semi-joias</option>
              <option value="multimarcas">🏪 Multimarcas</option>
            </NSelect>
          </div>

          <div>
            <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
              Status
            </NTypo>
            <NSelect v-model="form.status">
              <option value="ativo">✅ Ativo</option>
              <option value="potencial">🎯 Potencial</option>
              <option value="inativo">⏸️ Inativo</option>
            </NSelect>
          </div>
        </div>

        <!-- Contato -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
              Telefone
            </NTypo>
            <NInput
              v-model="form.telefone"
              type="tel"
              placeholder="(48) 99999-9999"
            />
          </div>

          <div>
            <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
              Email
            </NTypo>
            <NInput
              v-model="form.email"
              type="email"
              placeholder="contato@exemplo.com"
            />
          </div>
        </div>

        <!-- CNPJ -->
        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            CNPJ
          </NTypo>
          <NInput
            v-model="form.cnpj"
            type="text"
            placeholder="00.000.000/0000-00"
          />
        </div>

        <!-- Endereço Completo -->
        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            Endereço Completo *
          </NTypo>
          <NInput
            v-model="form.endereco_completo"
            type="text"
            placeholder="Rua, número, bairro, cidade - SC"
            required
          />
          <NTypo size="xs" tone="muted" class="mt-1">
            Este endereço será geocodificado automaticamente
          </NTypo>
        </div>

        <!-- Cidade (opcional, extraído do geocoding) -->
        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            Cidade
          </NTypo>
          <NInput
            v-model="form.cidade"
            type="text"
            placeholder="Ex: Florianópolis"
          />
        </div>

        <!-- Observações -->
        <div>
          <NTypo as="label" size="xs" weight="semibold" tone="muted" class="block mb-1.5">
            Observações
          </NTypo>
          <NTextArea
            v-model="form.observacoes"
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
            :disabled="isSubmitting"
            class="sm:flex-1"
          >
            {{ isSubmitting ? '⏳ Salvando...' : isNew ? '📝 Criar Cliente' : '💾 Salvar Alterações' }}
          </NButton>
          <NButton
            as="NuxtLink"
            to="/admin/clients"
            variant="outline"
            :disabled="isSubmitting"
            class="sm:flex-1"
          >
            Cancelar
          </NButton>
        </div>
      </form>
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
import { ClientDtoSchema, HistoricoClienteDtoSchema } from '~/types/schemas'
import { useClientsApi } from '~/composables/useClientsApi'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')
const isNew = id === 'new'

const { createClient, patchClient } = useClientsApi()

// Form state
const form = ref({
  nome: '',
  segmento: 'otica' as 'otica' | 'relojoaria' | 'semijoia' | 'multimarcas',
  status: 'potencial' as 'ativo' | 'potencial' | 'inativo',
  telefone: '',
  email: '',
  cnpj: '',
  endereco_completo: '',
  cidade: '',
  observacoes: '',
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

// Schemas
const ClientResponseSchema = z.object({ success: z.boolean(), data: ClientDtoSchema })
const HistoricoResponseSchema = z.object({ success: z.boolean(), data: z.array(HistoricoClienteDtoSchema) })

// Fetch client (somente se não for novo)
const { data: client, pending: pendingClient, error: clientError } = await useFetch(
  isNew ? null : `/api/v1/clients/${encodeURIComponent(id)}`,
  { 
    transform: (res) => ClientResponseSchema.parse(res).data,
    immediate: !isNew,
  }
)

// Popular form quando carregar cliente existente
watch(client, (clientData) => {
  if (clientData) {
    form.value = {
      nome: clientData.nome || '',
      segmento: (clientData.segmento || 'otica') as any,
      status: (clientData.status || 'potencial') as any,
      telefone: clientData.telefone || '',
      email: clientData.email || '',
      cnpj: clientData.cnpj || '',
      endereco_completo: clientData.endereco_completo || clientData.endereco?.endereco_completo || '',
      cidade: clientData.cidade || clientData.endereco?.cidade || '',
      observacoes: clientData.observacoes || '',
    }
  }
}, { immediate: true })

// Fetch histórico (somente se não for novo)
const {
  data: historico,
  pending: pendingHistorico,
  error: historicoError,
  refresh: refreshHistorico,
} = await useFetch(
  isNew ? null : `/api/v1/historico-cliente?clientId=${encodeURIComponent(id)}&limit=200`,
  {
    transform: (res) => HistoricoResponseSchema.parse(res).data,
    immediate: !isNew,
  }
)

// Validação básica
function validateForm(): boolean {
  errors.value = {}
  
  if (!form.value.nome.trim()) {
    errors.value.nome = 'Nome é obrigatório'
    return false
  }
  
  if (!form.value.endereco_completo.trim()) {
    errors.value.endereco_completo = 'Endereço é obrigatório'
    return false
  }
  
  return true
}

// Submit
async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  submitSuccess.value = ''

  try {
    if (isNew) {
      // Criar novo cliente
      const novoCliente = await createClient({
        nome: form.value.nome,
        segmento: form.value.segmento,
        status: form.value.status,
        telefone: form.value.telefone || undefined,
        email: form.value.email || undefined,
        cnpj: form.value.cnpj || undefined,
        endereco_completo: form.value.endereco_completo,
        cidade: form.value.cidade || undefined,
        observacoes: form.value.observacoes || undefined,
      })

      submitSuccess.value = `Cliente "${novoCliente.nome}" criado com sucesso!`
      
      // Redirecionar após 1.5s
      setTimeout(() => {
        router.push(`/admin/clients/${novoCliente.id}`)
      }, 1500)
    } else {
      // Atualizar cliente existente
      const updates: any = {}
      if (form.value.nome !== client.value?.nome) updates.nome = form.value.nome
      if (form.value.segmento !== client.value?.segmento) updates.segmento = form.value.segmento
      if (form.value.status !== client.value?.status) updates.status = form.value.status
      if (form.value.telefone !== client.value?.telefone) updates.telefone = form.value.telefone
      if (form.value.email !== client.value?.email) updates.email = form.value.email
      if (form.value.cnpj !== client.value?.cnpj) updates.cnpj = form.value.cnpj
      if (form.value.endereco_completo !== client.value?.endereco_completo) {
        updates.endereco_completo = form.value.endereco_completo
      }
      if (form.value.cidade !== client.value?.cidade) updates.cidade = form.value.cidade
      if (form.value.observacoes !== client.value?.observacoes) updates.observacoes = form.value.observacoes

      if (Object.keys(updates).length === 0) {
        submitError.value = 'Nenhuma alteração detectada'
        return
      }

      await patchClient(id, updates)
      submitSuccess.value = 'Cliente atualizado com sucesso!'

      // Limpar mensagem após 3s
      setTimeout(() => {
        submitSuccess.value = ''
      }, 3000)
    }
  } catch (error: any) {
    console.error('Erro ao salvar cliente:', error)
    submitError.value = error?.data?.message || error?.message || 'Erro ao salvar cliente. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}
function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
</script>
