<template>
  <div class="bg-[#F4F1EB] text-[#2A2A2A] [font-family:'Montserrat',sans-serif]">
    <section
      class="relative overflow-hidden bg-[linear-gradient(180deg,#2E2E2E_0%,#3A3A3A_60%,#E9E4DD_100%)] text-[#F8F6F2]"
    >
      <div class="absolute inset-0 bg-black/40"></div>
      <NContainer class="relative pt-6 sm:pt-8 md:pt-10">
        <div class="flex justify-center md:justify-start">
          <div class="inline-flex items-center gap-3">
            <div class="h-11 w-11 overflow-hidden rounded-sm">
              <img
                src="/logo.webp"
                alt="Monograma Felssner"
                class="h-full w-full object-cover object-left"
              />
            </div>
            <div class="leading-none">
              <p class="text-sm font-semibold tracking-[0.18em] text-white sm:text-base">
                FELSSNER
              </p>
              <p class="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/90">
                Representações
              </p>
            </div>
          </div>
        </div>

        <div
          class="grid min-h-[calc(100vh-84px)] items-center gap-10 py-10 md:grid-cols-2 md:py-20"
        >
          <div class="space-y-6">
            <div class="space-y-3">
              <h1
                class="text-4xl leading-tight [font-family:'Playfair_Display',serif] sm:text-5xl lg:text-6xl"
              >
                Linha Vi&Va Alianças com envio para todo o Brasil
              </h1>
              <p class="max-w-xl text-base text-[#F8F6F2]/90 sm:text-lg">
                Empresa de representação comercial focada em kits com pronta entrega e reposição
                média em até 15 dias.
              </p>
            </div>

            <ul class="space-y-2 text-sm text-[#F8F6F2]/95 sm:text-base">
              <li class="flex items-center gap-2">
                <NIcon name="mdi:check-circle" class="h-5 w-5 text-[#C6A64B]" />
                Envio para todo o Brasil
              </li>
              <li class="flex items-center gap-2">
                <NIcon name="mdi:check-circle" class="h-5 w-5 text-[#C6A64B]" />
                Produtos direto da fábrica
              </li>
              <li class="flex items-center gap-2">
                <NIcon name="mdi:check-circle" class="h-5 w-5 text-[#C6A64B]" />
                Produção média: 15 dias corridos
              </li>
              <li class="flex items-center gap-2">
                <NIcon name="mdi:check-circle" class="h-5 w-5 text-[#C6A64B]" />
                Certificado + Garantia de 1 Ano
              </li>
              <li class="flex items-center gap-2">
                <NIcon name="mdi:check-circle" class="h-5 w-5 text-[#C6A64B]" />
                Sem pedido mínimo
              </li>
            </ul>

            <div class="space-y-3">
              <div class="flex flex-col gap-3 sm:flex-row">
                <a :href="catalogLink" target="_blank" rel="noopener" :class="primaryButtonClass">
                  Quero Receber o Catálogo no WhatsApp
                </a>
                <a :href="serviceLink" target="_blank" rel="noopener" :class="outlineButtonClass">
                  Falar com Atendimento
                </a>
              </div>
              <p class="text-xs text-[#F8F6F2]/80">Resposta rápida no horário comercial</p>
            </div>
          </div>

          <div class="relative w-full md:justify-self-end md:pl-4">
            <div
              class="absolute -bottom-6 -left-4 h-40 w-40 rounded-full bg-[#C6A64B]/15 blur-3xl sm:-left-8 sm:h-56 sm:w-56"
            ></div>
            <div
              class="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
            >
              <picture>
                <source media="(max-width: 767px)" srcset="/estojo-frente.png" />
                <source media="(min-width: 1024px)" srcset="/estojo-vertical.png" />
                <img
                  src="/estojo.png"
                  alt="Estojo de alianças Felssner Representações"
                  class="h-[340px] w-full object-cover object-center sm:h-[430px] md:h-[560px] md:object-[50%_40%] lg:h-[620px]"
                />
              </picture>
            </div>
          </div>
        </div>
      </NContainer>
    </section>

    <section class="bg-white py-16 sm:py-20">
      <NContainer>
        <div class="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div class="rounded-2xl border border-[#ECE3D4] bg-[#FAF7F1] p-6 shadow-sm sm:p-8">
            <img src="/logo.webp" alt="Felssner Representações" class="h-auto w-36 sm:w-44" />
            <h2 class="mt-4 text-3xl [font-family:'Playfair_Display',serif] sm:text-4xl">
              Sobre a Felssner Representações
            </h2>
            <p class="mt-4 text-sm leading-relaxed text-[#4F4F4F] sm:text-base">
              A Felssner Representações atende lojistas, revendedoras e pessoa física com curadoria
              comercial, atendimento consultivo e operação prática para venda de alianças com
              excelente acabamento e fornecimento direto de fábrica.
            </p>
            <p class="mt-3 text-sm leading-relaxed text-[#4F4F4F] sm:text-base">
              Nosso foco é simplificar a montagem da linha de pronta entrega e garantir reposição
              eficiente para manter giro de estoque e margem saudável.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <article
              v-for="pillar in aboutPillars"
              :key="pillar.title"
              class="rounded-xl border border-[#E8DECC] bg-[#FFFEFC] p-5 shadow-sm"
            >
              <div
                class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#C6A64B]/30 bg-[#C6A64B]/10"
              >
                <NIcon :name="pillar.icon" class="h-5 w-5 text-[#A8842F]" />
              </div>
              <h3 class="mt-3 text-lg font-semibold">{{ pillar.title }}</h3>
              <p class="mt-2 text-sm text-[#5A5A5A]">{{ pillar.description }}</p>
            </article>
          </div>
        </div>
      </NContainer>
    </section>

    <section class="bg-[#F4F1EB] py-16 sm:py-20">
      <NContainer>
        <div class="mb-10 text-center">
          <p class="text-xs uppercase tracking-[1px] text-[#A8842F]">Escolha o kit ideal</p>
          <h2 class="mt-2 text-3xl [font-family:'Playfair_Display',serif] sm:text-4xl">
            Kits prontos para começar a vender
          </h2>
        </div>
        <div
          class="mb-8 flex flex-wrap items-center justify-center gap-2"
          role="tablist"
          aria-label="Filtrar kits por categoria"
        >
          <button
            v-for="tab in kitFilterTabs"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="activeKitFilter === tab.id"
            :tabindex="activeKitFilter === tab.id ? 0 : -1"
            :class="[
              'rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-[1px] transition sm:text-sm',
              activeKitFilter === tab.id
                ? 'border-[#A8842F] bg-[#C6A64B] text-[#2A2A2A] shadow-sm'
                : 'border-[#D8C8A5] bg-white text-[#6A5A3C] hover:border-[#C6A64B] hover:text-[#A8842F]',
            ]"
            @click="activeKitFilter = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="(kit, index) in filteredKits"
            :key="`${kit.code}-${kit.category}-${index}`"
            class="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <img :src="kit.image" :alt="kit.alt" class="h-64 w-full object-cover" />
            <div class="space-y-3 p-6">
              <p class="text-xs uppercase tracking-[1px] text-[#A8842F]">{{ kit.code }}</p>
              <h3 class="text-2xl [font-family:'Playfair_Display',serif]">{{ kit.line }}</h3>
              <div class="flex flex-wrap items-start gap-2">
                <p class="text-lg font-semibold text-[#2A2A2A]">
                  {{ formatCurrency(kit.unitPrice) }}
                  <span class="text-xs font-medium uppercase tracking-[1px] text-[#7A6A48]">
                    preço unitário
                  </span>
                </p>
                <span
                  v-if="kit.precoOuro18kReferencia && kit.precoOuro18kReferencia > kit.unitPrice"
                  class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                >
                  {{ Math.round(((kit.precoOuro18kReferencia - kit.unitPrice) / kit.precoOuro18kReferencia) * 100) }}% vs ouro 18k
                </span>
              </div>
              <p class="text-sm text-[#5A5A5A]">{{ kit.quickDescription }}</p>
              <p class="text-sm text-[#5A5A5A]">Numeração do kit: 14 ao 31 (18 alianças)</p>
              <div class="flex flex-wrap gap-1.5 text-[11px] font-medium">
                <span class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                  18+ peças → case grátis
                </span>
                <span class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
                  30+ peças → case + caixa
                </span>
              </div>
              <div class="flex flex-col gap-2 pt-1">
                <button type="button" :class="secondaryButtonClass" @click="openKitDetails(kit)">
                  Ver mais informações
                </button>
                <a
                  :href="conditionsLink"
                  target="_blank"
                  rel="noopener"
                  class="text-center text-xs font-semibold uppercase tracking-[1px] text-[#8B7A57] transition hover:text-[#A8842F]"
                >
                  Consultar valores no WhatsApp
                </a>
              </div>
            </div>
          </article>
        </div>
      </NContainer>
    </section>

    <NModal v-model="isKitDetailsOpen" :title="selectedKitModalTitle" size="lg">
      <div v-if="selectedKit" class="space-y-5">
        <div
          class="grid gap-4 rounded-xl border border-[#E7DBC8] bg-[#FCFAF6] p-4 md:grid-cols-[220px_1fr]"
        >
          <div class="space-y-2">
                <div class="overflow-hidden rounded-lg border border-[#E8DECC] bg-white">
                  <img
                    :src="selectedKit.image"
                    :alt="selectedKit.alt"
                    class="h-full w-full object-cover"
                  />
                </div>
                <!-- Miniaturas da galeria -->
                <div v-if="selectedKit.galleryUrls?.length" class="flex flex-wrap gap-1.5">
                  <img
                    v-for="(url, idx) in selectedKit.galleryUrls"
                    :key="idx"
                    :src="url"
                    :alt="`${selectedKit.alt} ${(idx as number) + 1}`"
                    class="h-14 w-14 cursor-pointer rounded border border-[#E8DECC] object-cover transition hover:border-[#C6A64B]"
                  />
                </div>
                <!-- Catálogo PDF -->
                <a
                  v-if="selectedKit.catalogPdfUrl"
                  :href="selectedKit.catalogPdfUrl"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8842F] underline hover:text-[#7A5E1A]"
                >
                  <NIcon name="mdi:file-pdf-box" class="h-4 w-4" />
                  Ver catálogo PDF
                </a>
              </div>
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[1px] text-[#A8842F]">{{ selectedKit.code }}</p>
            <h3 class="text-2xl [font-family:'Playfair_Display',serif] text-[#2A2A2A]">
              {{ selectedKit.line }}
            </h3>
            <p class="text-base font-semibold text-[#2A2A2A]">
              {{ formatCurrency(selectedKit.unitPrice) }} por unidade
            </p>
            <p class="text-sm text-[#4F4F4F]">{{ selectedKit.fullDescription }}</p>
            <p class="text-xs leading-relaxed text-[#6A6A6A]">
              <span class="font-medium text-[#4F4F4F]">Numeração:</span> aro
              {{ fixedRangeStart }} ao {{ fixedRangeEnd }} ({{ minimumKitQuantity }} peças)
              <span class="mx-1 text-[#B5A27B]">|</span>
              <span class="font-medium text-[#4F4F4F]">Altura x Largura:</span>
              {{ selectedKit.dimensions }}
              <span class="mx-1 text-[#B5A27B]">|</span>
              <span class="font-medium text-[#4F4F4F]">Peso:</span>
              {{ formatWeight(selectedKit.unitWeight) }}
              <span class="mx-1 text-[#B5A27B]">|</span>
              <span class="font-medium text-[#4F4F4F]">Case:</span>
              {{ selectedKit.caseDescription }}
              <span class="mx-1 text-[#B5A27B]">|</span>
              <span class="font-medium text-[#4F4F4F]">Caixa:</span>
              {{ selectedKit.caseSize }}
            </p>
            <!-- Comparação com Ouro 18k -->
            <div
              v-if="selectedKit.precoOuro18kReferencia && selectedKit.precoOuro18kReferencia > selectedKit.unitPrice"
              class="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2"
            >
              <p class="text-xs text-emerald-800">
                <span class="font-semibold">Custo {{ Math.round(((selectedKit.precoOuro18kReferencia - selectedKit.unitPrice) / selectedKit.precoOuro18kReferencia) * 100) }}% menor</span>
                que o equivalente em ouro 18k
                (ref.: {{ formatCurrency(selectedKit.precoOuro18kReferencia) }}/un.).
                Mesmo brilho, muito mais margem.
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-[#E6DCCB] bg-white p-4">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 class="text-base font-semibold text-[#2A2A2A]">
              Tabela de numeração (aro 10 ao 50)
            </h4>
            <p class="text-xs uppercase tracking-[1px] text-[#8B7A57]">
              Mínimo sugerido: 1 unidade do aro 14 ao 31
            </p>
          </div>
          <div class="overflow-hidden rounded-lg border border-[#EFE5D6] bg-[#FFFCF7]">
            <div class="overflow-x-auto p-2">
              <div class="grid grid-cols-[repeat(auto-fill,minmax(86px,1fr))] gap-1.5">
                <div
                  v-for="size in ringSizes"
                  :key="`size-cell-${size}`"
                  class="grid grid-cols-[18px_1fr_18px] items-center gap-1"
                >
                  <button
                    type="button"
                    class="inline-flex h-5 w-5 items-center justify-center rounded border border-[#DCCFB6] bg-white text-[#7A6A48] transition hover:border-[#C6A64B] hover:text-[#A8842F] disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="getRingQuantity(size) === 0"
                    :aria-label="`Diminuir aro ${size}`"
                    @click="decrementRingQuantity(size)"
                  >
                    <NIcon name="mdi:minus" class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    :class="[
                      'inline-flex h-9 w-full items-center justify-center rounded-md border px-1 text-center transition',
                      getRingQuantity(size) > 0
                        ? 'border-[#C6A64B] bg-[#FFF3D8] text-[#3D300F] shadow-sm'
                        : 'border-[#DDCFB3] bg-white text-[#6F6042] hover:border-[#C6A64B]',
                      getRingQuantity(size) > getDefaultRingQuantity(size)
                        ? 'ring-2 ring-[#C6A64B]/35'
                        : '',
                    ]"
                    @click="incrementRingQuantity(size)"
                  >
                    <span class="text-sm font-semibold leading-none">{{ size }}</span>
                    <sup
                      v-if="getRingQuantity(size) > 1"
                      class="ml-0.5 text-[11px] font-semibold leading-none text-[#7A5E20]"
                    >
                      x{{ getRingQuantity(size) }}
                    </sup>
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-5 w-5 items-center justify-center rounded border border-[#DCCFB6] bg-white text-[#7A6A48] transition hover:border-[#C6A64B] hover:text-[#A8842F]"
                    :aria-label="`Aumentar aro ${size}`"
                    @click="incrementRingQuantity(size)"
                  >
                    <NIcon name="mdi:plus" class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p class="mt-2 text-xs text-[#6E6E6E]">
            Use os botões − e + em cada aro para ajustar rapidamente.
          </p>
        </div>

        <div class="rounded-xl border border-[#E6DCCB] bg-white p-4">
          <h4 class="text-base font-semibold text-[#2A2A2A]">Frete aproximado (por CEP)</h4>
          <p class="mt-1 text-xs text-[#6E6E6E]">Origem: São José do Rio Preto - SP</p>
          <div class="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              v-model="shippingCep"
              type="text"
              inputmode="numeric"
              autocomplete="postal-code"
              maxlength="9"
              placeholder="Digite o CEP (00000-000)"
              class="w-full rounded-md border border-[#DCCFB8] px-3 py-2 text-sm text-[#2E2E2E] outline-none transition focus:border-[#C6A64B] focus:ring-2 focus:ring-[#C6A64B]/20 sm:max-w-[220px]"
            />
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-[#C6A64B] bg-[#C6A64B] px-4 py-2 text-xs font-semibold uppercase tracking-[1px] text-[#2A2A2A] transition hover:border-[#A8842F] hover:bg-[#A8842F] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="isShippingLoading"
              @click="calculateShipping"
            >
              {{ isShippingLoading ? 'Calculando...' : 'Calcular frete' }}
            </button>
          </div>
          <p v-if="shippingError" class="mt-2 text-xs text-red-600">{{ shippingError }}</p>
          <div
            v-if="shippingQuote"
            class="mt-3 rounded-lg border border-[#E8DECC] bg-[#FCFAF6] p-3 text-sm text-[#4A4A4A]"
          >
            <p>
              <span class="font-semibold text-[#2E2E2E]">Região:</span>
              {{ shippingQuote.region }}
            </p>
            <p>
              <span class="font-semibold text-[#2E2E2E]">Destino:</span>
              {{ shippingQuote.destination }}
            </p>
            <p>
              <span class="font-semibold text-[#2E2E2E]">Prazo estimado:</span>
              {{ shippingQuote.deadline }}
            </p>
            <p>
              <span class="font-semibold text-[#2E2E2E]">Frete estimado:</span>
              {{ formatCurrency(shippingQuote.value) }}
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-[#E6DCCB] bg-[#FCFAF6] p-4">
          <div class="grid gap-2 sm:grid-cols-2">
            <p class="text-sm text-[#4A4A4A]">
              <span class="font-semibold text-[#2E2E2E]">Mínimo sugerido:</span>
              {{ minimumKitQuantity }} unidades (1x do aro {{ fixedRangeStart }} ao
              {{ fixedRangeEnd }})
            </p>
            <p class="text-sm text-[#4A4A4A]">
              <span class="font-semibold text-[#2E2E2E]">Quantidade selecionada:</span>
              {{ totalSelectedUnits }} unidades
            </p>
            <p class="text-sm text-[#4A4A4A]">
              <span class="font-semibold text-[#2E2E2E]">Frete aproximado:</span>
              {{ shippingQuote ? formatCurrency(shippingQuote.value) : 'Calcular por CEP' }}
            </p>
            <p class="text-sm text-[#4A4A4A]">
              <span class="font-semibold text-[#2E2E2E]">Preço unitário:</span>
              {{ formatCurrency(selectedKit.unitPrice) }}
            </p>
            <p class="text-sm text-[#4A4A4A]">
              <span class="font-semibold text-[#2E2E2E]">Subtotal dos itens:</span>
              {{ formatCurrency(kitSubtotalValue) }}
            </p>
          </div>
          <p class="mt-2 text-xs text-[#6E6E6E]">Seleção atual: {{ selectedRingsSummary }}</p>
          <div
            :class="[
              'mt-2 rounded-lg border p-3',
              hasStorageBonus
                ? 'border-amber-200 bg-amber-50/80'
                : hasCaseBonus
                  ? 'border-emerald-200 bg-emerald-50/80'
                  : 'border-amber-200 bg-amber-50/40',
            ]"
          >
            <!-- Nível 1: case (18+ peças) -->
            <div class="flex items-center gap-3 pb-2">
              <div
                :class="[
                  'h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-white',
                  hasCaseBonus ? 'border-emerald-200' : 'border-amber-200',
                ]"
              >
                <img
                  src="/estojo-fechado.png"
                  alt="Case de alianças"
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#7A6A48]">
                  Bônus 1 — Case de Mostruário
                </p>
                <p
                  :class="[
                    'text-sm font-semibold',
                    hasCaseBonus ? 'text-emerald-700' : 'text-amber-700',
                  ]"
                >
                  {{
                    hasCaseBonus
                      ? 'Conquistado! Case mostruário incluído.'
                      : `Faltam ${piecesToCaseBonus} peça(s) (mín. ${caseBonusMinimumQuantity} un.)`
                  }}
                </p>
              </div>
              <NIcon
                :name="hasCaseBonus ? 'mdi:check-circle' : 'mdi:gift-outline'"
                :class="['h-5 w-5 shrink-0', hasCaseBonus ? 'text-emerald-600' : 'text-amber-500']"
              />
            </div>
            <!-- Nível 2: caixa de estoque (30+ peças) -->
            <div class="flex items-center gap-3 border-t border-[#E8DECC]/60 pt-2">
              <div
                :class="[
                  'h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-white',
                  hasStorageBonus ? 'border-amber-300' : 'border-gray-200',
                ]"
              >
                <img
                  src="/estojo-fechado.png"
                  alt="Caixa de estoque"
                  class="h-full w-full object-cover opacity-70"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#7A6A48]">
                  Bônus 2 — Caixa de Estoque
                </p>
                <p
                  :class="[
                    'text-sm font-semibold',
                    hasStorageBonus ? 'text-amber-700' : 'text-gray-400',
                  ]"
                >
                  {{
                    hasStorageBonus
                      ? 'Conquistado! Caixa de estoque incluída.'
                      : `Faltam ${piecesToStorageBonus} peça(s) para a caixa de estoque (mín. ${storageBonusMinimumQuantity} un.)`
                  }}
                </p>
              </div>
              <NIcon
                :name="hasStorageBonus ? 'mdi:check-circle' : 'mdi:package-variant-closed'"
                :class="['h-5 w-5 shrink-0', hasStorageBonus ? 'text-amber-600' : 'text-gray-300']"
              />
            </div>
          </div>
          <p class="mt-2 text-sm font-semibold text-[#2E2E2E]">
            Total estimado com frete: {{ formatCurrency(totalWithShipping) }}
          </p>
          <p class="mt-2 text-[11px] text-[#7A7A7A]">{{ selectedKit.note }}</p>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-[#D7C49E] px-5 py-2 text-xs font-semibold uppercase tracking-[1px] text-[#6B5A38] transition hover:border-[#C6A64B] hover:text-[#A8842F]"
          @click="isKitDetailsOpen = false"
        >
          Fechar
        </button>
        <a :href="requestOrderLink" target="_blank" rel="noopener" :class="primaryButtonClass">
          Solicitar pedido no WhatsApp
        </a>
      </template>
    </NModal>

    <!-- Seção: Linha do tempo comercial -->
    <section class="bg-[#2A2A2A] py-14 text-[#F8F6F2] sm:py-16">
      <NContainer>
        <div class="mx-auto max-w-3xl text-center">
          <p class="text-xs uppercase tracking-[1px] text-[#C6A64B]">Sem barreira de entrada</p>
          <h2 class="mt-2 text-3xl [font-family:'Playfair_Display',serif] sm:text-4xl">
            Faz o pedido hoje,<br />começa a pagar depois de receber
          </h2>
          <p class="mt-3 text-sm text-[#F8F6F2]/75 sm:text-base">
            Sujeito a aprovação cadastral. Condições para boleto à vista ou parcelado.
          </p>
        </div>

        <div class="mt-10 grid gap-0 md:grid-cols-4">
          <!-- Step 1 -->
          <div class="relative flex flex-col items-center text-center">
            <div class="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C6A64B] bg-[#C6A64B] text-[#2A2A2A]">
              <NIcon name="mdi:cart-outline" class="h-6 w-6" />
            </div>
            <div class="absolute top-6 left-1/2 hidden h-0.5 w-full bg-[#C6A64B]/30 md:block" aria-hidden="true" />
            <div class="mt-4 px-4">
              <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#C6A64B]">Dia 0</p>
              <p class="mt-1 text-base font-semibold">Faz o pedido</p>
              <p class="mt-1 text-xs text-[#F8F6F2]/60">Escolhe o kit, confirma pelo WhatsApp e aguarda confirmação.</p>
            </div>
          </div>
          <!-- Step 2 -->
          <div class="relative flex flex-col items-center text-center">
            <div class="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C6A64B] bg-[#3A3A3A] text-[#C6A64B]">
              <NIcon name="mdi:cog-sync-outline" class="h-6 w-6" />
            </div>
            <div class="absolute top-6 left-1/2 hidden h-0.5 w-full bg-[#C6A64B]/30 md:block" aria-hidden="true" />
            <div class="mt-4 px-4">
              <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#C6A64B]">Até ~15 dias</p>
              <p class="mt-1 text-base font-semibold">Produção e envio</p>
              <p class="mt-1 text-xs text-[#F8F6F2]/60">Produção média de 15 dias corridos + frete pelos Correios (Sedex).</p>
            </div>
          </div>
          <!-- Step 3 -->
          <div class="relative flex flex-col items-center text-center">
            <div class="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C6A64B] bg-[#3A3A3A] text-[#C6A64B]">
              <NIcon name="mdi:package-variant" class="h-6 w-6" />
            </div>
            <div class="absolute top-6 left-1/2 hidden h-0.5 w-full bg-[#C6A64B]/30 md:block" aria-hidden="true" />
            <div class="mt-4 px-4">
              <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#C6A64B]">~20 dias</p>
              <p class="mt-1 text-base font-semibold">Recebe o kit</p>
              <p class="mt-1 text-xs text-[#F8F6F2]/60">Kit completo na sua porta, pronto para colocar no balcão e vender.</p>
            </div>
          </div>
          <!-- Step 4 -->
          <div class="relative flex flex-col items-center text-center">
            <div class="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C6A64B] bg-[#3A3A3A] text-[#C6A64B]">
              <NIcon name="mdi:cash-multiple" class="h-6 w-6" />
            </div>
            <div class="mt-4 px-4">
              <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#C6A64B]">~30 dias</p>
              <p class="mt-1 text-base font-semibold">Começa a pagar</p>
              <p class="mt-1 text-xs text-[#F8F6F2]/60">1ª parcela ~10 dias após o recebimento. Boleto sem juros.</p>
            </div>
          </div>
        </div>

        <!-- Destaque condições de pagamento -->
        <div class="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#C6A64B]/30 bg-[#3A3A3A] p-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-[#C6A64B]/20 bg-[#2A2A2A] p-4 text-center">
              <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#C6A64B]">Boleto parcelado</p>
              <p class="mt-2 text-2xl font-bold text-[#F8F6F2]">4x</p>
              <p class="mt-1 text-sm text-[#F8F6F2]/70">Parcelas nos dias 30 · 60 · 90 · 120</p>
              <p class="mt-1 text-xs text-[#F8F6F2]/45">Sem juros · sujeito a aprovação</p>
            </div>
            <div class="rounded-xl border border-[#C6A64B]/20 bg-[#2A2A2A] p-4 text-center">
              <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#C6A64B]">Boleto à vista</p>
              <p class="mt-2 text-2xl font-bold text-[#F8F6F2]">30d</p>
              <p class="mt-1 text-sm text-[#F8F6F2]/70">Vencimento único após recebimento</p>
              <p class="mt-1 text-xs text-[#F8F6F2]/45">Sem juros · sujeito a aprovação</p>
            </div>
          </div>
          <p class="mt-4 text-center text-xs text-[#F8F6F2]/40">
            Condições sujeitas a aprovação cadastral. Cartão de crédito em implantação. Mínimo R$ 500 para parcelamento em boleto.
          </p>
        </div>

        <div class="mt-8 text-center">
          <a :href="firstKitLink" target="_blank" rel="noopener" :class="primaryButtonClass">
            Quero Montar Meu Primeiro Kit
          </a>
          <p class="mt-2 text-xs text-[#F8F6F2]/50">Resposta rápida no horário comercial</p>
        </div>
      </NContainer>
    </section>

    <section class="bg-white py-16 sm:py-20">
      <NContainer>
        <div class="mx-auto max-w-4xl text-center">
          <p class="text-xs uppercase tracking-[1px] text-[#A8842F]">Como funciona</p>
          <h2 class="mt-2 text-3xl [font-family:'Playfair_Display',serif] sm:text-4xl">
            Modelo simples para vender com segurança
          </h2>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-3">
          <article
            v-for="step in steps"
            :key="step.title"
            class="rounded-xl border border-[#E9E4DD] bg-[#FFFEFC] p-6 text-center shadow-sm"
          >
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#C6A64B]/40 bg-[#C6A64B]/10"
            >
              <NIcon :name="step.icon" class="h-6 w-6 text-[#A8842F]" />
            </div>
            <h3 class="mt-4 text-lg font-semibold">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-[#5A5A5A]">{{ step.description }}</p>
          </article>
        </div>

        <div class="mt-10 text-center">
          <a :href="firstKitLink" target="_blank" rel="noopener" :class="primaryButtonClass">
            Quero Montar Meu Primeiro Kit
          </a>
          <p class="mt-2 text-xs text-[#6A6A6A]">Resposta rápida no horário comercial</p>
        </div>
      </NContainer>
    </section>

    <section class="bg-[#2E2E2E] py-16 text-[#F8F6F2] sm:py-20">
      <NContainer>
        <div class="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[1px] text-[#C6A64B]">Diferencial técnico</p>
            <h2 class="mt-2 text-3xl [font-family:'Playfair_Display',serif] sm:text-4xl">
              Tecnologia Envelopada Vi&Va
            </h2>
            <p class="mt-4 text-sm leading-relaxed text-[#F8F6F2]/90 sm:text-base">
              Nossas alianças são envelopadas: uma camada de ouro é soldada ao aro de aço ou prata
              925, garantindo acabamento superior ao banho comum. Todos os modelos acompanham
              certificado e garantia da fabricante.
            </p>
          </div>

          <div class="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img
              src="/aco-e-ouro/AEX0113.png"
              alt="Detalhe técnico de aliança envelopada"
              class="h-72 w-full object-cover sm:h-96"
            />
          </div>
        </div>
      </NContainer>
    </section>

    <!-- Seção: Por que não Ouro 18k? -->
    <section class="bg-[#FAF7F1] py-16 sm:py-20">
      <NContainer>
        <div class="mx-auto max-w-4xl">
          <div class="text-center">
            <p class="text-xs uppercase tracking-[1px] text-[#A8842F]">Vantagem competitiva</p>
            <h2 class="mt-2 text-3xl [font-family:'Playfair_Display',serif] sm:text-4xl">
              Por que envelopado e não ouro 18k?
            </h2>
            <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#5A5A5A] sm:text-base">
              O cliente final ganha o mesmo brilho e acabamento premium — você ganha a diferença como margem.
            </p>
          </div>
          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <div class="rounded-xl border border-[#E8DECC] bg-white p-5 text-center shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#A8842F]">Preço de custo típico</p>
              <p class="mt-2 text-3xl font-bold text-[#2A2A2A]">~5–10×</p>
              <p class="mt-1 text-sm text-[#5A5A5A]">Ouro 18k custa de 5 a 10× mais que o equivalente envelopado de mesma largura.</p>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-center shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[1px] text-emerald-700">Capital imobilizado</p>
              <p class="mt-2 text-3xl font-bold text-emerald-800">Muito menos</p>
              <p class="mt-1 text-sm text-emerald-700">Estoque maior, mais numerações disponíveis, com o mesmo orçamento.</p>
            </div>
            <div class="rounded-xl border border-[#E8DECC] bg-white p-5 text-center shadow-sm">
              <p class="text-[11px] font-semibold uppercase tracking-[1px] text-[#A8842F]">Margem para o lojista</p>
              <p class="mt-2 text-3xl font-bold text-[#2A2A2A]">+alta</p>
              <p class="mt-1 text-sm text-[#5A5A5A]">Ticket de venda competitivo e margem mais atrativa — ideal para revendas e joalherias.</p>
            </div>
          </div>
          <p class="mt-5 text-center text-xs text-[#8A8A8A]">
            * Comparativo de referência com alianças de ouro 18k de mesma largura. Valores reais variam. Consulte nosso atendimento.
          </p>
        </div>
      </NContainer>
    </section>

    <section class="bg-[#F4F1EB] py-16 sm:py-20">
      <NContainer>
        <div class="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p class="text-xs uppercase tracking-[1px] text-[#A8842F]">Condições</p>
            <h2 class="mt-2 text-3xl [font-family:'Playfair_Display',serif] sm:text-4xl">
              Condições comerciais objetivas
            </h2>
            <ul class="mt-6 space-y-3">
              <li
                v-for="condition in conditions"
                :key="condition"
                class="flex items-start gap-2 text-sm text-[#3D3D3D] sm:text-base"
              >
                <NIcon name="mdi:check-decagram" class="mt-0.5 h-5 w-5 shrink-0 text-[#A8842F]" />
                {{ condition }}
              </li>
            </ul>
          </div>

          <div class="rounded-2xl border border-[#E5DCCB] bg-white p-6 shadow-sm">
            <h3 class="text-xl [font-family:'Playfair_Display',serif]">
              Atualização rápida por WhatsApp
            </h3>
            <p class="mt-2 text-sm text-[#5A5A5A]">
              Receba a tabela atualizada, disponibilidade e orientação para montar seu kit inicial.
            </p>
            <a
              :href="conditionsLink"
              target="_blank"
              rel="noopener"
              :class="`${primaryButtonClass} mt-5 w-full`"
            >
              Receber Tabela Atualizada
            </a>
            <p class="mt-2 text-center text-xs text-[#6A6A6A]">
              Resposta rápida no horário comercial
            </p>
          </div>
        </div>
      </NContainer>
    </section>

    <section class="bg-[#EFE8DC] py-16 sm:py-20">
      <NContainer>
        <div class="mx-auto max-w-4xl text-center">
          <p class="text-xs uppercase tracking-[1px] text-[#A8842F]">Linhas sob consulta</p>
          <h2 class="mt-2 text-3xl [font-family:'Playfair_Display',serif] sm:text-4xl">
            Amplie sua vitrine com itens especiais
          </h2>
        </div>

        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="line in consultationLines"
            :key="line"
            class="rounded-xl border border-[#E2D8C5] bg-white p-5 text-center shadow-sm"
          >
            <p class="text-base font-semibold">{{ line }}</p>
          </article>
        </div>

        <div class="mt-8 text-center">
          <a :href="catalogLink" target="_blank" rel="noopener" :class="primaryButtonClass">
            Pedir Catálogo Completo
          </a>
          <p class="mt-2 text-xs text-[#6A6A6A]">Resposta rápida no horário comercial</p>
        </div>
      </NContainer>
    </section>

    <section class="bg-white py-16 sm:py-20">
      <NContainer>
        <div class="mx-auto max-w-3xl text-center">
          <p class="text-xs uppercase tracking-[1px] text-[#A8842F]">FAQ</p>
          <h2 class="mt-2 text-3xl [font-family:'Playfair_Display',serif] sm:text-4xl">
            Dúvidas frequentes
          </h2>
        </div>

        <div class="mx-auto mt-8 max-w-3xl space-y-3">
          <article
            v-for="(faq, index) in faqs"
            :key="faq.question"
            class="overflow-hidden rounded-xl border border-[#E9E1D0] bg-[#FFFEFC]"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              @click="toggleFaq(index)"
            >
              <span class="text-sm font-semibold sm:text-base">{{ faq.question }}</span>
              <NIcon
                :name="activeFaqIndex === index ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                class="h-5 w-5 text-[#A8842F]"
              />
            </button>

            <Transition name="slide-down">
              <div v-if="activeFaqIndex === index" class="border-t border-[#EFE7D8] px-5 py-4">
                <p class="text-sm leading-relaxed text-[#5A5A5A] sm:text-base">{{ faq.answer }}</p>
              </div>
            </Transition>
          </article>
        </div>
      </NContainer>
    </section>

    <section class="bg-[#2E2E2E] py-16 text-[#F8F6F2] sm:py-20">
      <NContainer>
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="text-3xl [font-family:'Playfair_Display',serif] sm:text-5xl">
            Vamos Montar Sua Linha de Pronta Entrega?
          </h2>
          <p class="mt-4 text-sm text-[#F8F6F2]/85 sm:text-base">
            A Felssner Representações atende todo o Brasil com operação comercial prática via
            WhatsApp.
          </p>
          <a
            :href="catalogLink"
            target="_blank"
            rel="noopener"
            :class="`${primaryButtonClass} mt-6`"
          >
            Receber Catálogo no WhatsApp
          </a>
          <p class="mt-2 text-xs text-[#F8F6F2]/75">Resposta rápida no horário comercial</p>
        </div>
      </NContainer>
    </section>

    <footer class="bg-[#262626] py-10 text-[#F8F6F2]">
      <NContainer>
        <div class="grid gap-6 text-sm md:grid-cols-2">
          <div>
            <p class="[font-family:'Playfair_Display',serif] text-xl">
              Felssner Representações – Linha Vi&Va
            </p>
            <p class="mt-2 text-[#F8F6F2]/80">Envio para todo o Brasil</p>
            <a
              href="https://felssner.com.br"
              target="_blank"
              rel="noopener"
              class="mt-2 block text-[#F8F6F2]/85 hover:text-[#C6A64B]"
            >
              felssner.com.br
            </a>
          </div>
          <div class="space-y-2 md:text-right">
            <a
              :href="catalogLink"
              target="_blank"
              rel="noopener"
              class="block text-[#F8F6F2]/85 hover:text-[#C6A64B]"
            >
              WhatsApp: (47) 98802-5140
            </a>
            <a
              href="https://instagram.com/felssnerrepresentacoes"
              target="_blank"
              rel="noopener"
              class="block text-[#F8F6F2]/85 hover:text-[#C6A64B]"
            >
              @felssnerrepresentacoes
            </a>
          </div>
        </div>
      </NContainer>
    </footer>

    <a
      :href="catalogLink"
      target="_blank"
      rel="noopener"
      class="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-[#C6A64B] px-5 py-3 text-xs font-semibold uppercase tracking-[1px] text-[#2A2A2A] shadow-xl transition hover:bg-[#A8842F] hover:text-white"
      aria-label="Abrir WhatsApp"
    >
      <NIcon name="mdi:whatsapp" class="h-5 w-5" />
      WhatsApp
    </a>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { ProdutoDtoSchema } from '~/types/schemas'

definePageMeta({
  layout: false,
})

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap',
    },
    {
      rel: 'canonical',
      href: 'https://felssner.com.br',
    },
  ],
})

useSeoMeta({
  title: 'Felssner Representações | Linha Vi&Va Alianças',
  description:
    'Felssner Representações: kits de alianças Vi&Va em Aço + Ouro e Prata + Ouro, envio para todo o Brasil e atendimento rápido via WhatsApp.',
})

const whatsappNumber = '5547988025140'
const whatsappBase = `https://wa.me/${whatsappNumber}`

const catalogLink = `${whatsappBase}?text=${encodeURIComponent('Olá! Quero receber o catálogo da linha Vi&Va Alianças.')}`
const serviceLink = `${whatsappBase}?text=${encodeURIComponent('Olá! Quero falar com o atendimento da Felssner Representações.')}`
const firstKitLink = `${whatsappBase}?text=${encodeURIComponent('Olá! Quero montar meu primeiro kit Vi&Va.')}`
const conditionsLink = `${whatsappBase}?text=${encodeURIComponent('Olá! Quero receber a tabela atualizada e condições comerciais.')}`

const primaryButtonClass =
  'inline-flex w-full items-center justify-center rounded-md border border-[#C6A64B] bg-[#C6A64B] px-6 py-3 text-xs font-semibold uppercase tracking-[1px] text-[#2A2A2A] shadow-md transition hover:border-[#A8842F] hover:bg-[#A8842F] hover:text-white sm:w-auto'

const outlineButtonClass =
  'inline-flex w-full items-center justify-center rounded-md border border-[#C6A64B] px-6 py-3 text-xs font-semibold uppercase tracking-[1px] text-[#F8F6F2] transition hover:bg-[#C6A64B] hover:text-[#2A2A2A] sm:w-auto'

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-md border border-[#C6A64B] px-5 py-2 text-xs font-semibold uppercase tracking-[1px] text-[#A8842F] transition hover:bg-[#C6A64B] hover:text-[#2A2A2A]'

const aboutPillars = [
  {
    title: 'Atendimento consultivo',
    description: 'Suporte próximo para montar o mix certo de produtos para o seu perfil de venda.',
    icon: 'mdi:account-tie-outline',
  },
  {
    title: 'Operação prática',
    description: 'Modelo de kit inicial + reposição para reduzir capital parado e manter giro.',
    icon: 'mdi:cog-outline',
  },
  {
    title: 'Logística nacional',
    description: 'Envio para todo o Brasil com acompanhamento e comunicação direta via WhatsApp.',
    icon: 'mdi:truck-delivery-outline',
  },
  {
    title: 'Direto de fábrica',
    description:
      'Parceria com fabricante para garantir padrão técnico e abastecimento consistente.',
    icon: 'mdi:diamond',
  },
]

type KitCategory = 'steel-and-gold' | 'silver-and-gold' | 'gold-10k' | 'gold-18k'

type Kit = {
  code: string
  line: string
  image: string
  alt: string
  category: KitCategory
  quickDescription: string
  fullDescription: string
  dimensions: string
  unitWeight: number
  unitPrice: number
  caseDescription: string
  caseSize: string
  note: string
  /** Preço do equivalente em ouro 18k para comparação (vindo do DB) */
  precoOuro18kReferencia?: number
  /** Imagens da galeria (vindas do DB) */
  galleryUrls?: string[]
  /** Link do catálogo PDF (vindo do DB) */
  catalogPdfUrl?: string
}

type KitConfig = {
  code: string
  line: string
  image: string
  alt: string
  category: KitCategory
  quickDescription: string
  fullDescription: string
  dimensions: string
  unitWeight: number
  unitPrice: number
  caseDescription?: string
  caseSize?: string
}

function createKit(config: KitConfig): Kit {
  const caseDescription =
    config.caseDescription ??
    'Case organizadora com 18 nichos para exposição e transporte das alianças.'
  const caseSize = config.caseSize ?? 'Aproximadamente 30 cm x 22 cm x 8 cm.'

  return {
    code: config.code,
    line: config.line,
    image: config.image,
    alt: config.alt,
    category: config.category,
    quickDescription: config.quickDescription,
    fullDescription: config.fullDescription,
    dimensions: config.dimensions,
    unitWeight: config.unitWeight,
    unitPrice: config.unitPrice,
    caseDescription,
    caseSize,
    note: 'Valores unitários e peso podem variar levemente conforme acabamento, aro e personalização.',
  }
}

const kits: Kit[] = [
  createKit({
    code: 'AEX0100',
    line: 'Kit Aço + Ouro 4,3mm',
    image: '/aco-e-ouro/AEX0100.png',
    alt: 'Kit AEX0100 aliança 4,3mm aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    fullDescription: 'Aliança 4,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensions: '2,00 mm x 4,30 mm',
    unitWeight: 2.42,
    unitPrice: 340,
  }),
  createKit({
    code: 'AEX0101',
    line: 'Kit Aço + Ouro 5,3mm',
    image: '/aco-e-ouro/AEX0101.png',
    alt: 'Kit AEX0101 aliança 5,3mm aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    fullDescription: 'Aliança 5,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensions: '2,00 mm x 5,30 mm',
    unitWeight: 2.35,
    unitPrice: 390,
  }),
  createKit({
    code: 'AEX0102',
    line: 'Kit Aço + Ouro 6,3mm',
    image: '/aco-e-ouro/AEX0102.png',
    alt: 'Kit AEX0102 aliança 6,3mm aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    fullDescription: 'Aliança 6,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensions: '2,00 mm x 6,30 mm',
    unitWeight: 2.84,
    unitPrice: 450,
  }),
  createKit({
    code: 'AEX0105',
    line: 'Kit Aço + Ouro 7,3mm',
    image: '/aco-e-ouro/AEX0105.png',
    alt: 'Kit AEX0105 aliança 7,3mm aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    fullDescription: 'Aliança 7,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensions: '2,00 mm x 7,30 mm',
    unitWeight: 3.19,
    unitPrice: 510,
  }),
  createKit({
    code: 'AEX0112',
    line: 'Kit Aço + Ouro 5,3mm Chanfrada',
    image: '/aco-e-ouro/AEX0112.png',
    alt: 'Kit AEX0112 aliança 5,3mm chanfrada aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial reta chanfrada (desquinada) anatômica em aço e ouro 416 (10k).',
    fullDescription:
      'Aliança 5,3mm, envelopada aço e ouro 416 (10k) chanfrada (desquinada) anatômica.',
    dimensions: '2,00 mm x 5,30 mm',
    unitWeight: 2.35,
    unitPrice: 390,
  }),
  createKit({
    code: 'AEX0113',
    line: 'Kit Aço + Ouro 3,3mm',
    image: '/aco-e-ouro/AEX0113.png',
    alt: 'Kit AEX0113 aliança 3,3mm aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial abaulada anatômica em aço e ouro 416 (10k).',
    fullDescription: 'Aliança 3,3mm, envelopada aço e ouro 416 (10k) abaulada anatômica.',
    dimensions: '1,90 mm x 3,30 mm',
    unitWeight: 1.54,
    unitPrice: 310,
  }),
  createKit({
    code: 'AEX0114',
    line: 'Kit Aço + Ouro 6mm Reta',
    image: '/aco-e-ouro/AEX0114.png',
    alt: 'Kit AEX0114 aliança 6mm reta aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial reta anatômica em aço e ouro 416 (10k).',
    fullDescription: 'Aliança 6mm, envelopada aço e ouro 416 (10k) reta anatômica.',
    dimensions: '1,90 mm x 6,00 mm',
    unitWeight: 2.84,
    unitPrice: 450,
  }),
  createKit({
    code: 'AEX0117',
    line: 'Kit Aço + Ouro 4mm Reta',
    image: '/aco-e-ouro/AEX0117.png',
    alt: 'Kit AEX0117 aliança 4mm reta aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial reta anatômica em aço e ouro 416 (10k).',
    fullDescription: 'Aliança 4mm, envelopada aço e ouro 416 (10k) reta anatômica.',
    dimensions: '2,00 mm x 4,00 mm',
    unitWeight: 1.76,
    unitPrice: 340,
  }),
  createKit({
    code: 'AEX0213',
    line: 'Kit Aço + Ouro 3mm Reta',
    image: '/aco-e-ouro/AEX0213.png',
    alt: 'Kit AEX0213 aliança 3mm reta aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial reta anatômica em aço e ouro 416 (10k).',
    fullDescription: 'Aliança 3mm, envelopada aço e ouro 416 (10k) reta anatômica.',
    dimensions: '1,90 mm x 3,00 mm',
    unitWeight: 2.24,
    unitPrice: 310,
  }),
  createKit({
    code: 'AEX0214',
    line: 'Kit Aço + Ouro 4mm Friso Central',
    image: '/aco-e-ouro/AEX0214.png',
    alt: 'Kit AEX0214 aliança 4mm com friso central aço e ouro',
    category: 'steel-and-gold',
    quickDescription: 'Especial reta anatômica com friso central em aço e ouro 416 (10k).',
    fullDescription: 'Aliança 4mm, envelopada aço e ouro 416 (10k) com friso central anatômica.',
    dimensions: '2,00 mm x 4,00 mm',
    unitWeight: 2.34,
    unitPrice: 362,
  }),
]

const kitFilterTabs = [
  { id: 'all', label: 'Todos os Kits' },
  { id: 'steel-and-gold', label: 'Aço e Ouro' },
] as const

type KitFilter = (typeof kitFilterTabs)[number]['id']

const activeKitFilter = ref<KitFilter>('all')

// Fetch DB products to enrich hardcoded kit data (thumbnail, gallery, PDF, 18k ref price)
const ProdutosResponseSchema = z.object({ success: z.boolean(), data: z.array(ProdutoDtoSchema) })
const { data: dbProducts } = await useFetch('/api/v1/produtos', {
  transform: (res: unknown) => ProdutosResponseSchema.parse(res).data,
})

/** Merge hardcoded kits with DB data where codes match */
const enrichedKits = computed<Kit[]>(() => {
  return kits.map((kit) => {
  const db = dbProducts.value?.find((p: { codigo: string }) => p.codigo === kit.code)
    if (!db) return kit
    return {
      ...kit,
      image: db.thumbnailUrl || kit.image,
      alt: db.imagemAlt || kit.alt,
      quickDescription: db.descricaoRapida || kit.quickDescription,
      fullDescription: db.descricaoCompleta || kit.fullDescription,
      dimensions: db.dimensoes || kit.dimensions,
      unitWeight: db.pesoUnitario ?? kit.unitWeight,
      unitPrice: db.valor ?? kit.unitPrice,
      note: db.nota || kit.note,
      precoOuro18kReferencia: db.precoOuro18kReferencia,
      galleryUrls: db.galleryUrls?.length ? db.galleryUrls : undefined,
      catalogPdfUrl: db.catalogPdfUrl,
    }
  })
})

const filteredKits = computed(() => {
  const source = enrichedKits.value
  if (activeKitFilter.value === 'all') {
    return source
  }
  return source.filter((kit: Kit) => kit.category === activeKitFilter.value)
})

const isKitDetailsOpen = ref(false)
const selectedKit = ref<Kit | null>(null)

const ringSizeStart = 10
const ringSizeEnd = 50
const fixedRangeStart = 14
const fixedRangeEnd = 31
const minimumKitQuantity = fixedRangeEnd - fixedRangeStart + 1

const ringSizes = Array.from(
  { length: ringSizeEnd - ringSizeStart + 1 },
  (_, index) => ringSizeStart + index
)
const caseBonusMinimumQuantity = 18
/** 30+ peças ganham caixa de estoque adicional além do case de mostruário */
const storageBonusMinimumQuantity = 30

function getDefaultRingQuantity(size: number) {
  return size >= fixedRangeStart && size <= fixedRangeEnd ? 1 : 0
}

function createDefaultRingQuantities() {
  return ringSizes.reduce<Record<number, number>>((accumulator, size) => {
    accumulator[size] = getDefaultRingQuantity(size)
    return accumulator
  }, {})
}

const ringQuantities = ref<Record<number, number>>(createDefaultRingQuantities())

function sanitizeRingQuantity(value: number | string) {
  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 0
  }

  return Math.floor(parsedValue)
}

function getRingQuantity(size: number) {
  return ringQuantities.value[size] ?? 0
}

function setRingQuantity(size: number, value: number | string) {
  ringQuantities.value[size] = sanitizeRingQuantity(value)
}

function incrementRingQuantity(size: number) {
  setRingQuantity(size, getRingQuantity(size) + 1)
}

function decrementRingQuantity(size: number) {
  setRingQuantity(size, Math.max(getRingQuantity(size) - 1, 0))
}

const totalSelectedUnits = computed(() => {
  return ringSizes.reduce((accumulator, size) => accumulator + getRingQuantity(size), 0)
})

const hasCaseBonus = computed(() => totalSelectedUnits.value >= caseBonusMinimumQuantity)
const hasStorageBonus = computed(() => totalSelectedUnits.value >= storageBonusMinimumQuantity)

const piecesToCaseBonus = computed(() => {
  return Math.max(caseBonusMinimumQuantity - totalSelectedUnits.value, 0)
})

const piecesToStorageBonus = computed(() => {
  return Math.max(storageBonusMinimumQuantity - totalSelectedUnits.value, 0)
})

const selectedRingsSummary = computed(() => {
  const selectedSizes = ringSizes
    .map((size) => {
      return {
        size,
        quantity: getRingQuantity(size),
      }
    })
    .filter((item) => item.quantity > 0)
    .map((item) => `${item.size} (${item.quantity}x)`)

  if (!selectedSizes.length) {
    return 'Nenhum aro selecionado'
  }

  return selectedSizes.join(', ')
})

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatWeight(value: number) {
  return `${value.toFixed(2).replace('.', ',')} g`
}

const kitSubtotalValue = computed(() => {
  if (!selectedKit.value) {
    return 0
  }

  return selectedKit.value.unitPrice * totalSelectedUnits.value
})

type ShippingQuote = {
  destination: string
  region: string
  deadline: string
  value: number
}

const shippingCepRaw = ref('')
const isShippingLoading = ref(false)
const shippingError = ref('')
const shippingQuote = ref<ShippingQuote | null>(null)

const ViaCepSchema = z.object({
  cep: z.string().optional(),
  localidade: z.string().optional(),
  uf: z.string().optional(),
  erro: z.boolean().optional(),
})

function normalizeCep(value: string) {
  return value.replace(/\D/g, '').slice(0, 8)
}

function formatCepMask(value: string) {
  const normalized = normalizeCep(value)
  if (normalized.length <= 5) {
    return normalized
  }

  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`
}

const shippingCep = computed({
  get: () => shippingCepRaw.value,
  set: (value: string) => {
    shippingCepRaw.value = formatCepMask(value)
  },
})

function getShippingRuleByUf(uf: string) {
  const ufUpper = uf.toUpperCase()

  if (ufUpper === 'SP') {
    return {
      region: 'Sudeste',
      base: 22,
      deadline: '2 a 4 dias úteis',
    }
  }

  if (['RJ', 'MG', 'ES'].includes(ufUpper)) {
    return {
      region: 'Sudeste',
      base: 28,
      deadline: '3 a 5 dias úteis',
    }
  }

  if (['PR', 'SC', 'RS'].includes(ufUpper)) {
    return {
      region: 'Sul',
      base: 34,
      deadline: '4 a 6 dias úteis',
    }
  }

  if (['DF', 'GO', 'MT', 'MS'].includes(ufUpper)) {
    return {
      region: 'Centro-Oeste',
      base: 39,
      deadline: '4 a 7 dias úteis',
    }
  }

  if (['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'].includes(ufUpper)) {
    return {
      region: 'Nordeste',
      base: 48,
      deadline: '6 a 10 dias úteis',
    }
  }

  return {
    region: 'Norte',
    base: 56,
    deadline: '7 a 12 dias úteis',
  }
}

async function calculateShipping() {
  shippingError.value = ''
  shippingQuote.value = null

  if (!selectedKit.value) {
    shippingError.value = 'Selecione um kit para calcular o frete.'
    return
  }

  const normalizedCep = normalizeCep(shippingCepRaw.value)
  if (normalizedCep.length !== 8) {
    shippingError.value = 'Informe um CEP válido com 8 dígitos.'
    return
  }

  isShippingLoading.value = true

  try {
    const response = await $fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`)
    const parsedResponse = ViaCepSchema.safeParse(response)

    if (!parsedResponse.success || parsedResponse.data.erro || !parsedResponse.data.uf) {
      shippingError.value = 'CEP não encontrado. Verifique o número informado.'
      return
    }

    const shippingRule = getShippingRuleByUf(parsedResponse.data.uf)
    const variableFee = kitSubtotalValue.value * 0.004
    const calculatedValue = Number((shippingRule.base + variableFee).toFixed(2))

    shippingQuote.value = {
      destination: `${parsedResponse.data.localidade ?? 'Cidade não informada'} - ${parsedResponse.data.uf.toUpperCase()}`,
      region: shippingRule.region,
      deadline: shippingRule.deadline,
      value: calculatedValue,
    }
  } catch (error) {
    console.error('Erro ao calcular frete por CEP:', error)
    shippingError.value = 'Não foi possível calcular o frete agora. Tente novamente.'
  } finally {
    isShippingLoading.value = false
  }
}

const totalWithShipping = computed(() => {
  return kitSubtotalValue.value + (shippingQuote.value?.value ?? 0)
})

const requestOrderLink = computed(() => {
  if (!selectedKit.value) {
    return conditionsLink
  }

  const normalizedCep = normalizeCep(shippingCepRaw.value)
  const formattedCep = normalizedCep.length === 8 ? formatCepMask(normalizedCep) : 'Não informado'

  const shippingSummary = shippingQuote.value
    ? `${formatCurrency(shippingQuote.value.value)} (${shippingQuote.value.deadline} - ${shippingQuote.value.destination})`
    : 'Não calculado'

  const messageLines = [
    'Olá! Quero solicitar pedido de kit.',
    `Modelo: ${selectedKit.value.code} - ${selectedKit.value.line}`,
    `Descrição: ${selectedKit.value.fullDescription}`,
    `Faixa mínima sugerida: ${fixedRangeStart} ao ${fixedRangeEnd} (${minimumKitQuantity} unidades)`,
    `Seleção de aros: ${selectedRingsSummary.value}`,
    `Quantidade total: ${totalSelectedUnits.value} unidades`,
    `Case brinde: ${hasCaseBonus.value ? 'Sim' : `Não (faltam ${piecesToCaseBonus.value} peça(s))`}`,
    `Preço unitário: ${formatCurrency(selectedKit.value.unitPrice)}`,
    `Subtotal dos itens: ${formatCurrency(kitSubtotalValue.value)}`,
    `Frete aproximado: ${shippingSummary}`,
    `CEP: ${formattedCep}`,
    `Total estimado: ${formatCurrency(totalWithShipping.value)}`,
  ]

  return `${whatsappBase}?text=${encodeURIComponent(messageLines.join('\n'))}`
})

const selectedKitModalTitle = computed(() => {
  if (!selectedKit.value) {
    return 'Mais informações do kit'
  }

  return `${selectedKit.value.code} - ${selectedKit.value.line}`
})

function resetKitOrderState() {
  ringQuantities.value = createDefaultRingQuantities()
  shippingCepRaw.value = ''
  shippingError.value = ''
  shippingQuote.value = null
  isShippingLoading.value = false
}

function openKitDetails(kit: Kit) {
  selectedKit.value = kit
  resetKitOrderState()
  isKitDetailsOpen.value = true
}

watch(isKitDetailsOpen, (open) => {
  if (!open) {
    resetKitOrderState()
    selectedKit.value = null
  }
})

const steps = [
  {
    title: 'Escolha o Kit Completo',
    description: '18 peças do aro 14 ao 31 para começar com grade ampla e pronta entrega.',
    icon: 'mdi:briefcase-outline',
  },
  {
    title: 'Venda com Pronta Entrega',
    description: 'Tenha variedade no balcão e acelere a decisão de compra dos seus clientes.',
    icon: 'mdi:store-outline',
  },
  {
    title: 'Reponha Só o que Vendeu',
    description: 'Reposição enxuta, sem desperdício e com produção média em até 15 dias corridos.',
    icon: 'mdi:reload',
  },
]

const conditions = [
  'Produtos direto da fábrica com certificado',
  'Produção média: até 15 dias corridos',
  'Envio: Correios (Sedex), origem São José do Rio Preto – SP',
  '1ª parcela ~10 dias após recebimento do kit',
  '4x no boleto sem juros: 30/60/90/120 dias (sujeito a aprovação)',
  'Boleto à vista: vencimento 30 dias (sujeito a aprovação)',
  'Pedido mínimo: não há',
  'Garantia: 1 ano contra defeito de fabricação',
]

const consultationLines = ['Solitários', 'Pingentes', 'Aparadores', 'Brincos']

const faqs = [
  {
    question: 'Vocês enviam para todo o Brasil?',
    answer: 'Sim. Atendemos todo o território nacional com envio pelos Correios (Sedex).',
  },
  {
    question: 'Os produtos são direto da fábrica?',
    answer: 'Sim. A linha Vi&Va é fornecida direto da fábrica, com certificado e garantia.',
  },
  {
    question: 'Qual o prazo?',
    answer:
      'A produção média é de até 15 dias corridos, variando conforme a demanda e o volume do pedido.',
  },
  {
    question: 'Tem pedido mínimo?',
    answer: 'Não há pedido mínimo para iniciar o atendimento.',
  },
  {
    question: 'Tem ajuste?',
    answer:
      'Sim. As possibilidades de ajuste são avaliadas conforme o modelo e orientadas no atendimento.',
  },
  {
    question: 'Tem garantia?',
    answer:
      'Sim. Todos os modelos acompanham certificado e garantia de 1 ano contra defeito de fabricação.',
  },
]

const activeFaqIndex = ref(0)

function toggleFaq(index: number) {
  activeFaqIndex.value = activeFaqIndex.value === index ? -1 : index
}
</script>
