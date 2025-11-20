const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './app/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(214 10% 90%)',
        input: 'hsl(214 10% 97%)',
        ring: 'hsl(214 10% 65%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(217 33% 14%)',
        muted: {
          DEFAULT: 'hsl(214 15% 95%)',
          foreground: 'hsl(214 10% 50%)',
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(217 33% 14%)',
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(217 33% 14%)',
        },
        primary: {
          DEFAULT: 'hsl(222.2 47.4% 11.2%)',
          foreground: 'hsl(210 40% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(214 32% 91%)',
          foreground: 'hsl(217 33% 14%)',
        },
        accent: {
          DEFAULT: 'hsl(214 32% 91%)',
          foreground: 'hsl(217 33% 14%)',
        },
        destructive: {
          DEFAULT: 'hsl(2 81% 50%)',
          foreground: 'hsl(210 40% 98%)',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: 'calc(0.75rem - 2px)',
        sm: 'calc(0.75rem - 4px)',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), plugin(() => {})],
};
