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
        cream: {
          50: "#FEFDF9",
          100: "#FAF6EE",
          200: "#F4ECD9",
          300: "#EDE0C4",
          400: "#E3D0A8",
          500: "#D4B896",
        },
        coffee: {
          50: "#F5EDE6",
          100: "#E8D5C4",
          200: "#C9A98C",
          300: "#A87D5A",
          400: "#7A5535",
          500: "#5C3D1E",
          600: "#3D2510",
          700: "#2C1A0A",
          800: "#1C1008",
          900: "#120A04",
        },
        gold: {
          50: "#FBF5E6",
          100: "#F5E8C5",
          200: "#EACF8B",
          300: "#D9B456",
          400: "#C49A2E",
          500: "#A87E1A",
          600: "#8A630F",
          700: "#6B4B08",
          800: "#4D3305",
          900: "#2F1E02",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(160deg, #2C1A0A 0%, #1C1008 40%, #3D2510 70%, #5C3D1E 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(60,35,15,0.9) 0%, rgba(30,15,5,0.95) 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #C49A2E 0%, #D9B456 50%, #A87E1A 100%)",
        "cream-gradient":
          "linear-gradient(160deg, #FEFDF9 0%, #F4ECD9 50%, #FAF6EE 100%)",
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
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(196, 154, 46, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(196, 154, 46, 0)" },
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
