import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de la guía de marca (crema, blanco, dorado champán, café espresso, beige arena, negro cálido)
        cream: {
          50: "#FBF9F5",
          100: "#F5F0E9",
          200: "#ECE4D8",
          300: "#D9CBB9",
          400: "#C6B49C",
          500: "#B09A7E",
        },
        coffee: {
          50: "#F4EFEA",
          100: "#E3D9D0",
          200: "#C4B3A5",
          300: "#A08B79",
          400: "#7D6552",
          500: "#5E4636",
          600: "#4A3528",
          700: "#3A2A20",
          800: "#2F2520",
          900: "#26231F",
        },
        gold: {
          50: "#FAF5EA",
          100: "#F2E8D0",
          200: "#E6D4A8",
          300: "#D6BC84",
          400: "#C7A86A",
          500: "#96773A",
          600: "#7E6330",
          700: "#6A542C",
          800: "#4A3A1F",
          900: "#2F2413",
        },
        // Colores de acento según servicio
        rosa: "#E9A8B5",
        rojo: "#D9534F",
        naranja: "#F4A942",
        amarillo: "#F6D66A",
        verde: "#A7C557",
        azul: "#9FC5E8",
        lila: "#C9A0C7",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        bodoni: ["var(--font-bodoni)", "Georgia", "serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(160deg, #4A3528 0%, #3A2A20 55%, #26231F 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(74,53,40,0.95) 0%, rgba(38,35,31,0.97) 100%)",
        "gold-gradient": "linear-gradient(135deg, #C7A86A 0%, #C7A86A 100%)",
        "cream-gradient": "linear-gradient(160deg, #F5F0E9 0%, #F5F0E9 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 1s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(199, 168, 106, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(199, 168, 106, 0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      letterSpacing: {
        widest2: "0.25em",
        widest3: "0.35em",
      },
    },
  },
  plugins: [],
};

export default config;
