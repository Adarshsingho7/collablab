/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Muted, warm-but-technical color palette (retro-technical aesthetic)
        lab: {
          dark: '#1e2124',
          panel: '#282b30',
          amber: '#ffb000',
          green: '#43b581',
          text: '#dcddde',
          muted: '#72767d',
          border: '#36393f'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
