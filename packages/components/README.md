# @design-system/components

Part of the [design system](../../README.md) monorepo. This package contains the
public web components used by the design system, including the polymorphic
`Text` primitive and the `Button` action control.

## Public entry point

- **Web:** `@design-system/components` → `dist/web/index.js` (+ `index.d.ts`), declared
  via the `exports` field in `package.json`.
- **iOS:** the `DesignSystemComponents` SwiftPM target in the repo-root `Package.swift`,
  generated into `dist/ios/DesignSystemComponents/`.
- **CSS Modules:** `Text.module.css` and `Button.module.css` are copied into `dist/web`
  during the package build so the published components can resolve their
  token-based local styles.

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

The iOS `DesignSystemText` API uses a typed `TextRole` enum and the generated
typography descriptors from `DesignSystemTokens`. It preserves SwiftUI text
semantics; the web-only `as` HTML element prop is not part of the native API.
Authored Swift sources live in `src/ios/` and are copied into generated
`dist/ios/` output during the package build.

## Button component

Three appearances (`solid`, `outline`, `text`) at two sizes (`sm` 30px, `md`
38px), matching the approved Claude Design Button reference. `fullWidth`,
content alignment, and leading/trailing icon slots extend beyond that
reference per an accepted spec clarification (see
`specs/005-button-component/`).

```tsx
import { Button } from "@design-system/components";

<Button>Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button fullWidth contentAlignment="space-between" leadingIcon={<Icon />}>
  Continue
</Button>

{/* Icon-only: the only constructor for icon-only content requires an
    accessible name — `aria-label` or `aria-labelledby`. */}
<Button aria-label="Add item" leadingIcon={<Icon />} />
```

`type` defaults to `"button"` so it never submits a form implicitly; pass
`type="submit"` or `type="reset"` for native form behavior. Icon content is
consumer-supplied — on both platforms `@design-system/icons` provides the
icon components themselves (`PlaceholderIcon` on web, the generated SwiftUI
`Shape` of the same name on iOS).

The iOS `DesignSystemButton` mirrors the same appearances, sizes, and full
width/alignment options as a native SwiftUI view. Its icon-only construction
uses a distinct initializer (`iconOnlyAccessibilityLabel:`) that has no
overload omitting the accessibility label, enforcing the same non-empty-name
requirement as the type-level web contract. Authored Swift sources live in
`src/ios/` and are copied into generated `dist/ios/` output during the
package build.

## Commands

```bash
pnpm --filter @design-system/components run build      # generate dist/web + dist/ios
pnpm --filter @design-system/components run test       # Vitest
pnpm --filter @design-system/components run typecheck  # tsc --noEmit
```

Generated files under `dist/` are never hand-edited.
