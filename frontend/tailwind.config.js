/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ermBg: "#F7F6F2",
        ermSurface: "#FFFFFF",
        ermText: "#252923",
        ermMuted: "#6B7268",
        ermDivider: "#E5E3DC",
        ermBrand: "#345B49",
        ermBrandHover: "#284738",
        ermBrandLight: "#EBF1ED",
        ermAccent: "#879985",
        // Urgency color scale
        urgencyCritical: "#A83232",
        urgencyCriticalLight: "#FBF0F0",
        urgencyHigh: "#B86635",
        urgencyHighLight: "#FCF3EC",
        urgencyModerate: "#B18A37",
        urgencyModerateLight: "#FCF8ED",
        urgencyLow: "#66816B",
        urgencyLowLight: "#EFF5F1",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px'
      }
    },
  },
  plugins: [],
}
