## Using this design system

**No wrapper or provider required.** Components read design tokens straight from CSS custom properties defined on `:root` in `tokens.css` (part of `styles.css`'s import closure, loaded automatically) — there's no `ThemeProvider` to mount. Colour mode defaults to light; to render dark, add `data-theme="dark"` to any ancestor element (typically your root container) — every `--ds-*` colour token re-resolves through the cascade from there.

**Styling idiom: CSS custom properties (`var(--ds-*)`), not utility classes.** When composing your own layout around these components, reach for the real token names — never invent pixel values or hex codes:

| Family | Examples | Use for |
|---|---|---|
| `--ds-color-*` | `--ds-color-bg`, `--ds-color-bg-raised`, `--ds-color-bg-sunken`, `--ds-color-text-primary`, `--ds-color-text-secondary`, `--ds-color-text-tertiary`, `--ds-color-primary`, `--ds-color-primary-hover`, `--ds-color-primary-subtle`, `--ds-color-on-primary`, `--ds-color-border`, `--ds-color-border-strong`, `--ds-color-danger`, `--ds-color-warning`, `--ds-color-success`, `--ds-color-info`, `--ds-color-focus-ring` | backgrounds, text, borders, state colours — all theme-aware |
| `--ds-space-*` | `--ds-space-25` … `--ds-space-1200` (a numeric scale in rem, e.g. `--ds-space-100` = 0.5rem, `--ds-space-400` = 2rem) | padding, gap, margin |
| `--ds-radius-*` | `--ds-radius-100`, `-200`, `-300`, `-400`, `-full` | border-radius |
| `--ds-layout-*` | `--ds-layout-gutter`, `--ds-layout-max-width`, `--ds-layout-measure`, `--ds-layout-touch-min`, `--ds-layout-focus-ring-width`, `--ds-layout-focus-ring-offset` | page gutters, content width/measure, touch targets, focus rings |
| `--ds-type-*` | `--ds-type-display`, `-h1`, `-h2`, `-h3`, `-h4`, `-p`, `-p-sm`, `-label`, `-caption`, `-overline` | **each is a full `font` shorthand** (style/weight/size/line-height/family) — apply with `font: var(--ds-type-h2)` on one line, don't decompose into separate `font-size`/`font-weight`/etc. |

**Where the truth lives.** Read `tokens/tokens.css` for the complete, current token list (light values on `:root`, dark overrides under `[data-theme="dark"]`) and each component's `<Name>.prompt.md` for its API and usage examples. Prefer reading these over guessing — token names and component props are added over time.

**Build with `Text` for all copy — it's the only text primitive.** It accepts `as` (which HTML element to render: `p`, `span`, `div`, `h1`–`h4`, `label`, `strong`) and `variant` (which `--ds-type-*` style to apply), decoupled from each other so semantics and appearance can differ (e.g. an `h2` styled as `display`):

```jsx
<div style={{ padding: "var(--ds-space-300)", background: "var(--ds-color-bg-raised)", borderRadius: "var(--ds-radius-300)" }}>
  <Text as="h2" variant="h2">Section heading</Text>
  <Text as="p" variant="p-sm" style={{ color: "var(--ds-color-text-secondary)" }}>
    Supporting copy at a smaller size.
  </Text>
</div>
```
