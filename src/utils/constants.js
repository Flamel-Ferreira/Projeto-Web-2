// ============================================================================
// constants.js — enums, labels, cores (tons), chaves de storage e mensagens.
// Nenhum texto de interface deve ser duplicado fora deste arquivo (SPEC §10).
// Sem JSX: ícones são referenciados pelo NOME do ícone do lucide-react.
// ============================================================================

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export const APP = Object.freeze({
  name: 'LifePulse',
  tagline: 'PRODUTIVIDADE',
  version: 'v2.4',
  defaultPlan: 'Pro Workspace',
  defaultAvatarColor: 'primary',
  authFooter: 'LifePulse © 2025 • Produtividade e foco consciente.',
  navigationLabel: 'NAVEGAÇÃO',
});

export const QUOTE = Object.freeze({
  text: 'A simplicidade é o último grau da sofisticação.',
  author: 'Leonardo da Vinci',
});

// Textos genéricos de interface (acessibilidade e ações comuns).
export const UI_TEXT = Object.freeze({
  skipToContent: 'Pular para o conteúdo',
  mainNavigation: 'Navegação principal',
  openMenu: 'Abrir menu',
  closeMenu: 'Fechar menu',
  profileMenu: 'Menu do perfil',
  logout: 'Sair',
  close: 'Fechar',
  closeToast: 'Fechar aviso',
  notifications: 'Notificações',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  loading: 'Carregando',
});

// ---------------------------------------------------------------------------
// Rotas (HashRouter) e navegação
// ---------------------------------------------------------------------------
export const ROUTES = Object.freeze({
  login: '/entrar',
  register: '/cadastro',
  home: '/',
  focus: '/foco',
  habits: '/habitos',
  tasks: '/tarefas',
  notes: '/notas',
});

export const NAV_ITEMS = Object.freeze([
  { to: ROUTES.home, label: 'Visão Geral', end: true },
  { to: ROUTES.focus, label: 'Foco', end: false },
  { to: ROUTES.habits, label: 'Hábitos', end: false },
  { to: ROUTES.tasks, label: 'Tarefas', end: false },
  { to: ROUTES.notes, label: 'Notas', end: false },
]);

// ---------------------------------------------------------------------------
// Persistência (localStorage)
// ---------------------------------------------------------------------------
export const STORAGE_PREFIX = 'lifepulse:v1';
export const SCHEMA_VERSION = 1;

// Namespaces globais (sem userId) e por usuário (sempre com userId).
export const STORAGE_NAMESPACES = Object.freeze({
  users: 'users',
  session: 'session',
  profile: 'profile',
  tasks: 'tasks',
  habits: 'habits',
  notes: 'notes',
  pomodoro: 'pomodoro',
});

// ---------------------------------------------------------------------------
// Limites de validação
// ---------------------------------------------------------------------------
export const LIMITS = Object.freeze({
  nameMin: 2,
  nameMax: 40,
  passwordMin: 8,
  taskTitleMin: 1,
  taskTitleMax: 120,
  habitNameMin: 1,
  habitNameMax: 60,
  habitGoalMin: 1,
  habitGoalMax: 5,
  noteTitleMin: 1,
  noteTitleMax: 80,
});

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Ordem exibida no checklist do cadastro (2 colunas nos prints).
export const PASSWORD_RULES = Object.freeze([
  { id: 'length', label: 'Pelo menos 8 caracteres' },
  { id: 'upper', label: 'Uma letra maiúscula' },
  { id: 'lower', label: 'Uma letra minúscula' },
  { id: 'number', label: 'Um número' },
]);

export const PASSWORD_STRENGTH_LEVELS = Object.freeze({
  weak: { label: 'Fraca', tone: 'danger' },
  medium: { label: 'Média', tone: 'warning' },
  strong: { label: 'Forte', tone: 'success' },
});

export const PASSWORD_STRENGTH_SEGMENTS = 4;

// ---------------------------------------------------------------------------
// Datas
// ---------------------------------------------------------------------------
// Índice JS: 0 = domingo.
export const WEEKDAY_NAMES = Object.freeze([
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]);

export const MONTH_NAMES = Object.freeze([
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]);

export const MONTH_ABBR = Object.freeze([
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]);

// Semana exibida sempre Seg→Dom. `index` segue o padrão JS (0 = domingo).
export const WEEK_DAYS = Object.freeze([
  { index: 1, short: 'Seg', long: 'Segunda-feira' },
  { index: 2, short: 'Ter', long: 'Terça-feira' },
  { index: 3, short: 'Qua', long: 'Quarta-feira' },
  { index: 4, short: 'Qui', long: 'Quinta-feira' },
  { index: 5, short: 'Sex', long: 'Sexta-feira' },
  { index: 6, short: 'Sáb', long: 'Sábado' },
  { index: 0, short: 'Dom', long: 'Domingo' },
]);

export const ALL_WEEK_DAY_INDEXES = Object.freeze([1, 2, 3, 4, 5, 6, 0]);

// 05–11 manhã · 12–17 tarde · 18–04 noite (RN-52)
export const PERIODS = Object.freeze({
  morning: { greeting: 'Bom dia', label: 'matutino' },
  afternoon: { greeting: 'Boa tarde', label: 'vespertino' },
  night: { greeting: 'Boa noite', label: 'noturno' },
});

export const PERIOD_CONTEXT_PREFIX = 'Concentração otimizada para o período';

// Pedaços de texto do tempo relativo das notas (RN-33 / RN-35).
export const DATE_LABELS = Object.freeze({
  yesterday: 'Ontem', // carimbo do card
  yesterdayLower: 'ontem', // "Última edição ontem às 11:23"
  today: 'hoje',
  at: 'às',
  lastEdit: 'Última edição',
});

// ---------------------------------------------------------------------------
// Tarefas
// ---------------------------------------------------------------------------
export const TASK_STATUS = Object.freeze({
  todo: 'todo',
  inProgress: 'in_progress',
  done: 'done',
});

export const TASK_STATUS_LABELS = Object.freeze({
  [TASK_STATUS.todo]: 'A Fazer',
  [TASK_STATUS.inProgress]: 'Em Andamento',
  [TASK_STATUS.done]: 'Concluído',
});

// Ordem das colunas do Kanban + tom do dot (violeta / azul / verde).
export const TASK_COLUMNS = Object.freeze([
  { status: TASK_STATUS.todo, label: 'A Fazer', accent: 'primary' },
  { status: TASK_STATUS.inProgress, label: 'Em Andamento', accent: 'info' },
  { status: TASK_STATUS.done, label: 'Concluído', accent: 'success' },
]);

export const TASK_CATEGORY = Object.freeze({
  work: 'work',
  personal: 'personal',
  studies: 'studies',
});

// `tone` alimenta o <Badge tone>. "Estudos" não aparece nos prints: âmbar.
export const TASK_CATEGORY_LABELS = Object.freeze({
  [TASK_CATEGORY.work]: 'Trabalho',
  [TASK_CATEGORY.personal]: 'Pessoal',
  [TASK_CATEGORY.studies]: 'Estudos',
});

export const TASK_CATEGORY_TONES = Object.freeze({
  [TASK_CATEGORY.work]: 'purple',
  [TASK_CATEGORY.personal]: 'pink',
  [TASK_CATEGORY.studies]: 'amber',
});

export const TASK_PRIORITY = Object.freeze({
  low: 'low',
  medium: 'medium',
  high: 'high',
});

export const TASK_PRIORITY_LABELS = Object.freeze({
  [TASK_PRIORITY.low]: 'Baixa',
  [TASK_PRIORITY.medium]: 'Média',
  [TASK_PRIORITY.high]: 'Alta',
});

// Peso para ordenação (high > medium > low) — RN-10.
export const TASK_PRIORITY_WEIGHT = Object.freeze({
  [TASK_PRIORITY.low]: 0,
  [TASK_PRIORITY.medium]: 1,
  [TASK_PRIORITY.high]: 2,
});

// Cor do ponto de prioridade (conforme os prints: Alta rosa, Média violeta).
export const TASK_PRIORITY_TONES = Object.freeze({
  [TASK_PRIORITY.low]: 'slate',
  [TASK_PRIORITY.medium]: 'purple',
  [TASK_PRIORITY.high]: 'pink',
});

// Opções prontas para <SegmentedControl>.
export const TASK_STATUS_OPTIONS = Object.freeze(
  TASK_COLUMNS.map(({ status, label }) => ({ value: status, label })),
);
export const TASK_CATEGORY_OPTIONS = Object.freeze(
  Object.values(TASK_CATEGORY).map((value) => ({
    value,
    label: TASK_CATEGORY_LABELS[value],
  })),
);
export const TASK_PRIORITY_OPTIONS = Object.freeze(
  [TASK_PRIORITY.low, TASK_PRIORITY.medium, TASK_PRIORITY.high].map((value) => ({
    value,
    label: TASK_PRIORITY_LABELS[value],
  })),
);

// ---------------------------------------------------------------------------
// Hábitos
// ---------------------------------------------------------------------------
export const HABIT_CATEGORY = Object.freeze({
  health: 'health',
  studies: 'studies',
  productivity: 'productivity',
  mind: 'mind',
});

export const HABIT_DEFAULT_CATEGORY = HABIT_CATEGORY.health;

// `icon` = nome do ícone no lucide-react (o print de Saúde usa coração com pulso).
export const HABIT_CATEGORY_META = Object.freeze({
  [HABIT_CATEGORY.health]: { label: 'Saúde', icon: 'HeartPulse' },
  [HABIT_CATEGORY.studies]: { label: 'Estudos', icon: 'BookOpen' },
  [HABIT_CATEGORY.productivity]: { label: 'Produtividade', icon: 'Target' },
  [HABIT_CATEGORY.mind]: { label: 'Mente', icon: 'Brain' },
});

export const HABIT_CATEGORY_OPTIONS = Object.freeze(
  Object.values(HABIT_CATEGORY).map((value) => ({
    value,
    label: HABIT_CATEGORY_META[value].label,
  })),
);

export const HABIT_GOAL_OPTIONS = Object.freeze(
  [1, 2, 3, 4, 5].map((value) => ({
    value,
    label: value === 1 ? '1 vez ao dia' : `${value} vezes ao dia`,
  })),
);

export const HABIT_DEFAULT_GOAL = 1;

// Estados visuais de uma célula da tabela de hábitos.
export const HABIT_CELL_STATE = Object.freeze({
  done: 'done',
  pending: 'pending',
  notRequired: 'notRequired',
  future: 'future',
});

// ---------------------------------------------------------------------------
// Notas
// ---------------------------------------------------------------------------
export const NOTEBOOK = Object.freeze({
  focus: 'focus',
  ideas: 'ideas',
  personal: 'personal',
});

export const NOTEBOOK_DEFAULT = NOTEBOOK.focus;

// `label` = botões do modal · `fullLabel` = eyebrow do leitor ("CADERNO / …").
export const NOTEBOOK_META = Object.freeze({
  [NOTEBOOK.focus]: { label: 'Foco & Arq.', fullLabel: 'Foco & Arquitetura' },
  [NOTEBOOK.ideas]: { label: 'Ideias & Insights', fullLabel: 'Ideias & Insights' },
  [NOTEBOOK.personal]: { label: 'Pessoal', fullLabel: 'Pessoal' },
});

export const NOTEBOOK_OPTIONS = Object.freeze(
  Object.values(NOTEBOOK).map((value) => ({
    value,
    label: NOTEBOOK_META[value].label,
  })),
);

// ---------------------------------------------------------------------------
// Pomodoro
// ---------------------------------------------------------------------------
export const POMODORO_MODE = Object.freeze({
  focus: 'focus',
  short: 'short',
  long: 'long',
});

export const POMODORO_DURATIONS = Object.freeze({
  [POMODORO_MODE.focus]: 1500,
  [POMODORO_MODE.short]: 300,
  [POMODORO_MODE.long]: 900,
});

export const POMODORO_CYCLE_LENGTH = 4;

export const POMODORO_MODE_LABELS = Object.freeze({
  [POMODORO_MODE.focus]: 'Foco 25m',
  [POMODORO_MODE.short]: 'Pausa Curta 5m',
  [POMODORO_MODE.long]: 'Pausa Longa 15m',
});

export const POMODORO_MODE_OPTIONS = Object.freeze(
  Object.values(POMODORO_MODE).map((value) => ({
    value,
    label: POMODORO_MODE_LABELS[value],
  })),
);

// Rótulo sob o tempo (RN-47): foco em verde, pausas em âmbar.
export const POMODORO_STATUS = Object.freeze({
  [POMODORO_MODE.focus]: { label: 'SESSÃO FOCADA', tone: 'success' },
  [POMODORO_MODE.short]: { label: 'PAUSA CURTA', tone: 'warning' },
  [POMODORO_MODE.long]: { label: 'PAUSA LONGA', tone: 'warning' },
});

// Estado inicial de uma conta nova. `sessionDate` é preenchido pelo contexto
// com a data local do dia (YYYY-MM-DD).
export const POMODORO_DEFAULT_STATE = Object.freeze({
  mode: POMODORO_MODE.focus,
  durations: POMODORO_DURATIONS,
  remaining: POMODORO_DURATIONS[POMODORO_MODE.focus],
  isRunning: false,
  endsAt: null,
  sessionCount: 0,
  sessionDate: null,
  cycleLength: POMODORO_CYCLE_LENGTH,
  currentTaskId: null,
  updatedAt: null,
});

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
export const TOAST_TYPE = Object.freeze({
  success: 'success',
  error: 'error',
  info: 'info',
});

export const TOAST_DEFAULT_DURATION = 4000;

// ---------------------------------------------------------------------------
// Mensagens (toasts, erros de validação, avisos de storage)
// ---------------------------------------------------------------------------
export const MESSAGES = Object.freeze({
  auth: {
    invalidCredentials: 'E-mail ou senha incorretos.',
    registerSuccess: 'Conta criada com sucesso. Bem-vindo(a)!',
    welcomeBack: (name) => `Bem-vindo(a) de volta, ${name}`,
    emailTaken: 'Este e-mail já está cadastrado.',
    registerInvalid: 'Revise os campos destacados para criar a conta.',
    cryptoUnavailable:
      'Não foi possível proteger a senha neste navegador. Use HTTPS ou localhost.',
    unexpected: 'Algo deu errado. Tente novamente.',
  },
  storage: {
    unavailable:
      'Armazenamento local indisponível. Seus dados não serão salvos após fechar a página.',
    quotaExceeded:
      'Armazenamento local cheio. As alterações recentes não serão salvas após fechar a página.',
    schemaReset:
      'Os dados salvos eram de uma versão incompatível e foram reiniciados.',
  },
  tasks: {
    created: 'Tarefa criada com sucesso.',
    updated: 'Tarefa atualizada.',
    deleted: 'Tarefa excluída.',
  },
  habits: {
    created: 'Hábito criado com sucesso.',
    updated: 'Hábito atualizado.',
    deleted: 'Hábito excluído.',
    futureDay: 'Dia futuro',
  },
  notes: {
    created: 'Nota criada com sucesso.',
    saved: 'Nota salva.',
    deleted: 'Nota excluída.',
  },
  pomodoro: {
    focusDone: 'Sessão de foco concluída. Hora de uma pausa!',
    breakDone: 'Pausa encerrada. Pronto para focar?',
  },
});

export const VALIDATION = Object.freeze({
  nameRequired: 'Informe seu nome.',
  nameMin: `O nome deve ter pelo menos ${LIMITS.nameMin} caracteres.`,
  nameMax: `O nome deve ter no máximo ${LIMITS.nameMax} caracteres.`,
  emailRequired: 'Informe seu e-mail.',
  emailInvalid: 'Informe um e-mail válido.',
  passwordRequired: 'Informe sua senha.',
  passwordWeak:
    'A senha deve ter 8+ caracteres, com maiúscula, minúscula e número.',
  confirmRequired: 'Confirme sua senha.',
  confirmMismatch: 'As senhas não coincidem.',
  taskTitleRequired: 'Informe o título da tarefa.',
  taskTitleMax: `O título deve ter no máximo ${LIMITS.taskTitleMax} caracteres.`,
  habitNameRequired: 'Informe o nome do hábito.',
  habitNameMax: `O nome deve ter no máximo ${LIMITS.habitNameMax} caracteres.`,
  habitDaysRequired: 'Escolha pelo menos um dia da semana.',
  habitGoalInvalid: `A meta deve estar entre ${LIMITS.habitGoalMin} e ${LIMITS.habitGoalMax}.`,
  noteTitleRequired: 'Informe o título da nota.',
  noteTitleMax: `O título deve ter no máximo ${LIMITS.noteTitleMax} caracteres.`,
});

// ---------------------------------------------------------------------------
// Helpers de rótulo (texto com plural e iniciais)
// ---------------------------------------------------------------------------

// pt-BR: apenas 1 é singular (0 → "0 tarefas", como nos prints).
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

export function formatCount(count, singular, plural) {
  return `${count} ${pluralize(count, singular, plural)}`;
}

// "1 tarefa · 0 concluídas · 1 pendente"
export function formatTaskSummary({ total = 0, completed = 0, pending = 0 } = {}) {
  return [
    formatCount(total, 'tarefa', 'tarefas'),
    formatCount(completed, 'concluída', 'concluídas'),
    formatCount(pending, 'pendente', 'pendentes'),
  ].join(' · ');
}

// "0 DE 1 CONCLUÍDA" / "0 DE 0 CONCLUÍDAS" (a caixa alta vem do CSS do Badge).
export function formatCompletedBadge(completed = 0, total = 0) {
  return `${completed} de ${total} ${pluralize(total, 'concluída', 'concluídas')}`;
}

// "0 de 1" (badge de hábitos)
export function formatHabitsBadge(completed = 0, total = 0) {
  return `${completed} de ${total}`;
}

// "0 de 0 hábitos"
export function formatHabitsCount(completed = 0, total = 0) {
  return `${completed} de ${total} ${pluralize(total, 'hábito', 'hábitos')}`;
}

// "Sequência atual: 0 dias"
export function formatStreakDays(days = 0) {
  return formatCount(days, 'dia', 'dias');
}

// "1 nota guardada" / "3 notas guardadas"
export function formatNotesCount(count = 0) {
  return `${count} ${pluralize(count, 'nota guardada', 'notas guardadas')}`;
}

// "Sessão 1 de 4 prevista para hoje" — min(sessionCount + 1, ciclo) (RN-51)
export function formatSessionPlan(sessionCount = 0, cycleLength = POMODORO_CYCLE_LENGTH) {
  const current = Math.min(sessionCount + 1, cycleLength);
  return `Sessão ${current} de ${cycleLength} prevista para hoje`;
}

// "Sessão 1 de 4" (sublabel do anel na página Foco)
export function formatSessionShort(sessionCount = 0, cycleLength = POMODORO_CYCLE_LENGTH) {
  const current = Math.min(sessionCount + 1, cycleLength);
  return `Sessão ${current} de ${cycleLength}`;
}

export function getFirstName(fullName = '') {
  return String(fullName).trim().split(/\s+/)[0] || '';
}

export function getInitial(fullName = '') {
  const first = String(fullName).trim().charAt(0);
  return first ? first.toUpperCase() : '?';
}

// "Última edição hoje às 11:23 • 1 palavra"
export function formatNoteMeta(editedLabel = '', wordCountLabel = '') {
  return `${DATE_LABELS.lastEdit} ${editedLabel} • ${wordCountLabel}`;
}

// ---------------------------------------------------------------------------
// Textos do Lote 4: autenticação, Visão Geral e Pomodoro
// ---------------------------------------------------------------------------
export const AUTH_TEXT = Object.freeze({
  tabsLabel: 'Acesso à conta',
  tabLogin: 'Entrar',
  tabRegister: 'Criar Conta',
  headingLogin: 'Entrar na sua conta', // <h1> visível só para leitores de tela
  headingRegister: 'Criar sua conta',
  name: 'Nome',
  email: 'E-mail',
  password: 'Senha',
  confirm: 'Confirmar senha',
  namePlaceholder: 'Seu nome',
  emailPlaceholder: 'voce@exemplo.com',
  loginPasswordPlaceholder: 'Sua senha',
  registerPasswordPlaceholder: 'Crie uma senha forte',
  confirmPlaceholder: 'Repita a senha',
  submitLogin: 'Entrar',
  submitRegister: 'Criar conta',
  strengthTitle: 'Força da senha',
  ruleMet: 'Requisito atendido:',
  rulePending: 'Requisito pendente:',
});

export const POMODORO_TEXT = Object.freeze({
  modeGroupLabel: 'Modo do timer',
  start: 'Iniciar',
  pause: 'Pausar',
  reset: 'Resetar timer',
  timerLabel: 'Tempo restante',
  switchTitle: 'Trocar de modo?',
  switchDescription: 'O timer em andamento será interrompido.',
  switchConfirm: 'Trocar',
  switchCancel: 'Continuar',
});

export const OVERVIEW_TEXT = Object.freeze({
  eyebrow: 'Modo de foco disponível',
  focusTitle: 'Temporizador de Foco',
  focusDescription: 'Mantenha o ritmo no que importa.',
  focusBadge: 'Pomodoro',
  tasksTitle: 'Tarefas Prioritárias',
  tasksDescription: 'Até três pendências de maior prioridade.',
  tasksEmptyTitle: 'Nenhuma tarefa prioritária',
  tasksEmptyDescription: 'Crie um cartão para começar o dia.',
  tasksEmptyAction: 'Nova tarefa',
  habitsTitle: 'Hábitos de Hoje',
  habitsDescription: 'Pequenas ações, consistência real.',
  habitsEmptyTitle: 'Nenhum hábito para hoje',
  habitsEmptyDescription: 'Crie um hábito para acompanhar sua rotina.',
  habitsEmptyAction: 'Ver hábitos',
  consistency: 'Consistência Diária',
  streak: 'Sequência atual:',
  completeTask: (title) => `Concluir tarefa: ${title}`,
  markHabit: (name) => `Marcar hábito de hoje: ${name}`,
  priority: 'Prioridade:',
});