# Phase 1 Data Model: Token System Foundation

No runtime data store. Entities are the token authoring schema and the
intermediate shapes the resolver and generator pass around. Validation rules
trace to functional requirements in [spec.md](./spec.md).

## Entity: Token

A single named design decision. Authored in a category file.

| Field | Type | Notes |
|-------|------|-------|
| `value` | `TokenValue` (`string \| number`) | Base value. **Required** (FR-002). For `type` tokens, a full CSS `font` shorthand string (FR-003, D8). For `color` tokens, a `PaletteRef` string resolved to a literal colour at build time (FR-015/016, D11). |
| `description` | `string?` | Rendered as a comment in generated output. |
| `overrides` | `Record<string, OverrideNode>?` | Axis-marked keys → nested nodes (FR-004). |

**Validation**
- Missing `value` (only `overrides`) → build error naming the token (FR-002).
- `value` type is `string` or `number` — anything else fails `tsc` (FR-014).
- For a `color` token, every leaf value (base + overrides) must be a known
  `PaletteRef` — unknown ref → build error naming token + key (FR-016, R10).

## Entity: ColorPalette (private)

The internal colour ramp. **Not** a `Tokens` record, **not** exported from
`src/index.ts`. Lives in `src/palette.ts` (D11).

| Field | Type | Notes |
|-------|------|-------|
| `palette` | `Record<string, string>` (`as const`) | Ramp key (e.g. `"blue.500"`, `"neutral.0"`) → literal colour. Placeholder values this phase (FR-012). |
| `PaletteRef` | `keyof typeof palette` | The type semantic colour tokens author against. |
| `resolvePaletteRef(ref, tokenName)` | `(string, string) → string` | Returns the literal colour; throws `"<tokenName>: unknown palette key '<ref>'"` on miss. |

**Validation / invariants**
- No `palette` key ever appears in `dist/web/tokens.css`, `dist/web/index.d.ts`,
  `resolvedTokens`, or Swift output (FR-015, SC-007).
- Colour-token leaf resolution happens before any `ResolvedRule` is constructed,
  so downstream code only sees literal colours.

## Entity: SemanticColorToken

A `Token` in the `color` category. Same shape as Token, with the added rule that
`value` and every override leaf is a `PaletteRef`. It is the only colour form
that reaches any output (as a resolved literal under `--ds-color-<role>`).

## Entity: OverrideNode

An override tree node. Either a **leaf value** or an **object**.

| Form | Meaning |
|------|---------|
| `TokenValue` | Shorthand for `{ value: <that> }` — the value for the condition-set on the path here. |
| `{ value?: TokenValue, [axisKey]: OverrideNode }` | `value` (if present) is the value for the path's condition-set; each `axisKey` adds one condition and recurses. |

**Validation**
- Every axis key parses as exactly one axis (see ConditionAxis). Unrecognised
  key → error naming token + key (FR-007).
- A node with neither a `value` nor any axis key → error (empty override).
- Two paths that reduce to the **same condition-set** for one token → error
  naming token + condition-set (FR-007, spec edge case). No silent last-writer.

## Entity: ConditionAxis

One dimension an override varies along. Exactly three, in increasing specificity.

| Axis | Key grammar | CSS construct | Specificity weight (D3) |
|------|-------------|---------------|------------------------:|
| `colorMode` | bare `light` \| `dark` | `:root` (light) / `[data-theme="dark"]` | 1 |
| `mediaQuery` | `^\d+\$$` (px `min-width`) | `@media (min-width: Npx)` | 2 |
| `scope` | `^\.[a-z][a-z0-9-]*$` | `.ds-scope-<name>` | 4 |

**Validation**
- `colorMode`: bare word not in the `ColorMode` union → error (FR-006, FR-007).
- `mediaQuery`: non-numeric / no `$` / non-positive → error (FR-006a). Duplicate
  number for one token → same-condition-set error.
- `scope`: must match the pattern; the generated class is `ds-scope-` + the name
  without the dot.

## Entity: ConditionSet

The unordered set of conditions accumulated along one override path.

| Field | Type | Notes |
|-------|------|-------|
| `colorMode` | `ColorMode?` | at most one |
| `minWidth` | `number?` | at most one (px) |
| `scope` | `string?` | at most one (class name without dot) |

The empty ConditionSet is the base value. Two ConditionSets are equal iff all
three fields are equal — the uniqueness key for the duplicate-condition check.

## Entity: ResolvedRule

Output of flattening one token's tree. `resolve.ts` produces `ResolvedRule[]`
across all tokens.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Namespaced token name, e.g. `type.body`. |
| `conditions` | ConditionSet | |
| `value` | `TokenValue` | |
| `specificity` | number | D3 weight; derived. |

**Ordering (D3, D9)** — total order, ascending, emitted in this order so later
wins:
1. `specificity` (0–7)
2. `minWidth` ascending (0 if absent)
3. colorMode order (`light` before `dark`; absent first)
4. `scope` name lexicographic (absent first)
5. `name` lexicographic

**Validation**
- Regenerating from unchanged source → identical `ResolvedRule[]` and identical
  `tokens.css` (FR-010, SC-003), including when overrides are re-nested in a
  different order.

## Entity: TokenCategory

A source file under `src/tokens/` exporting a `Tokens` record.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | `type` \| `space` \| `color` \| … — the file/base name. |
| `tokens` | `Record<string, Token>` | keys are un-prefixed (`body`, `md`, `bg`). |

**Assembly (`src/tokens/index.ts`, D7)**
- Categories iterated in a fixed declared order.
- Final token name = `<category>.<key>`.
- The `color` category's leaf values are run through `resolvePaletteRef` (D11)
  during assembly, so what leaves `index.ts` is already literal colours.
- Two categories producing the same final `--ds-*` variable name → build error
  (FR-007 duplicate name; spec edge case).
- Zero categories, or a category with zero tokens → valid; output is
  empty-but-well-formed (FR-011).

## Entity: GeneratedOutput (`dist/web/tokens.css`)

CSS custom properties only. Structure per [contracts/css-output.md](./contracts/css-output.md).

| Property | Rule |
|----------|------|
| header | `/* Generated by @design-system/tokens. Do not edit. */` |
| block order | ResolvedRule order (D3/D9), rules with an identical wrapper merged |
| variable names | every one prefixed `--ds-` (D7) |
| no CSS Modules | global stylesheet only (spec Clarifications, Constitution) |
| no palette | no `--ds-palette-*` variable ever emitted; colour values are resolved literals (FR-015, SC-007) |
| ordering proof | emitted-selector specificity non-decreasing across block order (D13) |
| empty case | at least `:root {}` when there are no tokens (FR-011) |
| determinism | byte-identical for identical source (FR-010) |

Also emitted (unchanged mechanism): `dist/web/index.js` + `index.d.ts` (exports
`tokens`, `resolvedTokens`, types — FR-013) via `tsc`;
`dist/ios/DesignSystemTokens/Tokens.swift` (base values only this phase, D7
identifier sanitisation).

## Entity: Token Story (`apps/docs/src/Tokens.stories.tsx`)

Storybook documentation of the token categories (Constitution V: every token
group documented before its API is complete).

| Field | Type | Notes |
|-------|------|-------|
| per-category table | story | token name, base value, `var(--ds-…)` reference |
| override demo | story | toggles `data-theme="dark"` and a `.ds-scope-*` class on a wrapper, shows the resolved value changing via cascade only |
| snapshot baseline | file | `src/__snapshots__/Tokens.stories.tsx.snap` regenerated; axe + VR gates run in CI (FR-011 harness from 001) |
