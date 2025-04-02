const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        serif: ["Source Serif Pro", "Georgia", "serif"],
        display: ["var(--font-display)", ...fontFamily.sans],
      },
      colors: {
        gray: {
          950: "#0c0c0e",
          900: "#121214",
          800: "#1f1f23",
          700: "#2c2c35",
          600: "#3e3e48",
          500: "#555562",
          400: "#71717a",
          300: "#a1a1aa",
          200: "#d4d4d8",
          100: "#f1f1f3",
        },
        blue: {
          900: "#1e2f6f",
          800: "#1e3a8a",
          700: "#1d4ed8",
          600: "#2563eb",
          500: "#3b82f6",
          400: "#60a5fa",
          300: "#93c5fd",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "#d1d5db",
            a: {
              color: "#3b82f6",
              "&:hover": {
                color: "#60a5fa",
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
  darkMode: "class",
};
