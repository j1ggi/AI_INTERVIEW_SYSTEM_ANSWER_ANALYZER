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
        // Editorial Warm Ivory & Ink Palette
        ivory: {
          bg: '#F7F4EE',
          surface: '#FFFDF9',
          'surface-2': '#F0ECE4',
          border: '#DED9D0',
          'border-subtle': '#E8E3DA',
        },
        ink: {
          DEFAULT: '#171717',
          secondary: '#68645E',
          muted: '#948F87',
          faint: '#C2BCB3',
        },
        burgundy: {
          DEFAULT: '#7A263A',
          hover: '#641F30',
          subtle: '#FAF0F2',
          border: '#E8C5CC',
          dark: '#9E334B',
          900: '#4D1522',
        },
        brass: {
          DEFAULT: '#C59A5B',
          hover: '#B38747',
          subtle: '#FBF6EE',
          border: '#E8D5B8',
          dark: '#D4AA6A',
        },
        sage: {
          DEFAULT: '#3F6B52',
          hover: '#335742',
          subtle: '#EFF5F1',
          border: '#C2D9CB',
          dark: '#528568',
        },
        amber: {
          DEFAULT: '#A66A24',
          subtle: '#FBF5EC',
          border: '#E8D5BE',
          dark: '#BA7C2F',
        },
        crimson: {
          DEFAULT: '#A33B3B',
          hover: '#8F3232',
          subtle: '#FAF0F0',
          border: '#E8C4C4',
          dark: '#BA4545',
        },
        // Night Study Academic Archive Theme
        dark: {
          bg: '#141210',
          surface: '#1C1916',
          elevated: '#24201C',
          border: '#332F2A',
          muted: '#3D3833',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'paper': '0 1px 3px 0 rgba(23, 23, 23, 0.04), 0 1px 2px -1px rgba(23, 23, 23, 0.02)',
        'elevated': '0 4px 16px -2px rgba(23, 23, 23, 0.06)',
        'tactile': '0 1px 2px 0 rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'card': '0 1px 3px 0 rgba(23, 23, 23, 0.04), 0 1px 2px -1px rgba(23, 23, 23, 0.02)',
      },
      borderRadius: {
        'card': '12px',
        'btn': '10px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
