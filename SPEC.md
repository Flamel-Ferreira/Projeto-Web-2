# SPEC.md — LifePulse

> **Fase 1 — Especificação (SDD)**
> Documento de referência único para implementação, revisão e QA.
> **Status:** decisões D1–D10 aplicadas (v1.1). Nenhum arquivo de código foi criado.
> **Versão:** 1.1 · **Data:** 2026-11-14

---

## 1. Visão geral

**LifePulse** é uma aplicação web de produtividade *front-end only* que reúne quatro pilares — **Foco (Pomodoro)**, **Hábitos**, **Tarefas (Kanban)** e **Anotações (Markdown)** — sob uma **Visão Geral** que resume o dia do usuário.

| Item | Definição |
|---|---|
| Tipo | SPA (Single Page Application), sem backend |
| Stack | React 18 + Vite (JavaScript) + Tailwind CSS |
| Ícones | `lucide-react` |
| Markdown | `react-markdown` |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` |
| Roteamento | `react-router-dom` (v6) com `HashRouter` — URLs funcionam em qualquer hospedagem estática |
| Persistência | `localStorage`, isolado por usuário, com versionamento de schema |
| Segurança | Web Crypto API — **SHA-256** + *salt* aleatório por usuário (senha nunca em texto puro) |
| Idioma | pt-BR |
| Tema | Dark mode fixo (identidade dos protótipos) |

### 1.1 Princípios de experiência
1. **Baixo ruído cognitivo**: fundo quase preto, superfícies elevadas discretas, 1 cor de acento (violeta), verde apenas para conclusão.
2. **Hierarquia por espaço e tipografia**, não por bordas fortes.
3. **Feedback imediato**: toda ação gera mudança visual e/ou *toast*.
4. **Persistência silenciosa**: nada de botão "salvar" em telas de leitura; salvar é automático em notas.

---

## 2. Estrutura de pastas

```
Projeto/
├─ index.html
├─ package.json
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ .gitignore
├─ SPEC.md
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ index.css
   │
   ├─ routes/
   │  ├─ AppRoutes.jsx            # /entrar, /cadastro, /, /foco, /habitos, /tarefas, /notas
   │  └─ ProtectedRoute.jsx       # Guarda de rota (sessão) + redirecionamentos
   │
   ├─ pages/
   │  ├─ AuthPage.jsx            # Login + Cadastro (sem protótipo → mesma identidade)
   │  ├─ OverviewPage.jsx        # Visão Geral
   │  ├─ FocusPage.jsx           # Foco / Pomodoro
   │  ├─ HabitsPage.jsx          # Hábitos
   │  ├─ TasksPage.jsx           # Tarefas / Kanban
   │  └─ NotesPage.jsx           # Anotações
   │
   ├─ components/
   │  ├─ layout/
   │  │  ├─ AppShell.jsx         # Sidebar + área de conteúdo + drawer mobile
   │  │  ├─ Sidebar.jsx
   │  │  ├─ NavItem.jsx
   │  │  ├─ Brand.jsx
   │  │  ├─ ProfileMenu.jsx      # Popover com "Sair"
   │  │  └─ MobileTopbar.jsx     # Hambúrguer + logo
   │  │
   │  ├─ ui/
   │  │  ├─ Button.jsx
   │  │  ├─ IconButton.jsx
   │  │  ├─ Input.jsx
   │  │  ├─ Select.jsx
   │  │  ├─ FieldLabel.jsx
   │  │  ├─ SegmentedControl.jsx
   │  │  ├─ Modal.jsx
   │  │  ├─ Badge.jsx
   │  │  ├─ ProgressBar.jsx
   │  │  ├─ EmptyState.jsx
   │  │  ├─ ToastViewport.jsx
   │  │  ├─ PageHeader.jsx
   │  │  └─ ConfirmDialog.jsx
   │  │
   │  ├─ auth/
   │  │  ├─ AuthCard.jsx         # Card central com logo e tabs
   │  │  ├─ LoginForm.jsx
   │  │  ├─ RegisterForm.jsx
   │  │  └─ PasswordStrength.jsx
   │  │
   │  ├─ pomodoro/
   │  │  ├─ PomodoroRing.jsx     # SVG circular com glow
   │  │  ├─ ModeTabs.jsx         # Foco 25m / Pausa Curta 5m / Pausa Longa 15m
   │  │  ├─ TimerControls.jsx
   │  │  ├─ TaskPicker.jsx       # Popover de seleção de tarefa
   │  │  └─ CurrentTaskBar.jsx
   │  │
   │  ├─ tasks/
   │  │  ├─ TaskBoard.jsx        # DndContext + colunas
   │  │  ├─ TaskColumn.jsx
   │  │  ├─ TaskCard.jsx
   │  │  ├─ TaskModal.jsx
   │  │  └─ TaskBadges.jsx       # Tag de categoria + prioridade
   │  │
   │  ├─ habits/
   │  │  ├─ HabitTable.jsx
   │  │  ├─ HabitRow.jsx
   │  │  ├─ HabitDayCell.jsx
   │  │  ├─ StreakBadge.jsx
   │  │  ├─ ConsistencyBar.jsx
   │  │  └─ HabitModal.jsx
   │  │
   │  ├─ notes/
   │  │  ├─ NotesPanel.jsx       # Coluna esquerda (lista)
   │  │  ├─ NoteListItem.jsx
   │  │  ├─ NoteReader.jsx       # Coluna direita (leitura)
   │  │  ├─ NoteEditorForm.jsx   # Edição inline
   │  │  ├─ NoteModal.jsx        # Nova nota
   │  │  └─ MarkdownView.jsx     # react-markdown + estilos
   │  │
   │  └─ overview/
   │     ├─ OverviewHeader.jsx
   │     ├─ FocusSummaryCard.jsx
   │     ├─ PriorityTasksCard.jsx
   │     ├─ TodayHabitsCard.jsx
   │     └─ QuoteBar.jsx
   │
   ├─ context/
   │  ├─ AppProviders.jsx        # Composição de todos os providers
   │  ├─ ToastContext.jsx
   │  ├─ AuthContext.jsx
   │  ├─ TasksContext.jsx
   │  ├─ HabitsContext.jsx
   │  ├─ NotesContext.jsx
   │  ├─ PomodoroContext.jsx
   │  └─ UIContext.jsx           # estado do drawer mobile (efêmero)
   │
   └─ utils/
      ├─ storage.js              # get/set/remove + JSON seguro + namespace
      ├─ crypto.js               # SHA-256 + salt + verify
      ├─ ids.js                  # ids legíveis (tsk_, hab_, note_)
      ├─ date.js                 # hoje, semana, streak, tempo relativo
      ├─ validators.js           # e-mail, senha, campos obrigatórios
      ├─ constants.js            # enums, labels, cores, chaves
      ├─ markdown.js             # resumo em 2 linhas, contagem de palavras
      └─ cn.js                   # concatenação de classes
```

### 2.1 Dependências (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.x",
    "lucide-react": "^0.4xx",
    "react-markdown": "^9.x",
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "@dnd-kit/utilities": "^3.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.4.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```
> `@dnd-kit/sortable` e `@dnd-kit/utilities` são submódulos do mesmo ecossistema liberado (`@dnd-kit/core`).

---

## 3. Design system (extraído dos protótipos)

### 3.1 Paleta

| Token | Hex / valor | Uso |
|---|---|---|
| `bg` | `#050506` | Fundo da aplicação |
| `sidebar` | `#0B0B0C` | Menu lateral |
| `surface` | `#111112` | Cards, tabela, painéis |
| `surface-2` | `#171718` | Cards internos, popovers |
| `surface-3` | `#1F1F21` | Item ativo de menu, campos |
| `border` | `rgba(255,255,255,0.07)` | Divisórias e contornos |
| `text` | `#F4F4F5` | Títulos e texto principal |
| `text-secondary` | `#A1A1AA` | Subtítulos, labels |
| `text-muted` | `#6B6B75` | Metadados, placeholders |
| `primary` | `#6C5CE7` | Acento, botões, anel do timer |
| `primary-light` | `#A9A2FB` | Texto/realce sobre violeta, botão "Nova Nota" |
| `primary-strong` | `#5A49D6` | Hover/pressed |
| `primary-soft` | `rgba(108,92,231,0.14)` | Fundos de badge/aba ativa |
| `success` | `#22C55E` | Hábito concluído, dot "ao vivo", sequência |
| `success-soft` | `rgba(34,197,94,0.12)` | Fundo de badge verde |
| `danger` | `#F43F5E` | Erros, exclusão |
| `warning` | `#F59E0B` | Senha fraca, avisos |
| `pink` | `#D946EF` | Categoria "Pessoal" |
| `slate` | `#94A3B8` | Prioridade "Baixa" |

Gradientes:
- **Botão primário:** `linear-gradient(90deg,#7B6CF6 0%,#5F4BE8 100%)` + `shadow-[0_8px_24px_-6px_rgba(108,92,231,0.55)]`.
- **Logo:** quadrado `rounded-xl` com gradiente violeta → `#8B7CF7`, ícone branco `Zap`, glow externo violeta.
- **Hábito concluído:** `linear-gradient(135deg,#22C55E,#16A34A)` com leve glow verde.
- **Cabeçalho da página Tarefas:** gradiente radial sutil violeta→ciano no topo (presente no protótipo), opacidade ≤ 25%.

### 3.2 Tipografia
- Família: `Inter`, fallback `system-ui, -apple-system, "Segoe UI", sans-serif` (declarada em `index.css`; sem dependência extra).
- Escala:
  | Papel | Tamanho / peso |
  |---|---|
  | H1 de página | 36–40px / 600, tracking `-0.02em` |
  | Título de card | 18–20px / 600 |
  | Corpo | 14–15px / 400, `leading-relaxed` |
  | Label de formulário | 11–12px / 500, uppercase, tracking `0.12em`, cor `text-secondary` |
  | Metadado | 11–12px / 400, `text-muted` |
  | Timer | 56–64px / 600, tabular-nums |

### 3.3 Formas, espaçamento e foco
- Raio: input/botão `10px`, card `14–16px`, modal `20px`, badge `6px`, célula de hábito `8px`.
- Grade: sidebar `256px`; conteúdo `px-6 lg:px-10`, `max-w-[1180px]`; gaps `16–24px`.
- Alturas de controle: `sm 32px`, `md 40px`, `lg 48px`.
- Foco visível: `outline-none ring-2 ring-primary/60 ring-offset-2 ring-offset-bg` em todos os interativos.
- Scrollbar customizada discreta (largura 8px, thumb `#2A2A2E`).
- Movimento: transições `150–200ms ease-out`; `prefers-reduced-motion` desativa animações não essenciais.

---

## 4. Modelo de dados (`localStorage`)

### 4.1 Namespaces e chaves

| Chave | Conteúdo | Escopo |
|---|---|---|
| `lifepulse:v1:users` | `{ schemaVersion, users: User[] }` | Global (contas) |
| `lifepulse:v1:session` | `{ userId, email, createdAt }` | Global (sessão ativa) |
| `lifepulse:v1:profile:<userId>` | `Profile` | Por usuário |
| `lifepulse:v1:tasks:<userId>` | `{ schemaVersion, items: Task[] }` | Por usuário |
| `lifepulse:v1:habits:<userId>` | `{ schemaVersion, items: Habit[] }` | Por usuário |
| `lifepulse:v1:notes:<userId>` | `{ schemaVersion, items: Note[] }` | Por usuário |
| `lifepulse:v1:pomodoro:<userId>` | `PomodoroState` | Por usuário |

Regras:
- `schemaVersion` numérico; ao ler versão desconhecida → migrar ou resetar apenas aquele namespace, emitindo toast de aviso.
- Toda leitura passa por `safeParse` com fallback tipado (nunca quebra a aplicação com JSON inválido).
- Chaves de dados **sempre** incluem `userId`; trocar de conta nunca vaza dados.
- `localStorage` indisponível/quota excedida → toast de erro e modo somente memória.

### 4.2 `User`
```json
{
  "id": "usr_9f3c1a",
  "email": "alex@workspace.io",
  "name": "Alex Rivera",
  "password": "sha256$<saltHex>$<digestHex>",
  "createdAt": "2026-11-14T12:00:00.000Z",
  "lastLoginAt": "2026-11-14T12:00:00.000Z"
}
```
- `email`: obrigatório, `trim().toLowerCase()`, único na lista, regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`.
- `name`: **obrigatório**, 2–40 caracteres, sem derivação automática; vem do campo "Nome" do cadastro e alimenta sidebar e saudação.
- `password`: `sha256$<salt 16 bytes hex>$<SHA-256(salt + ":" + senha) hex>`; **jamais** a senha em claro.

### 4.3 `Profile`
```json
{
  "userId": "usr_9f3c1a",
  "displayName": "Alex Rivera",
  "plan": "Pro Workspace",
  "avatarColor": "primary",
  "createdAt": "2026-11-14T12:00:00.000Z"
}
```

### 4.4 `Task`
```json
{
  "id": "tsk_a1b2c3",
  "title": "Revisar documentação da API",
  "status": "todo",
  "category": "work",
  "priority": "medium",
  "order": 0,
  "createdAt": "2026-11-14T12:10:00.000Z",
  "updatedAt": "2026-11-14T12:10:00.000Z",
  "completedAt": null
}
```
Enums:
- `status`: `todo` ("A Fazer") · `in_progress` ("Em Andamento") · `done` ("Concluído").
- `category`: `work` ("Trabalho") · `personal` ("Pessoal") · `studies` ("Estudos").
- `priority`: `low` ("Baixa") · `medium` ("Média") · `high` ("Alta"); peso `0/1/2`.
- `order`: inteiro ≥ 0, posição dentro da coluna.

### 4.5 `Habit`
```json
{
  "id": "hab_m4n5o6",
  "name": "Meditar 10 minutos",
  "category": "productivity",
  "days": [1, 2, 3, 4, 5, 6, 0],
  "goal": 1,
  "history": { "2026-11-12": true, "2026-11-13": true },
  "createdAt": "2026-11-01T09:00:00.000Z",
  "archived": false
}
```
- `category`: `health` ("Saúde") · `studies` ("Estudos") · `productivity` ("Produtividade") · `mind` ("Mente").
- `days`: array de `0–6` com **0 = domingo** (padrão JS). Exibição sempre em ordem Seg→Dom.
- `goal`: inteiro `1..5` ("N vezes ao dia"). Marcar/desmarcar é binário por dia (`history[dateKey] = true/false`); a meta é informativa e compõe o texto "1 vez ao dia".
- `history`: chave `YYYY-MM-DD` em **data local** (não UTC).

### 4.6 `Note`
```json
{
  "id": "note_x7y8z9",
  "title": "Ideias para o Projeto",
  "notebook": "focus",
  "content": "A concepção deste projeto busca...\n\n### Diretrizes Principais\n\n- ...",
  "createdAt": "2026-11-14T14:00:00.000Z",
  "updatedAt": "2026-11-14T14:32:00.000Z"
}
```
- `notebook`: `focus` ("Foco & Arq.") · `ideas` ("Ideias & Insights") · `personal` ("Pessoal").
- `content`: Markdown puro; pode ser vazio (nota em branco é válida, exibe *empty state*).

### 4.7 `PomodoroState`
```json
{
  "mode": "focus",
  "durations": { "focus": 1500, "short": 300, "long": 900 },
  "remaining": 1500,
  "isRunning": false,
  "endsAt": null,
  "sessionCount": 1,
  "sessionDate": "2026-11-14",
  "cycleLength": 4,
  "currentTaskId": "tsk_a1b2c3",
  "updatedAt": "2026-11-14T12:00:00.000Z"
}
```
- `remaining`: segundos restantes no momento da pausa/última gravação.
- `endsAt`: epoch ms (`Date.now() + remaining*1000`) enquanto `isRunning`; base para retomar após recarregar.
- `sessionCount`: sessões de foco concluídas **no dia** (`sessionDate`); zera na virada do dia.
- `currentTaskId`: tarefa vinculada (pode ser `null`).

### 4.8 Conta nova (sem dados de demonstração)

Toda conta é criada **vazia**: `tasks`, `habits` e `notes` iniciam como listas vazias e o Pomodoro inicia no padrão (Foco 25:00, sessão 0 de 4, sem tarefa vinculada).

Consequências obrigatórias:
- Cada tela precisa de um **empty state** próprio, com ícone, título, frase curta e CTA quando fizer sentido:
  - Visão Geral: "Nenhuma tarefa prioritária" / "Nenhum hábito para hoje" (cards mantêm a estrutura e o timer funcional).
  - Foco: barra "Nenhuma tarefa selecionada" + ação "Escolher tarefa" (se não houver tarefas pendentes, o seletor mostra "Crie uma tarefa primeiro").
  - Hábitos: "Você ainda não criou hábitos" + botão "Novo Hábito".
  - Tarefas: cada coluna vazia mostra seu próprio convite para adicionar cartão; quadro vazio mantém as 3 colunas.
  - Notas: lista vazia com CTA "Nova Nota"; painel direito com "Selecione uma nota".
- Nenhuma constante de seed, nenhum dado fictício e nenhum `userId` de exemplo no código.
- O perfil é criado com o nome informado no cadastro; nenhuma outra informação é pré-preenchida.

---

## 5. Regras de negócio

### 5.1 Autenticação e sessão
| ID | Regra |
|---|---|
| RN-01 | E-mail é normalizado (`trim` + `toLowerCase`) antes de validar, salvar e comparar. |
| RN-02 | Cadastro valida: nome (2–40 caracteres), e-mail válido, e-mail não cadastrado, senha ≥ 8 caracteres com **1 maiúscula, 1 minúscula e 1 número**, confirmação idêntica. |
| RN-03 | Senha é armazenada como `sha256$salt$digest`; `crypto.subtle.digest('SHA-256', …)`; nenhum dado sensível em claro. |
| RN-04 | Cadastro bem-sucedido → toast de sucesso + **login automático** + conta vazia (sem seed) + `navigate('/')`. |
| RN-05 | Login inválido (e-mail inexistente **ou** senha incorreta) → toast de erro genérico: "E-mail ou senha incorretos." (não revela qual campo falhou). |
| RN-06 | Sessão persiste em `lifepulse:v1:session`; ao abrir o app, sessão válida entra direto no app. |
| RN-07 | Logout remove **apenas** a sessão; dados do usuário permanecem. Pausa o Pomodoro e faz `navigate('/entrar')`. |
| RN-08 | Todas as consultas/gravações de tarefas, hábitos, notas e pomodoro usam o `userId` da sessão. |
| RN-09 | Rotas privadas (`/`, `/foco`, `/habitos`, `/tarefas`, `/notas`) são protegidas: sem sessão → redireciona para `/entrar`; com sessão, `/entrar` e `/cadastro` redirecionam para `/`. Aba `storage` sincroniza logout/login entre abas. |

### 5.2 Tarefas
| ID | Regra |
|---|---|
| RN-10 | Ordenação padrão: `priority` desc (`high > medium > low`), depois `order` asc, depois `createdAt` asc. As colunas do Kanban preservam a ordem manual (`order`). |
| RN-11 | "Prioritárias" na Visão Geral = até **3** tarefas não concluídas ordenadas por prioridade; empate segue `order`. |
| RN-12 | Badge do card de prioridades = `concluídas / total exibido` (ex.: "1 de 3 concluídas"). Contagem global aparece no rodapé do card e nos contadores das colunas. |
| RN-13 | Cada coluna exibe contagem de tarefas; "Concluído" exibe check verde em cada card. |
| RN-14 | "+ Adicionar cartão" abre o modal já com a **coluna inicial** correspondente selecionada. "Nova Tarefa" abre com `todo`. |
| RN-15 | Concluir tarefa define `status='done'` e `completedAt=now`; reabrir limpa `completedAt` e move para `todo`. |
| RN-16 | Drag & drop move entre colunas **e** reordena dentro da coluna; `order` é recalculado como índice sequencial em ambas as colunas afetadas. |
| RN-17 | Título obrigatório (1–120 caracteres); sem descrição (não previsto nos protótipos). |
| RN-18 | Excluir tarefa exige confirmação; se era a tarefa do Pomodoro, `currentTaskId` vira `null`. |
| RN-19 | Contagem de concluídas/não concluídas é derivada (nunca persistida). |

### 5.3 Hábitos
| ID | Regra |
|---|---|
| RN-20 | "Hábitos de hoje" = hábitos ativos cujo `days` contém o dia da semana atual. |
| RN-21 | **Consistência diária** = `concluídosHoje / obrigatóriosHoje × 100`, arredondada. Se `obrigatóriosHoje = 0`, exibir `0%` e texto "Nenhum hábito para hoje". |
| RN-22 | **Sequência (streak)** = dias agendados consecutivos concluídos, contando de trás para frente. Regra: parte de hoje; se hoje é agendado e **não** concluído, hoje é ignorado (não quebra); dias não agendados são pulados; quebra no primeiro dia agendado não concluído. |
| RN-23 | Marcar hábito grava `history[YYYY-MM-DD] = true` (desmarcar grava `false`, sem remover a chave). |
| RN-24 | Só é possível alternar **hoje e dias passados da semana corrente**; dias futuros ficam bloqueados (opacidade reduzida + tooltip "Dia futuro"). |
| RN-25 | Dias não pertencentes à frequência do hábito recebem estilo "não obrigatório": célula mais escura (`#131315`), borda tracejada sutil, sem ícone, cursor `default`, `aria-disabled`. |
| RN-26 | A semana exibida é sempre Seg→Dom da semana corrente. |
| RN-27 | Criar hábito exige nome (1–60), ≥ 1 dia de frequência e meta `1..5`; categoria padrão "Saúde"; dias padrão = todos. |
| RN-28 | Editar hábito reutiliza o modal (título "Editar Hábito"); excluir exige confirmação e remove todo o histórico. |
| RN-29 | "Sequência atual" da Visão Geral = **maior** streak entre os hábitos de hoje com pelo menos 1 dia concluído. |
| RN-30 | A tabela ordena por `createdAt` asc (ordem de criação estável). |

### 5.4 Notas
| ID | Regra |
|---|---|
| RN-31 | Lista ordenada por `updatedAt` desc. |
| RN-32 | Resumo do card = **duas primeiras linhas não vazias** do conteúdo, com sintaxe Markdown removida, truncado em 2 linhas (`line-clamp-2`). |
| RN-33 | Tempo relativo do card: hoje → `HH:mm`; ontem → `Ontem`; 2–6 dias → dia da semana (ex.: `quinta-feira`); ≥ 7 dias → `21 Out` (dia + mês abreviado, sem "de"). Implementação simples em `formatNoteTimestamp`. |
| RN-34 | Ao criar nota, ela é selecionada automaticamente. Ao excluir, seleciona a primeira restante (ou nenhuma). A exclusão exige confirmação. |
| RN-35 | Detalhe exibe: caderno em caixa alta (`CADERNO / FOCO & ARQUITETURA`), título, "Última edição hoje às HH:mm • N palavras" e conteúdo em Markdown estilizado. O rodapé do painel direito contém uma **área fixa de exclusão** ("Excluir nota", ícone `Trash2`, tom `danger`), sempre visível. |
| RN-36 | Contagem de palavras ignora espaços extras e quebras vazias (`content.trim().split(/\s+/).filter(Boolean).length`). |
| RN-37 | Título obrigatório (1–80); caderno padrão `focus`; conteúdo opcional. |
| RN-38 | Rodapé da lista: "N notas guardadas"/"1 nota guardada". |
| RN-39 | Edição inline no painel direito (botão "Editar" → título + caderno + textarea + Salvar/Cancelar); salvar atualiza `updatedAt` e emite toast. |

### 5.5 Pomodoro
| ID | Regra |
|---|---|
| RN-40 | Modos e durações: Foco 25m = 1500s · Pausa Curta 5m = 300s · Pausa Longa 15m = 900s. |
| RN-41 | Trocar de modo para o timer, aplica a duração do novo modo e atualiza a persistência (pede confirmação apenas se `isRunning`). |
| RN-42 | Iniciar → `isRunning=true`, `endsAt=now+remaining*1000`. Pausar → `remaining` recalculado, `endsAt=null`. Retomar → novo `endsAt`. |
| RN-43 | Ao recarregar com `isRunning`, recalcular `remaining = max(0, ceil((endsAt - now)/1000))`; se ≤ 0, finalizar sessão. |
| RN-44 | Ao chegar a 0: parar, tocar bipe curto (WebAudio, sem dependência), emitir toast, incrementar `sessionCount` se modo = foco, e **avançar automaticamente** o modo: foco → pausa curta (a cada 4º foco → pausa longa); pausa → foco. `remaining` recebe a duração do novo modo. |
| RN-45 | Resetar → para o timer e restaura `remaining` para a duração do modo atual (não altera o modo). |
| RN-46 | Anel de progresso = `remaining / duration`; o traço **diminui** conforme o tempo passa; `stroke-linecap="round"`, glow violeta. |
| RN-47 | Rótulo sob o tempo: foco → `● SESSÃO FOCADA` (verde); pausa → `PAUSA CURTA`/`PAUSA LONGA` (âmbar). |
| RN-48 | Seleção de tarefa lista apenas tarefas não concluídas (todo + em andamento), com busca por título, opção "Nenhuma tarefa" e "Trocar". A escolha persiste. |
| RN-49 | Tarefa concluída/excluída deixa de aparecer no seletor; se era a atual, o vínculo é limpo. |
| RN-50 | Estado do timer é por usuário e persiste entre reloads; trocar de conta carrega o timer daquele usuário. |
| RN-51 | "Sessão X de 4 prevista para hoje" = `min(sessionCount+1, 4)` de `cycleLength = 4`. |

### 5.6 Visão Geral
| ID | Regra |
|---|---|
| RN-52 | Saudação por horário: 05–11 "Bom dia", 12–17 "Boa tarde", 18–04 "Boa noite" + primeiro nome. |
| RN-53 | Subtítulo = data por extenso (`Quarta-feira, 24 de Outubro`) + `•` + frase de contexto por período ("Concentração otimizada para o período matutino/vespertino/noturno"). |
| RN-54 | Os três cards resumem, em tempo real, Foco, Tarefas e Hábitos; qualquer ação (iniciar timer, marcar tarefa/hábito) reflete imediatamente na Visão Geral. |
| RN-55 | O card de foco permite iniciar/pausar/resetar e trocar modo sem sair da página. |
| RN-56 | O rodapé exibe citação fixa e a versão `LifePulse v2.4`. |

---

## 6. Fluxos de interação

### 6.1 Inicialização
```
App monta
  → HashRouter resolve a rota
      ├─ rota privada sem sessão → redireciona /entrar
      ├─ rota de auth com sessão → redireciona /
      └─ rota privada com sessão → AppShell + carrega Profile + Tasks + Habits + Notes + Pomodoro do userId
                                    → reconcilia timer (endsAt)
```

### 6.2 Cadastro
```
/entrar → aba "Criar Conta" (ou /cadastro) → preenche Nome, E-mail, Senha, Confirmar
  → valida em tempo real (nome, e-mail, força da senha + confirmação)
  → submit inválido: erros inline + toast de erro (sem criar conta)
  → submit válido: hash SHA-256 → grava usuário → cria profile (conta vazia)
  → toast "Conta criada com sucesso. Bem-vindo(a)!"
  → login automático → navigate('/') → Visão Geral
```

### 6.3 Login
```
Entrar → e-mail + senha → hash e compara
  ├─ sucesso → toast "Bem-vindo(a) de volta, {nome}" → Visão Geral
  └─ falha   → toast de erro "E-mail ou senha incorretos." + shake no card
```

### 6.4 Kanban
```
Nova Tarefa (topo) → modal (coluna inicial = "A Fazer")
"+ Adicionar cartão" (coluna) → modal (coluna inicial = coluna clicada)
  → Criar Tarefa → card no topo/fim da coluna, toast de sucesso
Arrastar card → DragOverlay segue o cursor → soltar:
  ├─ mesma coluna → reordena
  ├─ outra coluna → muda status (done ⇄ others ajusta completedAt)
  └─ fora de área válida → cancela (volta à origem)
Card concluído → check verde + título com opacidade reduzida
```

### 6.5 Hábitos
```
Novo Hábito → modal (nome, categoria, frequência, meta)
  → Salvar Hábito → linha entra na tabela + toast
Célula do dia (hoje/passado, dia obrigatório) → alterna verde ⇄ neutro
  → recalcula sequência da linha + consistência do dia
Dias não obrigatórios → célula apagada, não clicável
```

### 6.6 Notas
```
Nova Nota → modal (título, caderno, conteúdo rápido) → Criar Nota
  → nota selecionada + toast; lista reordenada
Selecionar nota → painel direito renderiza Markdown
Editar → formulário inline → Salvar → updatedAt + toast + lista reordenada
Excluir nota (área fixa no rodapé do painel direito) → confirmação → remove → seleciona próxima
```

### 6.7 Pomodoro
```
Modo → altera duração/anel
Iniciar → conta regressiva + anel esvaziando (+ "Pausar")
Resetar → volta ao tempo cheio do modo
Trocar tarefa → popover lista tarefas pendentes → seleciona
Tempo esgota → bipe + toast + avanço automático de modo
```

### 6.8 Logout
```
Clicar no perfil (rodapé da sidebar) → popover com "Sair"
  → sessão removida + timer pausado → navigate('/entrar')
```

---

## 7. Contratos de componentes e telas

> Convenção: `?` = opcional. Todos os contextos expõem um hook dedicado (`useAuth()`, `useTasks()`, etc.) que lança erro se usado fora do provider.

### 7.1 Contextos (APIs)

```ts
// AuthContext
{
  user: Profile | null,
  isAuthenticated: boolean,
  isBooting: boolean,
  login(email: string, password: string): Promise<{ ok: boolean, error?: string }>,
  register(input: { name: string, email: string, password: string, confirm: string }): Promise<{ ok: boolean, error?: string }>,
  logout(): void,
  updateProfile(patch: { displayName?: string }): void
}

// TasksContext
{
  tasks: Task[],
  counts: { todo: number, in_progress: number, done: number, total: number, completed: number, pending: number },
  byStatus(status): Task[],
  priorityTasks(limit = 3): Task[],
  addTask(input: { title, status, category, priority }): Task,
  updateTask(id, patch): void,
  deleteTask(id): void,
  toggleComplete(id): void,
  moveTask(id, toStatus, toIndex): void
}

// HabitsContext
{
  habits: Habit[],
  weekDates: string[],            // 7 ISO dates Seg→Dom
  todayKey: string,
  todayHabits: Habit[],
  dailyConsistency: { percent: number, completed: number, total: number },
  currentStreak: number,
  streakOf(id): number,
  addHabit(input: { name, category, days, goal }): Habit,
  updateHabit(id, patch): void,
  deleteHabit(id): void,
  toggleDay(id, dateKey): void
}

// NotesContext
{
  notes: Note[],
  selectedNote: Note | null,
  selectNote(id): void,
  addNote(input: { title, notebook, content }): Note,
  updateNote(id, patch): void,
  deleteNote(id): void,
  wordCountOf(note): number
}

// PomodoroContext
{
  mode: 'focus' | 'short' | 'long',
  duration: number,
  remaining: number,
  progress: number,               // 0..1 restante
  isRunning: boolean,
  formattedTime: string,          // "25:00"
  sessionCount: number,
  cycleLength: number,
  currentTask: Task | null,
  setMode(mode): void,
  start(): void,
  pause(): void,
  reset(): void,
  selectTask(taskId | null): void
}

// ToastContext
{
  toasts: Array<{ id, message, type: 'success' | 'error' | 'info', duration?: number }>,
  showToast(message, type?, options?): void,
  dismissToast(id): void
}

// UIContext — somente estado efêmero do drawer mobile
{
  isSidebarOpen: boolean,
  openSidebar(): void,
  closeSidebar(): void
}
```

> Navegação, aba ativa e proteção de rota são responsabilidade do `react-router-dom`: `NavLink` (`aria-current`), `useNavigate`, `useLocation` e o componente `ProtectedRoute`. Não existe mais `activeTab` em contexto nem persistência de aba — a URL é a fonte da verdade.

### 7.2 Layout

| Componente | Props |
|---|---|
| `AppShell` | `{ children? }` — layout route com `<Outlet />`; usa `UIContext`; sidebar fixa ≥ `lg`, drawer + overlay < `lg`; fecha o drawer em mudança de rota (`useLocation`). |
| `Sidebar` | `{ user, onLogout }` — itens são `NavLink` para `/`, `/foco`, `/habitos`, `/tarefas`, `/notas`; **sem ícones**. |
| `Brand` | `{ size?: 'sm' \| 'md', withSubtitle?: boolean }` — único elemento com ícone (`Zap`) no topo. |
| `NavItem` | `{ to, label }` — texto puro, item ativo com fundo `surface-3` e `aria-current="page"`. |
| `ProfileMenu` | `{ user: { displayName, plan }, onLogout }` — popover ancorado no rodapé, `Escape` fecha, clique fora fecha, "Sair" com ícone `LogOut`. |
| `MobileTopbar` | `{ onOpenMenu }` |
| `AppRoutes` | `{}` — árvore de rotas: `/entrar`, `/cadastro`, layout protegido com `/`, `/foco`, `/habitos`, `/tarefas`, `/notas`, fallback `*` → `/`. |
| `ProtectedRoute` | `{ children }` — sem sessão → `<Navigate to="/entrar" replace />`; autenticado em rota de auth → `<Navigate to="/" replace />`. |

### 7.3 UI base

| Componente | Props principais |
|---|---|
| `Button` | `{ children, variant?: 'primary' \| 'secondary' \| 'ghost' \| 'outline' \| 'danger', size?: 'sm' \| 'md' \| 'lg', icon?: LucideIcon, iconRight?: LucideIcon, loading?: boolean, disabled?, fullWidth?, type?, onClick?, ariaLabel? }` |
| `IconButton` | `{ icon, label (obrigatório p/ a11y), variant?, size?, onClick }` |
| `Input` | `{ id, label?, type?, value, onChange, placeholder?, error?, hint?, icon?, autoComplete?, disabled?, required?, inputMode? }` |
| `Select` | `{ id, label?, value, onChange, options: {value,label}[], disabled? }` |
| `FieldLabel` | `{ htmlFor?, children, hint? }` |
| `SegmentedControl` | `{ options: {value,label,icon?}[], value, onChange, columns?: number, size?: 'sm' \| 'md', name }` — usado em modo de timer, coluna/categoria/prioridade e tabs de auth. |
| `Modal` | `{ open, onClose, title, description?, children, footer?, size?: 'sm' \| 'md' \| 'lg', closeOnBackdrop?: boolean }` — portal, foco inicial no modal, trap de foco, `Escape`, `aria-modal`, bloqueio de scroll do body. |
| `Badge` | `{ children, tone?: 'purple' \| 'pink' \| 'green' \| 'slate' \| 'amber' \| 'neutral', size?: 'sm' \| 'md' }` |
| `ProgressBar` | `{ value: number, tone?: 'success' \| 'primary', label?: string }` — `role="progressbar"` com `aria-valuenow`. |
| `EmptyState` | `{ icon, title, description, action? }` |
| `PageHeader` | `{ eyebrow?, title, subtitle?, action?: ReactNode }` |
| `ConfirmDialog` | `{ open, title, description, confirmLabel?, destructive?, onConfirm, onCancel }` |
| `ToastViewport` | `{}` — portal `fixed top-4 right-4 z-[60]`, ícone por tipo, barra de progresso do auto-dismiss, `aria-live="polite"`. |

### 7.4 Autenticação

| Componente | Props / comportamento |
|---|---|
| `AuthPage` | `{}` — rota `/entrar` (aba Entrar) e `/cadastro` (aba Criar Conta); fundo `bg`, card central ~`440px`, logo + título "LifePulse" + subtítulo "Seu painel pessoal de foco e produtividade"; tabs sincronizadas com `useNavigate`; rodapé "LifePulse © 2025 • Produtividade e foco consciente." |
| `AuthCard` | `{ mode, onModeChange, children }` |
| `LoginForm` | `{ onSubmit({ email, password }), loading }` — erros inline + validação de e-mail; botão "Entrar →". |
| `RegisterForm` | `{ onSubmit({ name, email, password, confirm }), loading }` — **Nome obrigatório** (2–40), medidor de força, checklist (8+, maiúscula, minúscula, número), confirmação. |
| `PasswordStrength` | `{ password }` — 3 níveis (Fraca/Média/Forte), cor `danger`/`warning`/`success`, 4 requisitos com check. |

### 7.5 Visão Geral

| Componente | Props |
|---|---|
| `OverviewPage` | `{}` (consome todos os contextos) |
| `OverviewHeader` | `{ name, dateLabel, periodLabel }` |
| `FocusSummaryCard` | `{ mode, setMode, remaining, progress, isRunning, start, pause, reset, sessionCount, cycleLength }` |
| `PriorityTasksCard` | `{ tasks: Task[] (≤3), completedInList, totalCompleted, totalPending, onToggle }` |
| `TodayHabitsCard` | `{ habits: Habit[], consistency: { percent, completed, total }, currentStreak, onToggle }` |
| `QuoteBar` | `{ quote, author, version }` |

Layout: grid 3 colunas em `xl` (`1.05fr 1fr 1fr`), 2 em `md`, 1 em mobile; gap 20px; `QuoteBar` full width.

### 7.6 Foco

| Componente | Props |
|---|---|
| `FocusPage` | `{}` |
| `ModeTabs` | `{ mode, onChange, compact?: boolean }` |
| `PomodoroRing` | `{ remaining, duration, size?: number (280), stroke?: number (8), isRunning, label, sublabel? }` — SVG com track `#26262A` e progresso violeta + glow. |
| `TimerControls` | `{ isRunning, onStart, onPause, onReset }` — botão principal "Iniciar/Pausar" + `IconButton` `RotateCcw`. |
| `CurrentTaskBar` | `{ task, onOpenPicker, onClear }` — "Tarefa atual: {título}" com "Trocar ↗". |
| `TaskPicker` | `{ open, tasks, selectedId, onSelect, onClose }` — popover com busca e lista; `Esc` fecha. |

Layout: coluna central alinhada ao topo; timer 280px; controles 48px; barra de tarefa `max-w-md`; centralizado verticalmente na área útil.

### 7.7 Hábitos

| Componente | Props |
|---|---|
| `HabitsPage` | `{}` |
| `HabitTable` | `{ habits, weekDates, todayKey, onToggle, onEdit, onDelete }` — cabeçalho "HÁBITO · SEG…DOM · SEQUÊNCIA". |
| `HabitRow` | `{ habit, weekDates, todayKey, onToggle, onEdit, onDelete }` — ícone por categoria, nome, subcategoria, 7 células, `StreakBadge`, ações no hover (editar/excluir). |
| `HabitDayCell` | `{ state: 'done' \| 'pending' \| 'notRequired' \| 'future', label, onClick?, disabled? }` |
| `StreakBadge` | `{ days: number }` — pílula escura, ícone `Flame` verde, "N dias" (`0 dias` neutro). |
| `ConsistencyBar` | `{ percent, completed, total }` |
| `HabitModal` | `{ open, habit?: Habit \| null, onClose, onSubmit(values) }` — título/subtítulo mudam em edição. |

### 7.8 Tarefas

| Componente | Props |
|---|---|
| `TasksPage` | `{}` |
| `TaskBoard` | `{ tasks, onMove, onAddCard, onToggle, onDelete }` — `DndContext` + `SortableContext` por coluna, `PointerSensor` (distância 6px) + `KeyboardSensor`, `DragOverlay` com rotação/ escala leve. |
| `TaskColumn` | `{ status, label, accent, tasks, count, onAddCard, onToggle, onDelete }` |
| `TaskCard` | `{ task, onToggle, onDelete }` — tag de categoria, título, check quando concluída, ações no hover. |
| `TaskModal` | `{ open, initialStatus, onClose, onSubmit({ title, status, category, priority }) }` |
| `TaskBadges` | `{ category, priority, variant?: 'card' \| 'inline' }` |

### 7.9 Notas

| Componente | Props |
|---|---|
| `NotesPage` | `{}` |
| `NotesPanel` | `{ notes, selectedId, onSelect, onCreate }` — largura 340px fixa, botão "＋ Nova Nota", rodapé com contagem. |
| `NoteListItem` | `{ note, active, preview, timeLabel, onClick }` — barra violeta à esquerda quando ativo. |
| `NoteReader` | `{ note, wordCount, updatedLabel, onEdit, onDelete }` — vazio → `EmptyState` "Selecione uma nota". Cabeçalho com "Editar"; **rodapé fixo** com a área "Excluir nota" (`danger`) sempre visível. |
| `NoteEditorForm` | `{ note, onSave(patch), onCancel }` |
| `NoteModal` | `{ open, onClose, onSubmit({ title, notebook, content }) }` |
| `MarkdownView` | `{ content }` |

Layout ≥ `lg`: duas colunas `340px | 1fr`, altura `calc(100vh - 160px)`, painéis com scroll independente. Mobile: lista OU detalhe (com botão "Voltar").

---

## 8. Tela a tela (referência visual)

### 8.1 Login / Cadastro (sem protótipo — derivado dos modais)
- Página preta integral, conteúdo centralizado verticalmente, card `#101011` com borda `rgba(255,255,255,.06)`, `rounded-2xl`, padding 32px, largura 440px.
- Logo 44px com glow; título "LifePulse" 28px; subtítulo 13px `text-secondary`.
- Tab entre **Entrar** (`/entrar`) e **Criar Conta** (`/cadastro`); trocar de aba navega e preserva o card.
- Tabs em trilho `#0B0B0C` `rounded-lg`, item ativo `#262628` + texto branco.
- Campos do login: E-mail, Senha. Campos do cadastro: **Nome** (obrigatório, primeiro campo), E-mail, Senha, Confirmar Senha.
- Labels 12px; inputs 44px `bg-[#0F0F10]` borda `#26262A`, foco violeta com ring.
- CTA principal 48px, gradiente violeta, ícone `ArrowRight`.
- Erros: texto 12px `danger` abaixo do campo + borda `danger/60`.
- Rodapé fixo no bottom (16px do fim), 12px `text-muted`.

### 8.2 Visão Geral
- Cabeçalho: dot verde + "Modo de Foco Disponível" (11px, uppercase, tracking); H1 "Bom dia, {nome}"; subtítulo com data e período.
- Grid de 3 cards (`bg-surface`, borda, `rounded-2xl`, padding 24px, `min-h-[420px]`):
  1. **Temporizador de Foco** — ícone `Timer`, título 2 linhas, badge "Pomodoro"; `ModeTabs` compacto; anel 180px; "Iniciar" + reset; rodapé "● Sessão X de 4 prevista para hoje".
  2. **Tarefas Prioritárias** — ícone `ListChecks`, badge "1 de 3 concluídas", descrição curta, até 3 itens com checkbox, título (riscado se concluído) e linha `Categoria • Prioridade`; rodapé com totais.
  3. **Hábitos de Hoje** — ícone `Flame`, badge "3 de 4"; "Consistência Diária" + percentual e barra verde; lista de hábitos de hoje com caixas de check; rodapé "Sequência atual: N dias".
- `QuoteBar`: faixa `bg-surface/60`, citação à esquerda, "LifePulse v2.4" à direita.

### 8.3 Foco
- Conteúdo central; `ModeTabs` em trilho escuro com item ativo violeta claro; anel 280px com stroke 8px, glow; tempo 56px; status com dot; botões "Iniciar" (gradiente) e reset (quadrado escuro); barra "Tarefa atual" em `bg-surface-2` com "Trocar ↗".

### 8.4 Hábitos
- `PageHeader`: eyebrow "HÁBITOS", H1 "Meus Hábitos", subtítulo "Acompanhamento de consistência semanal", botão "+ Novo Hábito" à direita.
- Card tabela: header 11px uppercase `text-muted`; linhas `border-t border-white/5`, padding 16px; ícone em quadrado `surface-3`; nome 15px semibold; categoria 12px `text-muted`; células 30×30px; streak pill.
- Hover na linha: `bg-white/[0.02]` + ações editar/excluir à direita.

### 8.5 Tarefas
- Eyebrow "QUADRO SIMPLES • Organização diária"; H1 "Tarefas"; "＋ Nova Tarefa" à direita.
- 3 colunas `bg-[#101011]` borda, `rounded-2xl`, padding 16px; header com dot colorido (violeta/azul/violeta + verde em Concluído), título e contador em pill `#232325`; cards `bg-[#181819]` `rounded-xl` padding 14px; tag 11px; título 15px semibold; "+ Adicionar cartão" texto `text-muted` hover violeta.
- Mobile: colunas empilhadas ou scroll horizontal com `snap-x`.

### 8.6 Notas
- Sem título de página no protótipo: dois painéis ocupam a área.
- Painel esquerdo: botão "＋ Nova Nota" full width violeta claro (`#A9A2FB`, texto `#1B1733`), itens com padding 14px, título 14px semibold, horário 11px à direita, preview 12px em 2 linhas, item ativo `bg-[#1B1B1D]` + borda esquerda violeta 3px; rodapé "N notas guardadas".
- Painel direito: eyebrow "CADERNO / {NOME}" 11px uppercase; título 44px light; metadados 12px; Markdown com H3 20px, parágrafos 15px/1.75 `text-[#C9C9CE]`, listas com marcadores violeta, espaçamento generoso; botão "Editar" discreto no topo direito; **rodapé fixo** do painel com a área "Excluir nota" (ícone `Trash2`, texto `danger`, separada por borda superior), sempre visível.

---

## 9. Responsividade

| Breakpoint | Comportamento |
|---|---|
| `< 640px` | Sidebar vira drawer (largura 280px, overlay `black/60`, animação slide); topbar mobile com logo e hambúrguer; cards empilhados; timer 220px; Kanban em scroll horizontal com colunas 85vw; notas mostram lista ou detalhe. |
| `640–1023px` | Sidebar drawer; grid overview 2 colunas; tabela de hábitos com scroll horizontal; notas em duas colunas se ≥ 900px, senão empilhado. |
| `≥ 1024px` | Sidebar fixa 256px; overview 3 colunas; kanban 3 colunas; notas 340px + detalhe. |
| `≥ 1440px` | Conteúdo centralizado com `max-w-[1180px]`. |

Requisitos: nenhum scroll horizontal no body; alvos de toque ≥ 40px no mobile; tab order lógica; contraste AA para textos.

---

## 10. Acessibilidade e qualidade

- `aria-label` em todos os botões de ícone (reset, fechar, excluir, menu).
- Rotas: `NavLink` ativo expõe `aria-current="page"`; ao trocar de rota, o foco vai para o `<h1>` da página (`tabIndex={-1}`).
- Sidebar sem ícones: itens com altura ≥ 40px e área clicável total, mantendo a legibilidade por texto.
- Modais: `role="dialog"`, `aria-modal`, foco preso, retorno de foco ao gatilho.
- Kanban: sensor de teclado (`Space` pega, setas movem, `Space` solta) + instruções em `aria-describedby`; colunas com `aria-label` e contagem.
- Toasts em `aria-live="polite"`; erros de formulário com `aria-invalid` e `aria-describedby`.
- Células de hábito: `role="checkbox"` com `aria-checked` e `aria-label="Terça-feira, concluído"`; `notRequired` com `aria-disabled`.
- Preferência por movimento reduzido respeitada.
- Código: componentes puros sempre que possível, sem `any`/JSX em `.js`, constantes centralizadas, nenhum texto hardcoded duplicado (labels em `constants.js`).

---

## 11. Critérios de aceite (rastreabilidade)

| # | Requisito | Critério verificável |
|---|---|---|
| CA-01 | Login com e-mail validado | E-mail inválido bloqueia submit com mensagem inline |
| CA-02 | Autenticação e-mail/senha | Credenciais corretas entram; incorretas exibem toast de erro |
| CA-03 | Senha criptografada | Inspeção do `localStorage` não revela senha; hash `sha256$...` |
| CA-04 | Dados por usuário | Duas contas têm tarefas/hábitos/notas/pomodoro independentes |
| CA-05 | Cadastro valida senha forte | Sem maiúscula/minúscula/número ou < 8 caracteres → bloqueado |
| CA-06 | Toast de cadastro + login automático | Cadastro válido exibe toast e entra na Visão Geral |
| CA-07 | Sidebar navega e perfil desloga | 5 abas navegam; popover do perfil contém "Sair" |
| CA-08 | Overview com Pomodoro completo | Iniciar/pausar/resetar/trocar modo/trocar tarefa funcionam no card |
| CA-09 | Overview lista tarefas priorizadas | Até 3 pendentes, `Alta` antes de `Média`/`Baixa` |
| CA-10 | Contagem de tarefas | Badge e contadores de coluna corretos após mover/concluir |
| CA-11 | Overview de hábitos | Consistência = concluídos/obrigatórios do dia; só hábitos do dia |
| CA-12 | Foco: relógio circular | Anel acompanha o tempo; start/reset; 3 modos alteram duração |
| CA-13 | Foco: seleção de tarefa | Popover lista pendentes e "Trocar" atualiza a barra |
| CA-14 | Hábitos: modal | Cria hábito com nome/categoria/frequência/meta |
| CA-15 | Sequência de hábitos | Valores coerentes com o histórico; atualiza ao marcar |
| CA-16 | Dias não obrigatórios | Célula visualmente distinta e não clicável |
| CA-17 | Kanban: modal pré-preenchido | "+ Adicionar cartão" abre com a coluna correta |
| CA-18 | Badges de classificação | Todo card exibe tag de categoria |
| CA-19 | Drag & drop | Move entre colunas e reordena; persiste após reload |
| CA-20 | Notas: resumo | Título + 2 linhas + tempo relativo no formato especificado |
| CA-21 | Notas: detalhes | Caderno, título, última edição, nº de palavras, Markdown |
| CA-22 | Notas: contador | Rodapé correto, inclusive singular |
| CA-23 | Persistência geral | Reload preserva tudo; timer retoma corretamente |
| CA-24 | Build limpo | `npm run build` sem erros nem warnings bloqueantes |
| CA-25 | Fidelidade visual | Cores, espaçamentos, tipografia e estados conforme protótipos |
| CA-26 | Conta nova vazia | Após cadastro, tarefas/hábitos/notas vazios, timer 25:00 sem tarefa e empty states em todas as telas |
| CA-27 | Nome obrigatório | Cadastro sem nome é bloqueado; nome aparece na sidebar e na saudação |
| CA-28 | Exclusão de nota | Área "Excluir nota" sempre visível no painel direito; confirma e atualiza a lista |
| CA-29 | Rotas | `/tarefas`, `/notas` etc. acessíveis por URL; deslogado é redirecionado para `/entrar`; F5 preserva a rota |

---

## 12. Plano da Fase 2 (após aprovação)

1. **Base** — `npm create vite`, Tailwind, tokens, `index.css`, `react-router-dom` + `routes/*`, `utils/*`, `context/*`, `AppProviders`.
2. **Paralelo A (UI)** — `ui/*`, `layout/*` (sidebar sem ícones), `AuthPage` com Nome, páginas, modais e empty states conforme protótipos; responsividade.
3. **Paralelo B (Lógica)** — auth/SHA-256, CRUDs, ordenação, streaks/consistência, datas relativas, timer com retomada, filtros, DnD, exclusão de notas.
4. **Integração** — conectar contextos às telas, toasts, confirmações, atalhos de teclado.
5. **QA** — checklist CA-01…CA-29, revisão de fidelidade visual, `npm run build`, correção de warnings, entrega com instruções de execução.

---

## 13. Decisões finais (v1.1)

Todas as decisões abaixo estão aplicadas nas seções 2–12 e substituem as alternativas discutidas na v1.0.

| # | Decisão | Definição final |
|---|---|---|
| D1 | Dados iniciais | **Conta vazia.** Nenhum seed; `tasks`, `habits` e `notes` começam vazios; todas as telas têm empty state e CTA. |
| D2 | Nome no cadastro | **Campo obrigatório** "Nome" (2–40 caracteres), gravado em `User.name`/`Profile.displayName`; usado na sidebar e na saudação. |
| D3 | Sidebar | **Sem ícones** em nenhuma tela; itens apenas com texto, `NavLink` e estado ativo em pílula. |
| D4 | Notas | Edição inline + **área fixa "Excluir nota"** no rodapé do painel direito, sempre visível, com confirmação. Hábitos mantêm edição/exclusão discretas no hover. |
| D5 | Dias futuros | Hoje e dias passados da semana corrente são clicáveis; futuro bloqueado com tooltip. |
| D6 | Fim do timer | Para, toca bipe, emite toast e troca o modo (foco → pausa curta; a cada 4º foco → pausa longa; pausa → foco) **sem iniciar automaticamente**. |
| D7 | Rótulo "Respiração Guiada" | **Descartado.** O card da Visão Geral usa o rótulo do modo atual, igual à página Foco. |
| D8 | Roteamento | **`react-router-dom` (v6) com `HashRouter`**: `/entrar`, `/cadastro`, `/`, `/foco`, `/habitos`, `/tarefas`, `/notas`; `ProtectedRoute` para sessão. |
| D9 | Data das notas | Formato mais simples, próximo do print: `09:23` · `Ontem` · `quinta-feira` · `21 Out`. O texto literal do requisito não tem prioridade aqui. |
| D10 | Contagens de tarefas | Badge local (`1 de 3 concluídas`) **+** rodapé `6 tarefas · 3 concluídas · 3 pendentes`; contadores por coluna no Kanban. |

### 13.1 Observações de implementação

- **Roteamento:** `HashRouter` foi escolhido para que o build estático funcione ao abrir `dist/index.html` ou ao servir em qualquer host sem regra de fallback. Trocar para `BrowserRouter` é uma linha em `App.jsx`.
- **Conta vazia:** sem seed, o primeiro uso é o fluxo de criação — os CTAs dos empty states levam aos modais de tarefa, hábito e nota. O Pomodoro já nasce funcional, sem tarefa vinculada.
- **Exclusão de nota:** a área fica no rodapé do painel de leitura, separada por borda superior, visível sem hover; usa `ConfirmDialog` e, após excluir, seleciona a próxima nota.
- **Sidebar:** sem ícones de navegação; o único ícone do topo é o `Zap` da marca.
- **Nome:** obrigatório no cadastro e imutável nesta versão (não há tela de perfil).

> **Status:** especificação pronta para aprovação final (v1.1). Nenhum código foi escrito.
