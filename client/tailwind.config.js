import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb', // You can also use a CSS var or HSL like 'hsl(240, 5%, 84%)'
      },
    },
  },
  plugins: [],
};

export default config;
