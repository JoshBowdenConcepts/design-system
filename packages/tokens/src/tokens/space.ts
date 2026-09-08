import type { Tokens } from "../types.js";

/**
 * Spacing scale. Values are literal lengths.
 *
 * Placeholder values — not a final scale.
 */
export const space: Tokens = {
  sm: { value: "0.5rem", description: "Small gap." },
  md: {
    value: "1rem",
    description: "Default gap.",
    overrides: {
      dark: "1.125rem",
      "768$": "1.5rem",
      ".compact": "0.75rem",
    },
  },
  lg: { value: "2rem", description: "Large gap." },
};
