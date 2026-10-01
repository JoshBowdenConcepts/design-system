# @design-system/components

Part of the [design system](../../README.md) monorepo. This package contains the
public web components used by the design system, including the polymorphic
`Text` primitive, the `Button` action control, and the `Link` navigation control.

## Public entry point

- **Web:** `@design-system/components` → `dist/web/index.js` (+ `index.d.ts`), declared
  via the `exports` field in `package.json`.
- **iOS:** the `DesignSystemComponents` SwiftPM target in the repo-root `Package.swift`,
  generated into `dist/ios/DesignSystemComponents/`.
- **CSS Modules:** `Text.module.css`, `Button.module.css`, and `Link.module.css` are
  copied into `dist/web` during the package build so the published components can
  resolve their token-based local styles.

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

## Link component

Built directly on `Text` — `Link` has no typography of its own. Omitting `size`
inherits the surrounding text's size (`Text`'s `as="span"` default,
`font: inherit`); the explicit sizes are `p`, `p-sm`, `label`, and `caption`.
Heading and display sizes are not members of the `size` type, so passing one
fails `tsc`, matching the approved Claude Design Link reference (see
`specs/006-link-component/`). `caption` is required ahead of that reference per
an accepted spec clarification.

```tsx
import { Link } from "@design-system/components";

{/* Inline: inherits the surrounding paragraph's size, always underlined */}
<Text as="p">Read the <Link href="/docs">docs</Link> before shipping.</Text>

{/* Standalone: meets the 24×24 minimum interactive target */}
<Link href="/projects" standalone size="label">View all projects</Link>

{/* External: hidden-from-AT indicator + new-context statement in the accessible name + safe navigation */}
<Link href="https://example.com" external>Status page</Link>

{/* Unavailable: omit href — never a disabled prop. Renders de-emphasized,
    non-interactive text with no link role and no Tab-order presence. */}
<Link>Link text</Link>
```

There is no `disabled` option — a Link's destination is either present
(same-context or `external`) or absent, and an absent destination always
renders the de-emphasized, non-interactive presentation. `target`/`rel` are not
accepted props; the component manages them itself (`target="_blank"
rel="noopener noreferrer"`) whenever `external` is `true`, so the safety
guarantee cannot be weakened by a passthrough prop.

The iOS `DesignSystemLink` mirrors the same `size`/`standalone`/`external`
options and the same destination-presence rule (`destination: URL?`) as a
native SwiftUI view. It is built on a `Button` + `@Environment(\.openURL)`
action rather than SwiftUI's native `Link` view, because `Link` offers no
pressed-state styling hook; `.accessibilityAddTraits(.isLink)` /
`.accessibilityRemoveTraits(.isButton)` correct the exposed semantics back to
a link. Authored Swift sources live in `src/ios/` and are copied into
generated `dist/ios/` output during the package build.

## Commands

```bash
pnpm --filter @design-system/components run build      # generate dist/web + dist/ios
pnpm --filter @design-system/components run test       # Vitest
pnpm --filter @design-system/components run typecheck  # tsc --noEmit
```

Generated files under `dist/` are never hand-edited.
