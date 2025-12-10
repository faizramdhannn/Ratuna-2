/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        shopify: {
          // Dark theme colors
          dark: '#0a0a0a',
          darker: '#141414',
          charcoal: '#1a1a1a',
          
          // Gray scale
          gray: {
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#2d2d2d',
          },
          
          // Accent colors
          accent: {
            primary: '#5C6AC4',
            success: '#00A47C',
            critical: '#DE3618',
          },
          
          // Blue colors
          blue: {
            300: '#60a5fa',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          
          // Green colors
          green: {
            300: '#86efac',
            800: '#166534',
            900: '#14532d',
          },
        },
      },
      borderRadius: {
        'shopify': '0.5rem',
        'shopify-lg': '0.75rem',
      },
      boxShadow: {
        'shopify': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        'shopify-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'shopify-xl': '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}