<template>
  <div
    class="relative min-h-screen overflow-x-hidden bg-[color:var(--layer-paper)] text-[color:var(--ntypo-default)]"
  >
    <div
      class="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]"
    ></div>
    <div
      class="pointer-events-none absolute -left-40 top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]"
    ></div>
    <div
      class="pointer-events-none absolute -right-40 top-40 h-72 w-72 rounded-full bg-rose-500/10 blur-[120px]"
    ></div>


    <main class="relative">
      <section class="py-14 sm:py-20">
        <NContainer>
          <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div class="space-y-6">
              <div
                class="inline-flex items-center gap-2 rounded-full border border-[color:var(--layer-border)] bg-[color:var(--layer-solid)] px-4 py-2"
              >
                <NIcon name="mdi:diamond-stone" class="h-4 w-4 text-[color:var(--ntypo-brand)]" />
                <NTypo size="xs" tone="soft" caps tracking="wide">
                  Representação comercial especializada
                </NTypo>
              </div>

              <NTypo as="h1" size="5xl" weight="semibold" family="serif" class="leading-[1.05]">
                Artigos de Joalheria e Relojoaria para o seu negócio.
              </NTypo>
              <NTypo size="lg" tone="muted" class="max-w-xl">
                Representação comercial especializada em joias, relógios, alianças, pulseiras e acessórios. 
                Atendimento personalizado em Santa Catarina com mais de 15 anos de experiência.
              </NTypo>

              <div class="grid gap-3 grid-cols-3">
                <div
                  class="rounded-2xl border border-[color:var(--layer-border)] bg-[color:var(--layer-default)] px-4 py-3"
                >
                  <NTypo size="xs" tone="soft" caps tracking="tight" class="line-clamp-1"
                    >clientes</NTypo
                  >
                  <NTypo as="div" size="lg" weight="semibold">
                    280+
                  </NTypo>
                </div>
                <div
                  class="rounded-2xl border border-[color:var(--layer-border)] bg-[color:var(--layer-default)] px-4 py-3"
                >
                  <NTypo size="xs" tone="soft" caps tracking="tight" class="line-clamp-1"
                    >linhas representadas</NTypo
                  >
                  <NTypo as="div" size="lg" weight="semibold">
                    12
                  </NTypo>
                </div>
                <div
                  class="rounded-2xl border border-[color:var(--layer-border)] bg-[color:var(--layer-default)] px-4 py-3"
                >
                  <NTypo size="xs" tone="soft" caps tracking="tight" class="line-clamp-1"
                    >experiência</NTypo
                  >
                  <NTypo as="div" size="lg" weight="semibold">
                    15+ anos
                  </NTypo>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <NLayer radius="hero" variant="paper" size="lg" class="space-y-4">
                <NTypo size="xs" tone="soft" caps tracking="wide">como funciona</NTypo>
                <div class="space-y-3">
                  <div
                    class="flex items-center gap-3 rounded-2xl border border-[color:var(--layer-border)] bg-[color:var(--layer-solid)] px-4 py-3"
                  >
                    <NTypo
                      as="span"
                      size="xs"
                      weight="semibold"
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-white"
                    >
                      1
                    </NTypo>
                    <div>
                      <NTypo size="sm" weight="semibold">Conheça nosso catálogo</NTypo>
                      <NTypo size="xs" tone="muted">Produtos selecionados e tendências.</NTypo>
                    </div>
                  </div>
                  <div
                    class="flex items-center gap-3 rounded-2xl border border-[color:var(--layer-border)] bg-[color:var(--layer-solid)] px-4 py-3"
                  >
                    <NTypo
                      as="span"
                      size="xs"
                      weight="semibold"
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white"
                    >
                      2
                    </NTypo>
                    <div>
                      <NTypo size="sm" weight="semibold">Atendimento personalizado</NTypo>
                      <NTypo size="xs" tone="muted">Visitas regulares e suporte contínuo.</NTypo>
                    </div>
                  </div>
                  <div
                    class="flex items-center gap-3 rounded-2xl border border-[color:var(--layer-border)] bg-[color:var(--layer-solid)] px-4 py-3"
                  >
                    <NTypo
                      as="span"
                      size="xs"
                      weight="semibold"
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white"
                    >
                      3
                    </NTypo>
                    <div>
                      <NTypo size="sm" weight="semibold">Entrega e acompanhamento</NTypo>
                      <NTypo size="xs" tone="muted">Logística eficiente e pós-venda.</NTypo>
                    </div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <NButton size="sm" variant="primary" @click="scrollToSection('catalogo')">
                    Ver catálogo
                  </NButton>
                  <NButton size="sm" variant="outline" @click="scrollToSection('contato')">
                    Entrar em contato
                  </NButton>
                </div>
              </NLayer>
            </div>
          </div>
        </NContainer>
      </section>

      <section id="catalogo" class="py-14 bg-amber-50">
        <NContainer>
          <div class="flex flex-wrap items-end justify-between gap-2">
            <div class="space-y-2">
              <NTypo size="xs" tone="soft" caps tracking="wide">nosso catálogo</NTypo>
              <NTypo as="h2" size="3xl" weight="semibold" family="serif" tone="info">
                Produtos selecionados para sua relojoaria.
              </NTypo>
            </div>
          </div>

          <div class="mt-8 grid gap-6 sm:grid-cols-1 lg:grid-cols-4">
            <NLayer
              v-for="(category, index) in productCategories"
              :key="category.id"
              radius="card"
              variant="solid"
              size="lg"
              class="group flex flex-col overflow-hidden border border-[color:var(--layer-border)] bg-[color:var(--layer-solid)]"
            >
              <div class="relative block overflow-hidden">
                <div
                  class="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-emerald-500/20"
                ></div>
                <div class="aspect-[4/3] overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50">
                  <NIcon :name="category.icon" class="h-20 w-20 text-amber-600" />
                </div>
              </div>
              <div class="flex flex-1 flex-col gap-3 pt-5">
                <div class="flex items-start justify-between gap-2">
                  <NTypo size="lg" weight="semibold" class="leading-tight">
                    {{ category.name }}
                  </NTypo>
                </div>
                <NTypo size="sm" tone="muted" class="line-clamp-2">
                  {{ category.description }}
                </NTypo>
                <div class="mt-auto">
                  <NButton
                    size="sm"
                    variant="primary"
                    class="w-full"
                    @click="scrollToSection('contato')"
                  >
                    Solicitar catálogo
                  </NButton>
                </div>
              </div>
            </NLayer>
          </div>
        </NContainer>
      </section>

      <section id="diferenciais" class="py-14">
        <NContainer>
          <div class="space-y-2 text-center mb-10">
            <NTypo size="xs" tone="soft" caps tracking="wide">por que trabalhar conosco</NTypo>
            <NTypo as="h2" size="3xl" weight="semibold" family="serif">
              Diferenciais da nossa representação.
            </NTypo>
            <NTypo size="sm" tone="muted" class="max-w-2xl mx-auto">
              Mais de 15 anos atendendo relojoarias em Santa Catarina com profissionalismo e dedicação.
            </NTypo>
          </div>

          <div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            <NLayer
              radius="card"
              variant="solid"
              size="lg"
              class="flex flex-col gap-4 border border-[color:var(--layer-border)] bg-[color:var(--layer-solid)]"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <NIcon name="mdi:handshake" class="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <NTypo size="lg" weight="semibold" class="mb-2">Atendimento personalizado</NTypo>
                <NTypo size="sm" tone="muted">
                  Visitas regulares, suporte direto e relacionamento próximo com cada cliente.
                </NTypo>
              </div>
            </NLayer>

            <NLayer
              radius="card"
              variant="solid"
              size="lg"
              class="flex flex-col gap-4 border border-[color:var(--layer-border)] bg-[color:var(--layer-solid)]"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <NIcon name="mdi:package-variant" class="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <NTypo size="lg" weight="semibold" class="mb-2">Logística eficiente</NTypo>
                <NTypo size="sm" tone="muted">
                  Entregas pontuais, gestão de estoque e acompanhamento de pedidos em tempo real.
                </NTypo>
              </div>
            </NLayer>

            <NLayer
              radius="card"
              variant="solid"
              size="lg"
              class="flex flex-col gap-4 border border-[color:var(--layer-border)] bg-[color:var(--layer-solid)]"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                <NIcon name="mdi:star-circle" class="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <NTypo size="lg" weight="semibold" class="mb-2">Produtos de qualidade</NTypo>
                <NTypo size="sm" tone="muted">
                  Marcas consolidadas, tendências do mercado e produtos com alto giro.
                </NTypo>
              </div>
            </NLayer>
          </div>
        </NContainer>
      </section>

      <section id="contato" class="py-14">
        <NContainer>
          <NLayer
            radius="hero"
            variant="paper"
            size="lg"
            class="flex flex-col gap-6 sm:flex-row sm:items-center"
          >
            <div class="space-y-2">
              <NTypo size="xs" tone="soft" caps tracking="wide">fale conosco</NTypo>
              <NTypo as="h2" size="2xl" weight="semibold" family="serif">
                Quer conhecer nossos produtos? Entre em contato.
              </NTypo>
              <NTypo size="sm" tone="muted">
                Agende uma visita, solicite catálogos ou tire suas dúvidas. Estamos à disposição.
              </NTypo>
            </div>
            <div class="flex flex-wrap gap-3 sm:ml-auto">
              <NButton
                as="a"
                href="https://wa.me/5548999999999?text=Olá,%20gostaria%20de%20conhecer%20os%20produtos"
                target="_blank"
                variant="primary"
                size="sm"
                leading-icon="mdi:whatsapp"
              >
                WhatsApp
              </NButton>
              <NButton
                variant="outline"
                size="sm"
                leading-icon="mdi:file-pdf-box"
                @click="isPdfImporterOpen = true"
              >
                Importar PDF
              </NButton>
              <NButton
                as="NuxtLink"
                to="/admin"
                variant="outline"
                size="sm"
              >
                Área do cliente
              </NButton>
            </div>
          </NLayer>
        </NContainer>
      </section>
    </main>

    <ModalImportarPdfVenda v-model="isPdfImporterOpen" />

    <footer class="border-t border-[color:var(--layer-border)] bg-[color:var(--layer-solid)] py-12">
      <NContainer>
        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div class="space-y-3">
            <NTypo size="xs" tone="soft" caps tracking="wide">Representação Comercial</NTypo>
            <NTypo size="sm" tone="muted">
              Artigos de joalheria e relojoaria para Santa Catarina. Atendimento especializado há mais de 15 anos.
            </NTypo>
          </div>
          <div class="space-y-2">
            <NTypo size="xs" tone="soft" caps tracking="wide">Explorar</NTypo>
            <a
              href="#catalogo"
              class="block text-sm text-[color:var(--ntypo-muted)] hover:text-[color:var(--ntypo-default)]"
              @click.prevent="scrollToSection('catalogo')"
            >
              Catálogo
            </a>
            <a
              href="#diferenciais"
              class="block text-sm text-[color:var(--ntypo-muted)] hover:text-[color:var(--ntypo-default)]"
              @click.prevent="scrollToSection('diferenciais')"
            >
              Diferenciais
            </a>
          </div>
          <div class="space-y-2">
            <NTypo size="xs" tone="soft" caps tracking="wide">Área do cliente</NTypo>
            <NuxtLink
              to="/admin"
              class="block text-sm text-[color:var(--ntypo-muted)] hover:text-[color:var(--ntypo-default)]"
            >
              Acessar sistema
            </NuxtLink>
          </div>
          <div class="space-y-2">
            <NTypo size="xs" tone="soft" caps tracking="wide">Contato</NTypo>
            <a
              href="mailto:contato@representacao.com.br"
              class="block text-sm text-[color:var(--ntypo-muted)] hover:text-[color:var(--ntypo-default)]"
            >
              contato@representacao.com.br
            </a>
            <a
              href="https://wa.me/5548999999999"
              target="_blank"
              class="block text-sm text-[color:var(--ntypo-muted)] hover:text-[color:var(--ntypo-default)]"
            >
              WhatsApp: (48) 99999-9999
            </a>
          </div>
        </div>
        <div class="mt-10 text-xs text-[color:var(--ntypo-muted)]">2025 · Representação Comercial</div>
      </NContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public',
})

useSeoMeta({
  title: 'Representação Comercial de Joias e Relógios',
  description:
    'Representação especializada em artigos de joalheria e relojoaria para Santa Catarina. Atendimento personalizado há mais de 15 anos.',
})

const productCategories = [
  {
    id: 'joias',
    name: 'Joias',
    icon: 'mdi:diamond',
    description: 'Anéis, brincos, colares e pingentes em ouro, prata e pedras preciosas.',
  },
  {
    id: 'relogios',
    name: 'Relógios',
    icon: 'mdi:watch',
    description: 'Relógios de pulso masculinos e femininos das principais marcas do mercado.',
  },
  {
    id: 'aliancas',
    name: 'Alianças',
    icon: 'mdi:ring',
    description: 'Alianças de casamento e noivado em ouro, prata e materiais especiais.',
  },
  {
    id: 'pulseiras',
    name: 'Pulseiras',
    icon: 'mdi:link-variant',
    description: 'Pulseiras, braceletes e correntes em diversos estilos e materiais.',
  },
  {
    id: 'semijoias',
    name: 'Semi-joias',
    icon: 'mdi:necklace',
    description: 'Linha completa de semi-joias folheadas e com acabamento premium.',
  },
  {
    id: 'acessorios',
    name: 'Acessórios',
    icon: 'mdi:bag-personal',
    description: 'Boxes, expositores, embalagens e ferramentas para relojoarias.',
  },
  {
    id: 'infantil',
    name: 'Linha Infantil',
    icon: 'mdi:baby-face',
    description: 'Joias e acessórios especialmente desenvolvidos para o público infantil.',
  },
  {
    id: 'presentes',
    name: 'Presentes',
    icon: 'mdi:gift',
    description: 'Kits e conjuntos prontos para datas especiais e ocasiões comemorativas.',
  },
]

const scrollToSection = (id: string) => {
  if (typeof document === 'undefined') return
  const target = document.getElementById(id)
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>
