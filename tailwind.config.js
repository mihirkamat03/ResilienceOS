/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090d14',
          surface: '#0f172a',
          elevated: '#172033',
          border: '#1e293b',
          borderLight: '#334155'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.5)',
        'glow-orange': '0 0 25px -5px rgba(249, 115, 22, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
