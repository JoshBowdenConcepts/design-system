import type { ColorMode, GoogleFontSpec, TokenCategory } from "./types";

/**
 * Serializable description of the token set. Emitted as `manifest.json` by the
 * generator and consumed by docs (Storybook) to render token galleries.
 */

export interface PrimitiveManifestEntry {
  kind: "primitive";
  /** Token key within its group, e.g. "brand-500". */
  key: string;
  /** Generated CSS custom property name, e.g. "--color-brand-500". */
  cssVar: string;
  /** `var(--color-brand-500)` — convenient for direct use in docs. */
  cssRef: string;
  /** The token's value. */
  value: string;
}

export interface SemanticManifestEntry {
  kind: "semantic";
  key: string;
  cssVar: string;
  cssRef: string;
  /** Per-mode alias info: which primitive it points to and the resolved value. */
  modes: Record<ColorMode, { ref: string; value: string }>;
}

export interface FontFamilyManifestEntry {
  kind: "font";
  key: string;
  cssVar: string;
  cssRef: string;
  /** Full CSS font stack, including fallbacks. */
  stack: string;
  /** Present when the family is fetched from Google Fonts. */
  google?: GoogleFontSpec;
}

export type TokenManifestEntry =
  | PrimitiveManifestEntry
  | SemanticManifestEntry
  | FontFamilyManifestEntry;

export interface TokenManifestGroup {
  name: string;
  category: TokenCategory;
  kind: "primitive" | "semantic" | "font";
  tokens: TokenManifestEntry[];
}

export interface TokenManifest {
  modes: ColorMode[];
  defaultMode: ColorMode;
  groups: TokenManifestGroup[];
}
