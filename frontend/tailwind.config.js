/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.12)',
          medium: 'rgba(255, 255, 255, 0.18)',
          heavy: 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
      },
      backdropBlur: {
        glass: '20px',
        'glass-heavy': '40px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'morph': 'morph 8s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'ripple': 'ripple 0.6s linear',
        'particle': 'particle 20s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'liquid': 'liquid 7s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'tilt': 'tilt 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.2)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-10vh) rotate(720deg)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        liquid: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'rotate(0deg) scale(1)' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', transform: 'rotate(90deg) scale(1.02)' },
          '50%': { borderRadius: '50% 60% 30% 60% / 30% 60% 70% 40%', transform: 'rotate(180deg) scale(1)' },
          '75%': { borderRadius: '60% 40% 60% 40% / 70% 30% 50% 60%', transform: 'rotate(270deg) scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        tilt: {
          '0%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' },
          '100%': { transform: 'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))' },
        },
      },
    },
  },
  plugins: [],
};
