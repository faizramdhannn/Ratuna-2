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
        // Shopify Dark Theme Colors
        shopify: {
          // Main backgrounds
          'dark': '#0A0A0A',
          'charcoal': '#1A1A1A',
          'darker': '#0F0F0F',
          
          // Gray scale
          'gray-900': '#111111',
          'gray-800': '#1F1F1F',
          'gray-700': '#2A2A2A',
          'gray-600': '#404040',
          'gray-500': '#6B6B6B',
          'gray-400': '#8F8F8F',
          'gray-300': '#B8B8B8',
          'gray-200': '#E0E0E0',
          'gray-100': '#F5F5F5',
          
          // Accent colors
          'accent-primary': '#5C6AC4',
          'accent-success': '#00A47C',
          'accent-warning': '#FFC453',
          'accent-critical': '#DE3618',
          
          // Semantic colors
          'green-900': '#003D2B',
          'green-800': '#004D36',
          'green-300': '#5FD9B3',
          'blue-900': '#001F4D',
          'blue-800': '#002E6D',
          'blue-300': '#5C9FFF',
        }
      },
      borderRadius: {
        'shopify': '8px',
        'shopify-lg': '12px',
      },
      boxShadow: {
        'shopify': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'shopify-lg': '0 4px 12px rgba(0, 0, 0, 0.5)',
        'shopify-xl': '0 8px 24px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}