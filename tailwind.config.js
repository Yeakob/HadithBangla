/** @type {import('tailwindcss').Config} */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), raised: v('raised'), ink: v('ink'), muted: v('muted'),
        line: v('line'), emerald: v('emerald'), forest: v('forest'), gold: v('gold'), goldsoft: v('goldsoft'),
        night: v('night'), ivory: v('ivory'), ok: v('ok'), warn: v('warn'), bad: v('bad'),
      },
      fontFamily: {
        bn: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
        ar: ['Amiri', '"Noto Naskh Arabic"', '"Times New Roman"', 'serif'],
        en: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgb(var(--line) / .6), 0 10px 30px -18px rgb(var(--shadow) / .45)',
        lift: '0 24px 60px -28px rgb(var(--shadow) / .6)',
      },
    },
  },
  plugins: [],
}
