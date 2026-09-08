import { resolvePaletteRef } from "../palette.js";
import type { OverrideNode, Token, Tokens } from "../types.js";
import { color } from "./color.js";
import { space } from "./space.js";
import { type } from "./type.js";

/**
 * Breakpoint reference map (name -> px min-width). **Reference only** — the
 * generator reads the number straight out of each `<number>$` override key and
 * never consults this. Authors may spread it for named consistency.
 */
export const breakpoints = { sm: 640, md: 768, lg: 1024 } as const;

/** Categories, in fixed emission order. */
const CATEGORIES: ReadonlyArray<readonly [string, Tokens]> = [
  ["type", type],
  ["space", space],
  ["color", color],
];

/** Recursively replace every palette-reference leaf with its literal colour. */
function resolveColorNode(node: OverrideNode, tokenName: string): OverrideNode {
  if (typeof node !== "object" || node === null) {
    return resolvePaletteRef(String(node), tokenName);
  }
  const out: { value?: string; [key: string]: OverrideNode | undefined } = {};
  for (const [key, child] of Object.entries(node)) {
    if (child === undefined) continue;
    out[key] =
      key === "value"
        ? resolvePaletteRef(String(child), tokenName)
        : resolveColorNode(child, tokenName);
  }
  return out;
}

function resolveColorToken(name: string, token: Token): Token {
  const resolved: Token = { value: resolvePaletteRef(String(token.value), name) };
  if (token.description !== undefined) resolved.description = token.description;
  if (token.overrides) {
    const overrides: Record<string, OverrideNode> = {};
    for (const [key, child] of Object.entries(token.overrides)) {
      if (child === undefined) continue;
      overrides[key] = resolveColorNode(child, name);
    }
    resolved.overrides = overrides;
  }
  return resolved;
}

/**
 * The full, assembled token set. Keys are `<category>.<name>`. Colour values are
 * already resolved from the private palette to literal colours — nothing
 * palette-shaped survives into this object.
 */
export const tokens: Tokens = (() => {
  const out: Tokens = {};
  const seen = new Set<string>();
  for (const [category, set] of CATEGORIES) {
    for (const [key, token] of Object.entries(set)) {
      const name = `${category}.${key}`;
      if (seen.has(name)) {
        throw new Error(`duplicate token name '${name}' (category '${category}')`);
      }
      seen.add(name);
      out[name] = category === "color" ? resolveColorToken(name, token) : token;
    }
  }
  return out;
})();
