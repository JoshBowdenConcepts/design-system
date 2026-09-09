import type { Tokens } from "../types.js";

/**
 * Spacing scale. 8px base unit = `space.100`; the step number tracks that
 * multiple ×100 (`space.200` = 16px, `space.800` = 64px), with sub-base steps
 * `space.25` / `space.50` for hairline work. Values in rem (÷16). Same numeric
 * values apply as pt on iOS.
 *
 * Only these steps ship — no arbitrary values. Vertical rhythm inside a
 * component uses 100/150; spacing between components starts at 200.
 */
export const space: Tokens = {
  "25": { value: "0.125rem", description: "2px — hairline nudges, icon optical fixes." },
  "50": { value: "0.25rem", description: "4px — icon-to-label, chip inner padding." },
  "100": { value: "0.5rem", description: "8px — label-to-field, tight stacks." },
  "150": { value: "0.75rem", description: "12px — chip / small-card padding, list rows." },
  "200": { value: "1rem", description: "16px — default gutter, mobile card padding." },
  "300": { value: "1.5rem", description: "24px — between form groups, web card padding." },
  "400": { value: "2rem", description: "32px — between content blocks." },
  "600": { value: "3rem", description: "48px — section spacing inside a page." },
  "800": { value: "4rem", description: "64px — between major sections." },
  "1200": { value: "6rem", description: "96px — page top padding on web, hero breathing room." },
};
