import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
                mono: ['Space Mono', 'monospace'],
            },
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                // Calculator-specific semantic colors
                'calc-bg': 'oklch(var(--calc-bg))',
                'calc-card': 'oklch(var(--calc-card))',
                'calc-display': 'oklch(var(--calc-display))',
                'calc-btn-digit': 'oklch(var(--calc-btn-digit))',
                'calc-btn-digit-hover': 'oklch(var(--calc-btn-digit-hover))',
                'calc-btn-fn': 'oklch(var(--calc-btn-fn))',
                'calc-btn-fn-hover': 'oklch(var(--calc-btn-fn-hover))',
                'calc-btn-op': 'oklch(var(--calc-btn-op))',
                'calc-btn-op-hover': 'oklch(var(--calc-btn-op-hover))',
                'calc-btn-eq': 'oklch(var(--calc-btn-eq))',
                'calc-btn-eq-hover': 'oklch(var(--calc-btn-eq-hover))',
                'calc-text': 'oklch(var(--calc-text))',
                'calc-text-dim': 'oklch(var(--calc-text-dim))',
                'calc-amber': 'oklch(var(--calc-amber))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                'calc': '0 25px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)',
                'amber-glow': '0 0 20px oklch(0.78 0.18 75 / 0.25)',
                'amber-glow-sm': '0 0 10px oklch(0.78 0.18 75 / 0.15)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'press': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(0.94)' }
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(4px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'press': 'press 0.15s ease-out',
                'fade-in': 'fade-in 0.2s ease-out',
                'slide-up': 'slide-up 0.3s ease-out',
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
