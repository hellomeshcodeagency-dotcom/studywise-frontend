/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        black:     '#07070F',
        surface:   '#0E0E1A',
        surface2:  '#13131F',
        border:    'rgba(255,255,255,0.08)',
        violet:    '#7C3AED',
        'violet-l':'#9D5FF5',
        pink:      '#EC4899',
        'pink-l':  '#F472B6',
        cyan:      '#06B6D4',
        'cyan-l':  '#22D3EE',
        gold:      '#F59E0B',
        text:      '#F0F0FF',
        'text-2':  '#A0A0C0',
        'text-3':  '#606080',
      },
    },
  },
  plugins: [],
}
