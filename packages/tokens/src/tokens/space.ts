import { definePrimitives } from "../types";

/**
 * Spacing scale — expressed in rem.
 *
 * Base reference: 1rem = 16px (browser default root font-size).
 * Scale unit:     key 100 = 0.5rem = 8px, so `rem = key / 200`.
 *
 * This makes the fine steps land on clean pixel values (25 = 2px, 50 = 4px,
 * 75 = 6px) while the main scale steps by hundreds (100 = 8px … 1000 = 80px).
 * Keys are unitless numbers so the scale can grow without renaming.
 */
export const space = definePrimitives("space", "space", {
  "0": "0rem", // 0px
  "25": "0.125rem", // 2px
  "50": "0.25rem", // 4px
  "75": "0.375rem", // 6px
  "100": "0.5rem", // 8px
  "150": "0.75rem", // 12px
  "200": "1rem", // 16px
  "300": "1.5rem", // 24px
  "400": "2rem", // 32px
  "500": "2.5rem", // 40px
  "600": "3rem", // 48px
  "700": "3.5rem", // 56px
  "800": "4rem", // 64px
  "900": "4.5rem", // 72px
  "1000": "5rem", // 80px
});
