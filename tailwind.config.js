/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'cyber-pulse': 'neon-pulse 2s infinite',
        'cyber-float': 'float 3s ease-in-out infinite',
        'cyber-glitch': 'cyber-glitch 0.5s infinite',
        'cyber-scan': 'scan-line 4s linear infinite',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #000000 0%, #1a0000 100%)',
        'cyber-grid': 'radial-gradient(rgba(255, 0, 0, 0.1) 1px, transparent 1px)',
      },
      boxShadow: {
        'neon': '0 0 5px rgba(255, 0, 0, 0.2), 0 0 20px rgba(255, 0, 0, 0.1), 0 0 60px rgba(255, 0, 0, 0.1)',
        'neon-hover': '0 0 5px rgba(255, 0, 0, 0.3), 0 0 20px rgba(255, 0, 0, 0.2), 0 0 60px rgba(255, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};