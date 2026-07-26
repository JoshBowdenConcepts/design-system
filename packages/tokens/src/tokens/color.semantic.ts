import { defineSemantic } from "../types";

/**
 * Semantic color tokens.
 *
 * Each token aliases a primitive from the palette, per color mode. These are
 * what UI should consume (`--color-bg-canvas`, `--color-text-primary`, …) so
 * that switching modes only changes this layer, never the primitives.
 */
export const semanticColor = defineSemantic("color", "color", {
  // Backgrounds
  "bg-canvas": { light: "neutral-0", dark: "neutral-900" },
  "bg-surface": { light: "neutral-50", dark: "neutral-800" },
  "bg-surface-raised": { light: "neutral-0", dark: "neutral-700" },

  // Borders
  "border-default": { light: "neutral-200", dark: "neutral-700" },
  "border-strong": { light: "neutral-300", dark: "neutral-600" },

  // Text
  "text-primary": { light: "neutral-900", dark: "neutral-50" },
  "text-secondary": { light: "neutral-600", dark: "neutral-300" },
  "text-on-accent": { light: "neutral-0", dark: "neutral-0" },

  // Accent
  "accent-default": { light: "brand-500", dark: "brand-400" },
  "accent-hover": { light: "brand-600", dark: "brand-300" },

  // Status
  "success-default": { light: "success-500", dark: "success-500" },
  "warning-default": { light: "warning-500", dark: "warning-500" },
  "danger-default": { light: "danger-500", dark: "danger-500" },
});
