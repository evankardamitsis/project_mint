import type { Config } from "tailwindcss";

/**
 * Consumer marketplace palette (see also `src/app/globals.css` :root / @theme).
 * Loaded via `@config` in globals for Tailwind v4.
 */
export default {
  theme: {
    extend: {
      colors: {
        background: "#F7F6F3",
        surface: "#FFFFFF",
        border: "#EEECE8",
        ink: {
          DEFAULT: "#111111",
          2: "#6B6B6B",
          3: "#ABABAB",
        },
        mint: {
          DEFAULT: "#1D9E75",
          tint: "#E8F7F1",
          dark: "#0A5C43",
        },
        amber: {
          DEFAULT: "#C47A15",
          tint: "#FEF3E2",
        },
        danger: {
          DEFAULT: "#CC4444",
          tint: "#FEEDED",
        },
      },
    },
  },
} satisfies Config;
