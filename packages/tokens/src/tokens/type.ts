import type { Tokens } from "../types.js";

/**
 * Typography tokens. Each value is a complete CSS `font` shorthand
 * (`font: <style> <variant> <weight> <size>/<line-height> <family>`), so one
 * declaration applies the whole type style: `font: var(--ds-type-p);`.
 *
 * Display sizes (`display`, `h1`, `h2`) use Bricolage Grotesque; everything from
 * `h3` down uses Public Sans so text stays legible small; `overline` uses IBM
 * Plex Mono. The three families are loaded by `tokens.css` (see `src/fonts.ts`).
 *
 * Sizes in rem (÷16 from the canvas px), line-height unitless (size ÷ lh px).
 * Letter-spacing and text-transform are not expressible in the `font` shorthand
 * and are deferred to a later hardening pass.
 */
const DISPLAY = "'Bricolage Grotesque', sans-serif";
const TEXT = "'Public Sans', sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

export const type: Tokens = {
  display: { value: `normal normal 800 2.5rem/1.05 ${DISPLAY}`, description: "Largest display heading. iOS largeTitle." },
  h1: { value: `normal normal 800 2rem/1.125 ${DISPLAY}`, description: "Page title. iOS title1." },
  h2: { value: `normal normal 600 1.625rem/1.15 ${DISPLAY}`, description: "Section heading. iOS title2." },
  h3: { value: `normal normal 700 1.3125rem/1.24 ${TEXT}`, description: "Subsection heading. iOS title3." },
  h4: { value: `normal normal 700 1.0625rem/1.29 ${TEXT}`, description: "Minor heading. iOS headline." },
  p: { value: `normal normal 400 1rem/1.625 ${TEXT}`, description: "Body copy. iOS body." },
  "p-sm": { value: `normal normal 400 0.9375rem/1.53 ${TEXT}`, description: "Secondary running text, list rows. iOS callout." },
  label: { value: `normal normal 500 0.875rem/1.43 ${TEXT}`, description: "Form labels, table headers. iOS subheadline." },
  caption: { value: `normal normal 400 0.8125rem/1.46 ${TEXT}`, description: "Helper text, timestamps. iOS footnote — floor for body text." },
  overline: { value: `normal normal 500 0.75rem/1.33 ${MONO}`, description: "Values, IDs, code captions. IBM Plex Mono." },
};
