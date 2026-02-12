<template>
  <div class="bg-[#F4F1EB] text-[#2A2A2A] [font-family:'Montserrat',sans-serif]">
    <section
      class="relative overflow-hidden bg-[linear-gradient(180deg,#2E2E2E_0%,#3A3A3A_60%,#E9E4DD_100%)] text-[#F8F6F2]"
    >
      <div class="absolute inset-0 bg-black/40"></div>
      <NContainer class="relative">
        <div class="grid min-h-screen items-center gap-10 py-14 md:grid-cols-2 md:py-24">
          <div class="space-y-6">
            <img
              src="/logo.webp"
              alt="Logo Felssner Representações"
              class="h-auto w-36 rounded bg-white/5 p-2 backdrop-blur-sm sm:w-44"
            />

            <div class="space-y-3">
              <p class="text-xs uppercase tracking-[1px] text-[#C6A64B]">Felssner Representações</p>
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

          <div class="relative">
            <div class="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <picture>
                <source media="(max-width: 767px)" srcset="/estojo-frente.png" />
                <source media="(min-width: 1024px)" srcset="/estojo-vertical.png" />
                <img
                  src="/estojo.png"
                  alt="Estojo de alianças Felssner Representações"
                  class="h-[320px] w-full object-cover sm:h-[420px] md:h-[620px]"
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

        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="kit in kits"
            :key="kit.code"
            class="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <img :src="kit.image" :alt="kit.alt" class="h-64 w-full object-cover" />
            <div class="space-y-3 p-6">
              <p class="text-xs uppercase tracking-[1px] text-[#A8842F]">{{ kit.code }}</p>
              <h3 class="text-2xl [font-family:'Playfair_Display',serif]">{{ kit.line }}</h3>
              <p class="text-sm text-[#5A5A5A]">18 alianças do 14 ao 31</p>
              <p class="text-sm text-[#5A5A5A]">Kit acompanha case</p>
              <a
                :href="conditionsLink"
                target="_blank"
                rel="noopener"
                :class="secondaryButtonClass"
              >
                Ver Condições
              </a>
            </div>
          </article>
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

const kits = [
  {
    code: 'AEX0100',
    line: 'Kit Aço + Ouro',
    image: '/aco-e-ouro/AEX0100.png',
    alt: 'Kit AEX0100 Aço e Ouro',
  },
  {
    code: 'AEX0113',
    line: 'Kit Aço + Ouro',
    image: '/aco-e-ouro/AEX0113.png',
    alt: 'Kit AEX0113 Aço e Ouro',
  },
  {
    code: 'AEX0117',
    line: 'Kit Aço + Ouro',
    image: '/aco-e-ouro/AEX0117.png',
    alt: 'Kit AEX0117 Aço e Ouro',
  },
  {
    code: 'AVP4001',
    line: 'Kit Prata + Ouro',
    image: '/prata-e-ouro/AVP4001.png',
    alt: 'Kit AVP4001 Prata e Ouro',
  },
]

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
  'Produtos direto da fábrica',
  'Produção média: até 15 dias corridos',
  'Envio: Correios (Sedex)',
  'Origem: São José do Rio Preto – SP',
  'Pedido mínimo: não há',
  'Boleto até 4x (mínimo R$ 500)',
  'Cartão até 10x (em implantação)',
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
