/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Superfícies
        bg: '#050506',
        sidebar: '#0B0B0C',
        surface: {
          DEFAULT: '#111112',
          2: '#171718',
          3: '#1F1F21',
        },
        border: 'rgba(255,255,255,0.07)',

        // Texto
        text: {
          DEFAULT: '#F4F4F5',
          secondary: '#A1A1AA',
          muted: '#6B6B75',
        },

        // Acento (violeta)
        primary: {
          DEFAULT: '#6C5CE7',
          light: '#A9A2FB',
          strong: '#5A49D6',
          soft: 'rgba(108,92,231,0.14)',
        },

        // Estados
        success: {
          DEFAULT: '#22C55E',
          soft: 'rgba(34,197,94,0.12)',
        },
        danger: '#F43F5E',
        warning: '#F59E0B',
        info: '#3B82F6', // dot da coluna "Em Andamento"

        // Categorias e prioridades
        pink: '#D946EF', // categoria "Pessoal"
        slate: '#94A3B8', // prioridade "Baixa"
        'prio-high': '#D946EF', // prioridade "Alta" (ponto rosa nos prints)
        'prio-medium': '#8B7CF7', // prioridade "Média" (ponto violeta nos prints)
        'prio-low': '#94A3B8',

        // Campos e trilhos (login, modais)
        field: '#0F0F10',
        'field-border': '#26262A',
        rail: '#0B0B0C',
        track: '#26262A',
        cell: '#131315', // célula de hábito "não obrigatório"
      },

      // Borda padrão sutil (classe `border` sem cor explícita)
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
      },

      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'sans-serif',
        ],
      },

      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1rem' }], // 11px
        eyebrow: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.12em' }],
        'page-title': [
          '2.25rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        'page-title-lg': [
          '2.5rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        timer: ['3.5rem', { lineHeight: '1', fontWeight: '600' }], // 56px
        'timer-lg': ['4rem', { lineHeight: '1', fontWeight: '600' }], // 64px
        'note-title': [
          '2.75rem',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '300' },
        ], // 44px light
      },

      borderRadius: {
        control: '10px',
        card: '16px',
        modal: '20px',
        badge: '6px',
        cell: '8px',
      },

      // Alturas de controle: sm 32 · md 40 · lg 48 (44 nos campos de auth)
      height: {
        'control-sm': '2rem',
        'control-md': '2.5rem',
        'control-lg': '3rem',
        field: '2.75rem',
      },
      minHeight: {
        'control-sm': '2rem',
        'control-md': '2.5rem',
        'control-lg': '3rem',
        card: '420px',
      },

      // Larguras de layout (w-sidebar, pl-sidebar, w-drawer...)
      spacing: {
        sidebar: '16rem', // 256px
        drawer: '17.5rem', // 280px
        'notes-list': '340px',
      },
      maxWidth: {
        content: '1180px',
        auth: '440px',
      },

      screens: {
        notes: '900px', // notas em duas colunas a partir de 900px
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #7B6CF6 0%, #5F4BE8 100%)',
        'gradient-logo': 'linear-gradient(135deg, #6C5CE7 0%, #8B7CF7 100%)',
        'gradient-success': 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      },

      boxShadow: {
        'primary-glow': '0 8px 24px -6px rgba(108,92,231,0.55)',
        'logo-glow': '0 0 24px rgba(108,92,231,0.45)',
        'ring-glow': '0 0 24px rgba(108,92,231,0.55)',
        'success-glow': '0 0 12px rgba(34,197,94,0.35)',
        modal: '0 24px 64px -12px rgba(0,0,0,0.7)',
        popover: '0 12px 32px -8px rgba(0,0,0,0.6)',
      },

      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(7px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'drawer-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-progress': {
          from: { transform: 'scaleX(1)' },
          to: { transform: 'scaleX(0)' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-out',
        'fade-in': 'fade-in 150ms ease-out',
        'pop-in': 'pop-in 180ms ease-out',
        'drawer-in': 'drawer-in 200ms ease-out',
        'toast-in': 'toast-in 200ms ease-out',
        // duração definida por inline style: style={{ '--toast-duration': '4000ms' }}
        'toast-progress':
          'toast-progress var(--toast-duration, 4000ms) linear forwards',
      },

      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
};
