import { definePrimitives } from "../types";

/**
 * Color palette — raw, internal color scales.
 *
 * These primitives are NOT part of the public API and are not emitted as CSS
 * variables. They exist solely to be referenced by semantic color tokens
 * (see `color.semantic.ts`), which is what consumers should use.
 */
export const palette = definePrimitives(
  "color",
  "color",
  {
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

    // Success
    "success-50": "#e9f7ef",
    "success-100": "#c8ecd7",
    "success-200": "#93dab0",
    "success-300": "#5bc487",
    "success-400": "#33ac68",
    "success-500": "#1f9d55",
    "success-600": "#178047",
    "success-700": "#136639",
    "success-800": "#114f2e",
    "success-900": "#0d3a23",

    // Warning
    "warning-50": "#fdf5e7",
    "warning-100": "#f9e4bd",
    "warning-200": "#f2c979",
    "warning-300": "#eaae3c",
    "warning-400": "#e29a1c",
    "warning-500": "#d98b0a",
    "warning-600": "#b67208",
    "warning-700": "#915a08",
    "warning-800": "#6e4508",
    "warning-900": "#4d3006",

    // Danger
    "danger-50": "#fdecec",
    "danger-100": "#f9cfcf",
    "danger-200": "#f0a3a3",
    "danger-300": "#e57373",
    "danger-400": "#dd5757",
    "danger-500": "#d64545",
    "danger-600": "#b83636",
    "danger-700": "#932c2c",
    "danger-800": "#6f2222",
    "danger-900": "#4d1818",
  },
  { internal: true },
);
