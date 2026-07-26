import type { ColorMode, TokenCategory } from "./types";

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

export type TokenManifestEntry = PrimitiveManifestEntry | SemanticManifestEntry;

export interface TokenManifestGroup {
  name: string;
  category: TokenCategory;
  kind: "primitive" | "semantic";
  tokens: TokenManifestEntry[];
}

export interface TokenManifest {
  modes: ColorMode[];
  defaultMode: ColorMode;
  groups: TokenManifestGroup[];
}
