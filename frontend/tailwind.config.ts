import type { Config } from "tailwindcss";

// Carried forward from the original app's design language — the
// halftone/gutter comic-book identity is the one thing worth keeping
// verbatim through the rewrite.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0D",
        surface: "#16161C",
        "surface-2": "#1E1E27",
        "surface-3": "#26262F",
        line: "#2C2C36",
        marvel: { DEFAULT: "#ED1D24", dim: "#6E1114" },
        dc: { DEFAULT: "#0476F2", dim: "#0A3B7A" },
        gold: "#FFC300",
        ink: { DEFAULT: "#F2F1EC", dim: "#9A99A6", faint: "#5C5B66" },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
} satisfies Config;
