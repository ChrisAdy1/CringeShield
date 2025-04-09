import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(240, 5%, 84%)', // or use #e5e7eb or any other shade
      },
    },
  },
  plugins: [],
};

export default config;
