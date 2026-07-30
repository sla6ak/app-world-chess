/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  safelist: [
    'light-square',
    'dark-square',
    'white-piece',
    'black-piece',
    'selected',
    'valid-move',
    'check',
    'checkmate',
    'last-move',
    'hover-scale',
    'fade-in',
    'slide-in',
  ],
  theme: {
    extend: {
      colors: {
        // Chess board colors — map to CSS variables for theming
        board: {
          light: 'var(--color-bg-board)',
          dark: 'var(--color-bg-board-dark)',
          bg: 'var(--color-bg-accent)',
          accent: 'var(--color-accent-light)',
          pc: 'var(--color-bg-board-pc)',
        },
        // Brand colors — map to CSS variables
        accent: 'var(--color-accent)',
        hoverAccent: 'var(--color-accent-hover)',
        green: 'var(--color-green)',
        hoverGreen: 'var(--color-green-hover)',
        purpure: 'var(--color-purple)',
        text: 'var(--color-text-primary)',
        helperText: 'var(--color-text-muted)',
        iconColor: 'var(--color-icon-default)',
        fone: 'var(--color-bg-primary)',
        error: 'var(--color-error)',
        hoverWhite: 'var(--color-bg-hover)',
        // Dark mode palette — also CSS-variable driven
        dark: {
          bg: 'var(--color-bg-primary)',
          surface: 'var(--color-bg-secondary)',
          card: 'var(--color-bg-surface)',
          border: 'var(--color-border)',
          text: 'var(--color-text-primary)',
          muted: 'var(--color-text-muted)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen-Sans',
          'Ubuntu',
          'Cantarell',
          'Helvetica Neue',
          'sans-serif',
        ],
        poppins: ['Poppins', 'sans-serif'],
        mono: ['source-code-pro', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      screens: {
        xs: '475px',
        '3xl': '1920px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-pieces': 'bouncePieces 0.6s ease-in-out',
        'check-flash': 'checkFlash 1s ease-in-out infinite',
        'last-move-glow': 'lastMoveGlow 2s ease-in-out infinite',
        'hover-lift': 'hoverLift 0.2s ease-out',
        'board-hover': 'boardHover 0.3s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bouncePieces: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        checkFlash: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' },
          '50%': { boxShadow: '0 0 12px 4px rgba(255, 0, 0, 0.4)' },
        },
        lastMoveGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(102, 53, 23, 0)' },
          '50%': { boxShadow: '0 0 8px 2px rgba(102, 53, 23, 0.3)' },
        },
        hoverLift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-2px)' },
        },
        boardHover: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' },
        },
      },
      transitionDuration: {
        200: '200ms',
        300: '300ms',
        400: '400ms',
      },
      transitionTimingFunction: {
        chess: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      borderRadius: {
        chess: 'var(--radius-board)',
        piece: '50%',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        chess: 'var(--shadow-card)',
        piece: '0 2px 4px rgba(0, 0, 0, 0.2)',
        glow: 'var(--shadow-glow)',
        'glow-green': 'var(--shadow-green)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
