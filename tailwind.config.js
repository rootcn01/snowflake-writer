/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'border': 'var(--border)',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'serif': ['Noto Serif SC', 'serif'],
      },
      maxWidth: {
        'content': '680px',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}
