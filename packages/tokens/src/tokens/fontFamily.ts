import { defineFontFamily } from "../types";

/**
 * Font family tokens.
 *
 * Each token is a full CSS font stack (webfont first, then robust system
 * fallbacks so text stays readable before/if the webfont fails to load).
 *
 * Tokens that carry a `google` spec are fetched from Google Fonts. The
 * generator collects every spec into a single `@import` at the top of
 * `variables.css`, so a family is only downloaded because it's a token here —
 * nothing is requested that the system doesn't reference.
 *
 * Roles:
 *   - heading — Manrope: geometric, slightly tighter; great for display/headings.
 *   - body    — Inter: highly legible at small sizes; body copy and data/UI text.
 *   - mono    — JetBrains Mono: code, tabular numbers, and dense data readouts.
 */
export const fontFamily = defineFontFamily("font-family", {
  heading: {
    stack:
      '"Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    google: { family: "Manrope", axes: "wght@400;500;600;700;800" },
  },
  body: {
    stack:
      '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    google: { family: "Inter", axes: "wght@400;500;600;700" },
  },
  mono: {
    stack:
      '"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    google: { family: "JetBrains Mono", axes: "wght@400;500;600;700" },
  },
});
