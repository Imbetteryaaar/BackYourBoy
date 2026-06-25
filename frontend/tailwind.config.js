/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: '#FFF7ED',
        'team-a': '#FF7AA2',     // coral pink (Team A)
        'team-a-dk': '#E84F7E',
        'team-b': '#4FC0E8',     // sky blue (Team B)
        'team-b-dk': '#2A9BD4',
        sun: '#FFD23F',          // accent yellow
        grape: '#8B5CF6',        // accent purple
        mint: '#34D399',
        ink: '#3B2E4A',          // soft dark text
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        sans: ['Fredoka', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      boxShadow: {
        toon: '0 6px 0 0 rgba(59,46,74,0.18), 0 10px 25px -5px rgba(59,46,74,0.25)',
        'toon-sm': '0 4px 0 0 rgba(59,46,74,0.16)',
        'toon-lg': '0 10px 0 0 rgba(59,46,74,0.18), 0 20px 40px -10px rgba(59,46,74,0.35)',
        pop: '0 0 0 4px #fff, 0 8px 20px rgba(0,0,0,0.18)',
      },
      animation: {
        pop: 'pop 0.35s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
        bob: 'bob 2.2s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite',
        'bounce-soft': 'bounceSoft 1.4s ease-in-out infinite',
        blob: 'blob 9s ease-in-out infinite',
        gradient: 'gradientShift 14s ease infinite',
        'pulse-ring': 'pulseRing 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(0.7)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        wiggle: { '0%,100%': { transform: 'rotate(-4deg)' }, '50%': { transform: 'rotate(4deg)' } },
        bob: { '0%,100%': { transform: 'translateY(0) rotate(-1deg)' }, '50%': { transform: 'translateY(-6px) rotate(1deg)' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px) rotate(-2deg)' }, '75%': { transform: 'translateX(5px) rotate(2deg)' } },
        bounceSoft: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-18px)' } },
        blob: {
          '0%,100%': { borderRadius: '42% 58% 63% 37% / 42% 44% 56% 58%' },
          '50%': { borderRadius: '58% 42% 38% 62% / 58% 56% 44% 42%' },
        },
        gradientShift: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: '0.6' }, '100%': { transform: 'scale(2)', opacity: '0' } },
      },
    },
  },
  plugins: [],
}
