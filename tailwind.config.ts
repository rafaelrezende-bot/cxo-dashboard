import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:       '#0f1117',
          surface:  '#1a1d27',
          surface2: '#242835',
          border:   '#2e3344',
          text:     '#e4e6ed',
          muted:    '#8b8fa3',
          accent:   '#6c8cff',
          green:    '#34d399',
          yellow:   '#fbbf24',
          red:      '#f87171',
          purple:   '#a78bfa',
          orange:   '#fb923c',
          pink:     '#f472b6',
          sky:      '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
