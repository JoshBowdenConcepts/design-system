import type { Token } from "../types.js";

/**
 * Placeholder token — NOT a real design value.
 *
 * It exists only so the generate pipeline has something to emit and tests have
 * something to assert. Delete this file (and its entry in `index.ts`) when the
 * first real tokens land.
 */
export const placeholder: Token = {
  value: 0,
  description: "Placeholder token — not a real design value.",
};
