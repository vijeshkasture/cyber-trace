/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          bg: '#f8fafc',          // Clean slate-50 canvas
          surface: '#ffffff',     // Crisp white panels
          card: '#ffffff',        // White cards
          cardHover: '#f8fafc',   // Subtle hover
          subtle: '#f1f5f9',      // Slate-100 secondary background
          border: '#e2e8f0',      // Slate-200 clean borders
          borderStrong: '#cbd5e1',// Slate-300 headers/dividers
          navy: '#0f172a',        // Deep police navy for top bar or high-contrast elements
          navyMuted: '#1e293b',   // Slate-800
          text: '#0f172a',        // Slate-900 primary text
          textMuted: '#475569',   // Slate-600 secondary text
          textDim: '#64748b',     // Slate-500 tertiary/metadata text
          accent: '#1d4ed8',      // Law enforcement blue (blue-700)
          accentHover: '#1e40af', // blue-800
          accentLight: '#eff6ff', // blue-50 subtle highlight
          accentBorder: '#bfdbfe',// blue-200
          critical: '#dc2626',    // red-600
          criticalBg: '#fef2f2',  // red-50
          criticalBorder: '#fecaca', // red-200
          high: '#ea580c',        // orange-600
          highBg: '#fff7ed',      // orange-50
          highBorder: '#fed7aa',  // orange-200
          medium: '#d97706',      // amber-600
          mediumBg: '#fffbeb',    // amber-50
          mediumBorder: '#fde68a',// amber-200
          low: '#16a34a',         // green-600
          lowBg: '#f0fdf4',       // green-50
          lowBorder: '#bbf7d0',   // green-200
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'SFMono-Regular', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
