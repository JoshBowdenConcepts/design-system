/**
 * Private colour palette — NOT part of the public token API.
 *
 * Semantic colour tokens (`src/tokens/color.ts`) reference these entries by key.
 * `src/tokens/index.ts` resolves every reference to its literal value during
 * assembly, so the palette never reaches `tokens.css`, `dist/web/index.d.ts`,
 * `resolvedTokens`, or the Swift output. This module is deliberately NOT
 * re-exported from `src/index.ts`.
 *
 * Ramps are keyed `<hue>.<step>`, steps in hundreds (50 and sub-hundred steps
 * exist where a semantic role needs one). `emerald` is the brand hue; `neutral`
 * is a faintly green-cool grey (chroma < 0.01). `blue` / `amber` / `red` carry
 * only the two steps each status role needs.
 */

export const palette = {
  // Brand — emerald
  "emerald.50": "#f0fbf5",
  "emerald.100": "#dbf6e7",
  "emerald.200": "#b4edce",
  "emerald.300": "#7de7b4",
  "emerald.400": "#55e39b",
  "emerald.500": "#17a96d",
  "emerald.600": "#04724d",
  "emerald.700": "#045c3f",
  "emerald.800": "#04452f",
  "emerald.850": "#15291f", // dark-mode primary-subtle surface
  "emerald.900": "#032b1e",
  "emerald.950": "#06140d", // dark-mode on-primary text

  // Neutral — green-cool grey
  "neutral.0": "#ffffff",
  "neutral.25": "#eff6f3", // dark-mode primary text
  "neutral.50": "#fbfcfc",
  "neutral.100": "#f1f5f3",
  "neutral.200": "#e3eae7",
  "neutral.300": "#c9d2ce",
  "neutral.350": "#b9c7c2", // dark-mode secondary text
  "neutral.400": "#9aa6a1",
  "neutral.450": "#869590", // dark-mode tertiary text
  "neutral.500": "#6e7b76",
  "neutral.600": "#52605a",
  "neutral.650": "#46554e", // dark-mode strong border
  "neutral.700": "#384540",
  "neutral.800": "#202b26",
  "neutral.850": "#223029", // dark-mode border
  "neutral.900": "#101815",
  "neutral.925": "#141f1a", // dark-mode raised surface
  "neutral.950": "#0b1210", // dark-mode page background
  "neutral.1000": "#070c0a", // dark-mode sunken surface

  // Status — blue (info)
  "blue.300": "#8fb4ff",
  "blue.500": "#0b57d0",
  "blue.700": "#08409b",

  // Status — amber (warning)
  "amber.300": "#f1be5a",
  "amber.700": "#8a5200",

  // Status — red (danger)
  "red.300": "#ff9e96",
  "red.600": "#b3261e",
} as const;

export type PaletteRef = keyof typeof palette;

/**
 * Resolve a palette reference to its literal colour, or throw an error naming
 * the token and the missing key (rejection R10).
 */
export function resolvePaletteRef(ref: string, tokenName: string): string {
  if (Object.prototype.hasOwnProperty.call(palette, ref)) {
    return palette[ref as PaletteRef];
  }
  throw new Error(`${tokenName}: unknown palette key '${ref}'`);
}
