/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af', // Indigo-800
          container: '#dee0ff',
          fixed: '#dde1ff',
          'fixed-dim': '#bac3ff',
        },
        secondary: {
          DEFAULT: '#14b8a6', // Teal-500
          container: '#dde1fc',
        },
        surface: {
          DEFAULT: '#fbf8ff',
          dim: '#dad9e3',
          bright: '#fbf8ff',
          'container-lowest': '#ffffff',
          'container-low': '#f4f2fc',
          'container': '#eeecf6',
          'container-high': '#e8e7f1',
          'container-highest': '#e3e1eb',
        },
        on: {
          surface: '#1a1b22',
          'surface-variant': '#444651',
          primary: '#ffffff',
        },
        outline: {
          DEFAULT: '#757684',
          variant: '#c4c5d5',
        },
        'error-red': '#ef4444',
        'success-green': '#10b981',
        'energy-orange': '#f97316'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'sans-serif'],
      },
      spacing: {
        'gutter': '24px',
        'container-margin': '48px',
        'stack-lg': '24px',
        'stack-md': '16px',
        'stack-sm': '8px',
      }
    },
  },
  plugins: [],
}
