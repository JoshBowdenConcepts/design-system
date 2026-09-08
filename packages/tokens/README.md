# @design-system/tokens

Part of the [design system](../../README.md) monorepo. The source of truth for
every visual decision — authored in TypeScript, projected to web CSS, a typed
data structure, and iOS Swift.

## Authoring

One category per file under `src/tokens/` (`type.ts`, `space.ts`, `color.ts`, …),
assembled by `src/tokens/index.ts` into a single set keyed `<category>.<name>`
(→ CSS var `--ds-<category>-<name>`).

Each token has one **base `value`** and optional **`overrides`**:

```ts
export const space: Tokens = {
  md: {
    value: "1rem",
    overrides: {
      dark: "1rem",                    // colour mode
      "768$": "1.5rem",                // min-width breakpoint (px)
      ".compact": { value: "0.75rem",  // class-name scope → .ds-scope-compact
        dark: "0.5rem" },              // …axes nest in any order, any depth
    },
  },
};
```

Override key markers:

| Axis | Key | Emitted selector |
|------|-----|------------------|
| colour mode | bare `light` / `dark` | `[data-theme="dark"]` (light folds into `:root`) |
| breakpoint | `<number>$` e.g. `768$` | `@media (min-width: 768px)` |
| class-name scope | `.<name>` e.g. `.compact` | `.ds-scope-compact` |

Two override trees that express the same set of conditions resolve identically
regardless of nesting order. When conditions overlap at runtime the more
specific one wins (scope > breakpoint > colour mode; any combination beats its
parts), purely through the CSS cascade.

### Typography

`type` values are complete CSS `font` shorthands, so one declaration applies the
whole style:

```ts
body: { value: "normal normal 400 1rem/1.5 system-ui, sans-serif" }
```
```css
p { font: var(--ds-type-body); }
```

### Colour

`src/palette.ts` holds a **private** colour ramp. Semantic colour tokens
reference palette entries by key; the build resolves them to literal colours.
The palette is never emitted to CSS and never exported — only semantic
`--ds-color-<role>` tokens are public.

## Consuming

```ts
import { tokens, resolvedTokens } from "@design-system/tokens";
import "@design-system/tokens/tokens.css";

tokens["type.body"].value;                          // authored base value
resolvedTokens.filter((r) => r.name === "color.bg"); // every finalized value + condition-set
```

```css
.card { background: var(--ds-color-bg); color: var(--ds-color-fg); }
```

## Contracts

- [Token authoring schema](../../specs/002-token-system-foundation/contracts/token-schema.md)
- [`tokens.css` structure & ordering](../../specs/002-token-system-foundation/contracts/css-output.md)

## Commands

```bash
pnpm --filter @design-system/tokens run build      # generate dist/web + dist/ios
pnpm --filter @design-system/tokens run test       # Vitest
pnpm --filter @design-system/tokens run typecheck  # tsc --noEmit
```

Generated files under `dist/` are never hand-edited.
