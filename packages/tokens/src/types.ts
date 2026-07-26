/**
 * Token schema.
 *
 * Two kinds of token groups:
 *   - "primitive": raw, mode-agnostic values (the palette).
 *   - "semantic":  mode-aware tokens that *alias* primitives. Each semantic
 *     token provides a value per color mode, referencing a primitive by key.
 *
 * Color modes are attribute-scoped (see the generator) rather than using the
 * CSS `light-dark()` function, so the system scales beyond two modes.
 */

export type TokenCategory = "color";

export const COLOR_MODES = ["light", "dark"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];
export const DEFAULT_COLOR_MODE: ColorMode = "light";

/** Raw values keyed by token name, e.g. { "brand-500": "#2f6bff" }. */
export type PrimitiveTokens = Record<string, string>;

/**
 * Per-mode aliases. Each value is the *key* of a primitive token in the same
 * category (e.g. "neutral-0"), resolved to `var(--<prefix>-<key>)` at build.
 */
export type ModeMap = Record<ColorMode, string>;
export type SemanticTokens = Record<string, ModeMap>;

export interface PrimitiveGroup {
  /** CSS variable prefix, e.g. "color" -> --color-*. */
  name: string;
  category: TokenCategory;
  kind: "primitive";
  tokens: PrimitiveTokens;
}

export interface SemanticGroup {
  name: string;
  category: TokenCategory;
  kind: "semantic";
  tokens: SemanticTokens;
}

export type TokenGroup = PrimitiveGroup | SemanticGroup;

export function definePrimitives(
  name: string,
  category: TokenCategory,
  tokens: PrimitiveTokens,
): PrimitiveGroup {
  return { name, category, kind: "primitive", tokens };
}

export function defineSemantic(
  name: string,
  category: TokenCategory,
  tokens: SemanticTokens,
): SemanticGroup {
  return { name, category, kind: "semantic", tokens };
}
