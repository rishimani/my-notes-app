/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gray: {
          950: "#0a0a0a",
          900: "#121212",
          800: "#1f1f1f",
          700: "#2e2e2e",
          600: "#4a4a4a",
          500: "#6e6e6e",
          400: "#909090",
          300: "#b3b3b3",
          200: "#d1d1d1",
          100: "#e8e8e8",
          50: "#f5f5f5",
        },
        blue: {
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      typography: (theme) => ({
        invert: {
          css: {
            "--tw-prose-body": theme("colors.gray[300]"),
            "--tw-prose-headings": theme("colors.gray[100]"),
            "--tw-prose-lead": theme("colors.gray[300]"),
            "--tw-prose-links": theme("colors.blue[600]"),
            "--tw-prose-bold": theme("colors.gray[100]"),
            "--tw-prose-counters": theme("colors.gray[400]"),
            "--tw-prose-bullets": theme("colors.gray[400]"),
            "--tw-prose-hr": theme("colors.gray[700]"),
            "--tw-prose-quotes": theme("colors.gray[300]"),
            "--tw-prose-quote-borders": theme("colors.gray[700]"),
            "--tw-prose-captions": theme("colors.gray[400]"),
            "--tw-prose-code": theme("colors.gray[100]"),
            "--tw-prose-pre-code": theme("colors.gray[300]"),
            "--tw-prose-pre-bg": theme("colors.gray[800]"),
            "--tw-prose-th-borders": theme("colors.gray[700]"),
            "--tw-prose-td-borders": theme("colors.gray[700]"),
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
