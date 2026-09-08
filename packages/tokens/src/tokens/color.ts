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
 * Placeholder roles — not a final colour system.
 */
const ref = (key: PaletteRef): PaletteRef => key;

export const color: Tokens = {
  bg: {
    value: ref("neutral.0"),
    description: "Page background.",
    overrides: {
      dark: {
        value: ref("neutral.900"),
        ".compact": ref("neutral.700"),
      },
      "1024$": ref("neutral.100"),
      ".compact": ref("neutral.100"),
    },
  },
  fg: {
    value: ref("neutral.900"),
    description: "Primary text.",
    overrides: {
      dark: ref("neutral.0"),
    },
  },
  accent: {
    value: ref("blue.500"),
    description: "Accent / interactive.",
    overrides: {
      dark: ref("blue.300"),
    },
  },
};
