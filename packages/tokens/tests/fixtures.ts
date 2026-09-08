import type { Token, Tokens } from "../src/types.js";

/** A token with only a base value — no overrides. */
export const baseOnly: Token = { value: "1rem" };

/** One token exercising all three axes plus a full three-axis combination. */
export const allAxes: Token = {
  value: "1rem",
  overrides: {
    dark: {
      value: "1.1rem",
      "768$": {
        ".compact": "1.2rem",
      },
    },
    "768$": "1.5rem",
    ".compact": "0.75rem",
  },
};

/**
 * Two tokens whose overrides express the SAME condition-set
 * (`{ colorMode: "dark", minWidth: 768 }`) with the axes nested in opposite
 * orders. `resolveTokens` MUST produce identical rules for both.
 */
export const nestedOrderA: Token = {
  value: "base",
  overrides: { dark: { "768$": { value: "combined" } } },
};
export const nestedOrderB: Token = {
  value: "base",
  overrides: { "768$": { dark: { value: "combined" } } },
};

/** A category that authored no tokens. */
export const emptyCategory: Tokens = {};

/** A token set with one populated and one empty category. */
export const mixedEmpty: Tokens = {
  "space.md": { value: "1rem" },
  // (no `type.*` entries — the "type" category is empty)
};

/* ------------------------------------------------------------------ *
 * Rejection-matrix fixtures. Each is deliberately invalid; the build
 * MUST throw naming the token and the offending key.
 * ------------------------------------------------------------------ */

/** R1 — overrides but no base value. */
export const missingBase = { overrides: { dark: "x" } } as unknown as Token;

/** R3 — a key that matches no axis grammar. */
export const unrecognisedKey: Token = {
  value: "x",
  overrides: { "weird key": "y" },
};

/** R4 — a bare word that is not a known colour mode. */
export const unknownColorMode: Token = {
  value: "x",
  overrides: { night: "y" },
};

/** R5 — a `$`-suffixed key that is not a positive integer. */
export const malformedBreakpoint: Token = {
  value: "x",
  overrides: { "0$": "y" },
};

/** R6 — a `.`-prefixed key that is not lowercase kebab-case. */
export const malformedScope: Token = {
  value: "x",
  overrides: { ".Compact": "y" },
};

/** R7 — two override paths that reduce to the same condition-set. */
export const duplicateCondition: Token = {
  value: "x",
  overrides: {
    dark: { "768$": "a" },
    "768$": { dark: "b" },
  },
};

/** R8 — an override node with neither a `value` nor any axis key. */
export const emptyOverride: Token = {
  value: "x",
  overrides: { dark: {} },
};
