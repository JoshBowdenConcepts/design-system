/**
 * Custom TypeScript token schema (not DTCG / Style Dictionary).
 *
 * A token has a default `value` plus optional overrides along three variant
 * axes: breakpoints, color modes, and features. The generator projects these
 * into scoped CSS selector blocks (`:root`, `@media`, `[data-theme="dark"]`,
 * `.ds-feature-*`), a typed JS object, and Swift constants.
 */

export type TokenValue = string | number;

export type ColorMode = "light" | "dark";

export interface Token {
  /** Default value — emitted in `:root`. */
  value: TokenValue;
  /** Optional human description, rendered as a comment. */
  description?: string;
  /**
   * Per-breakpoint overrides, keyed by a breakpoint name that MUST exist in
   * the `breakpoints` registry passed to the generator.
   */
  breakpoints?: Record<string, TokenValue>;
  /** Per-color-mode overrides. `light` overrides `:root`; `dark` -> `[data-theme="dark"]`. */
  colorModes?: Partial<Record<ColorMode, TokenValue>>;
  /** Per-feature overrides, keyed by feature name -> `.ds-feature-<name>`. */
  features?: Record<string, TokenValue>;
}

export type Tokens = Record<string, Token>;

/** Breakpoint name -> CSS `min-width` value (e.g. `"md": "48rem"`). */
export type Breakpoints = Record<string, string>;

export interface TokenConfig {
  tokens: Tokens;
  breakpoints: Breakpoints;
}
