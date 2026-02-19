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

      <!-- Ranking de Vendas -->
      <NLayer
        variant="paper"
        size="base"
        radius="soft"
        class="shadow-sm md:col-span-3 lg:col-span-2"
      >
        <div class="flex items-center justify-between mb-4">
          <NTypo as="h2" size="lg" weight="bold">Ranking de Vendas</NTypo>
          <NButton
            variant="ghost"
            size="xs"
            leading-icon="mdi:refresh"
            :disabled="rankingPending"
            @click="refreshRanking()"
          />
        </div>

        <!-- Filtros de período -->
        <div class="flex gap-2 mb-4">
          <NButton
            :variant="rankingPeriod === 'year' ? 'primary' : 'outline'"
            size="xs"
            @click="rankingPeriod = 'year'"
          >
            {{ currentYear }}
          </NButton>
          <NButton
            :variant="rankingPeriod === 'lastYear' ? 'primary' : 'outline'"
            size="xs"
            @click="rankingPeriod = 'lastYear'"
          >
            {{ prevYear }}
          </NButton>
          <NButton
            :variant="rankingPeriod === 'all' ? 'primary' : 'outline'"
            size="xs"
            @click="rankingPeriod = 'all'"
          >
            Todos
          </NButton>
        </div>

        <!-- Lista de produtos -->
        <div v-if="rankingPending" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-16 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div v-else-if="rankingVendas.length === 0" class="py-8 text-center">
          <NIcon name="mdi:package-variant-closed" class="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <NTypo size="sm" tone="muted">Nenhuma venda registrada neste período</NTypo>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(produto, index) in rankingVendas"
            :key="produto.produtoId"
            class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
          >
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

            <!-- Info do produto -->
            <div class="flex-1 min-w-0">
              <NTypo size="sm" weight="semibold" class="truncate">{{ produto.nome }}</NTypo>
              <div class="flex items-center gap-3 mt-0.5">
                <NTypo size="xs" tone="muted"> {{ produto.quantidade }} unidades </NTypo>
                <span class="text-gray-300">•</span>
                <NTypo size="xs" tone="muted">
                  {{ produto.numeroVendas }} {{ produto.numeroVendas === 1 ? 'venda' : 'vendas' }}
                </NTypo>
              </div>
            </div>

            <!-- Valor total -->
            <div class="text-right">
              <NTypo size="sm" weight="bold" class="text-indigo-600">
                {{ formatCurrency(produto.totalVendido) }}
              </NTypo>
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

// Ranking de vendas
const rankingPeriod = ref<'year' | 'lastYear' | 'all'>('year')

const RankingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    ranking: z.array(
      z.object({
        produtoId: z.string(),
        nome: z.string(),
        quantidade: z.number(),
        totalVendido: z.number(),
        numeroVendas: z.number(),
      })
    ),
    period: z.string(),
    totalEventos: z.number(),
  }),
})

const {
  data: rankingData,
  pending: rankingPending,
  refresh: refreshRanking,
} = await useFetch('/api/v1/admin/ranking-vendas', {
  query: { period: rankingPeriod },
  transform: (res) => RankingResponseSchema.parse(res).data,
  watch: [rankingPeriod],
})

const rankingVendas = computed(() => rankingData.value?.ranking || [])

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
  await Promise.all([refresh(), refreshCommercialKpis(), refreshRanking()])
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
