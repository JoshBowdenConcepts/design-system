import type { Tokens } from "../types.js";

/**
 * Layout primitives — the loose structural values from the design canvas that
 * aren't spacing steps: page gutter (responsive), content measure, focus-ring
 * geometry, and the minimum touch target.
 */
export const layout: Tokens = {
  gutter: {
    value: "1rem",
    description: "Screen margin. 16px mobile, 24px tablet, 32px web.",
    overrides: {
      "768$": "1.5rem",
      "1024$": "2rem",
    },
  },
  "max-width": { value: "75rem", description: "Max content width (1200px)." },
  measure: { value: "68ch", description: "Body-copy line-length cap." },
  "touch-min": { value: "44px", description: "Minimum touch target (iOS + web)." },
  "focus-ring-width": { value: "3px", description: "Focus ring thickness." },
  "focus-ring-offset": { value: "2px", description: "Focus ring gap from the element." },
};
