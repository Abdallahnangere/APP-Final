import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { blue:'#007AFF', green:'#34C759', red:'#FF3B30', orange:'#FF9500', yellow:'#FFCC00', purple:'#AF52DE', gold:'#D4AF37' }
      },
      fontFamily: { sans: ['DM Sans','system-ui','sans-serif'], display: ['Playfair Display','serif'] }
    }
  },
  plugins: []
};
export default config;
