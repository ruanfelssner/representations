<template>
  <div class="space-y-4 lg:space-y-6">
    <!-- Header -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <NTypo as="h1" size="2xl" weight="bold" class="lg:text-3xl">Dashboard</NTypo>
          <NTypo size="sm" tone="muted" class="mt-1">
            Visão geral do negócio • {{ currentDate }}
          </NTypo>
        </div>
        <div class="flex items-center gap-2">
          <NButton
            variant="outline"
            size="sm"
            leading-icon="mdi:refresh"
            :disabled="pending || commercialKpisPending || rankingPending"
            @click="refreshAll()"
          >
            Atualizar
          </NButton>
          <NButton as="NuxtLink" to="/" variant="outline" size="sm" leading-icon="mdi:map">
            Ver Mapa
          </NButton>
        </div>
      </div>
    </NLayer>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-4">
      <NTypo size="sm" weight="semibold" class="text-red-700"
        >Falha ao carregar números do dashboard.</NTypo
      >
      <NTypo size="xs" tone="muted" class="mt-1"
        >Verifique a API `/api/v1/clients` e o Mongo.</NTypo
      >
    </div>
    <div v-if="commercialKpisError" class="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <NTypo size="sm" weight="semibold" class="text-amber-700"
        >Falha ao carregar KPIs comerciais.</NTypo
      >
      <NTypo size="xs" tone="muted" class="mt-1"
        >Os demais indicadores continuam disponíveis.</NTypo
      >
    </div>

    <!-- KPIs Grid -->
    <div class="grid !grid-cols-2 md:!grid-cols-4 lg:!grid-cols-4 gap-3 lg:gap-4">
      <!-- Total Clientes -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Total Clientes</NTypo>
            <NTypo size="3xl" weight="bold" class="text-sky-600 tabular-nums lg:text-4xl">
              {{ stats.totalClients }}
            </NTypo>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <NIcon name="mdi:account-plus" class="w-4 h-4 text-sky-600" />
              <span class="font-semibold text-sky-700 tabular-nums"
                >+{{ stats.createdThisMonth }}</span
              >
              <span class="text-gray-500">novos no mês</span>
            </div>
          </div>
          <div class="p-2 bg-sky-50 rounded-lg">
            <NIcon name="mdi:account-group" class="w-6 h-6 text-sky-600" />
          </div>
        </div>
      </NLayer>

      <!-- Clientes Ativos -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Ativos (≤90d)</NTypo>
            <NTypo size="3xl" weight="bold" class="text-emerald-600 tabular-nums lg:text-4xl">
              {{ stats.activosVerde }}
            </NTypo>
            <div class="mt-2 text-xs text-gray-600">
              <span class="font-semibold">{{ activePercentage }}%</span> da base
            </div>
          </div>
          <div class="p-2 bg-emerald-50 rounded-lg">
            <NIcon name="mdi:check-circle" class="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </NLayer>

      <!-- Críticos -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Críticos (>180d)</NTypo>
            <NTypo size="3xl" weight="bold" class="text-red-600 tabular-nums lg:text-4xl">
              {{ stats.activosVermelho }}
            </NTypo>
            <div class="mt-2 text-xs text-gray-600">
              <span class="font-semibold">{{ criticalPercentage }}%</span> precisam atenção
            </div>
          </div>
          <div class="p-2 bg-red-50 rounded-lg">
            <NIcon name="mdi:alert-circle" class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </NLayer>

      <!-- Contatos no Mês -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <NTypo size="xs" tone="muted" weight="medium" class="mb-1">Contatos (mês)</NTypo>
            <NTypo size="3xl" weight="bold" class="text-violet-600 tabular-nums lg:text-4xl">
              {{ stats.contatosNoMes }}
            </NTypo>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <NIcon
                :name="contatosVsMesAnterior.icon"
                class="w-4 h-4"
                :class="contatosVsMesAnterior.iconClass"
              />
              <span class="font-semibold tabular-nums" :class="contatosVsMesAnterior.textClass">{{
                contatosVsMesAnterior.text
              }}</span>
              <span class="text-gray-500">vs mês anterior</span>
            </div>
          </div>
          <div class="p-2 bg-violet-50 rounded-lg">
            <NIcon name="mdi:phone" class="w-6 h-6 text-violet-600" />
          </div>
        </div>
      </NLayer>
    </div>

    <!-- Faturamento Row -->
    <div class="grid !grid-cols-1 md:!grid-cols-3 lg:!grid-cols-3 gap-3 lg:gap-4">
      <!-- Mensal -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-3">
            <NTypo size="xs" tone="muted" weight="medium">Faturamento Mensal</NTypo>
            <div class="p-1.5 bg-violet-50 rounded-lg">
              <NIcon name="mdi:calendar-month" class="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <NTypo size="2xl" weight="bold" class="text-violet-600 tabular-nums lg:text-3xl">
            {{ formatCurrency(stats.faturamentoMensal) }}
          </NTypo>
          <div class="mt-3 pt-3 border-t space-y-1.5">
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon
                :name="mensalVsMesAnterior.icon"
                class="w-3.5 h-3.5"
                :class="mensalVsMesAnterior.iconClass"
              />
              <span class="font-semibold tabular-nums" :class="mensalVsMesAnterior.textClass">{{
                mensalVsMesAnterior.text
              }}</span>
              <span class="text-gray-500">vs mês anterior</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon
                :name="mensalVsMesmoMesAnoAnterior.icon"
                class="w-3.5 h-3.5"
                :class="mensalVsMesmoMesAnoAnterior.iconClass"
              />
              <span
                class="font-semibold tabular-nums"
                :class="mensalVsMesmoMesAnoAnterior.textClass"
                >{{ mensalVsMesmoMesAnoAnterior.text }}</span
              >
              <span class="text-gray-500">vs mesmo mês (ano anterior)</span>
            </div>
          </div>
        </div>
      </NLayer>

      <!-- Trimestral -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-3">
            <NTypo size="xs" tone="muted" weight="medium">Faturamento Trimestral</NTypo>
            <div class="p-1.5 bg-amber-50 rounded-lg">
              <NIcon name="mdi:calendar-range" class="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <NTypo size="2xl" weight="bold" class="text-amber-600 tabular-nums lg:text-3xl">
            {{ formatCurrency(stats.faturamentoTrimestral) }}
          </NTypo>
          <div class="mt-3 pt-3 border-t space-y-1.5">
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon
                :name="trimestralVsTrimestreAnterior.icon"
                class="w-3.5 h-3.5"
                :class="trimestralVsTrimestreAnterior.iconClass"
              />
              <span
                class="font-semibold tabular-nums"
                :class="trimestralVsTrimestreAnterior.textClass"
                >{{ trimestralVsTrimestreAnterior.text }}</span
              >
              <span class="text-gray-500">vs trimestre anterior</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon
                :name="trimestralVsMesmoTrimestreAnoAnterior.icon"
                class="w-3.5 h-3.5"
                :class="trimestralVsMesmoTrimestreAnoAnterior.iconClass"
              />
              <span
                class="font-semibold tabular-nums"
                :class="trimestralVsMesmoTrimestreAnoAnterior.textClass"
                >{{ trimestralVsMesmoTrimestreAnoAnterior.text }}</span
              >
              <span class="text-gray-500">vs mesmo trimestre (ano anterior)</span>
            </div>
          </div>
        </div>
      </NLayer>

      <!-- Anual -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-3">
            <NTypo size="xs" tone="muted" weight="medium">Faturamento Anual</NTypo>
            <div class="p-1.5 bg-orange-50 rounded-lg">
              <NIcon name="mdi:calendar-year" class="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <NTypo size="2xl" weight="bold" class="text-orange-600 tabular-nums lg:text-3xl">
            {{ formatCurrency(stats.faturamentoAnual) }}
          </NTypo>
          <div class="mt-3 pt-3 border-t">
            <div class="flex items-center gap-1.5 text-xs">
              <NIcon
                :name="anualVsAnoAnterior.icon"
                class="w-3.5 h-3.5"
                :class="anualVsAnoAnterior.iconClass"
              />
              <span class="font-semibold tabular-nums" :class="anualVsAnoAnterior.textClass">{{
                anualVsAnoAnterior.text
              }}</span>
              <span class="text-gray-500">vs mesmo período (ano anterior)</span>
            </div>
          </div>
        </div>
      </NLayer>
    </div>

    <!-- Últimos 3 Meses + Médias Anuais -->
    <div class="grid !grid-cols-1 md:!grid-cols-5 lg:!grid-cols-5 gap-3 lg:gap-4">
      <!-- Mês Atual -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">{{ currentMonthName }}</NTypo>
            <div class="p-1 bg-indigo-50 rounded">
              <NIcon name="mdi:calendar" class="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-indigo-600 tabular-nums lg:text-2xl">
            {{ formatCurrency(salesTotals.month) }}
          </NTypo>
        </div>
      </NLayer>

      <!-- Mês Anterior -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">{{ prevMonthName }}</NTypo>
            <div class="p-1 bg-indigo-50 rounded">
              <NIcon name="mdi:calendar" class="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-indigo-600 tabular-nums lg:text-2xl">
            {{ formatCurrency(salesTotals.monthPrev) }}
          </NTypo>
        </div>
      </NLayer>

      <!-- 2 Meses Atrás -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">{{ twoMonthsAgoName }}</NTypo>
            <div class="p-1 bg-indigo-50 rounded">
              <NIcon name="mdi:calendar" class="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-indigo-600 tabular-nums lg:text-2xl">
            {{ formatCurrency(salesTotals.month2Ago) }}
          </NTypo>
        </div>
      </NLayer>

      <!-- Média Mensal Deste Ano -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Média/Mês {{ currentYear }}</NTypo>
            <div class="p-1 bg-teal-50 rounded">
              <NIcon name="mdi:chart-line" class="w-3.5 h-3.5 text-teal-600" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-teal-600 tabular-nums lg:text-2xl">
            {{ formatCurrency(avgMonthlyThisYear) }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1">{{ currentMonthNumber }} meses</NTypo>
        </div>
      </NLayer>

      <!-- Média Mensal Ano Passado -->
      <NLayer variant="paper" size="sm" radius="soft" class="shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Média/Mês {{ prevYear }}</NTypo>
            <div class="p-1 bg-slate-50 rounded">
              <NIcon name="mdi:chart-line" class="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-slate-600 tabular-nums lg:text-2xl">
            {{ formatCurrency(avgMonthlyLastYear) }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1">{{ currentMonthNumber }} meses</NTypo>
        </div>
      </NLayer>
    </div>

    <!-- Comissões Estimadas -->
    <div class="grid !grid-cols-1 md:!grid-cols-5 lg:!grid-cols-5 gap-3 lg:gap-4">
      <!-- Comissão Mês Atual -->
      <NLayer
        variant="paper"
        size="sm"
        radius="soft"
        class="shadow-sm bg-gradient-to-br from-green-50 to-emerald-50"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium"
              >Comissão {{ currentMonthName.split(' ')[0] }}</NTypo
            >
            <div class="p-1 bg-emerald-100 rounded">
              <NIcon name="mdi:cash-multiple" class="w-3.5 h-3.5 text-emerald-700" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-emerald-700 tabular-nums lg:text-2xl">
            {{ formatCurrency(commissionMonth) }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1"
            >sobre {{ formatCurrency(salesTotals.month) }}</NTypo
          >
        </div>
      </NLayer>

      <!-- Comissão Mês Anterior -->
      <NLayer
        variant="paper"
        size="sm"
        radius="soft"
        class="shadow-sm bg-gradient-to-br from-green-50 to-emerald-50"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium"
              >Comissão {{ prevMonthName.split(' ')[0] }}</NTypo
            >
            <div class="p-1 bg-emerald-100 rounded">
              <NIcon name="mdi:cash-multiple" class="w-3.5 h-3.5 text-emerald-700" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-emerald-700 tabular-nums lg:text-2xl">
            {{ formatCurrency(commissionMonthPrev) }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1"
            >sobre {{ formatCurrency(salesTotals.monthPrev) }}</NTypo
          >
        </div>
      </NLayer>

      <!-- Comissão 2 Meses Atrás -->
      <NLayer
        variant="paper"
        size="sm"
        radius="soft"
        class="shadow-sm bg-gradient-to-br from-green-50 to-emerald-50"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium"
              >Comissão {{ twoMonthsAgoName.split(' ')[0] }}</NTypo
            >
            <div class="p-1 bg-emerald-100 rounded">
              <NIcon name="mdi:cash-multiple" class="w-3.5 h-3.5 text-emerald-700" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-emerald-700 tabular-nums lg:text-2xl">
            {{ formatCurrency(commissionMonth2Ago) }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1"
            >sobre {{ formatCurrency(salesTotals.month2Ago) }}</NTypo
          >
        </div>
      </NLayer>

      <!-- Comissão Média Mensal Deste Ano -->
      <NLayer
        variant="paper"
        size="sm"
        radius="soft"
        class="shadow-sm bg-gradient-to-br from-green-50 to-emerald-50"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium"
              >Comissão Média/Mês {{ currentYear }}</NTypo
            >
            <div class="p-1 bg-emerald-100 rounded">
              <NIcon name="mdi:cash-multiple" class="w-3.5 h-3.5 text-emerald-700" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-emerald-700 tabular-nums lg:text-2xl">
            {{ formatCurrency(commissionAvgThisYear) }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1"
            >sobre {{ formatCurrency(avgMonthlyThisYear) }}/mês</NTypo
          >
        </div>
      </NLayer>

      <!-- Comissão Média Mensal Ano Passado -->
      <NLayer
        variant="paper"
        size="sm"
        radius="soft"
        class="shadow-sm bg-gradient-to-br from-green-50 to-emerald-50"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Comissão Média/Mês {{ prevYear }}</NTypo>
            <div class="p-1 bg-emerald-100 rounded">
              <NIcon name="mdi:cash-multiple" class="w-3.5 h-3.5 text-emerald-700" />
            </div>
          </div>
          <NTypo size="xl" weight="bold" class="text-emerald-700 tabular-nums lg:text-2xl">
            {{ formatCurrency(commissionAvgLastYear) }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1"
            >sobre {{ formatCurrency(avgMonthlyLastYear) }}/mês</NTypo
          >
        </div>
      </NLayer>
    </div>

    <!-- KPIs Comerciais -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <NTypo as="h2" size="lg" weight="bold">KPIs Comerciais (últimos 3 meses)</NTypo>
          <NTypo size="xs" tone="muted" class="mt-1">
            {{ commercialKpis.pedidos3m }} pedidos • atualizado em
            {{ formatDateTime(commercialKpis.computedAt) }}
          </NTypo>
        </div>
        <NButton
          variant="ghost"
          size="xs"
          leading-icon="mdi:refresh"
          :disabled="commercialKpisPending"
          @click="refreshCommercialKpis()"
        />
      </div>

      <div class="grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 gap-3">
        <div class="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Peças por pedido</NTypo>
            <NIcon name="mdi:cube-outline" class="w-4 h-4 text-indigo-600" />
          </div>
          <NTypo size="xl" weight="bold" class="text-indigo-700 tabular-nums">
            {{ formatDecimal(commercialKpis.mediaPecasPorPedido) }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1"
            >P75: {{ formatDecimal(commercialKpis.percentil75PecasPorPedido) }}</NTypo
          >
        </div>

        <div class="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Ticket médio/pedido</NTypo>
            <NIcon name="mdi:cash" class="w-4 h-4 text-emerald-600" />
          </div>
          <NTypo size="xl" weight="bold" class="text-emerald-700 tabular-nums">
            {{ formatCurrencyPrecise(commercialKpis.ticketMedioPorPedido) }}
          </NTypo>
        </div>

        <div class="rounded-lg border border-teal-100 bg-teal-50 p-3">
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Ticket médio/peça</NTypo>
            <NIcon name="mdi:cash-fast" class="w-4 h-4 text-teal-600" />
          </div>
          <NTypo size="xl" weight="bold" class="text-teal-700 tabular-nums">
            {{ formatCurrencyPrecise(commercialKpis.ticketMedioPorPeca) }}
          </NTypo>
        </div>

        <div class="rounded-lg border border-violet-100 bg-violet-50 p-3">
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Pedidos/cliente ativo/mês</NTypo>
            <NIcon name="mdi:account-multiple-check" class="w-4 h-4 text-violet-600" />
          </div>
          <NTypo size="xl" weight="bold" class="text-violet-700 tabular-nums">
            {{ formatDecimal(commercialKpis.pedidosPorClienteAtivoMedio, 3) }}
          </NTypo>
          <div class="mt-2 space-y-1">
            <div
              v-for="mes in commercialKpis.pedidosPorClienteAtivoMes"
              :key="mes.key"
              class="flex items-center justify-between text-xs"
            >
              <span class="text-gray-500">{{ mes.label }}</span>
              <span class="font-semibold text-violet-700 tabular-nums">{{
                formatDecimal(mes.pedidosPorClienteAtivo, 3)
              }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-orange-100 bg-orange-50 p-3">
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Reativação (30 dias)</NTypo>
            <NIcon name="mdi:account-refresh" class="w-4 h-4 text-orange-600" />
          </div>
          <NTypo size="xl" weight="bold" class="text-orange-700 tabular-nums">
            {{ commercialKpis.reativados30d }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1">
            {{ formatPercent(commercialKpis.taxaReativacao30d) }} de
            {{ commercialKpis.clientesComPedido30d }} clientes com pedido
          </NTypo>
        </div>

        <div class="rounded-lg border border-sky-100 bg-sky-50 p-3">
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Conversão tentativa → pedido</NTypo>
            <NIcon name="mdi:chart-bell-curve-cumulative" class="w-4 h-4 text-sky-600" />
          </div>
          <NTypo size="xl" weight="bold" class="text-sky-700 tabular-nums">
            {{ formatPercent(commercialKpis.taxaConversaoTentativaPedido) }}
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1">
            {{ commercialKpis.tentativasConvertidas3m }} de
            {{ commercialKpis.tentativas3m }} tentativas
          </NTypo>
        </div>

        <div class="rounded-lg border border-amber-100 bg-amber-50 p-3">
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Prazo médio</NTypo>
            <NIcon name="mdi:timer-outline" class="w-4 h-4 text-amber-600" />
          </div>
          <NTypo size="xl" weight="bold" class="text-amber-700 tabular-nums">
            {{ formatDecimal(commercialKpis.prazoMedioDias, 1) }} dias
          </NTypo>
          <NTypo size="xs" tone="muted" class="mt-1">tentativa até pedido</NTypo>
        </div>

        <div class="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div class="flex items-center justify-between mb-2">
            <NTypo size="xs" tone="muted" weight="medium">Clientes ativos (base)</NTypo>
            <NIcon name="mdi:account-check" class="w-4 h-4 text-slate-600" />
          </div>
          <NTypo size="xl" weight="bold" class="text-slate-700 tabular-nums">
            {{ commercialKpis.clientesAtivos }}
          </NTypo>
        </div>
      </div>

      <div class="grid !grid-cols-1 md:!grid-cols-2 gap-3 mt-3">
        <div class="rounded-lg border border-gray-200 p-3">
          <NTypo size="sm" weight="semibold" class="mb-2">Distribuição por tamanho de pedido</NTypo>
          <div class="space-y-1.5">
            <div
              v-for="bucket in commercialKpis.distribuicaoPorPedido"
              :key="bucket.label"
              class="flex items-center justify-between text-xs"
            >
              <span class="text-gray-600">{{ bucket.label }}</span>
              <span class="font-semibold tabular-nums text-gray-800">
                {{ bucket.count }} ({{ formatPercent(bucket.percentage) }})
              </span>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 p-3">
          <NTypo size="sm" weight="semibold" class="mb-2">Distribuição por tamanho</NTypo>
          <div class="space-y-1.5">
            <div
              v-for="bucket in commercialKpis.distribuicaoPorTamanho.slice(0, 8)"
              :key="bucket.label"
              class="flex items-center justify-between text-xs"
            >
              <span class="text-gray-600">{{
                bucket.label === 'Sem tamanho'
                  ? 'Sem tamanho identificado'
                  : `Tamanho ${bucket.label}`
              }}</span>
              <span class="font-semibold tabular-nums text-gray-800">
                {{ bucket.count }} peças ({{ formatPercent(bucket.percentage) }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </NLayer>

    <!-- Status Distribution & Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-6">
      <!-- Coluna 1: Distribuição + Acesso Rápido -->
      <div class="space-y-4 lg:space-y-6">
        <!-- Distribuição por Status -->
        <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
          <NTypo as="h2" size="lg" weight="bold" class="mb-4">Distribuição por Status</NTypo>
          <div class="space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-emerald-500" />
                  <NTypo size="sm" weight="medium">Ativos (≤90d)</NTypo>
                </div>
                <NTypo size="sm" weight="bold" class="text-emerald-600">{{
                  stats.activosVerde
                }}</NTypo>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full transition-all bar-active" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-yellow-500" />
                  <NTypo size="sm" weight="medium">Atenção (91-180d)</NTypo>
                </div>
                <NTypo size="sm" weight="bold" class="text-yellow-600">{{
                  stats.activosAmarelo
                }}</NTypo>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-yellow-500 rounded-full transition-all bar-attention" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-red-500" />
                  <NTypo size="sm" weight="medium">Críticos (>180d)</NTypo>
                </div>
                <NTypo size="sm" weight="bold" class="text-red-600">{{
                  stats.activosVermelho
                }}</NTypo>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-red-500 rounded-full transition-all bar-critical" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-blue-500" />
                  <NTypo size="sm" weight="medium">Potenciais</NTypo>
                </div>
                <NTypo size="sm" weight="bold" class="text-blue-600">{{ stats.potenciais }}</NTypo>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full transition-all bar-potential" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-gray-400" />
                  <NTypo size="sm" weight="medium">Inativos</NTypo>
                </div>
                <NTypo size="sm" weight="bold" class="text-gray-600">{{ stats.inativos }}</NTypo>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-gray-400 rounded-full transition-all bar-inactive" />
              </div>
            </div>
          </div>
        </NLayer>

        <!-- Ações Rápidas -->
        <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
          <NTypo as="h2" size="lg" weight="bold" class="mb-4">Acesso Rápido</NTypo>
          <div class="grid grid-cols-1 gap-3">
            <NuxtLink
              to="/admin/clients"
              class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-sky-200 hover:bg-sky-50 transition-all group"
            >
              <div class="p-2 bg-sky-100 rounded-lg group-hover:bg-sky-200 transition-colors">
                <NIcon name="mdi:account-group" class="w-5 h-5 text-sky-600" />
              </div>
              <div class="flex-1">
                <NTypo weight="semibold" class="group-hover:text-sky-700">Gerenciar Clientes</NTypo>
                <NTypo size="xs" tone="muted">Visualizar e editar cadastros</NTypo>
              </div>
              <NIcon
                name="mdi:chevron-right"
                class="w-5 h-5 text-gray-400 group-hover:text-sky-600"
              />
            </NuxtLink>

            <NuxtLink
              to="/admin/historico"
              class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
            >
              <div class="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <NIcon name="mdi:history" class="w-5 h-5 text-indigo-600" />
              </div>
              <div class="flex-1">
                <NTypo weight="semibold" class="group-hover:text-indigo-700"
                  >Histórico de Atividades</NTypo
                >
                <NTypo size="xs" tone="muted">Vendas, visitas e contatos</NTypo>
              </div>
              <NIcon
                name="mdi:chevron-right"
                class="w-5 h-5 text-gray-400 group-hover:text-indigo-600"
              />
            </NuxtLink>

            <NuxtLink
              to="/admin/users"
              class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
            >
              <div class="p-2 bg-violet-100 rounded-lg group-hover:bg-violet-200 transition-colors">
                <NIcon name="mdi:account" class="w-5 h-5 text-violet-600" />
              </div>
              <div class="flex-1">
                <NTypo weight="semibold" class="group-hover:text-violet-700"
                  >Gerenciar Usuários</NTypo
                >
                <NTypo size="xs" tone="muted">Vendedores, gerentes e admins</NTypo>
              </div>
              <NIcon
                name="mdi:chevron-right"
                class="w-5 h-5 text-gray-400 group-hover:text-violet-600"
              />
            </NuxtLink>

            <NuxtLink
              to="/admin/produtos"
              class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
            >
              <div
                class="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors"
              >
                <NIcon name="mdi:package-variant" class="w-5 h-5 text-emerald-600" />
              </div>
              <div class="flex-1">
                <NTypo weight="semibold" class="group-hover:text-emerald-700"
                  >Catálogo de Produtos</NTypo
                >
                <NTypo size="xs" tone="muted">Preços e disponibilidade</NTypo>
              </div>
              <NIcon
                name="mdi:chevron-right"
                class="w-5 h-5 text-gray-400 group-hover:text-emerald-600"
              />
            </NuxtLink>

            <NuxtLink
              to="/"
              class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
              <div class="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <NIcon name="mdi:map" class="w-5 h-5 text-blue-600" />
              </div>
              <div class="flex-1">
                <NTypo weight="semibold" class="group-hover:text-blue-700">Visualizar Mapa</NTypo>
                <NTypo size="xs" tone="muted">Distribuição geográfica</NTypo>
              </div>
              <NIcon
                name="mdi:chevron-right"
                class="w-5 h-5 text-gray-400 group-hover:text-blue-600"
              />
            </NuxtLink>

            <NuxtLink
              to="/admin/configuracoes"
              class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group"
            >
              <div class="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <NIcon name="mdi:cog" class="w-5 h-5 text-orange-600" />
              </div>
              <div class="flex-1">
                <NTypo weight="semibold" class="group-hover:text-orange-700">Configurações</NTypo>
                <NTypo size="xs" tone="muted">Comissão e preferências</NTypo>
              </div>
              <NIcon
                name="mdi:chevron-right"
                class="w-5 h-5 text-gray-400 group-hover:text-orange-600"
              />
            </NuxtLink>
          </div>
        </NLayer>
      </div>

      <!-- Ranking de Vendedores -->
      <NLayer
        variant="paper"
        size="base"
        radius="soft"
        class="shadow-sm md:col-span-3 lg:col-span-2"
      >
        <div class="flex items-center justify-between mb-4">
          <NTypo as="h2" size="lg" weight="bold">Ranking de Vendedores</NTypo>
          <NButton
            variant="ghost"
            size="xs"
            leading-icon="mdi:refresh"
            :disabled="rankingPending"
            @click="refreshRankingSection()"
          />
        </div>

        <!-- Filtros de período -->
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <NButton
            :variant="rankingScope === 'month' ? 'primary' : 'outline'"
            size="xs"
            @click="rankingScope = 'month'"
          >
            Mês
          </NButton>
          <NButton
            :variant="rankingScope === 'year' ? 'primary' : 'outline'"
            size="xs"
            @click="rankingScope = 'year'"
          >
            Ano
          </NButton>

          <select
            v-model.number="rankingYear"
            class="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option v-for="year in rankingYearOptions" :key="year" :value="year">
              {{ year }}
            </option>
          </select>

          <select
            v-if="rankingScope === 'month'"
            v-model.number="rankingMonth"
            class="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option v-for="month in rankingMonthOptions" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <NTypo size="xs" tone="muted" class="mb-4">{{ rankingPeriodLabel }}</NTypo>

        <!-- Lista de vendedores -->
        <div v-if="rankingPending" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div v-else-if="rankingVendedores.length === 0" class="py-8 text-center">
          <NIcon name="mdi:account-off-outline" class="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <NTypo size="sm" tone="muted">Nenhuma venda registrada neste período</NTypo>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(seller, index) in rankingVendedores"
            :key="seller.userId"
            class="rounded-lg border border-gray-100 transition-all hover:border-indigo-200"
          >
            <div class="flex items-center gap-3 p-3 hover:bg-indigo-50/50">
              <!-- Posição -->
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                :class="[
                  index === 0 ? 'bg-yellow-400 text-yellow-900' : '',
                  index === 1 ? 'bg-gray-300 text-gray-700' : '',
                  index === 2 ? 'bg-orange-400 text-orange-900' : '',
                  index > 2 ? 'bg-gray-100 text-gray-600' : '',
                ]"
              >
                {{ index + 1 }}
              </div>

              <!-- Info do vendedor -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <NTypo size="sm" weight="semibold" class="truncate">{{ seller.nome }}</NTypo>
                  <NTypo
                    v-if="seller.ativo === false"
                    as="span"
                    size="xs"
                    class="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
                  >
                    inativo
                  </NTypo>
                  <NTypo
                    v-if="!seller.encontrado"
                    as="span"
                    size="xs"
                    class="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-800"
                  >
                    não listado
                  </NTypo>
                </div>
                <div class="flex items-center gap-3 mt-0.5">
                  <NTypo size="xs" tone="muted">
                    {{ seller.numeroVendas }} {{ seller.numeroVendas === 1 ? 'venda' : 'vendas' }}
                  </NTypo>
                  <span class="text-gray-300">•</span>
                  <NTypo size="xs" tone="muted">
                    {{ seller.clientesUnicos }}
                    {{ seller.clientesUnicos === 1 ? 'cliente' : 'clientes' }}
                  </NTypo>
                </div>
              </div>

              <!-- Valor total -->
              <div class="text-right">
                <NTypo size="sm" weight="bold" class="text-indigo-600">
                  {{ formatCurrency(seller.totalVendido) }}
                </NTypo>
                <NTypo size="xs" tone="muted"
                  >Ticket {{ formatCurrency(seller.ticketMedio) }}</NTypo
                >
              </div>

              <NButton
                size="xs"
                variant="outline"
                :loading="isSellerDetailsLoading(seller.userId)"
                :trailing-icon="
                  isSellerExpanded(seller.userId) ? 'mdi:chevron-up' : 'mdi:chevron-down'
                "
                @click="toggleSellerExpanded(seller.userId)"
              >
                {{ isSellerExpanded(seller.userId) ? 'Ocultar' : 'Ver vendas' }}
              </NButton>
            </div>

            <div
              v-if="isSellerExpanded(seller.userId)"
              class="border-t border-gray-100 bg-gray-50/60 p-3 space-y-2"
            >
              <div v-if="isSellerDetailsLoading(seller.userId)" class="space-y-2">
                <div v-for="i in 3" :key="i" class="h-8 rounded bg-gray-100 animate-pulse" />
              </div>

              <div
                v-else-if="sellerDetailsErrorByUserId[seller.userId]"
                class="rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <NTypo size="xs" class="text-red-700">{{
                  sellerDetailsErrorByUserId[seller.userId]
                }}</NTypo>
              </div>

              <div
                v-else-if="sellerDetailsRows(seller.userId).length === 0"
                class="rounded-lg border border-gray-200 bg-white p-3"
              >
                <NTypo size="xs" tone="muted">Nenhuma venda encontrada para este vendedor.</NTypo>
              </div>

              <div v-else class="space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <NTypo size="xs" tone="muted">{{
                    sellerDetailsSummaryText(seller.userId)
                  }}</NTypo>
                  <NTypo size="xs" tone="muted">{{ rankingPeriodLabel }}</NTypo>
                </div>

                <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table class="min-w-full text-left text-xs">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-3 py-2 font-semibold text-gray-700">Data</th>
                        <th class="px-3 py-2 font-semibold text-gray-700">Cliente</th>
                        <th class="px-3 py-2 font-semibold text-gray-700">Cidade</th>
                        <th class="px-3 py-2 font-semibold text-gray-700">Canal</th>
                        <th class="px-3 py-2 text-right font-semibold text-gray-700">Valor</th>
                        <th class="px-3 py-2 font-semibold text-gray-700">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="row in sellerDetailsRows(seller.userId)"
                        :key="`${row.eventId}-${row.data}`"
                        class="border-t border-gray-100"
                      >
                        <td class="px-3 py-2 whitespace-nowrap text-gray-700">
                          {{ formatShortDate(row.data) }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-gray-900">
                          {{ row.clientNome }}
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap text-gray-700">{{ row.cidade }}</td>
                        <td class="px-3 py-2 whitespace-nowrap text-gray-700">
                          {{ row.tipoLabel }}
                        </td>
                        <td
                          class="px-3 py-2 whitespace-nowrap text-right font-semibold text-emerald-700"
                        >
                          {{ formatCurrencyPrecise(row.valor) }}
                        </td>
                        <td class="px-3 py-2 align-top">
                          <div class="flex min-w-[17rem] flex-col gap-1.5">
                            <div class="flex items-center gap-1.5">
                              <NSelect
                                :model-value="transferTargetByEventId[row.eventId] || ''"
                                size="sm"
                                class="min-w-[11rem]"
                                @update:model-value="onTransferTargetChange(row.eventId, $event)"
                              >
                                <option value="">Transferir para...</option>
                                <option
                                  v-for="option in transferSellerOptionsForCurrentSeller(
                                    seller.userId
                                  )"
                                  :key="option.value"
                                  :value="option.value"
                                >
                                  {{ option.label }}
                                </option>
                              </NSelect>

                              <NButton
                                size="xs"
                                variant="outline"
                                :loading="isTransferringSale(row.eventId)"
                                :disabled="
                                  isTransferringSale(row.eventId) ||
                                  !canTransferSale(row.eventId, seller.userId)
                                "
                                @click="transferSaleRow(row, seller.userId)"
                              >
                                Transferir
                              </NButton>
                            </div>

                            <NTypo
                              v-if="transferSaleErrorByEventId[row.eventId]"
                              size="xs"
                              class="text-red-600"
                            >
                              {{ transferSaleErrorByEventId[row.eventId] }}
                            </NTypo>
                            <NTypo
                              v-else-if="transferSaleSuccessByEventId[row.eventId]"
                              size="xs"
                              class="text-emerald-700"
                            >
                              {{ transferSaleSuccessByEventId[row.eventId] }}
                            </NTypo>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NLayer>
    </div>

    <!-- Segmentos -->
    <NLayer variant="paper" size="base" radius="soft" class="shadow-sm">
      <NTypo as="h2" size="lg" weight="bold" class="mb-4">Distribuição por Segmento</NTypo>
      <div class="grid !grid-cols-2 md:!grid-cols-4 lg:!grid-cols-4 gap-3">
        <div
          class="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">👓</span>
            <NTypo size="sm" weight="semibold" class="text-blue-900">Ótica</NTypo>
          </div>
          <NTypo size="2xl" weight="bold" class="text-blue-600 tabular-nums">
            {{ stats.segmentos.otica }}
          </NTypo>
        </div>

        <div
          class="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">⌚</span>
            <NTypo size="sm" weight="semibold" class="text-purple-900">Relojoaria</NTypo>
          </div>
          <NTypo size="2xl" weight="bold" class="text-purple-600 tabular-nums">
            {{ stats.segmentos.relojoaria }}
          </NTypo>
        </div>

        <div
          class="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">💍</span>
            <NTypo size="sm" weight="semibold" class="text-pink-900">Semi-joias</NTypo>
          </div>
          <NTypo size="2xl" weight="bold" class="text-pink-600 tabular-nums">
            {{ stats.segmentos.semijoia }}
          </NTypo>
        </div>

        <div
          class="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">🏪</span>
            <NTypo size="sm" weight="semibold" class="text-amber-900">Multimarcas</NTypo>
          </div>
          <NTypo size="2xl" weight="bold" class="text-amber-600 tabular-nums">
            {{ stats.segmentos.multimarcas }}
          </NTypo>
        </div>
      </div>
    </NLayer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { z } from 'zod'
import { ClientDtoSchema } from '~/types/schemas'

definePageMeta({ layout: 'admin' })

const ClientsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    clients: z.array(ClientDtoSchema),
    mapSettings: z.any(),
    salesTotals: z
      .object({
        month: z.number(),
        monthPrev: z.number().optional(),
        month2Ago: z.number().optional(),
        monthPrevYear: z.number().optional(),
        quarter: z.number(),
        quarterPrev: z.number().optional(),
        quarterPrevYear: z.number().optional(),
        year: z.number(),
        yearPrevYear: z.number().optional(),
      })
      .optional(),
    contactsThisMonth: z.number().optional(),
    contactsPrevMonth: z.number().optional(),
  }),
})

const SettingsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    commissionRate: z.number(),
  }),
})

const KpisDistributionSchema = z.object({
  label: z.string(),
  count: z.number(),
  percentage: z.number(),
})

const CommercialKpisResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    janelaInicio: z.string(),
    janelaFim: z.string(),
    pedidos3m: z.number(),
    clientesAtivos: z.number(),
    mediaPecasPorPedido: z.number(),
    percentil75PecasPorPedido: z.number(),
    pedidosPorClienteAtivoMedio: z.number(),
    pedidosPorClienteAtivoMes: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        pedidos: z.number(),
        pedidosPorClienteAtivo: z.number(),
      })
    ),
    reativados30d: z.number(),
    clientesComPedido30d: z.number(),
    taxaReativacao30d: z.number(),
    tentativas3m: z.number(),
    tentativasConvertidas3m: z.number(),
    taxaConversaoTentativaPedido: z.number(),
    prazoMedioDias: z.number(),
    ticketMedioPorPedido: z.number(),
    ticketMedioPorPeca: z.number(),
    distribuicaoPorPedido: z.array(KpisDistributionSchema),
    distribuicaoPorTamanho: z.array(KpisDistributionSchema),
    observacoes: z.object({
      prazoMedioBase: z.string(),
      tamanhoBase: z.string(),
    }),
    computedAt: z.string(),
  }),
})

const { data, pending, error, refresh } = await useFetch('/api/v1/clients', {
  transform: (res) => ClientsResponseSchema.parse(res).data,
})

const { data: settingsData } = await useFetch('/api/v1/settings', {
  transform: (res) => SettingsResponseSchema.parse(res).data,
})

const {
  data: commercialKpisData,
  pending: commercialKpisPending,
  error: commercialKpisError,
  refresh: refreshCommercialKpis,
} = await useFetch('/api/v1/admin/kpis-comerciais', {
  transform: (res) => CommercialKpisResponseSchema.parse(res).data,
})

const commissionRate = computed(() => settingsData.value?.commissionRate || 0)

// Ranking de vendedores
const rankingScope = ref<'month' | 'year'>('month')
const rankingYear = ref(new Date().getFullYear())
const rankingMonth = ref(new Date().getMonth() + 1)

const RankingSellersResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    ranking: z.array(
      z.object({
        userId: z.string(),
        nome: z.string(),
        ativo: z.union([z.boolean(), z.null()]),
        encontrado: z.boolean(),
        clientesUnicos: z.number(),
        totalVendido: z.number(),
        ticketMedio: z.number(),
        numeroVendas: z.number().int().min(0),
      })
    ),
    scope: z.enum(['month', 'year']),
    year: z.number(),
    month: z.number().nullable(),
    periodLabel: z.string(),
    totalEventos: z.number().int().min(0),
  }),
})

const RankingSellerDetailsRowSchema = z.object({
  eventId: z.string(),
  tipo: z.string(),
  tipoLabel: z.string(),
  data: z.string(),
  valor: z.number(),
  clientId: z.string(),
  clientNome: z.string(),
  cidade: z.string(),
})

const RankingSellerDetailsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    userId: z.string(),
    scope: z.enum(['month', 'year']),
    year: z.number(),
    month: z.number().nullable(),
    periodLabel: z.string(),
    totalEventos: z.number().int().min(0),
    returnedEventos: z.number().int().min(0),
    limit: z.number().int().min(1),
    rows: z.array(RankingSellerDetailsRowSchema),
  }),
})

const SellerTransferUserSchema = z.object({
  id: z.string(),
  nome: z.string(),
})

const SellerTransferUsersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SellerTransferUserSchema),
})

const SellerTransferResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    eventId: z.string(),
    fromUserId: z.string(),
    toUserId: z.string(),
    changed: z.boolean(),
  }),
})

type RankingSellerDetailsPayload = z.infer<typeof RankingSellerDetailsResponseSchema>['data']
type RankingSellerDetailsRow = z.infer<typeof RankingSellerDetailsRowSchema>

const rankingQuery = computed(() => {
  const base: Record<string, string | number> = {
    scope: rankingScope.value,
    year: rankingYear.value,
  }
  if (rankingScope.value === 'month') base.month = rankingMonth.value
  return base
})

const {
  data: rankingData,
  pending: rankingPending,
  refresh: refreshRanking,
} = await useFetch('/api/v1/admin/ranking-vendedores', {
  query: rankingQuery,
  transform: (res) => RankingSellersResponseSchema.parse(res).data,
  watch: [rankingScope, rankingYear, rankingMonth],
})

const { data: sellerTransferUsersData } = await useFetch('/api/v1/users', {
  query: {
    role: 'vendedor',
    ativo: 'true',
  },
  transform: (res) => SellerTransferUsersResponseSchema.parse(res).data,
})

const rankingVendedores = computed(() => rankingData.value?.ranking || [])
const rankingPeriodLabel = computed(() => rankingData.value?.periodLabel || 'Período selecionado')
const rankingMonthOptions = Array.from({ length: 12 }, (_, index) => {
  const value = index + 1
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2020, index, 1)))
  return { value, label }
})
const rankingYearOptions = computed(() =>
  Array.from({ length: 6 }, (_, offset) => new Date().getFullYear() - offset)
)

const SELLER_DETAILS_LIMIT = 300
const expandedSellerIds = ref<string[]>([])
const sellerDetailsByUserId = ref<Record<string, RankingSellerDetailsPayload>>({})
const sellerDetailsLoadingByUserId = ref<Record<string, boolean>>({})
const sellerDetailsErrorByUserId = ref<Record<string, string>>({})
const transferTargetByEventId = ref<Record<string, string>>({})
const transferSaleLoadingByEventId = ref<Record<string, boolean>>({})
const transferSaleErrorByEventId = ref<Record<string, string>>({})
const transferSaleSuccessByEventId = ref<Record<string, string>>({})

const sellerNameByUserId = computed<Record<string, string>>(() => {
  const names: Record<string, string> = {}

  for (const user of sellerTransferUsersData.value || []) {
    if (!user.id) continue
    names[user.id] = user.nome || user.id
  }

  for (const seller of rankingVendedores.value) {
    if (!seller.userId) continue
    if (!names[seller.userId]) names[seller.userId] = seller.nome || seller.userId
  }

  return names
})

const transferSellerOptions = computed(() => {
  const options = Object.entries(sellerNameByUserId.value).map(([value, label]) => ({
    value,
    label,
  }))
  options.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }))
  return options
})

function resetSellerDetailsState() {
  expandedSellerIds.value = []
  sellerDetailsByUserId.value = {}
  sellerDetailsLoadingByUserId.value = {}
  sellerDetailsErrorByUserId.value = {}
  transferTargetByEventId.value = {}
  transferSaleLoadingByEventId.value = {}
  transferSaleErrorByEventId.value = {}
  transferSaleSuccessByEventId.value = {}
}

watch([rankingScope, rankingYear, rankingMonth], () => {
  resetSellerDetailsState()
})

function isSellerExpanded(userId: string): boolean {
  return expandedSellerIds.value.includes(userId)
}

function isTransferringSale(eventId: string): boolean {
  return Boolean(transferSaleLoadingByEventId.value[eventId])
}

function isSellerDetailsLoading(userId: string): boolean {
  return Boolean(sellerDetailsLoadingByUserId.value[userId])
}

function sellerDetailsRows(userId: string) {
  return sellerDetailsByUserId.value[userId]?.rows || []
}

function transferSellerOptionsForCurrentSeller(currentUserId: string) {
  return transferSellerOptions.value.filter((option) => option.value !== currentUserId)
}

function onTransferTargetChange(eventId: string, targetUserId: string) {
  transferTargetByEventId.value = {
    ...transferTargetByEventId.value,
    [eventId]: String(targetUserId || '').trim(),
  }
  transferSaleErrorByEventId.value = {
    ...transferSaleErrorByEventId.value,
    [eventId]: '',
  }
  transferSaleSuccessByEventId.value = {
    ...transferSaleSuccessByEventId.value,
    [eventId]: '',
  }
}

function canTransferSale(eventId: string, currentUserId: string): boolean {
  const targetUserId = String(transferTargetByEventId.value[eventId] || '').trim()
  return Boolean(targetUserId && targetUserId !== currentUserId)
}

function sellerDetailsSummaryText(userId: string): string {
  const details = sellerDetailsByUserId.value[userId]
  if (!details) return 'Sem detalhes carregados'
  if (details.totalEventos <= details.returnedEventos) {
    return `${details.returnedEventos} vendas listadas`
  }
  return `${details.returnedEventos} de ${details.totalEventos} vendas listadas`
}

function clearSellerDetailsCacheForUsers(userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)))
  if (!uniqueUserIds.length) return

  const nextDetails = { ...sellerDetailsByUserId.value }
  const nextLoading = { ...sellerDetailsLoadingByUserId.value }
  const nextErrors = { ...sellerDetailsErrorByUserId.value }

  for (const userId of uniqueUserIds) {
    delete nextDetails[userId]
    delete nextLoading[userId]
    delete nextErrors[userId]
  }

  sellerDetailsByUserId.value = nextDetails
  sellerDetailsLoadingByUserId.value = nextLoading
  sellerDetailsErrorByUserId.value = nextErrors
}

async function fetchSellerDetails(userId: string, opts: { force?: boolean } = {}) {
  if (!userId) return
  if (
    !opts.force &&
    (sellerDetailsByUserId.value[userId] || sellerDetailsLoadingByUserId.value[userId])
  )
    return

  sellerDetailsLoadingByUserId.value = {
    ...sellerDetailsLoadingByUserId.value,
    [userId]: true,
  }
  sellerDetailsErrorByUserId.value = {
    ...sellerDetailsErrorByUserId.value,
    [userId]: '',
  }

  try {
    const response = await $fetch(
      `/api/v1/admin/ranking-vendedores/${encodeURIComponent(userId)}`,
      {
        query: {
          ...rankingQuery.value,
          limit: SELLER_DETAILS_LIMIT,
        },
      }
    )
    const parsed = RankingSellerDetailsResponseSchema.parse(response)
    sellerDetailsByUserId.value = {
      ...sellerDetailsByUserId.value,
      [userId]: parsed.data,
    }
  } catch (error) {
    console.error('Erro ao carregar detalhes do vendedor:', error)
    sellerDetailsErrorByUserId.value = {
      ...sellerDetailsErrorByUserId.value,
      [userId]: 'Falha ao carregar detalhes das vendas deste vendedor.',
    }
  } finally {
    sellerDetailsLoadingByUserId.value = {
      ...sellerDetailsLoadingByUserId.value,
      [userId]: false,
    }
  }
}

async function transferSaleRow(row: RankingSellerDetailsRow, fromUserId: string) {
  const eventId = String(row.eventId || '').trim()
  const toUserId = String(transferTargetByEventId.value[eventId] || '').trim()

  transferSaleErrorByEventId.value = {
    ...transferSaleErrorByEventId.value,
    [eventId]: '',
  }
  transferSaleSuccessByEventId.value = {
    ...transferSaleSuccessByEventId.value,
    [eventId]: '',
  }

  if (!eventId) {
    transferSaleErrorByEventId.value = {
      ...transferSaleErrorByEventId.value,
      [eventId]: 'Venda inválida para transferência.',
    }
    return
  }

  if (!toUserId) {
    transferSaleErrorByEventId.value = {
      ...transferSaleErrorByEventId.value,
      [eventId]: 'Selecione o representante de destino.',
    }
    return
  }

  if (toUserId === fromUserId) {
    transferSaleErrorByEventId.value = {
      ...transferSaleErrorByEventId.value,
      [eventId]: 'Selecione um representante diferente do atual.',
    }
    return
  }

  const targetName = sellerNameByUserId.value[toUserId] || toUserId
  const confirmed = confirm(
    `Transferir a venda de ${formatShortDate(row.data)} (${formatCurrencyPrecise(row.valor)}) para ${targetName}?`
  )
  if (!confirmed) return

  transferSaleLoadingByEventId.value = {
    ...transferSaleLoadingByEventId.value,
    [eventId]: true,
  }

  try {
    const response = await $fetch('/api/v1/admin/ranking-vendedores/transfer-venda', {
      method: 'POST',
      body: {
        eventId,
        toUserId,
      },
    })
    const parsed = SellerTransferResponseSchema.parse(response)
    const affectedUserIds = Array.from(new Set([parsed.data.fromUserId, parsed.data.toUserId]))

    clearSellerDetailsCacheForUsers(affectedUserIds)

    await refreshRanking()
    await Promise.all(
      affectedUserIds
        .filter((userId) => isSellerExpanded(userId))
        .map((userId) => fetchSellerDetails(userId, { force: true }))
    )

    transferSaleSuccessByEventId.value = {
      ...transferSaleSuccessByEventId.value,
      [eventId]: parsed.data.changed
        ? `Venda transferida para ${sellerNameByUserId.value[parsed.data.toUserId] || parsed.data.toUserId}.`
        : 'Venda já estava com este representante.',
    }
  } catch (error: any) {
    console.error('Erro ao transferir venda:', error)
    const message =
      String(error?.data?.statusMessage || error?.statusMessage || error?.message || '').trim() ||
      'Falha ao transferir venda.'
    transferSaleErrorByEventId.value = {
      ...transferSaleErrorByEventId.value,
      [eventId]: message,
    }
  } finally {
    transferSaleLoadingByEventId.value = {
      ...transferSaleLoadingByEventId.value,
      [eventId]: false,
    }
  }
}

async function toggleSellerExpanded(userId: string) {
  if (!userId) return

  if (isSellerExpanded(userId)) {
    expandedSellerIds.value = expandedSellerIds.value.filter((id) => id !== userId)
    return
  }

  expandedSellerIds.value = [...expandedSellerIds.value, userId]
  await fetchSellerDetails(userId)
}

async function refreshRankingSection() {
  resetSellerDetailsState()
  await refreshRanking()
}

const commercialKpis = computed(() => {
  return (
    commercialKpisData.value || {
      janelaInicio: '',
      janelaFim: '',
      pedidos3m: 0,
      clientesAtivos: 0,
      mediaPecasPorPedido: 0,
      percentil75PecasPorPedido: 0,
      pedidosPorClienteAtivoMedio: 0,
      pedidosPorClienteAtivoMes: [] as Array<{
        key: string
        label: string
        pedidos: number
        pedidosPorClienteAtivo: number
      }>,
      reativados30d: 0,
      clientesComPedido30d: 0,
      taxaReativacao30d: 0,
      tentativas3m: 0,
      tentativasConvertidas3m: 0,
      taxaConversaoTentativaPedido: 0,
      prazoMedioDias: 0,
      ticketMedioPorPedido: 0,
      ticketMedioPorPeca: 0,
      distribuicaoPorPedido: [] as Array<{ label: string; count: number; percentage: number }>,
      distribuicaoPorTamanho: [] as Array<{ label: string; count: number; percentage: number }>,
      observacoes: {
        prazoMedioBase: '',
        tamanhoBase: '',
      },
      computedAt: '',
    }
  )
})

const clients = computed(() => data.value?.clients || [])
const salesTotals = computed(() => {
  const s = data.value?.salesTotals
  return {
    month: s?.month || 0,
    monthPrev: s?.monthPrev || 0,
    month2Ago: s?.month2Ago || 0,
    monthPrevYear: s?.monthPrevYear || 0,
    quarter: s?.quarter || 0,
    quarterPrev: s?.quarterPrev || 0,
    quarterPrevYear: s?.quarterPrevYear || 0,
    year: s?.year || 0,
    yearPrevYear: s?.yearPrevYear || 0,
  }
})

const contactsThisMonth = computed(() => Number(data.value?.contactsThisMonth) || 0)
const contactsPrevMonth = computed(() => Number(data.value?.contactsPrevMonth) || 0)

const { keyForClient } = useClientEngagementStatus()

const createdThisMonth = computed(() => {
  const now = new Date()
  const start = new Date(now)
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  let count = 0
  for (const c of clients.value as any[]) {
    const iso = c?.createdAt
    if (typeof iso !== 'string' || !iso) continue
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) continue
    if (d >= start) count++
  }
  return count
})

const statusBuckets = computed(() => {
  let verde = 0
  let amarelo = 0
  let vermelho = 0
  let potencial = 0
  let inativo = 0

  for (const c of clients.value as any[]) {
    const k = keyForClient(c)
    if (k === 'inativo') inativo++
    else if (k === 'potencial') potencial++
    else if (k === 'critico') vermelho++
    else if (k === 'atencao') amarelo++
    else verde++
  }

  return { verde, amarelo, vermelho, potencial, inativo }
})

const segmentos = computed(() => {
  const out = { otica: 0, relojoaria: 0, semijoia: 0, multimarcas: 0 }
  for (const c of clients.value as any[]) {
    const seg = String(c?.segmento || '')
    if (seg === 'otica') out.otica++
    else if (seg === 'relojoaria') out.relojoaria++
    else if (seg === 'semijoia') out.semijoia++
    else if (seg === 'multimarcas') out.multimarcas++
  }
  return out
})

const stats = computed(() => ({
  totalClients: clients.value.length,
  createdThisMonth: createdThisMonth.value,
  activosVerde: statusBuckets.value.verde,
  activosAmarelo: statusBuckets.value.amarelo,
  activosVermelho: statusBuckets.value.vermelho,
  potenciais: statusBuckets.value.potencial,
  inativos: statusBuckets.value.inativo,
  contatosNoMes: contactsThisMonth.value,
  faturamentoMensal: salesTotals.value.month,
  faturamentoTrimestral: salesTotals.value.quarter,
  faturamentoAnual: salesTotals.value.year,
  segmentos: segmentos.value,
}))

const currentDate = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
})

const currentYear = computed(() => new Date().getFullYear())
const prevYear = computed(() => new Date().getFullYear() - 1)
const currentMonthNumber = computed(() => new Date().getMonth() + 1)

const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())
})

const prevMonthName = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d)
})

const twoMonthsAgoName = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 2)
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d)
})

const avgMonthlyThisYear = computed(() => {
  const months = currentMonthNumber.value
  if (months === 0) return 0
  return Math.round(salesTotals.value.year / months)
})

const avgMonthlyLastYear = computed(() => {
  const months = currentMonthNumber.value
  if (months === 0) return 0
  return Math.round(salesTotals.value.yearPrevYear / months)
})

const commissionRateFormatted = computed(() => `${(commissionRate.value * 100).toFixed(0)}%`)

const commissionMonth = computed(() => Math.round(salesTotals.value.month * commissionRate.value))
const commissionMonthPrev = computed(() =>
  Math.round(salesTotals.value.monthPrev * commissionRate.value)
)
const commissionMonth2Ago = computed(() =>
  Math.round(salesTotals.value.month2Ago * commissionRate.value)
)
const commissionAvgThisYear = computed(() =>
  Math.round(avgMonthlyThisYear.value * commissionRate.value)
)
const commissionAvgLastYear = computed(() =>
  Math.round(avgMonthlyLastYear.value * commissionRate.value)
)

function pct(n: number, d: number) {
  if (!d) return 0
  return Math.round((n / d) * 100)
}

const activePercentage = computed(() => pct(stats.value.activosVerde, stats.value.totalClients))
const activePercentagePct = computed(() => `${activePercentage.value}%`)

const attentionPercentage = computed(() =>
  pct(stats.value.activosAmarelo, stats.value.totalClients)
)
const attentionPercentagePct = computed(() => `${attentionPercentage.value}%`)

const criticalPercentage = computed(() =>
  pct(stats.value.activosVermelho, stats.value.totalClients)
)
const criticalPercentagePct = computed(() => `${criticalPercentage.value}%`)

const potentialPercentage = computed(() => pct(stats.value.potenciais, stats.value.totalClients))
const potentialPercentagePct = computed(() => `${potentialPercentage.value}%`)

const inactivePercentage = computed(() => pct(stats.value.inativos, stats.value.totalClients))
const inactivePercentagePct = computed(() => `${inactivePercentage.value}%`)

type DeltaMeta = { text: string; textClass: string; icon: string; iconClass: string }
function deltaMeta(current: number, previous: number): DeltaMeta {
  const c = Number.isFinite(current) ? current : 0
  const p = Number.isFinite(previous) ? previous : 0

  if (p <= 0) {
    if (c <= 0)
      return {
        text: '0%',
        textClass: 'text-slate-600',
        icon: 'mdi:minus',
        iconClass: 'text-slate-500',
      }
    return {
      text: 'novo',
      textClass: 'text-emerald-700',
      icon: 'mdi:trending-up',
      iconClass: 'text-emerald-600',
    }
  }

  const pct = Math.round(((c - p) / p) * 100)
  if (pct > 0)
    return {
      text: `+${pct}%`,
      textClass: 'text-emerald-700',
      icon: 'mdi:trending-up',
      iconClass: 'text-emerald-600',
    }
  if (pct < 0)
    return {
      text: `${pct}%`,
      textClass: 'text-red-700',
      icon: 'mdi:trending-down',
      iconClass: 'text-red-600',
    }
  return { text: '0%', textClass: 'text-slate-600', icon: 'mdi:minus', iconClass: 'text-slate-500' }
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

async function refreshAll() {
  await Promise.all([refresh(), refreshCommercialKpis(), refreshRankingSection()])
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDecimal(value: number, digits = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${formatDecimal(value, 1)}%`
}

function formatDateTime(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function formatShortDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}
</script>

<style scoped>
.bar-active {
  width: v-bind(activePercentagePct);
}
.bar-attention {
  width: v-bind(attentionPercentagePct);
}
.bar-critical {
  width: v-bind(criticalPercentagePct);
}
.bar-potential {
  width: v-bind(potentialPercentagePct);
}
.bar-inactive {
  width: v-bind(inactivePercentagePct);
}
</style>
