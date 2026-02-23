<template>
  <div class="min-h-screen">
    <div class="w-full px-3 py-4 lg:px-4 lg:py-6 space-y-3">
      <div class="flex gap-2 md:gap-3 overflow-x-auto pb-1">
        <div class="flex-1 min-w-[240px] bg-emerald-50 border border-emerald-100 rounded-lg p-3">
          <div class="grid gap-2 md:grid-cols-[120px_1fr] md:items-start">
            <div>
              <NTypo size="xs" tone="muted" class="mb-1">Clientes</NTypo>
              <NTypo size="xl" weight="bold" class="tabular-nums text-emerald-500 lg:text-2xl">
                {{ formatCompactNumber(visitedStats.total) }}
              </NTypo>
            </div>
            <div class="text-[11px] font-semibold">
              <div class="flex flex-wrap gap-x-3 gap-y-1">
                <span class="inline-flex items-center gap-1 text-emerald-700">
                  <span class="h-2 w-2 rounded-full bg-emerald-500" />
                  {{ visitedStats.clientes }} clientes
                </span>
                <span class="inline-flex items-center gap-1 text-blue-700">
                  <span class="h-2 w-2 rounded-full bg-blue-500" />
                  {{ visitedStats.comerciais }} comercial
                </span>
                <span class="inline-flex items-center gap-1 text-gray-700">
                  <span class="h-2 w-2 rounded-full bg-gray-400" />
                  {{ visitedStats.prospectos }} prospectos
                </span>
              </div>
              <div class="mt-2 pt-2 border-t border-emerald-100 flex flex-wrap gap-x-3 gap-y-1">
                <span class="inline-flex items-center gap-1 text-emerald-700">
                  <span class="h-2 w-2 rounded-full bg-emerald-500" />
                  {{ visitedStats.ativosVerde }} ativo
                </span>
                <span class="inline-flex items-center gap-1 text-yellow-700">
                  <span class="h-2 w-2 rounded-full bg-yellow-500" />
                  {{ visitedStats.ativosAmarelo }} atenção
                </span>
                <span class="inline-flex items-center gap-1 text-red-700">
                  <span class="h-2 w-2 rounded-full bg-red-500" />
                  {{ visitedStats.ativosVermelho }} crítico
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 min-w-[240px] bg-sky-50 border border-sky-100 rounded-lg p-3 lg:p-4">
          <div class="grid gap-2 md:grid-cols-[120px_1fr] md:items-start">
            <div>
              <NTypo size="xs" tone="muted" class="mb-1">Contatos nesse mês</NTypo>
              <NTypo size="xl" weight="bold" class="tabular-nums text-sky-500 lg:text-2xl">
                {{ formatCompactNumber(visitedStats.contatosNoMes) }}
              </NTypo>
            </div>
            <div class="text-[11px] font-semibold" :class="contatosVsMesAnterior.class">
              <NTypo size="xs" tone="muted" class="mt-1">
                Mes anterior: {{ formatCompactNumber(contactsPrevMonth) }}
              </NTypo>
              <div class="flex items-center gap-1">
                <NIcon :name="contatosVsMesAnterior.icon" class="w-4 h-4" />
                <span class="tabular-nums">{{ contatosVsMesAnterior.text }}</span>
                <span class="font-medium text-slate-500">vs mês anterior</span>
              </div>
            </div>
          </div>
        </div>
        <div
          class="flex-1 min-w-[240px] bg-violet-50 border border-violet-100 rounded-lg p-3 lg:p-4"
        >
          <div class="grid gap-2 md:grid-cols-2 md:items-start">
            <div>
              <NTypo size="xs" tone="muted" class="mb-1"
                >Mensal / ant {{ formatCurrency(salesTotals.monthPrev) }}</NTypo
              >
              <NTypo size="xl" weight="bold" class="tabular-nums text-violet-500">
                {{ formatCurrency(visitedStats.faturamentoMensal) }}
              </NTypo>

              <div>
                <div class="flex items-center gap-1" :class="mensalVsMesAnterior.class">
                  <NIcon :name="mensalVsMesAnterior.icon" class="w-4 h-4" />
                  <NTypo size="xs">{{ mensalVsMesAnterior.text }}</NTypo>
                  <NTypo size="xs">vs mês anterior</NTypo>
                </div>
              </div>
            </div>
            <div class="space-y-1 text-[11px] font-semibold">
              <!-- Meta do mês -->
              <div v-if="currentMonthGoal > 0" class="mb-2 pb-2 border-b border-violet-200">
                <NTypo size="xs" tone="muted"> Meta: {{ formatCurrency(currentMonthGoal) }} </NTypo>
                <div class="flex items-center gap-2 mt-1">
                  <div class="flex-1 bg-violet-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="
                        goalProgress && goalProgress.percentage >= 80
                          ? 'bg-emerald-500'
                          : goalProgress && goalProgress.percentage >= 50
                            ? 'bg-violet-500'
                            : 'bg-amber-500'
                      "
                      :style="{ width: `${Math.min(100, goalProgress?.percentage || 0)}%` }"
                    />
                  </div>
                  <span
                    class="text-xs font-bold tabular-nums"
                    :class="
                      goalProgress && goalProgress.percentage >= 80
                        ? 'text-emerald-600'
                        : goalProgress && goalProgress.percentage >= 50
                          ? 'text-violet-600'
                          : 'text-amber-600'
                    "
                  >
                    {{ Math.round(goalProgress?.percentage || 0) }}%
                  </span>
                </div>
                <div
                  v-if="goalProgress && goalProgress.remaining > 0"
                  class="flex items-center gap-1 mt-1 text-violet-700"
                >
                  <NIcon name="mdi:target" class="w-3 h-3" />
                  <span>Faltam {{ formatCurrency(goalProgress.remaining) }}</span>
                </div>
                <div
                  v-else-if="goalProgress && goalProgress.remaining <= 0"
                  class="flex items-center gap-1 mt-1 text-emerald-700"
                >
                  <NIcon name="mdi:check-circle" class="w-3 h-3" />
                  <span>Meta atingida! 🎉</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 min-w-[240px] bg-amber-50 border border-amber-100 rounded-lg p-3 lg:p-4">
          <div class="grid gap-2 md:grid-cols-[120px_1fr] md:items-start">
            <div>
              <NTypo size="xs" tone="muted" class="mb-1">Trimestral</NTypo>
              <NTypo size="xl" weight="bold" class="tabular-nums text-amber-600 lg:text-2xl">
                {{ formatCurrency(visitedStats.faturamentoTrimestral) }}
              </NTypo>
            </div>
            <div class="space-y-1 text-[11px] font-semibold">
              <NTypo size="xs" tone="muted" class="mt-1">
                Trimestre anterior: {{ formatCurrency(salesTotals.quarterPrev) }}
              </NTypo>
              <div class="flex items-center gap-1" :class="trimestralVsTrimestreAnterior.class">
                <NIcon :name="trimestralVsTrimestreAnterior.icon" class="w-4 h-4" />
                <span class="tabular-nums">{{ trimestralVsTrimestreAnterior.text }}</span>
                <span class="font-medium text-slate-500">vs trimestre anterior</span>
              </div>
              <div
                class="flex items-center gap-1"
                :class="trimestralVsMesmoTrimestreAnoAnterior.class"
              >
                <NIcon :name="trimestralVsMesmoTrimestreAnoAnterior.icon" class="w-4 h-4" />
                <span class="tabular-nums">{{ trimestralVsMesmoTrimestreAnoAnterior.text }}</span>
                <span class="font-medium text-slate-500">vs ano anterior</span>
              </div>
            </div>
          </div>
        </div>
        <div
          class="flex-1 min-w-[240px] bg-orange-50 border border-orange-100 rounded-lg p-3 lg:p-4"
        >
          <div class="grid gap-2 md:grid-cols-[120px_1fr] md:items-start">
            <div>
              <NTypo size="xs" tone="muted" class="mb-1">Anual</NTypo>
              <NTypo size="xl" weight="bold" class="tabular-nums text-orange-500 lg:text-2xl">
                {{ formatCurrency(visitedStats.faturamentoAnual) }}
              </NTypo>
            </div>
            <div class="text-[11px] font-semibold" :class="anualVsAnoAnterior.class">
              <NTypo size="xs" tone="muted" class="mt-1">
                Ano anterior: {{ formatCurrency(salesTotals.yearPrevYear) }}
              </NTypo>
              <div class="flex items-center gap-1">
                <NIcon :name="anualVsAnoAnterior.icon" class="w-4 h-4" />
                <span class="tabular-nums">{{ anualVsAnoAnterior.text }}</span>
                <span class="font-medium text-slate-500">vs ano anterior</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Filtros + Stats -->

      <!-- Mapa + painel -->
      <div class="grid !grid-cols-1 md:!grid-cols-12 lg:!grid-cols-12 gap-4 lg:gap-6">
        <div
          class="md:!col-span-9 lg:!col-span-9 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-2xl overflow-hidden border border-gray-200 bg-white h-[450px] sm:h-[550px] lg:h-[700px] relative"
        >
          <!-- Controles de visibilidade -->
          <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <button
              @click="mostrarClientes = !mostrarClientes"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all text-sm font-semibold',
                mostrarClientes
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300',
              ]"
              :title="mostrarClientes ? 'Esconder clientes' : 'Mostrar clientes'"
            >
              <NIcon :name="mostrarClientes ? 'mdi:eye' : 'mdi:eye-off'" class="w-4 h-4" />
              <span>Clientes</span>
            </button>

            <button
              @click="mostrarComerciais = !mostrarComerciais"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all text-sm font-semibold',
                mostrarComerciais
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300',
              ]"
              :title="mostrarComerciais ? 'Esconder comercial' : 'Mostrar comercial'"
            >
              <NIcon :name="mostrarComerciais ? 'mdi:eye' : 'mdi:eye-off'" class="w-4 h-4" />
              <span>Comercial</span>
            </button>

            <button
              @click="mostrarProspectos = !mostrarProspectos"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all text-sm font-semibold',
                mostrarProspectos
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300',
              ]"
              :title="mostrarProspectos ? 'Esconder prospectos' : 'Mostrar prospectos'"
            >
              <NIcon :name="mostrarProspectos ? 'mdi:eye' : 'mdi:eye-off'" class="w-4 h-4" />
              <span>Prospectos</span>
            </button>
          </div>

          <NLayer
            variant="paper"
            size="base"
            radius="soft"
            class="absolute bottom-4 left-4 right-4 z-10 w-auto px-3 py-2 shadow-sm lg:shadow-lg"
          >
            <div class="flex flex-nowrap items-end gap-3">
              <div class="min-w-[260px] flex-1">
                <NTypo
                  as="label"
                  size="xs"
                  weight="semibold"
                  tone="muted"
                  class="block mb-1 leading-none"
                >
                  Buscar
                </NTypo>
                <NButton
                  v-if="searchQuery || filterSegmento || filterTipo"
                  @click="handleClearFilters"
                  variant="outline"
                  size="zs"
                  class="absolute right-2 top-2"
                >
                  Limpar filtros
                </NButton>
                <div class="relative">
                  <NTypo
                    as="span"
                    size="sm"
                    tone="muted"
                    class="absolute left-3 top-1/2 -translate-y-1/2"
                  >
                    🔎
                  </NTypo>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Nome, cidade, endereço ou CNPJ..."
                    class="w-full pl-10 pr-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>

              <div class="min-w-[150px]">
                <NTypo
                  as="label"
                  size="xs"
                  weight="semibold"
                  tone="muted"
                  class="block mb-1 leading-none"
                >
                  Segmento
                </NTypo>
                <select
                  v-model="filterSegmento"
                  class="w-full px-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                >
                  <option value="">Todos</option>
                  <option value="joalheria">💎 Joalheria</option>
                  <option value="relojoaria">⌚ Relojoaria</option>
                  <option value="otica">👓 Ótica</option>
                  <option value="outros">🏪 Outros</option>
                </select>
              </div>

              <div class="min-w-[160px]">
                <NTypo
                  as="label"
                  size="xs"
                  weight="semibold"
                  tone="muted"
                  class="block mb-1 leading-none"
                >
                  Status
                </NTypo>
                <select
                  v-model="filterTipo"
                  class="w-full px-3 py-2 rounded-lg border bg-white border-gray-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                >
                  <option value="">Todos</option>
                  <option value="ativo">✅ Ativo (≤90d)</option>
                  <option value="ativo_mes">📈 Ativo mes (venda no mes)</option>
                  <option value="atencao">⚠️ Em atenção (91–180d)</option>
                  <option value="critico">🚨 Crítico / Reativar (&gt;180d)</option>
                  <option value="potencial">🎯 Potencial</option>
                  <option value="inativo">⏸️ Inativo</option>
                </select>
              </div>

              <div class="min-w-[150px]">
                <NTypo
                  as="label"
                  size="xs"
                  weight="semibold"
                  tone="muted"
                  class="block mb-1 leading-none"
                >
                  Ranking
                </NTypo>
                <NSelect
                  :model-value="topRankSelectValue"
                  :options="rankPresets"
                  size="md"
                  class="w-full"
                  :disabled="!maxRankLimit || mapViewMode === 'city'"
                  @update:modelValue="handleTopRankSelect"
                />
              </div>

              <div class="min-w-[160px]">
                <NTypo
                  as="label"
                  size="xs"
                  weight="semibold"
                  tone="muted"
                  class="block mb-1 leading-none"
                >
                  Visualização
                </NTypo>
                <NSelect
                  :model-value="mapViewMode"
                  :options="mapViewOptions"
                  size="md"
                  class="w-full"
                  @update:modelValue="handleMapViewModeChange"
                />
              </div>
            </div>
          </NLayer>

          <BrokerMaps
            v-if="visitedMapData"
            :markers="createVisitedMarkers"
            :polygons="activeMapPolygons"
            :selected-polygon-id="selectedPolygonId"
            :cluster-mode="mapClusterMode"
            :center-lat="visitedMapData.mapSettings.center.lat"
            :center-lng="visitedMapData.mapSettings.center.lng"
            :zoom="visitedMapData.mapSettings.zoom"
            class="h-full"
            @marker-click="handleVisitedMarkerClick"
            @polygon-click="handleMapPolygonClick"
          />
          <div
            v-if="mapViewMode === 'city' && cityModeState === 'detail'"
            class="absolute top-4 right-4 z-10 flex items-center gap-2"
          >
            <NButton
              variant="outline"
              size="zs"
              leading-icon="mdi:arrow-left"
              class="bg-white"
              @click="backToCityOverview"
            >
              Voltar para cidades
            </NButton>
            <span
              class="rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm"
            >
              {{ selectedCityLabel }}
            </span>
          </div>
          <div v-if="!visitedMapData" class="h-full flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-4">🗺️</div>
              <NTypo size="sm" tone="muted" weight="medium">Carregando mapa...</NTypo>
            </div>
          </div>
        </div>

        <!-- Painel desktop (sidebar) -->
        <div class="hidden md:block lg:block md:!col-span-3 lg:!col-span-3 h-[700px]">
          <ClientSidePanel
            :is-open="true"
            :client-data="selectedClient"
            :show-close="false"
            @add-action="handleAddAction"
            @edit-client="handleOpenEditarCliente"
            @remove-client="handleRemoveCliente"
            @edit-evento="handleEditEvento"
            @delete-evento="handleDeleteEvento"
          />
        </div>

        <!-- Painel mobile (drawer no fluxo do documento) -->
        <Transition name="slide-down">
          <ClientSidePanel
            class="lg:hidden"
            v-if="selectedClient && isSidePanelOpen"
            :is-open="true"
            :client-data="selectedClient"
            :show-close="false"
            @add-action="handleAddAction"
            @edit-client="handleOpenEditarCliente"
            @remove-client="handleRemoveCliente"
            @edit-evento="handleEditEvento"
            @delete-evento="handleDeleteEvento"
          />
        </Transition>
      </div>
<div class="grid grid-cols-2 gap-4">
  
      <!-- Mensagem quando não há clientes -->
      <div
        v-if="!clientes.length"
        class="text-center py-12 lg:py-16 rounded-xl shadow-sm border border-gray-200 bg-white mx-4"
      >
        <div class="text-5xl lg:text-6xl mb-3 lg:mb-4">👥</div>
        <NTypo as="h3" size="lg" weight="bold" class="mb-2 lg:text-xl"
          >Nenhum cliente cadastrado ainda</NTypo
        >
        <NTypo size="sm" tone="muted" class="lg:text-base">
          Comece adicionando seus clientes usando o formulário acima!
        </NTypo>
      </div>

      <NLayer v-else variant="paper" size="base" radius="soft" class="shadow-sm lg:shadow-lg">
        <div class="flex items-start justify-between gap-3">
          <div>
            <NTypo as="h2" size="sm" weight="bold">Clientes visíveis no mapa</NTypo>
            <NTypo size="xs" tone="muted" class="mt-0.5">
              {{ mapScopeDescription }}
            </NTypo>
          </div>
          <span
            class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
          >
            {{ mapVisibleClients.length }} clientes
          </span>
        </div>

        <div
          v-if="!mapVisibleClients.length"
          class="mt-3 rounded-lg border border-dashed border-slate-200 p-4 text-center"
        >
          <NTypo size="sm" tone="muted">Nenhum cliente no recorte atual do mapa.</NTypo>
        </div>

        <div
          v-else
          class="mt-3 divide-y rounded-lg border border-gray-100 bg-white overflow-hidden"
        >
          <button
            v-for="cliente in mapVisibleClients.slice(0, 60)"
            :key="cliente.id"
            type="button"
            class="w-full px-3 py-3 text-left hover:bg-slate-50 transition-colors"
            @click="selectClientFromList(cliente.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <NTypo weight="bold" class="truncate">{{ cliente.nome }}</NTypo>
                <NTypo size="xs" tone="muted" class="mt-1 truncate">
                  <span>{{ cliente.cidade || 'Sem cidade' }}</span>
                  <span v-if="cliente.segmento"> • {{ cliente.segmento }}</span>
                </NTypo>
              </div>
              <span
                class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                :class="metaForClient(cliente).chipClass"
              >
                <span class="h-2 w-2 rounded-full" :class="metaForClient(cliente).dotClass" />
                {{ metaForClient(cliente).label }}
              </span>
            </div>
          </button>
        </div>
      </NLayer>

      <NLayer
        v-if="actionPlanTop.length"
        variant="paper"
        size="base"
        radius="soft"
        class="shadow-sm lg:shadow-lg"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <NTypo as="h2" size="sm" weight="bold">Plano de ação</NTypo>
            <NTypo size="xs" tone="muted" class="mt-0.5">
              Comece pelos críticos com maior impacto e follow-ups atrasados.
            </NTypo>
          </div>
          <NButton variant="outline" size="zs" leading-icon="mdi:refresh" @click="loadClients()">
            Atualizar
          </NButton>
        </div>

        <div class="mt-3 divide-y rounded-lg border border-gray-100 bg-white overflow-hidden">
          <NuxtLink
            v-for="task in actionPlanTop"
            :key="task.clientId"
            :to="`/admin/clients/${task.clientId}`"
            class="block w-full px-3 py-3 hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <NTypo weight="bold" class="truncate">{{ task.nome }}</NTypo>
                  <span
                    class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    :class="metaForKey(task.statusKey).chipClass"
                  >
                    <span
                      class="h-2 w-2 rounded-full"
                      :class="metaForKey(task.statusKey).dotClass"
                    />
                    {{ metaForKey(task.statusKey).emoji }} {{ metaForKey(task.statusKey).label }}
                  </span>
                  <span
                    class="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                  >
                    {{ task.priority }}
                  </span>
                </div>

                <NTypo size="xs" tone="muted" class="mt-1 truncate">
                  <span v-if="task.cidade">{{ task.cidade }}</span>
                  <span v-if="task.cidade && task.segmento"> • </span>
                  <span v-if="task.segmento">{{ task.segmento }}</span>
                  <span v-if="task.valueMetricLabel && task.valueMetric > 0">
                    • {{ task.valueMetricLabel }}</span
                  >
                </NTypo>

                <NTypo v-if="task.reasons.length" size="xs" class="mt-1 text-slate-700">
                  {{ task.suggestedActionLabel }} • {{ task.reasons.join(' · ') }}
                </NTypo>
              </div>

              <div class="shrink-0 flex items-center gap-2" @click.prevent>
                <NButton
                  v-if="task.telefone"
                  variant="success"
                  size="zs"
                  leading-icon="mdi:whatsapp"
                  :href="whatsAppUrl(task.telefone, task.nome)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </NButton>
              </div>
            </div>
          </NuxtLink>
        </div>
      </NLayer>

      <div v-if="loadClientsError" class="rounded-xl border border-red-200 bg-red-50 p-3 lg:p-4">
        <NTypo size="sm" weight="semibold" class="text-red-700">
          Falha ao carregar clientes: {{ loadClientsError }}
        </NTypo>
        <NTypo size="xs" tone="muted" class="mt-1">
          Verifique se o Mongo está rodando e se `NUXT_MONGO_URI` / `NUXT_MONGO_DB_NAME` estão
          configurados.
        </NTypo>
      </div>
</div>
    </div>
    <!-- Modais -->
    <ModalNovaVisita
      :is-open="isModalNovaVisitaOpen"
      :cliente-nome="selectedClient?.nome || ''"
      :initial-action-type="modalActionType"
      :default-user-id="currentUserId"
      :evento="editingEvento"
      @close="handleCloseNovaVisita"
      @submit="handleSubmitNovaVisita"
    />

    <ModalEditarCliente
      :is-open="isModalEditarClienteOpen"
      :cliente="selectedClient"
      @close="isModalEditarClienteOpen = false"
      @submit="handleSubmitEditarCliente"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Cliente } from '~/types/client'
import type { TerritoryCityDto, TerritoryStateDto } from '~/types/schemas'
import type { CityGeoFeature } from '~/composables/useCityGeo'
import { useCityGeo } from '~/composables/useCityGeo'
import { useClientsApi } from '~/composables/useClientsApi'
import { useHistoricoClienteApi } from '~/composables/useHistoricoClienteApi'
import { useTerritoryApi } from '~/composables/useTerritoryApi'

interface MapData {
  markers: any[]
  polygons: any[]
  mapSettings: {
    center: { lat: number; lng: number }
    zoom: number
  }
}

type MapPolygon = {
  id?: string
  paths: Array<{ lat: number; lng: number }>
  strokeColor?: string
  strokeOpacity?: number
  strokeWeight?: number
  fillColor?: string
  fillOpacity?: number
  label?: string
}

type CityMapBucket = 'blue' | 'yellow' | 'red' | 'gray'

type CityAggregate = {
  id: string
  name: string
  count: number
  score: number
  rank: number
  centroid: { lat: number; lng: number }
  bucket: CityMapBucket
  colorHex: string
}

type ClientMapPosition = {
  lat: number
  lng: number
  approximate: boolean
}

const visitedMapData = ref<MapData | null>(null)
const scCityFeatures = ref<CityGeoFeature[]>([])
const loadedCityUfKey = ref('')
const clientes = ref<Cliente[]>([])
const territoryStates = ref<TerritoryStateDto[]>([])
const territoryCities = ref<TerritoryCityDto[]>([])
const mapViewMode = ref<'clients' | 'city'>('city')
const cityModeState = ref<'overview' | 'detail'>('overview')
const selectedCityId = ref('')
const salesTotals = ref<{
  month: number
  monthPrev: number
  monthPrevYear: number
  quarter: number
  quarterPrev: number
  quarterPrevYear: number
  year: number
  yearPrevYear: number
}>({
  month: 0,
  monthPrev: 0,
  monthPrevYear: 0,
  quarter: 0,
  quarterPrev: 0,
  quarterPrevYear: 0,
  year: 0,
  yearPrevYear: 0,
})
const contactsThisMonth = ref(0)
const contactsPrevMonth = ref(0)
const loadClientsError = ref('')
const isSidePanelOpen = ref(false)
const selectedClient = ref<Cliente | null>(null)
const isModalNovaVisitaOpen = ref(false)
const modalActionType = ref<
  | 'visita_fisica'
  | 'atendimento_online'
  | 'ligacao'
  | 'venda_fisica'
  | 'venda_online'
  | 'venda_telefone'
>('visita_fisica')
const editingEvento = ref<any>(null)
const isModalEditarClienteOpen = ref(false)
const searchQuery = ref('')
const filterSegmento = ref('')
const filterTipo = ref('')
const mostrarClientes = ref(true)
const mostrarComerciais = ref(true)
const mostrarProspectos = ref(true)
const DEFAULT_TOP_RANK = 50
const topRankLimit = ref<number | null>(DEFAULT_TOP_RANK)
const {
  normalizeText,
  normalizeNumericId,
  cityNameKey,
  parsePolygonGeometry,
  extractCityFeatures,
  fetchCityGeoJsonByUf,
} = useCityGeo()
const { fetchStates, fetchCities } = useTerritoryApi()

const { fetchClients, patchClient, deleteClient } = useClientsApi()
const { createEvento, updateEvento, deleteEvento } = useHistoricoClienteApi()
const { keyForClient, metaForClient, metaForKey } = useClientEngagementStatus()
const { topTasks } = useSellerActionPlan()
const currentUserId = 'user-app'

// Buscar configurações (metas mensais)
const { data: settingsData } = await useFetch('/api/v1/settings')
const monthlyGoals = computed(() => {
  const data = settingsData.value as any
  return data?.data?.monthlyGoals || {}
})

// Meta do mês atual
const currentMonthKey = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
})
const currentMonthGoal = computed(() => monthlyGoals.value[currentMonthKey.value] || 0)

// Progresso em relação à meta
const goalProgress = computed(() => {
  if (!currentMonthGoal.value) return null
  const percentage = (salesTotals.value.month / currentMonthGoal.value) * 100
  return {
    percentage,
    remaining: currentMonthGoal.value - salesTotals.value.month,
    isOnTrack: percentage >= 50, // Considera "on track" se atingiu pelo menos 50% (ajustável)
  }
})

const mapViewOptions = [
  { value: 'clients', label: 'Clientes' },
  { value: 'city', label: 'Cidade' },
]

function normalizeCityNameForMatch(value: string | undefined) {
  return normalizeText(value)
    .replace(/\b(das|dos|da|de|do)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cityMatchKey(value: string | undefined, uf?: string) {
  const cityName = normalizeCityNameForMatch(value)
  if (!cityName) return ''
  const normalizedUf = normalizeUf(uf)
  return normalizedUf ? `${normalizedUf}:${cityName}` : cityName
}

const CITY_BUCKET_COLORS: Record<CityMapBucket, string> = {
  blue: '#3B82F6',
  yellow: '#EAB308',
  red: '#EF4444',
  gray: '#9CA3AF',
}

function toCityScopeId(client: any) {
  const cityId = String(client?.cityId || '').trim()
  if (cityId) return cityId
  const cityName = normalizeText(client?.cidade || client?.endereco?.cidade || '')
  const uf = String(client?.estado || client?.endereco?.uf || '')
    .trim()
    .toUpperCase()
  return cityName ? `city-${uf || 'NA'}-${cityName}` : ''
}

const scCityFeatureById = computed(() => {
  const map = new Map<string, CityGeoFeature>()
  for (const feature of scCityFeatures.value) {
    map.set(feature.id, feature)
  }
  return map
})

const scCityFeatureByName = computed(() => {
  const map = new Map<string, CityGeoFeature>()
  for (const feature of scCityFeatures.value) {
    map.set(cityNameKey(feature.normalizedName, feature.uf), feature)
    if (!map.has(feature.normalizedName)) {
      map.set(feature.normalizedName, feature)
    }
    const strictKey = cityMatchKey(feature.name, feature.uf)
    if (strictKey) {
      map.set(strictKey, feature)
    }
    const looseKey = cityMatchKey(feature.name)
    if (looseKey && !map.has(looseKey)) {
      map.set(looseKey, feature)
    }
  }
  return map
})

const territoryCityById = computed(() => {
  const map = new Map<string, TerritoryCityDto>()
  for (const city of territoryCities.value) {
    map.set(String(city.id), city)
  }
  return map
})

function resolveCityFeatureForClient(client: any) {
  const cityIdRaw = String(client?.cityId || '').trim()
  if (cityIdRaw) {
    const byRawId = scCityFeatureById.value.get(cityIdRaw)
    if (byRawId) return byRawId

    const numericCityId = normalizeNumericId(cityIdRaw)
    if (numericCityId) {
      const byNumericId = scCityFeatureById.value.get(numericCityId)
      if (byNumericId) return byNumericId
    }

    const territoryCity = territoryCityById.value.get(cityIdRaw)
    const ibgeCode = normalizeNumericId(String((territoryCity as any)?.ibgeCode || ''))
    if (ibgeCode) {
      const byIbge = scCityFeatureById.value.get(ibgeCode)
      if (byIbge) return byIbge
    }

    const territoryCityName = normalizeText((territoryCity as any)?.nome)
    if (territoryCityName) {
      const byTerritoryName = scCityFeatureByName.value.get(territoryCityName)
      if (byTerritoryName) return byTerritoryName
    }
    const territoryCityLoose = cityMatchKey((territoryCity as any)?.nome)
    if (territoryCityLoose) {
      const byTerritoryLoose = scCityFeatureByName.value.get(territoryCityLoose)
      if (byTerritoryLoose) return byTerritoryLoose
    }
  }

  const cityRaw = String(client?.cidade || client?.endereco?.cidade || '').trim()
  const cityName = normalizeText(cityRaw)
  if (cityName) {
    const uf = String(client?.estado || client?.endereco?.uf || '')
      .trim()
      .toUpperCase()
    if (uf) {
      const byUfName = scCityFeatureByName.value.get(cityNameKey(cityName, uf))
      if (byUfName) return byUfName
      const byUfLoose = scCityFeatureByName.value.get(cityMatchKey(cityRaw, uf))
      if (byUfLoose) return byUfLoose
    }
    const byLoose = scCityFeatureByName.value.get(cityMatchKey(cityRaw))
    if (byLoose) return byLoose
    const byName = scCityFeatureByName.value.get(cityName)
    if (byName) return byName
  }

  return null
}

function resolveCityScopeIdForClient(client: any) {
  const fromGeo = resolveCityFeatureForClient(client)
  if (fromGeo) return fromGeo.id
  return toCityScopeId(client)
}

function cityColorForAggregate(aggregate: CityAggregate | undefined) {
  return aggregate?.colorHex || CITY_BUCKET_COLORS.gray
}

const cityPolygons = computed<MapPolygon[]>(() => {
  if (scCityFeatures.value.length) {
    return scCityFeatures.value.map((feature) => {
      const aggregate = cityAggregatesById.value.get(feature.id)
      const color = cityColorForAggregate(aggregate)

      return {
        id: feature.id,
        paths: feature.paths,
        strokeColor: color,
        strokeOpacity: aggregate ? 0.9 : 0.55,
        strokeWeight: aggregate ? 2 : 1.2,
        fillColor: color,
        fillOpacity: aggregate ? 0.28 : 0.14,
        label: aggregate
          ? `${feature.name} • ${aggregate.count} oportunidades`
          : `${feature.name} • 0 oportunidades`,
      } as MapPolygon
    })
  }

  const fromDb: MapPolygon[] = territoryCities.value
    .map((city) => {
      const paths = parsePolygonGeometry((city as any).geometry)
      if (!paths.length) return null
      const aggregate = cityAggregatesById.value.get(String(city.id))
      const color = cityColorForAggregate(aggregate)
      return {
        id: city.id,
        paths,
        strokeColor: color,
        fillColor: color,
        fillOpacity: aggregate ? 0.24 : 0.12,
        label: city.nome,
      } as MapPolygon
    })
    .filter(Boolean) as MapPolygon[]

  return fromDb
})

const selectedPolygonId = computed(() => {
  if (mapViewMode.value !== 'city') return null
  return selectedCityId.value || null
})

const activeMapPolygons = computed<MapPolygon[]>(() => {
  if (mapViewMode.value !== 'city') return []

  if (cityModeState.value === 'overview') {
    return cityPolygons.value
  }

  if (!selectedCityId.value) return []

  const selected = cityPolygons.value.find(
    (polygon) => String(polygon.id || '') === selectedCityId.value
  )
  if (!selected) return []

  return [
    {
      ...selected,
      strokeColor: '#9CA3AF',
      fillColor: '#9CA3AF',
      fillOpacity: 0,
      strokeOpacity: 1,
      strokeWeight: Math.max(3, selected.strokeWeight || 2),
    },
  ]
})

const mapClusterMode = computed<'all' | 'off'>(() => {
  return mapViewMode.value === 'clients' ? 'all' : 'off'
})

function normalizeUf(value: unknown) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .slice(0, 2)
}

function collectPortfolioUfs() {
  const ufs = new Set<string>()
  for (const cliente of clientes.value as any[]) {
    const uf = normalizeUf(cliente?.estado || cliente?.endereco?.uf)
    if (uf) ufs.add(uf)
  }
  if (!ufs.size) ufs.add('SC')
  return Array.from(ufs).sort()
}

async function loadCityFeaturesForPortfolio() {
  const ufs = collectPortfolioUfs()
  const nextKey = ufs.join(',')
  if (nextKey === loadedCityUfKey.value) return

  const featuresByUf = await Promise.all(
    ufs.map(async (uf) => {
      const payload = await fetchCityGeoJsonByUf(uf)
      return extractCityFeatures(payload, uf)
    })
  )

  const merged = featuresByUf.flat()
  if (merged.length) {
    scCityFeatures.value = merged
    loadedCityUfKey.value = nextKey
  } else if (!scCityFeatures.value.length) {
    scCityFeatures.value = []
    loadedCityUfKey.value = nextKey
  }
}

async function loadTerritories() {
  try {
    const statesInPortfolio = Array.from(
      new Set((clientes.value as any[]).map((c) => String(c?.stateId || '').trim()).filter(Boolean))
    )

    territoryStates.value = await fetchStates({
      active: true,
      withGeometry: false,
      ids: statesInPortfolio.length ? statesInPortfolio : undefined,
      limit: 200,
    })

    const stateIds = territoryStates.value.map((s) => s.id)
    territoryCities.value = await fetchCities({
      active: true,
      withGeometry: false,
      limit: 6000,
      ...(stateIds.length === 1 ? { stateId: stateIds[0] } : {}),
    })
  } catch (error) {
    console.error('Erro ao carregar territórios:', error)
    territoryStates.value = []
    territoryCities.value = []
  }
}

watch(mapViewMode, () => {
  selectedCityId.value = ''
  cityModeState.value = 'overview'
  if (mapViewMode.value === 'city' && !territoryCities.value.length) {
    loadTerritories()
  }
})

onMounted(async () => {
  try {
    visitedMapData.value = {
      markers: [],
      polygons: [],
      mapSettings: {
        center: { lat: -27.5954, lng: -48.548 },
        zoom: 7,
      },
    }

    await loadClients()
    await loadTerritories()
  } catch (error) {
    console.error('Erro ao carregar dados do mapa:', error)
  }
})

// Atualizar cores dos clientes periodicamente e quando a página ganha foco
onMounted(() => {
  // Atualizar cores a cada minuto
  const intervalId = setInterval(async () => {
    await loadClients()
  }, 60000)

  // Atualizar quando a página ganha foco
  const handleFocus = async () => {
    await loadClients()
  }
  window.addEventListener('focus', handleFocus)

  // Cleanup
  onUnmounted(() => {
    clearInterval(intervalId)
    window.removeEventListener('focus', handleFocus)
  })
})

async function loadClients() {
  try {
    loadClientsError.value = ''
    const data = await fetchClients({ scope: 'portfolio' })
    clientes.value = (data.clients || []) as Cliente[]
    await loadCityFeaturesForPortfolio()
    if (data.salesTotals) {
      salesTotals.value = {
        month: data.salesTotals.month,
        monthPrev: data.salesTotals.monthPrev || 0,
        monthPrevYear: data.salesTotals.monthPrevYear || 0,
        quarter: data.salesTotals.quarter,
        quarterPrev: data.salesTotals.quarterPrev || 0,
        quarterPrevYear: data.salesTotals.quarterPrevYear || 0,
        year: data.salesTotals.year,
        yearPrevYear: data.salesTotals.yearPrevYear || 0,
      }
    }
    if (typeof data.contactsThisMonth === 'number') contactsThisMonth.value = data.contactsThisMonth
    if (typeof data.contactsPrevMonth === 'number') contactsPrevMonth.value = data.contactsPrevMonth

    if (visitedMapData.value?.mapSettings && data.mapSettings) {
      visitedMapData.value.mapSettings = data.mapSettings
    }

    if (selectedClient.value && !(selectedClient.value as any)._isProspect) {
      selectedClient.value = clientes.value.find((c) => c.id === selectedClient.value?.id) || null
    }

    if (mapViewMode.value === 'city' || !territoryCities.value.length) {
      await loadTerritories()
    }
  } catch (err: any) {
    console.error('Erro ao carregar clientes:', err)
    clientes.value = []
    loadClientsError.value =
      err?.data?.statusMessage || err?.data?.message || err?.message || 'Erro desconhecido'
  }
}

const portfolioClientes = computed(() => {
  if (mapViewMode.value === 'city') {
    return clientes.value
  }
  if (filterTipo.value === 'inativo') {
    return clientes.value.filter((c) => (c as any)?.status === 'inativo')
  }
  return clientes.value.filter((c) => (c as any)?.status !== 'inativo')
})

const cityClientesBase = computed(() => portfolioClientes.value)

const filteredClientes = computed(() => {
  let result = portfolioClientes.value

  // Filtro por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    const queryDigits = searchQuery.value.replace(/\D/g, '')
    result = result.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(query) ||
        cliente.cidade?.toLowerCase().includes(query) ||
        cliente.endereco?.toLowerCase().includes(query) ||
        (queryDigits.length > 0 &&
          ((cliente.cnpj || '').replace(/\D/g, '').includes(queryDigits) ||
            String(cliente.id || '')
              .replace(/\D/g, '')
              .includes(queryDigits)))
    )
  }

  // Filtro por segmento
  if (filterSegmento.value) {
    result = result.filter((cliente) => cliente.segmento === filterSegmento.value)
  }

  // Filtro por tipo
  if (filterTipo.value) {
    if (filterTipo.value === 'ativo_mes') {
      result = result.filter((cliente) => safeNumber((cliente as any)?.objectives?.mesAberto) > 0)
    } else {
      result = result.filter((cliente) => keyForClient(cliente) === (filterTipo.value as any))
    }
  }

  return result
})

function matchesCityScope(cliente: any, cityScopeId: string) {
  if (!cityScopeId) return true
  const byScopeId = resolveCityScopeIdForClient(cliente)
  if (byScopeId) return byScopeId === cityScopeId

  const cityFromGeo = scCityFeatureById.value.get(cityScopeId)
  if (cityFromGeo) {
    const cityName = normalizeCityNameForMatch(cliente?.cidade || cliente?.endereco?.cidade || '')
    return cityName === normalizeCityNameForMatch(cityFromGeo.name)
  }

  const selectedCity = territoryCities.value.find((city) => city.id === cityScopeId)
  if (selectedCity) {
    const cityName = normalizeCityNameForMatch(cliente?.cidade || cliente?.endereco?.cidade || '')
    return cityName === normalizeCityNameForMatch(selectedCity.nome)
  }
  return false
}

const mapScopedClientes = computed(() => {
  if (mapViewMode.value === 'city') {
    if (cityModeState.value === 'detail' && selectedCityId.value) {
      return cityClientesBase.value.filter((cliente) =>
        matchesCityScope(cliente as any, selectedCityId.value)
      )
    }
    return cityClientesBase.value
  }

  let result = filteredClientes.value
  return result
})

const mapPositionByClientId = computed(() => {
  const map = new Map<string, ClientMapPosition>()
  const allowApproximate =
    mapViewMode.value === 'city' && cityModeState.value === 'detail' && !!selectedCityId.value
  for (const cliente of mapScopedClientes.value as any[]) {
    const clientId = String(cliente?.id || '')
    if (!clientId) continue
    const position = resolveClientMapPosition(cliente, allowApproximate)
    if (!position) continue
    map.set(clientId, position)
  }
  return map
})

const MAX_PINS = 10000
const clientesParaPins = computed(() => {
  const mappable = mapScopedClientes.value.filter((c: any) =>
    mapPositionByClientId.value.has(String(c?.id || ''))
  )
  if (mappable.length <= MAX_PINS) return mappable
  return mappable.slice(0, MAX_PINS)
})

function isCategoryVisible(cliente: any) {
  const categoria = categorizeClient(cliente)
  if (categoria === 'cliente' && !mostrarClientes.value) return false
  if (categoria === 'comercial' && !mostrarComerciais.value) return false
  if (categoria === 'prospecto' && !mostrarProspectos.value) return false
  return true
}

const visibleClientesForRanking = computed(() => {
  return clientesParaPins.value.filter((cliente) => isCategoryVisible(cliente))
})

const cityAggregationSourceClientes = computed(() => {
  return cityClientesBase.value.filter((cliente) => {
    if (!isCategoryVisible(cliente)) return false
    const categoria = categorizeClient(cliente)
    return categoria === 'cliente' || categoria === 'prospecto'
  })
})

const cityDetailClients = computed(() => {
  if (!selectedCityId.value) return [] as Cliente[]
  return cityAggregationSourceClientes.value.filter((cliente) =>
    matchesCityScope(cliente as any, selectedCityId.value)
  )
})

const visibleClientesForMapMode = computed(() => {
  if (mapViewMode.value === 'city') {
    if (cityModeState.value === 'detail') {
      return cityDetailClients.value
    }
    return cityAggregationSourceClientes.value
  }

  const source = clientesParaPins.value
  return source.filter((cliente) => isCategoryVisible(cliente))
})

function categorizeClient(cliente: any) {
  const temVendas =
    safeNumber(cliente?.sales?.totalAllTime) > 0 ||
    safeNumber(cliente?.sales?.total12m) > 0 ||
    safeNumber(cliente?.sales?.total90d) > 0
  const temContatos = Array.isArray(cliente?.visitas) && cliente.visitas.length > 0

  if (temVendas) return 'cliente' // Verde/Amarelo/Vermelho baseado no engajamento
  if (temContatos) return 'comercial' // Azul
  return 'prospecto' // Cinza
}

function markerColor(cliente: any) {
  const categoria = categorizeClient(cliente)

  if (categoria === 'prospecto') {
    return '#9CA3AF' // gray-400
  }

  if (categoria === 'comercial') {
    return '#3B82F6' // blue-500
  }

  // Cliente com vendas - usar lógica de engajamento
  return metaForClient(cliente).colorHex
}

function cityBucketByRank(rank: number, total: number, score: number): CityMapBucket {
  if (score <= 0) return 'gray'
  const redLimit = Math.max(1, Math.ceil(total * 0.12))
  const yellowLimit = Math.max(redLimit + 1, Math.ceil(total * 0.4))
  if (rank <= redLimit) return 'red'
  if (rank <= yellowLimit) return 'yellow'
  return 'blue'
}

function cityMarkerSize(count: number) {
  if (count >= 80) return 26
  if (count >= 40) return 24
  if (count >= 20) return 22
  if (count >= 10) return 20
  return 18
}

function clientOrderWeight(cliente: any) {
  const total90d = safeNumber(cliente?.sales?.total90d)
  const total12m = safeNumber(cliente?.sales?.total12m)
  const totalAllTime = safeNumber(cliente?.sales?.totalAllTime)
  const mesAberto = safeNumber(cliente?.objectives?.mesAberto)
  const metric = total90d || total12m || totalAllTime || mesAberto
  return metric > 0 ? metric : 1
}

const cityAggregates = computed<CityAggregate[]>(() => {
  const grouped = new Map<
    string,
    {
      id: string
      name: string
      count: number
      score: number
      sumLat: number
      sumLng: number
      centroid: { lat: number; lng: number } | null
    }
  >()

  for (const cliente of cityAggregationSourceClientes.value as any[]) {
    const cityFeature = resolveCityFeatureForClient(cliente)
    const cityScopeId = cityFeature?.id || resolveCityScopeIdForClient(cliente)
    if (!cityScopeId) continue

    const lat = Number(cliente?.lat)
    const lng = Number(cliente?.lng)
    const hasGeoPoint = Number.isFinite(lat) && Number.isFinite(lng)
    if (!cityFeature && !hasGeoPoint) continue

    const cityName =
      cityFeature?.name || String(cliente?.cidade || cliente?.endereco?.cidade || cityScopeId)
    if (!grouped.has(cityScopeId)) {
      grouped.set(cityScopeId, {
        id: cityScopeId,
        name: cityName,
        count: 0,
        score: 0,
        sumLat: 0,
        sumLng: 0,
        centroid: cityFeature?.centroid || (hasGeoPoint ? { lat, lng } : null),
      })
    }

    const city = grouped.get(cityScopeId)!
    city.count += 1
    city.score += clientOrderWeight(cliente)
    if (hasGeoPoint) {
      city.sumLat += lat
      city.sumLng += lng
    }
  }

  const ranked = Array.from(grouped.values())
    .map((city) => {
      const centroid =
        city.centroid ||
        (city.count > 0 ? { lat: city.sumLat / city.count, lng: city.sumLng / city.count } : null)
      if (!centroid) return null
      return { ...city, centroid }
    })
    .filter(Boolean)
    .sort(
      (a: any, b: any) =>
        b.score - a.score || b.count - a.count || a.name.localeCompare(b.name, 'pt-BR')
    )

  const total = ranked.length || 1

  return ranked.map((city: any, index: number) => {
    const rank = index + 1
    const bucket = cityBucketByRank(rank, total, city.score)
    return {
      id: city.id,
      name: city.name,
      count: city.count,
      score: city.score,
      rank,
      centroid: city.centroid,
      bucket,
      colorHex: CITY_BUCKET_COLORS[bucket],
    }
  })
})

const cityAggregatesById = computed(() => {
  const map = new Map<string, CityAggregate>()
  for (const aggregate of cityAggregates.value) {
    map.set(aggregate.id, aggregate)
  }
  return map
})

function safeNumber(v: any) {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function stableHash(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function resolveClientMapPosition(
  cliente: any,
  allowApproximate = false
): ClientMapPosition | null {
  const lat = Number(cliente?.lat)
  const lng = Number(cliente?.lng)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng, approximate: false }
  }

  if (!allowApproximate) return null

  const cityFeature = resolveCityFeatureForClient(cliente)
  if (!cityFeature) return null

  const seedSource = String(cliente?.id || cliente?.cnpj || cliente?.nome || cityFeature.id || '')
  const seed = stableHash(seedSource || cityFeature.id)
  const angle = ((seed % 360) * Math.PI) / 180
  const ring = 1 + (Math.floor(seed / 360) % 5)
  const radius = 0.004 + ring * 0.0016

  return {
    lat: cityFeature.centroid.lat + Math.sin(angle) * radius,
    lng: cityFeature.centroid.lng + Math.cos(angle) * radius,
    approximate: true,
  }
}

function formatCompactMoney(v: number) {
  const n = Math.round(v)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}

function formatCompactNumber(v: number) {
  const n = Math.round(v)
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n >= 10_000_000_000 ? 0 : 1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}

const pinMetricByClientId = computed(() => {
  const list = visibleClientesForRanking.value
  const pairs = list.map((c: any) => {
    const totalAllTime = safeNumber(c?.sales?.totalAllTime)
    const total12m = safeNumber(c?.sales?.total12m)
    const total90d = safeNumber(c?.sales?.total90d)
    const mesAberto = safeNumber(c?.objectives?.mesAberto)
    const metric =
      total90d || total12m || mesAberto || totalAllTime || safeNumber(c?.sales?.priorityScore)
    return { id: c.id, metric, totalAllTime, total12m, total90d, mesAberto }
  })

  pairs.sort((a, b) => b.metric - a.metric)

  const rank = new Map<string, number>()
  const metric = new Map<string, number>()
  const totals = new Map<
    string,
    { totalAllTime: number; total12m: number; total90d: number; mesAberto: number }
  >()
  pairs.forEach((p, idx) => {
    rank.set(p.id, idx + 1)
    metric.set(p.id, p.metric)
    totals.set(p.id, {
      totalAllTime: p.totalAllTime,
      total12m: p.total12m,
      total90d: p.total90d,
      mesAberto: p.mesAberto,
    })
  })

  const maxMetric = pairs.length && pairs[0] ? Math.max(1, pairs[0].metric) : 1
  return { rank, metric, totals, maxMetric }
})

const maxRankLimit = computed(() => {
  if (mapViewMode.value === 'city') {
    return cityAggregates.value.length || 0
  }
  return pinMetricByClientId.value.rank.size || 0
})
const topRankLabel = computed(() => {
  if (!maxRankLimit.value) return '--'
  if (topRankLimit.value === null) return 'Tudo'
  if (topRankLimit.value <= 0 || topRankLimit.value >= maxRankLimit.value) {
    return 'Tudo'
  }
  return `Top ${topRankLimit.value}`
})

const rankPresets = computed(() => {
  const maxValue = maxRankLimit.value
  if (!maxValue) return [{ value: 0, label: 'Sem resultados' }]
  const base = [3, 10, 50, 100].filter((n) => n < maxValue)
  return [...base, maxValue].map((value) => ({
    value,
    label: value === maxValue ? 'Tudo' : `Top ${value}`,
  }))
})

const topRankSelectValue = computed(() => {
  const maxValue = maxRankLimit.value
  if (!maxValue) return 0
  if (topRankLimit.value === null) return maxValue
  return Math.min(topRankLimit.value, maxValue)
})

watch(maxRankLimit, (maxValue) => {
  if (!maxValue) return
  if (topRankLimit.value === null || topRankLimit.value <= 0) {
    topRankLimit.value = Math.min(DEFAULT_TOP_RANK, maxValue)
  } else if (topRankLimit.value > maxValue) {
    topRankLimit.value = maxValue
  }
})

watch(
  () => [searchQuery.value, filterSegmento.value, filterTipo.value],
  ([query, segmento, tipo]) => {
    if (!query && !segmento && !tipo && maxRankLimit.value) {
      topRankLimit.value = Math.min(DEFAULT_TOP_RANK, maxRankLimit.value)
    }
  }
)

function setTopRank(value: number) {
  const maxValue = maxRankLimit.value || 0
  if (!maxValue) {
    topRankLimit.value = null
    return
  }
  topRankLimit.value = Math.min(Math.max(1, value), maxValue)
}

function handleTopRankSelect(value: string | number) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return
  setTopRank(numeric)
}

function handleClearFilters() {
  searchQuery.value = ''
  filterSegmento.value = ''
  filterTipo.value = ''
}

function handleMapViewModeChange(value: string | number) {
  const next = String(value) as 'clients' | 'city'
  if (next !== 'clients' && next !== 'city') return
  mapViewMode.value = next
  cityModeState.value = 'overview'
  selectedCityId.value = ''
}

function handleMapPolygonClick(polygon: any) {
  if (mapViewMode.value !== 'city') return
  const directId = String(polygon?.id || '').trim()
  const id =
    directId ||
    (() => {
      const label = String(polygon?.label || '').trim()
      if (!label) return ''
      const byLabel = scCityFeatureByName.value.get(cityMatchKey(label))
      return byLabel?.id || ''
    })()
  if (!id) return
  if (cityModeState.value === 'overview') {
    selectedCityId.value = id
    cityModeState.value = 'detail'
    return
  }
  if (selectedCityId.value === id) {
    backToCityOverview()
    return
  }
  selectedCityId.value = id
}

const createVisitedMarkers = computed(() => {
  if (mapViewMode.value === 'city') {
    if (cityModeState.value === 'overview') {
      if (scCityFeatures.value.length) {
        return scCityFeatures.value.map((feature) => {
          const aggregate = cityAggregatesById.value.get(feature.id)
          const count = aggregate?.count || 0
          return {
            lat: feature.centroid.lat,
            lng: feature.centroid.lng,
            title: `${feature.name} • ${count} oportunidades`,
            value: count,
            color: cityColorForAggregate(aggregate),
            size: cityMarkerSize(count),
            cityScopeId: feature.id,
            categoria: 'city',
            kind: 'city',
          }
        })
      }

      return cityAggregates.value.map((city) => ({
        lat: city.centroid.lat,
        lng: city.centroid.lng,
        title: `${city.name} • ${city.count} oportunidades`,
        value: city.count,
        color: city.colorHex,
        size: cityMarkerSize(city.count),
        cityScopeId: city.id,
        categoria: 'city',
        kind: 'city',
      }))
    }

    const cityMeta = cityAggregatesById.value.get(selectedCityId.value)
    return cityDetailClients.value
      .map((cliente: any, index: number) => {
        const clientId = String(cliente?.id || '')
        const position = mapPositionByClientId.value.get(clientId)
        if (!position) return null
        return {
          lat: position.lat,
          lng: position.lng,
          title: `${cliente.nome}${cityMeta ? ` • ${cityMeta.name}` : ''}${position.approximate ? ' (aprox.)' : ''}`,
          value: index + 1,
          color: markerColor(cliente),
          size: 24,
          clientId,
          categoria: categorizeClient(cliente),
          kind: 'client',
        }
      })
      .filter(Boolean)
  }

  const markers: any[] = []
  const meta = pinMetricByClientId.value
  const maxRank = maxRankLimit.value
  const limit = topRankLimit.value
  const shouldLimit = typeof limit === 'number' && limit > 0 && limit < maxRank

  for (const cliente of visibleClientesForRanking.value) {
    const categoria = categorizeClient(cliente)

    const id = (cliente as any).id
    const position = mapPositionByClientId.value.get(String(id || ''))
    if (!position) continue
    const m = meta.metric.get(id) || 0
    const r = meta.rank.get(id) || 1

    if (shouldLimit && r > (limit as number)) continue

    markers.push({
      lat: position.lat,
      lng: position.lng,
      title:
        m > 0
          ? `${cliente.nome} (#${r} · R$ ${formatCompactMoney(m)})${position.approximate ? ' (aprox.)' : ''}`
          : `${cliente.nome} (#${r})${position.approximate ? ' (aprox.)' : ''}`,
      value: r,
      color: markerColor(cliente),
      size: (() => {
        const minSize = categoria === 'prospecto' ? 18 : categoria === 'comercial' ? 22 : 24
        if (m <= 0) return minSize
        const ratio = Math.max(0, Math.min(1, m / meta.maxMetric))
        const base = minSize + Math.round(ratio * 18)
        if (r <= 3) return base + 6
        if (r <= 10) return base + 3
        return base
      })(),
      clientId: id,
      categoria,
    })
  }

  return markers
})

watch(cityPolygons, (list) => {
  if (!selectedCityId.value) return
  if (!list.some((polygon) => String(polygon.id || '') === selectedCityId.value)) {
    selectedCityId.value = ''
  }
})

const carteiraBuckets = computed(() => {
  let clientes = 0 // Com vendas
  let comerciais = 0 // Só contatos
  let prospectos = 0 // Sem histórico
  let verde = 0
  let amarelo = 0
  let vermelho = 0

  for (const c of mapScopedClientes.value as any[]) {
    const categoria = categorizeClient(c)

    if (categoria === 'cliente') {
      clientes++
      // Subcategorizar por engajamento
      const k = keyForClient(c)
      if (k === 'critico') vermelho++
      else if (k === 'atencao') amarelo++
      else verde++
    } else if (categoria === 'comercial') {
      comerciais++
    } else {
      prospectos++
    }
  }

  return {
    clientes,
    comerciais,
    prospectos,
    verde,
    amarelo,
    vermelho,
    total: clientes + comerciais + prospectos,
  }
})

const visitedStats = computed(() => {
  const carteira = carteiraBuckets.value
  return {
    total: carteira.total,
    clientes: carteira.clientes,
    comerciais: carteira.comerciais,
    prospectos: carteira.prospectos,
    ativosVerde: carteira.verde,
    ativosAmarelo: carteira.amarelo,
    ativosVermelho: carteira.vermelho,
    contatosNoMes: contactsThisMonth.value,
    faturamentoMensal: salesTotals.value.month,
    faturamentoTrimestral: salesTotals.value.quarter,
    faturamentoAnual: salesTotals.value.year,
  }
})

function deltaMeta(current: number, previous: number) {
  const c = Number.isFinite(current) ? current : 0
  const p = Number.isFinite(previous) ? previous : 0

  if (p <= 0) {
    if (c <= 0) return { text: '0%', class: 'text-slate-600', icon: 'mdi:minus' }
    return { text: 'novo', class: 'text-emerald-700', icon: 'mdi:trending-up' }
  }

  const pct = Math.round(((c - p) / p) * 100)
  if (pct > 0) return { text: `+${pct}%`, class: 'text-emerald-700', icon: 'mdi:trending-up' }
  if (pct < 0) return { text: `${pct}%`, class: 'text-red-700', icon: 'mdi:trending-down' }
  return { text: '0%', class: 'text-slate-600', icon: 'mdi:minus' }
}

const contatosVsMesAnterior = computed(() =>
  deltaMeta(contactsThisMonth.value, contactsPrevMonth.value)
)
const mensalVsMesAnterior = computed(() =>
  deltaMeta(salesTotals.value.month, salesTotals.value.monthPrev)
)
const mensalVsMesmoMesAnoAnterior = computed(() =>
  deltaMeta(salesTotals.value.month, salesTotals.value.monthPrevYear)
)
const trimestralVsTrimestreAnterior = computed(() =>
  deltaMeta(salesTotals.value.quarter, salesTotals.value.quarterPrev)
)
const trimestralVsMesmoTrimestreAnoAnterior = computed(() =>
  deltaMeta(salesTotals.value.quarter, salesTotals.value.quarterPrevYear)
)
const anualVsAnoAnterior = computed(() =>
  deltaMeta(salesTotals.value.year, salesTotals.value.yearPrevYear)
)

const rankedPortfolioClientes = computed(() => {
  const list = visibleClientesForRanking.value
  if (mapViewMode.value === 'city') return visibleClientesForMapMode.value

  const maxRank = maxRankLimit.value
  const limit = topRankLimit.value
  const shouldLimit = typeof limit === 'number' && limit > 0 && limit < maxRank
  if (!shouldLimit) return list

  const rankMap = pinMetricByClientId.value.rank
  return list.filter((c: any) => {
    const r = rankMap.get(c.id)
    if (!r) return false
    return r <= (limit as number)
  })
})

const mapVisibleClients = computed(() => rankedPortfolioClientes.value)

function cityLabelById(cityId: string) {
  if (!cityId) return ''
  const fromGeo = scCityFeatureById.value.get(cityId)
  if (fromGeo) return fromGeo.name

  const fromDb = territoryCities.value.find((city) => city.id === cityId)
  if (fromDb) return fromDb.nome

  const aggregateName = cityAggregatesById.value.get(cityId)?.name
  if (aggregateName) return aggregateName

  return cityPolygons.value.find((city) => city.id === cityId)?.label || ''
}

const selectedCityLabel = computed(() => cityLabelById(selectedCityId.value))

const mapScopeDescription = computed(() => {
  if (mapViewMode.value === 'clients') {
    return 'Visualização de clientes (pins clusterizados)'
  }
  if (cityModeState.value === 'overview') {
    return 'Visualização por cidade (pin central com total de oportunidades)'
  }
  if (!selectedCityId.value) return 'Cidade selecionada'
  const cityName = cityLabelById(selectedCityId.value)
  return cityName ? `Cidade selecionada: ${cityName}` : 'Cidade selecionada'
})

const actionPlanTop = computed(() => topTasks(rankedPortfolioClientes.value, { limit: 8 }))

function whatsAppUrl(telefoneRaw: string, nome: string) {
  const telefone = String(telefoneRaw || '').replace(/\D/g, '')
  if (!telefone) return '#'
  const mensagem = encodeURIComponent(
    `Olá ${nome}! Sou representante comercial e gostaria de falar com você.`
  )
  return `https://wa.me/55${telefone}?text=${mensagem}`
}

function noop() {}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function handleVisitedMarkerClick(marker: any) {
  if (mapViewMode.value === 'city' && marker?.cityScopeId) {
    selectedCityId.value = String(marker.cityScopeId)
    cityModeState.value = 'detail'
    return
  }

  const cliente = clientes.value.find((c) => c.id === marker.clientId)
  if (cliente) {
    selectedClient.value = cliente
    isSidePanelOpen.value = true
  }
}

function backToCityOverview() {
  cityModeState.value = 'overview'
  selectedCityId.value = ''
}

function selectClientFromList(clientId: string) {
  const cliente = clientes.value.find((c) => c.id === clientId)
  if (!cliente) return
  selectedClient.value = cliente
  isSidePanelOpen.value = true
}

function handleAddAction(action: 'visita_fisica' | 'atendimento_online' | 'venda' | 'ligacao') {
  editingEvento.value = null
  modalActionType.value = action
  isModalNovaVisitaOpen.value = true
}

function handleCloseNovaVisita() {
  isModalNovaVisitaOpen.value = false
  editingEvento.value = null
}

function handleEditEvento(evento: any) {
  editingEvento.value = evento
  modalActionType.value = evento.tipo || 'visita_fisica'
  isModalNovaVisitaOpen.value = true
}

async function handleDeleteEvento(id: string) {
  try {
    await deleteEvento(id)
    await loadClients()
  } catch (error: any) {
    console.error('Erro ao excluir evento:', error)
    const errorMessage = error?.data?.statusMessage || error?.message || 'Falha ao excluir evento'
    alert(`Erro: ${errorMessage}`)
  }
}

function handleSubmitNovaVisita(payload: any) {
  if (!selectedClient.value) return

  const isEdit = !!payload.id

  if (isEdit) {
    // Edição
    const { id, ...updateData } = payload
    updateEvento(id, updateData).then(async () => {
      await loadClients()
      editingEvento.value = null
    })
  } else {
    // Criação
    createEvento({
      clientId: selectedClient.value.id,
      ...payload,
      userId: payload.userId || currentUserId,
    }).then(async () => {
      await loadClients()
    })
  }

  isModalNovaVisitaOpen.value = false
}

function handleOpenEditarCliente() {
  isModalEditarClienteOpen.value = true
}

async function handleSubmitEditarCliente(updates: Record<string, unknown>) {
  if (!selectedClient.value) return

  const clientId = selectedClient.value.id
  const updated = await patchClient(clientId, updates as any)
  console.log('✅ Cliente atualizado:', { id: updated.id, lat: updated.lat, lng: updated.lng })

  await loadClients()

  // Re-selecionar o cliente após reload para garantir dados frescos
  const freshClient = clientes.value.find((c) => c.id === clientId)
  if (freshClient) {
    selectedClient.value = freshClient
    console.log('🔄 Cliente re-selecionado:', {
      id: freshClient.id,
      lat: freshClient.lat,
      lng: freshClient.lng,
    })
  }

  isModalEditarClienteOpen.value = false
}

function handleRemoveCliente() {
  if (!selectedClient.value) return

  deleteClient(selectedClient.value.id).then(async () => {
    isSidePanelOpen.value = false
    selectedClient.value = null
    await loadClients()
  })
}

definePageMeta({
  layout: 'default',
})
</script>
