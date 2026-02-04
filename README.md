# 🎯 Sistema de Representação Comercial

> Plataforma completa para gestão de representantes de **Óticas, Relojoarias e Semi-joias**

## 🚀 Visão Geral

Sistema desenvolvido para representantes comerciais gerenciarem suas visitas, clientes e vendas de forma visual e intuitiva através de mapas interativos.

### ✨ Funcionalidades Principais

#### 📍 **Gestão Visual de Clientes**
- Mapa interativo com todos os clientes
- Cores inteligentes baseadas no **status da carteira** (calculado por venda/contato):
  - ✅ **Ativo (Verde)**: teve venda **ou** contato nos últimos **90 dias**
  - ⚠️ **Em atenção (Amarelo)**: teve venda **ou** contato entre **91 e 180 dias**
  - 🚨 **Crítico / Reativar (Vermelho)**: sem venda e sem contato há **mais de 180 dias**
  - 🎯 **Potencial (Azul)**: prospect (ainda não virou cliente) **ou** sem histórico registrado
  - ⏸️ **Inativo (Cinza)**: marcado manualmente como inativo (fora da carteira)
- Geocodificação automática de endereços

#### 👥 **Cadastro Completo de Clientes**
- Dados básicos: nome, telefone, email, endereço
- Classificação:
  - **Status (cadastro)**: Potencial, Ativo, Inativo
  - **Segmento**: 👓 Ótica, ⌚ Relojoaria, 💍 Semi-joias, 🏪 Multimarcas
  - **Porte**: Pequeno, Médio, Grande
  - **Potencial**: Baixo, Médio, Alto
- Sistema de recorrência automática (semanal, quinzenal, mensal, etc.)

#### 📝 **Registro de Visitas**
- Data e descrição da visita
- Duração em minutos
- Controle de vendas:
  - Valor total
  - Produtos vendidos (com quantidade e preço)
  - Catálogo de 20+ produtos reais
- Histórico completo organizado por data

#### 📊 **Dashboard Analítico**
- **Total de Clientes**
- **Clientes por status** (ativo / atenção / crítico / potencial)
- **Faturamento Mensal**
- **Faturamento Anual**
- **Produto Mais Consumido**
- BigNumbers por cliente (última visita, próxima, dias até próxima, vendas)

#### 🔍 **Filtros e Busca**
- Busca por nome, cidade ou endereço
- Filtro por segmento
- Filtro por **status da carteira**
- Contador de resultados

#### 💬 **Integração WhatsApp**
- Botão direto para enviar mensagem
- Template pré-formatado

### 🛠️ Tecnologias

- **Frontend**: Nuxt 4 + Vue 3 + TypeScript
- **UI**: Tailwind CSS v4
- **Mapas**: Google Maps API (Geocoding + Visualização)
- **Armazenamento**: localStorage (para MVP/apresentação)
- **State Management**: Composition API nativo

### 📦 Estrutura do Projeto

```
app/
├── components/
│   ├── BrokerMaps.vue           # Componente de mapa
│   ├── ClientSidePanel.vue       # Painel lateral de detalhes
│   ├── ModalNovaVisita.vue       # Modal de registro de visitas
│   └── ModalEditarCliente.vue    # Modal de edição de cliente
├── composables/
│   └── useClientStorage.ts       # Lógica de persistência
├── pages/
│   └── Maps.vue                  # Página principal
└── types/
    ├── client.ts                 # Interfaces de Cliente/Visita
    └── product.ts                # Catálogo de produtos
```

### 🎨 Design System

**Gradientes Principais:**
- Blue → Purple: Ações primárias
- Emerald → Teal: Registro de visitas
- Indigo → Blue: Edição
- Green: WhatsApp

**Ícones Temáticos:**
- 👓 Ótica
- ⌚ Relojoaria
- 💍 Semi-joias
- 🎁 Acessórios

## 🚀 Começando

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev
```

Acesse `http://localhost:3000` e navegue para a aba "Locais Visitados".

## 📱 Uso do Sistema

1. **Cadastrar Cliente**: Preencha nome e endereço no formulário
2. **Visualizar no Mapa**: Cliente aparece com marcador colorido
3. **Clicar no Marcador**: Abre painel lateral com detalhes
4. **Registrar Visita**: Botão "Nova Visita" → preencher dados
5. **Editar Cliente**: Botão "Editar" → atualizar informações
6. **Filtrar**: Use barra de busca e filtros para encontrar clientes

## 🎯 Roadmap Futuro

- [ ] Backend com Supabase/PostgreSQL
- [ ] Autenticação de usuários
- [ ] Dashboard analítico avançado
- [ ] Roteirização automática
- [ ] PWA com modo offline
- [ ] Notificações push
- [ ] Exportação PDF/CSV
- [ ] Notas e lembretes

## 📄 Licença

MIT

## Preview

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## Normalização da planilha (aco-e-ouro.xlsx)

Para analisar/importar no app (e depois plotar no Google Maps), você pode “flatten” a planilha removendo linhas de **Total** e preenchendo valores mesclados.

```bash
python3 scripts/normalize_aco_e_ouro.py --pretty
```

Saídas geradas:
- `public/data/aco-e-ouro.normalized.json` (uma linha por item: cliente + mês/ano + produto + quantidade)
- `public/data/aco-e-ouro.normalized.csv`
- `public/data/aco-e-ouro.summary.json` (agregados)
- `public/data/aco-e-ouro.issues.json` (linhas que pareciam “item” mas faltou algo)
