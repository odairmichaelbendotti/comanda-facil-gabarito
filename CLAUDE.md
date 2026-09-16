# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint (flat config via `eslint-config-next`)

There is no test setup in this project yet.

## Architecture

Freshly scaffolded Next.js 16 App Router project (`create-next-app`, template `app-tw`) — no application code beyond the default shell yet:

- `app/layout.tsx` — root layout; loads the Fraunces and Plus Jakarta Sans fonts via `next/font/google` and sets `metadata`.
- `app/page.tsx` — home route.
- `app/globals.css` — global stylesheet; imports Tailwind CSS v4 and defines the project's theme tokens (see Design System below).
- Tailwind CSS v4 is wired through PostCSS (`postcss.config.mjs`, `@tailwindcss/postcss`) — there is no `tailwind.config.*` file, which is expected for v4.
- Path alias `@/*` maps to the project root (`tsconfig.json`).

## Design System

- Cores, fontes e espaçamentos do tema ficam em `app/globals.css`, no bloco `@theme inline`. Os tokens semânticos (cores que mudam entre light/dark) ficam logo abaixo, como variáveis CSS em `:root` e `.dark` no mesmo arquivo. O carregamento das fontes (next/font/google) fica em `app/layout.tsx`.
- Cores de rampa (primitivas) viram classes normais do Tailwind, ex.: `bg-red-500`, `text-neutral-600`.
- Cores semânticas (bg/text/border/status/brand) são variáveis CSS — use-as com a forma curta de valor arbitrário do Tailwind v4, ex.: `bg-(--color-bg-canvas)`, `text-(--color-text-primary)`. Nunca a forma longa `bg-[var(--color-bg-canvas)]`/`text-[color:var(--color-text-primary)]`. (Alguns componentes mais antigos do projeto ainda usam a forma longa — não precisa migrar por conta própria, só use a curta em código novo.)
- Fontes: `font-sans` para texto, `font-display` para títulos.
- Escala tipográfica: `text-display`, `text-h2`, `text-h3`, `text-body-lg`, `text-body-md`, `text-body-sm`, `text-label-md`, `text-label-sm`, `text-button`.
- Espaçamento: escala padrão do Tailwind (unidade-base de 4px). Para bater com um valor em px do Figma, divida por 4 e use o número direto (ex.: 335px → `w-83.75`), nunca `w-[335px]`.

### Regras
- Sempre use as classes do design system, nunca valores soltos.
- Todo ícone do projeto vem do react-icons, sempre da mesma família. Não escreva SVG na mão.
- Toda mudança de estado, como hover e foco, tem uma transição suave e curta.
- Padrão de animação do projeto (use sempre o mesmo): `duration-150`, curva padrão do Tailwind (sem classe `ease-*`), e só anime `opacity`/deslocamento (`transition-colors` para cor, `transition-opacity` para fade puro) — nunca width, height ou posição via `top`/`left`. Sempre acompanhado de `motion-reduce:transition-none`.
- Atenção: no Tailwind v4, `translate-x-*`/`translate-y-*` animam a propriedade CSS nativa `translate`, não `transform` — `transition-transform` ou `transition-[opacity,transform]` NÃO anima esse deslocamento (a classe existe mas não pega o `translate`, então o elemento só troca de posição sem transição, "seco"). Para deslocamento sozinho use `transition-[translate]`; para fade + deslocamento juntos (entrada/saída de modal, drawer) use `transition-[opacity,translate]`.
- Para entrada de conteúdo ao montar (cards, seções, conteúdo de rota), use a classe `animate-fade-in-up` (definida em `app/globals.css`) em vez de controlar isso com estado do React — evita efeito colateral desnecessário e já respeita `prefers-reduced-motion` sozinha.
- Para esconder a barra de rolagem visualmente sem perder a rolagem por wheel/toque/teclado (ex.: conteúdo de modal), use a classe `scrollbar-hidden` (definida em `app/globals.css`).
- Quando o design não mostrar como fica o hover de um elemento, defina um hover coerente com o design system, usando as cores e estilos dele.
- Links de âncora (ex.: "Como funciona" no menu da landing) rolam a página suavemente até a seção, sem que o menu fixo cubra o título da seção.
- Enquanto um conteúdo carrega, mostre um estado de carregamento com o formato do conteúdo e faça o conteúdo aparecer com transição suave.
- Respeite a configuração de movimento reduzido do sistema: para quem a ativou, desligue as animações e a rolagem suave.

## Regras de frontend

### Código
- Escreva o código em inglês: nomes de variáveis, funções, componentes, arquivos e comentários.
- Textos exibidos na interface e endereços das páginas ficam em português.

### Estilo
- Use apenas as cores, fontes e espaçamentos do tema. Nunca escreva um valor solto, como #3E56C9 ou 13px, direto no componente.
- Não instale bibliotecas novas sem pedir antes.

### Componentes
- Antes de criar um componente, verifique se já existe um parecido em app/components.
- Cada componente fica em app/components/<Nome>.tsx, com nome em PascalCase e export default.
- Props tipadas com interface acima do componente. Props de texto e estilo têm valor padrão.
- Variantes (ex.: botão primário e secundário) ficam em um objeto de mapeamento no topo do arquivo, não em if encadeado.
- Todo componente novo aparece na página /preview, com uma instância de cada variante.
- `app/components/` já tem os componentes base do design system, reutilizáveis em todo o projeto — use um deles em vez de recriar algo parecido: `Button`, `Input`, `Textarea`, `NativeSelect`, `Badge`, `Tab`, `FilterTab`, `SidebarNavItem`, `PageHeader`, `Table`, `OrderCard`, `CategoryCard`, `MesaCard`, `AccordionHeader`, `Dropdown`, `ModalContainer`, `Modal`, `NewOrderModal`, `OrderDetailModal`, `NewProductModal`, `CategoryModal`, `NewMesaModal`, `FuncionarioModal`, `Pagination`, `QuantityStepper`, `Sidebar`, `AppShell`, `EmptyState`, `MaskedInput`, `ThemeToggle`, `ConfirmationModal`, `PageLoadingState`, `AccessDenied`, `ProtectedRoute`, `Logo`, `DocumentTypeToggle`, `SidebarPlanIndicators`.
- `Logo` (`app/components/Logo.tsx`) é a logo do produto ("Comanda" + "Fácil" em vermelho, `--color-brand-primary`) — único lugar que deve renderizar o nome da marca com essa formatação; qualquer tela que precise exibir a logo usa esse componente em vez de escrever o texto "ComandaFácil" à mão. Ele já é um link: leva para `/pedidos` se a pessoa está autenticada, ou para `/` (landing page) caso contrário — nenhuma página precisa decidir esse destino por conta própria. Prop `size`: `"sm"` (`text-body-lg`, usado em `Sidebar`/topo mobile do `AppShell`) ou `"lg"` (`text-h2`, usado em cabeçalhos de tela cheia como landing, `/login`, `/cadastro`).
- `DocumentTypeToggle` (`app/components/DocumentTypeToggle.tsx`) é o par de botões CPF/CNPJ usado em `/login` e na etapa 2 de `/cadastro` — era JSX duplicado entre as duas telas antes de virar componente compartilhado. Props: `value` (`"cpf" | "cnpj"`) e `onChange`; quem chama decide o que fazer com a troca de tipo (ex.: limpar o campo de documento).
- `SidebarPlanIndicators` (`app/components/SidebarPlanIndicators.tsx`) é a seção de plano (card "Plano Gratuito" com barra de uso + card "Restaurante Premium") que `Sidebar` renderiza entre a navegação e o rodapé — ainda não há endpoint de assinatura/uso, então `ordersUsed`/`ordersLimit` são props com valor padrão (17/30) até existir uma fonte de dados real.
- Páginas com várias etapas ou seções (ex.: `/cadastro`) seguem o mesmo padrão de `_components`: a `page.tsx` fica "burra" — só estado, validação e handlers — e cada etapa/seção vira um componente de apresentação em `_components`, recebendo os dados e callbacks como props. Ver `app/cadastro/_components/` para o exemplo mais completo (um componente por etapa do formulário).
- `CategoryModal` serve tanto para criar quanto editar categoria (mesmo componente, mesmo gatilho de "Nova Categoria" e "Editar"): sem `initialValues`, título "Nova Categoria" e botão "Adicionar Categoria"; com `initialValues`, título "Editar Categoria" e botão "Salvar Alterações". `FuncionarioModal` e `NewProductModal` seguem o mesmo padrão dual criar/editar via `initialValues` (título e texto do botão trocam do mesmo jeito). Nesses três, o campo com `MaskedInput` usa `key={`<campo>-${isOpen}`}` para forçar remontagem ao reabrir o modal — `MaskedInput` guarda o valor em estado interno via `defaultValue` (não é controlado), então só a prop mudar não reseta o campo; a troca de `key` força o React a recriar a instância com o novo `defaultValue`. `Textarea` (`app/components/Textarea.tsx`) segue o mesmo padrão visual do `Input` (label, borda, foco, erro), só que multilinha — use-o para qualquer campo de texto longo.
- `CategoryCard` cobre dois modos pela mesma prop set: sem `onEdit`/`onDelete`, é um card inteiro clicável (`onClick`) mostrando `title`/`subtitle` — usado para selecionar uma categoria. Com `onEdit` e/ou `onDelete`, vira um card não clicável com pílulas de ação "Editar"/"Excluir" no rodapé — usado em telas de gerenciamento (ex.: `/configuracoes`). `subtitle` é livre (ID, contagem de produtos, etc.), não assuma que é sempre um ID.
- `NativeSelect` (`app/components/NativeSelect.tsx`) é um `<select>` HTML nativo estilizado para combinar com `Input` (mesma borda/foco/tamanho), mas as `<option>` continuam 100% nativas do navegador — sem popup customizado em JS. Use-o **sempre** que o campo estiver dentro de um `Modal` (`NewOrderModal` e `NewProductModal` já usam `NativeSelect`, nenhum modal do projeto usa `Dropdown`). O popup do `Dropdown` calcula sua posição via `getBoundingClientRect()` em JS e depende de detalhes de layout do que está ao redor — na prática, isso quebrou mais de uma vez (vazamento de scroll, popup fora do lugar) cada vez que a estrutura do `Modal`/`ModalContainer` mudou. `Dropdown` continua válido fora de modais (ex.: um filtro solto numa página), onde não há esse acoplamento.
- `Modal` (`app/components/Modal.tsx`) é a base de qualquer modal do projeto: overlay com fade, foco preso dentro do diálogo com retorno ao elemento de origem ao fechar, fecha com Esc/clique fora, trava o scroll da página. Novos modais (ex.: `NewOrderModal`, `OrderDetailModal`) compõem `Modal` por cima, não reimplementam esse comportamento.
- `ModalContainer` (`app/components/ModalContainer.tsx`) tem cabeçalho fixo (título + botão fechar, `shrink-0`) separado do corpo (`flex-1 overflow-y-auto`), que é quem rola quando o conteúdo do modal é maior que a tela — o cabeçalho nunca se move. Não junte os dois num único container rolável: quando o card inteiro (cabeçalho incluso) rola como um bloco só, qualquer scroll faz o título/botão fechar subir e descer junto, o que parece um bug visual mesmo sendo scroll "correto". A cadeia `Modal` → `ModalContainer` → corpo usa `min-h-0` em cada nível flex — não remova, é o que permite o corpo encolher e ativar seu próprio scroll em vez de estourar a altura do modal.
- `AppShell` (`app/components/AppShell.tsx`) é o layout padrão de página autenticada/admin: Sidebar fixa no desktop, topo + drawer no mobile, `<main>` com o fade de entrada. Toda página com esse layout (`/pedidos`, `/produtos`, futuras `/configuracoes`, `/funcionarios`) usa `<AppShell activeHref="/rota">{conteúdo}</AppShell>` em vez de duplicar Sidebar/drawer/top bar.
- Quem rola nas páginas com `AppShell` é o `<main>` interno (`overflow-y-auto`), não o `<body>` — isso é proposital, pra manter a Sidebar fixa em 100% da altura sem rolar junto. Por causa disso, `Modal` não trava só `document.body.style.overflow`: isso sozinho não impede o `<main>` de continuar rolando por baixo (scroll chaining) enquanto o modal fica "parado" (`position: fixed`), dando a impressão de que o modal se move. `Modal` também bloqueia qualquer `wheel`/`touchmove` que aconteça fora do diálogo, então isso já está resolvido — não reimplemente o scroll lock em um modal novo, sempre componha `Modal`.
- Escala de `z-index` do projeto (para não colidir camadas sobrepostas): topo mobile do `AppShell` = `z-30`, backdrop do drawer mobile = `z-40`, painel do drawer mobile = `z-50`, `Modal` (`app/components/Modal.tsx`) = `z-[60]`, popup do `Dropdown` (`app/components/Dropdown.tsx`) = `z-[70]` — sempre acima do Modal, já que um Dropdown pode abrir dentro de um modal. Qualquer overlay novo de página inteira (menu, drawer) deve ficar abaixo de `z-[60]`; qualquer popup/menu flutuante que precise abrir por cima de um modal deve ficar acima de `z-[60]`.
- `Dropdown` posiciona seu popup de opções com `position: fixed` (coordenadas calculadas via `getBoundingClientRect()` do gatilho, recalculadas em scroll/resize), não `position: absolute`. Isso é proposital: um popup `absolute` dentro de um `Modal` (que tem `overflow-y-auto`) conta como conteúdo do modal para efeito de `scrollHeight` sempre que se estende além da borda do card, mesmo sendo um elemento pequeno — isso faz o `Modal` achar que tem overflow real e libera o scroll nele, fazendo o card inteiro deslizar junto quando na real só o popup deveria (ou nada deveria) rolar. `position: fixed` evita esse vazamento porque não conta para o scrollable overflow de nenhum ancestral. Qualquer popup novo (menu de contexto, tooltip com lista, etc.) que possa abrir dentro de um `Modal` deve seguir o mesmo padrão.
- `app/lib/format.ts` tem o `formatCurrency` compartilhado (formato R$ brasileiro) — use-o em vez de duplicar `toLocaleString` em cada componente.
- `Pagination` (`app/components/Pagination.tsx`) pagina qualquer lista/grade longa (cards de pedido, linhas de tabela, cards de categoria/mesa) para evitar rolagem vertical excessiva na página. Some `<Pagination>` embaixo da grade/tabela quando a lista puder crescer. Use o hook `usePagination(items, pageSize)` de `app/lib/use-pagination.ts` para fatiar a lista e controlar a página atual — ele já trava a página num valor válido quando a lista encolhe (ex.: depois de excluir um item). O componente retorna `null` sozinho quando cabe tudo em uma página, então pode ficar sempre renderizado sem checagem extra.
- Grades de card (pedidos, categorias, mesas) usam CSS grid, não `flex-wrap`: `className="grid gap-N"` com `style={{ gridTemplateColumns: "repeat(auto-fill, minmax(<largura mínima do card>px, 1fr))" }}` — o número de colunas nasce do espaço disponível no container, sem breakpoints manuais (`sm:grid-cols-*`). Os componentes de card (`OrderCard`, `CategoryCard`) não têm largura própria (`w-full`), quem decide a largura é a célula do grid; ao usá-los fora de um grid (ex.: `/preview`), passe uma largura via `className`.
- `pageSize` de uma lista paginada não deve ser um número fixo: use `useResponsiveGrid` (`app/lib/use-responsive-grid.ts`) para calcular quantos itens cabem na tela de verdade — colunas a partir do `grid-template-columns` computado (ou `columns: 1` para tabelas) × linhas a partir da altura disponível (`window.innerHeight` menos o topo do container menos `reservedBottom`, que deve ser `PAGINATION_RESERVED_HEIGHT` exportado por `Pagination.tsx`). Ele devolve uma **callback ref** (não um `useRef` comum) — importante porque a grade pode desmontar/remontar (troca de aba, lista que vira `EmptyState` e volta), e só uma callback ref reage a isso; um `RefObject` ficaria observando um nó desconectado do DOM e pararia de recalcular. Para tabelas, passe `getItemElement` retornando a primeira linha real via `container.querySelector('[data-table-row]')` (o `Table` já marca cada linha com esse atributo) — assim a altura do cabeçalho é descontada automaticamente, sem precisar informá-la à parte.
- `<Pagination>` fica "colada" ao fundo da página sem JS: como o `<main>` do `AppShell` já é `flex flex-col`, basta dar `className="mt-auto"` no `<Pagination>` (último irmão de fluxo depois da grade/tabela) — a margem automática absorve o espaço vertical sobrando e empurra o componente para o fim da área visível. Isso também vale dentro de uma aba (ex.: `/configuracoes`), desde que o container da aba também seja `flex flex-1 flex-col`.
- `MaskedInput` (`app/components/MaskedInput.tsx`) cobre os campos com máscara em formato brasileiro (`type="phone" | "cpf" | "cnpj" | "cep" | "date" | "currency"`, via `react-imask`). Mostra o valor formatado para a pessoa e expõe o valor sem formatação por `onValueChange`; valida comprimento/dígito verificador e mostra erro de campo incompleto/inválido.
- Coluna "Ações" de uma `Table` (`/produtos`, `/funcionarios`): ícones soltos (`LuPencil` editar, `LuTrash2` excluir), sem fundo/pílula, `gap-4`, alinhados à direita — o `Table` já força a última coluna a `justify-end`. Cada ícone é um `<button>` (não `<Button>`) com `aria-label` descrevendo a ação + o item, `cursor-pointer`, `transition-colors duration-150 motion-reduce:transition-none`, cor `text-(--color-text-secondary)` (editar, hover `text-(--color-text-primary)`) ou `text-(--color-status-danger-text)` (excluir, hover `text-(--color-action-danger-hover)`), ícone em `size-4`.
- `ConfirmationModal` (`app/components/ConfirmationModal.tsx`) é um modal reutilizável para confirmar ações como excluir/editar — minimalista, com apenas título (no header), descrição, e dois botões (Cancelar e confirmação). Props: `isOpen`, `onClose`, `onConfirm`, `title`, `description`, `confirmLabel`, `cancelLabel`, `isDangerous` (muda a cor do botão entre danger/primary). Integrado em `/produtos`, `/funcionarios`, `/configuracoes` para confirmação antes de deletar.
- `OrderDetailModal` (`app/components/OrderDetailModal.tsx`) exibe detalhes de um pedido — mesa, itens com preços individuais e total, subtotal, total geral. Props: `isOpen`, `onClose`, `order`, `onEditOrder` (botão com ícone lápis, background padrão), `onStartPrep` (botão com ícone chama, fundo laranja), `onMarkReady` (botão vermelho). Cada botão só aparece se a prop correspondente for passada — quem chama o modal decide a visibilidade (ex.: por papel de usuário) simplesmente omitindo a prop. Sempre mostra o horário do pedido no rodapé.

### Autenticação e proteção de rotas
- `app/lib/mock-users.ts` só guarda o tipo `UserRole` (`"admin" | "garcom" | "cozinha"`) e `ROLE_LABELS` — a checagem de credenciais é real, feita pelo backend (`/api/auth/login`, `/api/cadastro`, `/api/auth/sessao`) contra o banco. `app/lib/store/auth-store.ts` é a store Zustand (`useAuthStore`) com `user`, `plano` (espelha o `plano` de `/api/auth/sessao`: `premium`, `pedidosUsados`, `pedidosLimite`), `isAuthenticated`, `setUser(user, plano?)`, `logout()` — usa `persist` (localStorage) só para evitar flash de loading entre páginas; quem decide de verdade quem está logado é sempre `/api/auth/sessao`. Expõe `hasHydrated` para saber quando a leitura do localStorage já terminou.
- `app/lib/permissions.ts` é o único lugar que declara quais papéis acessam cada rota privada (`ROUTE_ACCESS`) e as permissões de ação da tela de Pedidos (`canManageOrders` — admin/garçom, edita e cria pedido; `canPrepareOrders` — admin/cozinha, inicia preparo e marca como pronto). Uma rota nova só precisa de uma entrada em `ROUTE_ACCESS`; uma ação nova de tela reaproveita ou estende essas funções.
- `ProtectedRoute` (`app/components/ProtectedRoute.tsx`) é o componente que aplica a proteção — página privada envolve seu conteúdo com `<ProtectedRoute>{...}</ProtectedRoute>` (veja `/pedidos`, `/produtos`, `/configuracoes`, `/funcionarios`, `/premium-upgrade`). A cada montagem ele chama `GET /api/auth/sessao` (nunca confia só no `localStorage` — cookie inválido/expirado ou conta desativada precisam refletir na hora, não só quando o JWT vencer sozinho) e sincroniza `user`+`plano` na store; navegações já autenticadas renderizam na hora a partir do cache e revalidam por trás, sem flash de loading. Sem sessão válida, redireciona para `/login?redirect=<rota>`, que depois do login volta para essa mesma rota; com papel não permitido, mostra `AccessDenied`. `/preview`, `/login` e `/cadastro` ficam fora dessa proteção (públicas).
- `AppShell`/`Sidebar` escondem do menu os itens cuja rota o papel atual não acessa, consultando o mesmo `ROUTE_ACCESS`.
- `/premium-upgrade` é a página de upgrade de plano (design Figma node 165:1265), aberta pelo botão "Seja Premium" do `SidebarPlanIndicators` (via `onUpgradeClick`, passado por `AppShell`). Não usa `AppShell`/`Sidebar` — tem seu próprio navbar/rodapé de página cheia, como `/login`/`/cadastro`. Os dois cards de plano (`PricingPlanCard` em `app/premium-upgrade/_components/`) reagem ao `plano.premium` real da store: o card do plano atual mostra o rótulo "Plano atual" e botão desabilitado ("Seu plano atual"); o outro mostra o botão de ação ("Assinar Premium"/"Voltar ao plano gratuito"). Sem endpoint de cobrança ainda, os botões de ação não fazem nada até serem plugados a um fluxo real.

### Next.js
- Ao criar ou alterar componentes e páginas, siga a skill react-best-practices.
- Use "use client" só em componentes com estado ou evento, como clique e digitação.
- Use o componente Image do Next para imagens e Link para navegação entre páginas.

### HTML e acessibilidade
- Use button para ações, Link para navegação, label em todo campo de formulário e alt em toda imagem.
- Todo elemento clicável funciona pelo teclado e mostra foco visível.
- Todo elemento clicável, como botões, links e cards clicáveis, usa cursor-pointer.

### Layout
- Monte primeiro a versão para celular e depois ajuste para telas maiores.
- Não copie do Figma posições fixas em pixels. Use flex e grid.

### Ícones
- Use os ícones do react-icons em todo o projeto, sem criar SVG na mão.
- A família escolhida para o projeto é **Lucide** (`react-icons/lu`), decidida a partir do design system do Figma — use sempre essa família, não misture com outras.
- Importe apenas os ícones usados em cada arquivo, nunca o pacote inteiro (ex.: `import { LuTag } from "react-icons/lu"`, nunca `import * as Icons from "react-icons"`).
