import type { Config } from "tailwindcss";

/**
 * Consumer marketplace palette (see also `src/app/globals.css` :root / @theme).
 * Loaded via `@config` in globals for Tailwind v4.
 *
 * Classnames: use arbitrary CSS vars in JSX, e.g. `text-[var(--color-text-muted)]`,
 * not the v4-only `text-(--color-text-muted)` form, so editors and scanners agree.
 */
export default {
  theme: {
    extend: {
      colors: {
        background: "#f5f3ee",
        surface: "#FFFFFF",
        border: "#e0ddd8",
        ink: {
          DEFAULT: "#111111",
          2: "#6B6B6B",
          3: "#ABABAB",
        },
        mint: {
          DEFAULT: "#1a7a4a",
          tint: "#1a7a4a14",
          dark: "#15633c",
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
