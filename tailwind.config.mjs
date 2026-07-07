import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [tailwindcssAnimate, typography],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shine': 'shine 2.5s linear infinite',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Frontend brand colors
        primary: {
          DEFAULT: '#5A9A35',
          light: 'rgba(90, 154, 53, 0.1)',
          hover: '#4F8A2F',
          50: '#F5FDF0',
          100: '#E8F9DD',
          200: '#D1F2BB',
          300: '#B0E88E',
          400: '#8BD85C',
          500: '#75BF44',
          600: '#5FA032',
          700: '#4A7D2A',
          800: '#3E6426',
          900: '#355423',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#EE5428',
          light: 'rgba(238, 84, 40, 0.1)',
          hover: '#D64C24',
          50: '#FEF4F2',
          100: '#FDE6E1',
          200: '#FBD1C8',
          300: '#F7B2A2',
          400: '#F2886C',
          500: '#EE5428',
          600: '#DC3F1A',
          700: '#B83318',
          800: '#972D1A',
          900: '#7C2A1C',
          foreground: '#ffffff',
        },
        // Frontend custom colors
        'abu-bg': 'var(--abu-bg)',
        'abu-stroke': 'var(--abu-stroke)',
        'dark-blue': '#1A1A2E',
        grey: 'var(--grey)',
        'light-green': 'var(--light-green)',
        text: 'var(--text)',
        triatry: 'var(--triatry)',
        'white-fade': 'var(--white-fade)',
        // Original Payload colors
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsla(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        ring: 'hsl(var(--ring))',
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)'],
        sans: ['var(--font-fahkwang)', 'sans-serif'],
        fahkwang: ['var(--font-fahkwang)', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'serif'],
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
        'shine': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
