# Contract: Token Authoring Schema

The TypeScript surface a token author writes against, and every input the build
rejects. Types live in `packages/tokens/src/types.ts`; enforcement lives in
`packages/tokens/src/resolve.ts`, `src/palette.ts`, and `src/tokens/index.ts`.

## Types

```ts
export type TokenValue = string | number;
export type ColorMode = "light" | "dark";

export type OverrideNode =
  | TokenValue
  | ({ value?: TokenValue } & { [axisKey: string]: OverrideNode });

export interface Token {
  value: TokenValue;                       // base — required
  description?: string;
  overrides?: Record<string, OverrideNode>;
}

export type Tokens = Record<string, Token>; // one category file exports this
```

Resolved shapes (also exported, for non-CSS consumers — FR-013):

```ts
export interface ConditionSet {
  colorMode?: ColorMode;
  minWidth?: number;   // px
  scope?: string;      // class name without the leading dot
}
export interface ResolvedRule {
  name: string;            // "type.body"
  conditions: ConditionSet;
  value: TokenValue;
  specificity: number;     // 0..7
}
```

## Axis-key grammar

A key inside `overrides` (or any nested node) is classified by shape:

| Axis | Regex | Valid | Invalid → error |
|------|-------|-------|-----------------|
| color mode | key ∈ `{"light","dark"}` | `light`, `dark` | `night`, `hc` → `unknown color mode` |
| media query | `^[1-9][0-9]*\$$` | `768$`, `1024$` | `768`, `$768`, `md$`, `0$` → `malformed breakpoint key` |
| class-name scope | `^\.[a-z][a-z0-9-]*$` | `.compact`, `.data-dense` | `.A`, `compact`, `.` → `malformed scope key` |

`value` is reserved — never treated as an axis key. Any key matching none of the
three grammars → error `unrecognised override key`.

## Private colour palette (FR-015/016, research D11)

`src/palette.ts` — **not re-exported from `src/index.ts`**:

```ts
export const palette = {
  "neutral.0": "#ffffff",
  "neutral.900": "#111111",
  "blue.500": "#3b82f6",
  // … placeholder ramp this phase
} as const;
export type PaletteRef = keyof typeof palette;
export function resolvePaletteRef(ref: string, tokenName: string): string;
```

- `src/tokens/color.ts` authors `Token`s whose `value` and every override leaf is
  a `PaletteRef` string.
- `src/tokens/index.ts` maps the `color` category's leaf values through
  `resolvePaletteRef` during assembly → literal colours before any `ResolvedRule`.
- `palette` never appears in `dist/web/tokens.css`, `dist/web/index.d.ts`,
  `resolvedTokens`, or Swift output.
- This applies to the `color` category only; `type` / `space` author literals.

## Category assembly

- Each file in `src/tokens/` exports a `Tokens` record with **un-prefixed** keys.
- `src/tokens/index.ts` imports them in a fixed order and namespaces:
  final name = `<category>.<key>` → CSS var `--ds-<category>-<key>`.
- The `color` category's leaves are palette-resolved during assembly (above).
- Category list and breakpoint reference map are exported from `index.ts`:
  ```ts
  export const breakpoints = { sm: 640, md: 768, lg: 1024 } as const; // reference only
  ```

## Rejection matrix (build fails, non-zero exit, nothing written — FR-007, SC-004)

| # | Condition | Message contains |
|---|-----------|------------------|
| R1 | token has `overrides` but no `value` | token name, `missing base value` |
| R2 | `value` is not string/number | caught by `tsc` (FR-014) |
| R3 | unrecognised override key | token name, the key, `unrecognised override key` |
| R4 | bare word key not in `ColorMode` | token name, the key, `unknown color mode` |
| R5 | media-query key not `^[1-9][0-9]*\$$` | token name, the key, `malformed breakpoint key` |
| R6 | scope key not `^\.[a-z][a-z0-9-]*$` | token name, the key, `malformed scope key` |
| R7 | two override paths reduce to the same `ConditionSet` for one token | token name, the condition-set, `duplicate condition` |
| R8 | node with no `value` and no axis keys | token name, `empty override` |
| R9 | two category+key pairs collide on the final `--ds-*` name | both source locations, `duplicate token name` |
| R10 | a `color` token leaf value is not a known `PaletteRef` | token name, the ref, `unknown palette key` |

## Order-independence guarantee (FR-004)

For any token, these two `overrides` MUST produce identical `ResolvedRule`s:

```ts
overrides: { dark: { "768$": { value: "A" } } }
overrides: { "768$": { dark: { value: "A" } } }
```

Both → `{ conditions: { colorMode: "dark", minWidth: 768 }, value: "A", specificity: 3 }`.

## Empty / well-formed (FR-011)

- `Tokens` = `{}` in a category, or zero category files → build exits 0.
- Generated `tokens.css` still contains a `:root {}` block.
- Generated Swift still contains `public enum DesignSystemTokens {}`.

## Palette privacy (FR-015, SC-007)

- `grep -c 'ds-palette' dist/web/tokens.css` → `0`.
- `dist/web/index.d.ts` exports `tokens`, `resolvedTokens`, and schema types —
  **not** `palette` or `PaletteRef`.
- Every `resolvedTokens` entry whose `name` starts `color.` has a literal colour
  `value`, never a `PaletteRef`.
