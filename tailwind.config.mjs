/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./formkit.theme.ts",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#DA691C",
      },
      fontFamily: {
        kalam: "Kalam"
      }
    },
  },
  plugins: [],
};
