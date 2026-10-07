import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B5CFF",
        orange: "#FF742E",
        background: "#F7F7FA",
        text: "#232333",
        "text-muted": "#747487",
        border: "#E0E0E6",
        "room-bg": "#1A1A1A",
        "room-control": "#222222",
        "room-tile": "#2D2D2D",
        danger: "#E02828",
      },
      fontFamily: {
        sans: ["var(--font-lato)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        btn: "8px",
        modal: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
