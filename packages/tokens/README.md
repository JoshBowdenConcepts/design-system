# @design-system/tokens

Part of the [design system](../../README.md) monorepo. The source of truth for
every visual decision — authored in TypeScript, projected to web CSS, a typed
data structure, and iOS Swift.

## Authoring

One category per file under `src/tokens/` — `type.ts`, `space.ts`, `radius.ts`,
`layout.ts`, `color.ts` — assembled by `src/tokens/index.ts` into a single set
keyed `<category>.<name>` (→ CSS var `--ds-<category>-<name>`). Scale steps are
numbered in hundreds (`space.200`, `radius.300`); colour and layout tokens use
semantic names (`color.text-primary`, `layout.gutter`).

Each token has one **base `value`** and optional **`overrides`**:

```ts
export const layout: Tokens = {
  gutter: {
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

A token can combine all three axes in one path. This example applies the final
value only in dark mode, at 768px and above, inside the compact scope:

```ts
bg: {
  value: ref("neutral.50"),
  overrides: {
    dark: {
      value: ref("neutral.950"),
      "768$": {
        ".compact": ref("neutral.900"),
      },
    },
  },
}
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
p: { value: "normal normal 400 1rem/1.625 'Public Sans', sans-serif" }
```
```css
p { font: var(--ds-type-p); }
```

The three families the `type` tokens name (Bricolage Grotesque, Public Sans, IBM
Plex Mono) are loaded by an `@import` at the top of `tokens.css` — see
`src/fonts.ts`. Importing `@design-system/tokens/tokens.css` is all a consumer
needs; no separate `<link>`. Letter-spacing and text-transform aren't part of
the `font` shorthand and are deferred to a later pass.

### Colour

`src/palette.ts` holds a **private** colour ramp (`emerald` / `neutral` full
ramps, plus the two steps each `blue` / `amber` / `red` status role needs).
Semantic colour tokens reference palette entries by key; the build resolves them
to literal colours. The base `value` is the light-mode colour and each `dark`
override the dark-mode colour. The palette is never emitted to CSS and never
exported — only semantic `--ds-color-<role>` tokens are public.

## Consuming

```ts
import { tokens, resolvedTokens } from "@design-system/tokens";
import "@design-system/tokens/tokens.css";

tokens["type.p"].value;                              // authored base value
resolvedTokens.filter((r) => r.name === "color.bg"); // every finalized value + condition-set
```

```css
.card { background: var(--ds-color-bg-raised); color: var(--ds-color-text-primary); }
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
