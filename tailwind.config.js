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
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.blue.400"),
              "&:hover": {
                color: theme("colors.blue.300"),
              },
            },
            h1: {
              fontFamily: "var(--font-serif)",
              fontWeight: "600",
              color: theme("colors.gray.100"),
            },
            h2: {
              fontFamily: "var(--font-serif)",
              fontWeight: "600",
              color: theme("colors.gray.100"),
            },
            h3: {
              fontFamily: "var(--font-serif)",
              fontWeight: "600",
              color: theme("colors.gray.100"),
            },
            h4: {
              fontFamily: "var(--font-serif)",
              fontWeight: "600",
              color: theme("colors.gray.100"),
            },
            h5: {
              fontFamily: "var(--font-serif)",
              fontWeight: "600",
              color: theme("colors.gray.100"),
            },
            h6: {
              fontFamily: "var(--font-serif)",
              fontWeight: "600",
              color: theme("colors.gray.100"),
            },
            blockquote: {
              color: theme("colors.gray.300"),
              borderLeftColor: theme("colors.gray.700"),
            },
            "ul > li::before": {
              backgroundColor: theme("colors.gray.700"),
            },
            "ol > li::before": {
              color: theme("colors.gray.400"),
            },
            hr: {
              borderColor: theme("colors.gray.800"),
            },
            strong: {
              color: theme("colors.gray.100"),
            },
            thead: {
              color: theme("colors.gray.100"),
              borderBottomColor: theme("colors.gray.700"),
            },
            tbody: {
              tr: {
                borderBottomColor: theme("colors.gray.800"),
              },
            },
            code: {
              color: theme("colors.gray.100"),
              backgroundColor: theme("colors.gray.800"),
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
            },
            pre: {
              backgroundColor: theme("colors.gray.900"),
              borderColor: theme("colors.gray.800"),
              color: theme("colors.gray.100"),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
};
