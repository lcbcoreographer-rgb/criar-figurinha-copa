/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ng: '#00FF87',
        nd: '#00CC6A',
        gd: '#FFD700',
        gdm: '#C9A227',
        dark: '#0A0A0A',
        card: '#161616',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        raj: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        shimmer: 'shimmer 2.5s infinite',
        'count-up': 'countUp 0.3s ease-out',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(var(--rot,0deg))' },
          '50%': { transform: 'translateY(-18px) rotate(var(--rot,0deg))' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(0,255,135,0.3), 0 0 60px rgba(0,255,135,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(0,255,135,0.6), 0 0 100px rgba(0,255,135,0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
