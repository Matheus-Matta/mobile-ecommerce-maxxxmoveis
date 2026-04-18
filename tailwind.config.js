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
        // cores reais do site maxxxmoveis.com.br
        brand: {
          DEFAULT: "#0058BB",
          hover:   "#004A9D",
          dark:    "#1a1c1c",
          light:   "#f7f7f7",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted:   "#f7f7f7",
          border:  "#e5e7eb",
          card:    "#F3F4F6",
        },
        text: {
          DEFAULT: "#1a1c1c",
          muted:   "#4b5563",
          subtle:  "#9ca3af",
        },
        accent: {
          orange:  "#F97316",
          green:   "#16a34a",
          red:     "#ef4444",
        },
        badge: {
          promo:   "#F97316",
          sale:    "#16a34a",
          danger:  "#ef4444",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
