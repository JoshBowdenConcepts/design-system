/**
 * Private colour palette — NOT part of the public token API.
 *
 * Semantic colour tokens (`src/tokens/color.ts`) reference these entries by key.
 * `src/tokens/index.ts` resolves every reference to its literal value during
 * assembly, so the palette never reaches `tokens.css`, `dist/web/index.d.ts`,
 * `resolvedTokens`, or the Swift output. This module is deliberately NOT
 * re-exported from `src/index.ts`.
 *
 * Placeholder values — not a real palette.
 */

export const palette = {
  "neutral.0": "#ffffff",
  "neutral.100": "#f4f4f5",
  "neutral.700": "#3f3f46",
  "neutral.900": "#111111",
  "blue.300": "#93c5fd",
  "blue.500": "#3b82f6",
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
