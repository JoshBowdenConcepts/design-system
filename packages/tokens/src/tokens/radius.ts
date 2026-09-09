import type { Tokens } from "../types.js";

/**
 * Corner radius scale. Ordinal steps in hundreds (no meaningful base unit);
 * `radius.full` is the pill value. Values in px.
 */
export const radius: Tokens = {
  "100": { value: "2px", description: "Tags, inline code." },
  "200": { value: "4px", description: "Fields, inputs." },
  "300": { value: "8px", description: "Cards." },
  "400": { value: "14px", description: "Sheets, modals." },
  full: { value: "9999px", description: "Buttons, chips, avatars, icon buttons." },
};
