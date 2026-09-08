# Quickstart: Token System Foundation

Validation guide — proves the feature works end to end. Assumes a clean checkout
with `corepack enable` already run once.

## Prerequisites

```bash
pnpm install
```

## 1. Build the tokens package

```bash
pnpm --filter @design-system/tokens build
```

Expected: exits 0, writes `packages/tokens/dist/web/tokens.css`,
`dist/web/index.js` + `index.d.ts`, and `dist/ios/DesignSystemTokens/Tokens.swift`.

## 2. Inspect the generated CSS

```bash
cat packages/tokens/dist/web/tokens.css
```

Check against [contracts/css-output.md](./contracts/css-output.md):

- Header comment on line 1.
- A `:root { … }` block with one `--ds-<category>-<name>` per token base value.
- For the placeholder token that exercises all three axes: a `[data-theme="dark"]`
  block, an `@media (min-width: …px)` block, a `.ds-scope-…` block, and at least
  one combined block — appearing in ascending-specificity order (color mode
  before media query before scope; combinations after their parts).

## 3. Confirm the palette is private

```bash
grep -c 'ds-palette' packages/tokens/dist/web/tokens.css   # → 0
grep -E 'palette|PaletteRef' packages/tokens/dist/web/index.d.ts   # → no matches
```

Every `--ds-color-*` value is a literal colour (e.g. `#ffffff`), never a palette
key. `tests/resolve.test.ts` asserts a `color.*` semantic token resolves through
`src/palette.ts` and that an unknown palette key fails the build naming the token
(rejection R10).

## 4. Confirm determinism and order-independence

```bash
pnpm --filter @design-system/tokens generate
git diff --exit-code packages/tokens/dist/web/tokens.css   # (if dist were tracked) → no change
pnpm --filter @design-system/tokens test
```

`tests/resolve.test.ts` asserts that a token whose overrides nest `dark` inside
`768$` resolves identically to one nesting `768$` inside `dark`, and that repeated
generation is byte-identical. `tests/generate.test.ts` asserts the emitted
selectors' specificity is non-decreasing down the file (ordering correctness, not
just block sequence).

## 5. Confirm the rejection paths

`tests/resolve.test.ts` covers each row of the rejection matrix in
[contracts/token-schema.md](./contracts/token-schema.md): missing base value,
unknown color mode, malformed `$` breakpoint key, malformed `.scope` key,
duplicate condition-set, duplicate token name, unknown palette key. Each error
names the token and the offending key.

## 6. View in Storybook and toggle conditions

```bash
pnpm dev            # or: pnpm --filter docs storybook
```

Open **Tokens** → the per-category tables (base value + `var(--ds-…)` reference)
and the **Overrides** story. In that story:

- Toggle the dark background / `data-theme="dark"` → the demo token's value
  switches to its dark override with no script running.
- Toggle the `.ds-scope-compact` wrapper class → the scoped value wins.
- With both active → the combined-condition value wins (most specific).

## 7. Typed consumers (FR-013)

```ts
import { tokens, resolvedTokens } from "@design-system/tokens";

tokens["type.body"].value;                    // authored base (a font shorthand)
resolvedTokens.filter(r => r.name === "color.bg");   // finalized literal colours + condition-sets
// `palette` is NOT importable — semantic names only
```

## 8. CI gates

`pnpm build && pnpm test && pnpm lint` mirror CI. The Storybook visual-regression
and axe steps run against the built Storybook; regenerate the Tokens snapshot
baseline (`apps/docs/src/__snapshots__/Tokens.stories.tsx.snap`) when the token
stories change intentionally.

## Success = spec Success Criteria

| Check | SC |
|-------|----|
| New token with all-axis overrides shows up correctly after one build, no other files touched | SC-001 |
| All condition combinations resolve to the most specific match in the browser | SC-002 |
| Byte-identical output regardless of nesting order | SC-003 |
| Every targeted authoring error caught with token+key named | SC-004 |
| A `font` shorthand token applies the whole type style in one declaration | SC-005 |
| Every category ships a placeholder exercising every axis | SC-006 |
| Zero palette entries in output/API; all semantic colours resolve to a palette colour | SC-007 |
