import type { PaletteRef } from "../palette.js";
import type { Tokens } from "../types.js";

/**
 * Semantic colour roles. Every value (base and override) is a reference into
 * the private palette (`src/palette.ts`); `src/tokens/index.ts` resolves each
 * reference to a literal colour at build time. The palette itself is never
 * exported or emitted.
 *
 * `ref()` is an identity helper whose typed parameter makes an unknown palette
 * key fail `tsc` for statically-written source (FR-016).
 *
 * Base value = the light-mode colour; each `dark` override is the dark-mode
 * colour. Ratios and rationale live in the design canvas ("Color and Type
 * Pairings").
 */
const ref = (key: PaletteRef): PaletteRef => key;

export const color: Tokens = {
  bg: {
    value: ref("neutral.50"),
    description: "Page background.",
    overrides: {
      dark: {
        value: ref("neutral.950"),
        "768$": {
          ".compact": ref("neutral.900"),
        },
      },
      "768$": ref("neutral.100"),
      ".compact": ref("neutral.25"),
    },
  },
  "bg-raised": {
    value: ref("neutral.0"),
    description: "Raised surface — cards, menus, sheets.",
    overrides: { dark: ref("neutral.925") },
  },
  "bg-sunken": {
    value: ref("neutral.100"),
    description: "Sunken surface — wells, insets, track backgrounds.",
    overrides: { dark: ref("neutral.1000") },
  },

  "text-primary": {
    value: ref("neutral.900"),
    description: "Primary text.",
    overrides: { dark: ref("neutral.25") },
  },
  "text-secondary": {
    value: ref("neutral.700"),
    description: "Secondary text — supporting copy, list rows.",
    overrides: { dark: ref("neutral.350") },
  },
  "text-tertiary": {
    value: ref("neutral.500"),
    description: "Tertiary text — captions, timestamps, placeholders.",
    overrides: { dark: ref("neutral.450") },
  },

  border: {
    value: ref("neutral.200"),
    description: "Default border / divider.",
    overrides: { dark: ref("neutral.850") },
  },
  "border-strong": {
    value: ref("neutral.400"),
    description: "Emphasised border — inputs, focus targets.",
    overrides: { dark: ref("neutral.650") },
  },

  primary: {
    value: ref("emerald.600"),
    description: "Primary / interactive.",
    overrides: { dark: ref("emerald.400") },
  },
  "primary-hover": {
    value: ref("emerald.700"),
    description: "Primary, hovered / pressed.",
    overrides: { dark: ref("emerald.300") },
  },
  "primary-subtle": {
    value: ref("emerald.100"),
    description: "Tinted primary surface — selected rows, subtle fills.",
    overrides: { dark: ref("emerald.850") },
  },
  "on-primary": {
    value: ref("neutral.0"),
    description: "Text / icons on a primary fill.",
    overrides: { dark: ref("emerald.950") },
  },
  "focus-ring": {
    value: ref("emerald.500"),
    description: "Focus ring colour (3px, 2px offset — see layout tokens).",
    overrides: { dark: ref("emerald.300") },
  },

  success: {
    value: ref("emerald.600"),
    description: "Success — shares the primary hue, so always pair with an icon or label.",
    overrides: { dark: ref("emerald.400") },
  },
  info: {
    value: ref("blue.500"),
    description: "Informational.",
    overrides: { dark: ref("blue.300") },
  },
  warning: {
    value: ref("amber.700"),
    description: "Warning.",
    overrides: { dark: ref("amber.300") },
  },
  danger: {
    value: ref("red.600"),
    description: "Error / destructive.",
    overrides: { dark: ref("red.300") },
  },
};
