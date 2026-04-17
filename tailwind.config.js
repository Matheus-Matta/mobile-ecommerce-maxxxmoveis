/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A1A2E",
          50:  "#f0f0f7",
          100: "#d9d9ee",
          200: "#b3b3dc",
          300: "#8c8ccb",
          400: "#6666b9",
          500: "#4040a8",
          600: "#333397",
          700: "#262680",
          800: "#1A1A2E",
          900: "#0d0d1f",
        },
        accent: {
          DEFAULT: "#E94560",
          light: "#f0738a",
          dark: "#c0243d",
        },
        surface: {
          DEFAULT: "#16213E",
          card: "#0F3460",
        },
        neutral: {
          50:  "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
