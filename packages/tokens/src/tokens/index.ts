import type { Breakpoints, Tokens } from "../types.js";
import { placeholder } from "./placeholder.js";

/**
 * The full token set. One theme part per source file; this barrel assembles
 * them. Scaffold: only the placeholder.
 */
export const tokens: Tokens = {
  placeholder,
};

/**
 * Breakpoint registry (name -> CSS `min-width`). Empty for the scaffold; the
 * generator already supports emitting `@media` blocks when tokens reference a
 * breakpoint name defined here.
 */
export const breakpoints: Breakpoints = {};
