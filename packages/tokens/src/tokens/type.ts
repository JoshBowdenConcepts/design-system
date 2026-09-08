import type { Tokens } from "../types.js";

/**
 * Typography tokens. Each value is a complete CSS `font` shorthand
 * (`font: <style> <variant> <weight> <size>/<line-height> <family>`), so one
 * declaration applies the whole type style: `font: var(--ds-type-body);`.
 *
 * Placeholder values — not final type styles.
 */
export const type: Tokens = {
  body: {
    value: "normal normal 400 1rem/1.5 system-ui, sans-serif",
    description: "Body copy.",
    overrides: {
      dark: {
        value: "normal normal 400 1rem/1.6 system-ui, sans-serif",
        ".compact": "normal normal 400 0.9375rem/1.5 system-ui, sans-serif",
      },
      "768$": "normal normal 400 1.125rem/1.5 system-ui, sans-serif",
      ".compact": "normal normal 400 0.875rem/1.4 system-ui, sans-serif",
    },
  },
  heading: {
    value: "normal normal 700 1.5rem/1.25 system-ui, sans-serif",
    description: "Section heading.",
  },
};
