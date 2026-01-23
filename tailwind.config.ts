import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Apple-style palette
        primary: {
          50: '#f5f5f7',
          100: '#ebebf0',
          200: '#d5d5df',
          300: '#b3b3c0',
          400: '#8a8a99',
          500: '#65657a',
          600: '#52525d',
          700: '#40404a',
          800: '#2d2d32',
          900: '#1a1a1f',
        },
        accent: {
          blue: '#007AFF',
          green: '#34C759',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          pink: '#FF2D55',
          purple: '#AF52DE',
          teal: '#30B0C0',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'base': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        'sm': ['13px', { lineHeight: '18px', letterSpacing: '0.3px' }],
        'base': ['15px', { lineHeight: '22px', letterSpacing: '0.2px' }],
        'lg': ['17px', { lineHeight: '24px', letterSpacing: '0.1px' }],
        'xl': ['19px', { lineHeight: '26px' }],
        '2xl': ['22px', { lineHeight: '28px' }],
        '3xl': ['28px', { lineHeight: '32px' }],
        '4xl': ['32px', { lineHeight: '36px' }],
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        'elevation-2': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'elevation-4': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'elevation-8': '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;