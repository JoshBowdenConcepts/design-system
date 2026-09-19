# @design-system/components

Part of the [design system](../../README.md) monorepo. This package contains the
public web components used by the design system, including the polymorphic
`Text` primitive.

## Public entry point

- **Web:** `@design-system/components` → `dist/web/index.js` (+ `index.d.ts`), declared
  via the `exports` field in `package.json`.
- **iOS:** the `DesignSystemComponents` SwiftPM target in the repo-root `Package.swift`,
  generated into `dist/ios/DesignSystemComponents/`.
- **CSS Modules:** `Text.module.css` is copied into `dist/web` during the package build so the
  published component can resolve its token-based local styles.

## Text component

The `Text` component defaults to a semantic `p` element and accepts an optional
`as` override for the supported intrinsic elements: `p`, `span`, `div`, `h1`,
`h2`, `h3`, `h4`, `label`, `a`, and `strong`.

```tsx
import { Text } from "@design-system/components";

<Text>Body copy</Text>
<Text as="h1">Page title</Text>
```

Variants use the existing type-token names (`display`, `h1`, `h2`, `h3`, `h4`,
`p`, `p-sm`, `label`, `caption`, `overline`) and are applied after the selected
element's default style. Consumer `className` values are merged alongside the
module-generated classes.

## Commands

```bash
pnpm --filter @design-system/components run build      # generate dist/web + dist/ios
pnpm --filter @design-system/components run test       # Vitest
pnpm --filter @design-system/components run typecheck  # tsc --noEmit
```

Generated files under `dist/` are never hand-edited.
