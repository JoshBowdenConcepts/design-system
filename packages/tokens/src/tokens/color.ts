import { definePrimitives } from "../types";

/**
 * Color palette — raw color scales. These are the primitive values; semantic
 * tokens (bg/text/border, mode-aware) alias these in `color.semantic.ts`.
 */
export const color = definePrimitives("color", "color", {
  // Brand
  "brand-50": "#eef4ff",
  "brand-100": "#d9e6ff",
  "brand-200": "#b3ccff",
  "brand-300": "#84a9ff",
  "brand-400": "#5385ff",
  "brand-500": "#2f6bff",
  "brand-600": "#1f4fd6",
  "brand-700": "#1a3ea6",
  "brand-800": "#183577",
  "brand-900": "#152a52",

  // Neutral
  "neutral-0": "#ffffff",
  "neutral-50": "#f6f7f9",
  "neutral-100": "#eceef2",
  "neutral-200": "#d7dbe2",
  "neutral-300": "#b6bcc7",
  "neutral-400": "#8b93a3",
  "neutral-500": "#666e7e",
  "neutral-600": "#4a515e",
  "neutral-700": "#343a44",
  "neutral-800": "#20242b",
  "neutral-900": "#0b0d10",

  // Status
  "success-500": "#1f9d55",
  "warning-500": "#d98b0a",
  "danger-500": "#d64545",
});
