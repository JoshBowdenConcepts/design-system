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

export type TokenCategory = "color" | "space" | "font";

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
  /**
   * Internal primitives are used only to resolve semantic aliases; they are NOT
   * emitted as public CSS variables nor exported from the package. The palette
   * is internal — consume colors via semantic tokens instead.
   */
  internal: boolean;
  tokens: PrimitiveTokens;
}

export interface SemanticGroup {
  name: string;
  category: TokenCategory;
  kind: "semantic";
  tokens: SemanticTokens;
}

/**
 * Instruction for loading a web font from Google Fonts. Consumed by the
 * generator to build a single `@import` at the top of the CSS. Omit this for
 * system-only stacks (nothing is fetched over the network for those).
 */
export interface GoogleFontSpec {
  /** Family name as Google Fonts knows it, e.g. "Manrope" or "JetBrains Mono". */
  family: string;
  /**
   * The css2 axes tail appended after the family, e.g. "wght@400;500;600;700".
   * Leave undefined to load the family's default (regular 400) face only.
   */
  axes?: string;
}

export interface FontFamilyToken {
  /** Full CSS font stack, including system fallbacks. */
  stack: string;
  /** Google Fonts loading spec; omit for system-only stacks. */
  google?: GoogleFontSpec;
}

export type FontFamilyTokens = Record<string, FontFamilyToken>;

export interface FontFamilyGroup {
  /** CSS variable prefix, e.g. "font-family" -> --font-family-*. */
  name: string;
  category: "font";
  kind: "font";
  tokens: FontFamilyTokens;
}

export type TokenGroup = PrimitiveGroup | SemanticGroup | FontFamilyGroup;

export function definePrimitives(
  name: string,
  category: TokenCategory,
  tokens: PrimitiveTokens,
  options: { internal?: boolean } = {},
): PrimitiveGroup {
  return {
    name,
    category,
    kind: "primitive",
    internal: options.internal ?? false,
    tokens,
  };
}

export function defineSemantic(
  name: string,
  category: TokenCategory,
  tokens: SemanticTokens,
): SemanticGroup {
  return { name, category, kind: "semantic", tokens };
}

export function defineFontFamily(
  name: string,
  tokens: FontFamilyTokens,
): FontFamilyGroup {
  return { name, category: "font", kind: "font", tokens };
}
