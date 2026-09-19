# Research: Text Component

## Decision: Constrained polymorphic intrinsic API

Use a generic React component constrained to the documented text elements:
`p`, `span`, `div`, `h1`, `h2`, `h3`, `h4`, `label`, `a`, and `strong`.
Derive native props and refs from React's intrinsic element types rather than
redeclaring HTML attributes. Default `as` is `p`.

**Rationale:** This preserves semantic HTML, gives consumers element-specific
props, and prevents the text primitive from accepting arbitrary elements that
are outside its design-system contract. React 18's `forwardRef` typing needs a
small exported callable-interface cast to preserve the generic `as` parameter.

**Alternatives considered:** Supporting every `keyof JSX.IntrinsicElements` was
more flexible but weakens the public contract. A fixed element would lose
semantic control. A custom attribute map would duplicate React's type source.

## Decision: Existing typography tokens define variants

Use `display`, `h1`, `h2`, `h3`, `h4`, `p`, `p-sm`, `label`, `caption`, and
`overline` as the initial variant union. The default class for each `as` value
maps to an existing type token: paragraph-like elements use `type.p`, headings
use their matching token, and `label` uses `type.label`.

A supplied variant class is composed after the element default class and its CSS
rule is declared after element defaults with equal specificity, so variant
styles override defaults without runtime style calculation.

**Rationale:** The token package already exposes complete font shorthands and
this avoids speculative new typography tokens. `h5` and `h6` are excluded from
the initial `as` set because no corresponding token exists.

**Alternatives considered:** Adding h5/h6 tokens would broaden the feature
beyond the requested component. Mapping them to an unrelated token would make
the default style surprising. Allowing arbitrary variant strings would defeat
type safety.

## Decision: CSS Module with generated asset copying

Create `Text.module.css` and a `*.module.css` TypeScript declaration. Keep the
existing `tsx` + `tsc` package build and extend the components generator to copy
CSS Module assets into `dist/web` after clearing output. The package already
publishes `dist/web`, and Vite/Storybook can process the source module directly.

**Rationale:** This satisfies the CSS Modules requirement while minimizing
build-tool changes and preserving the established package build. Plain `tsc`
emits the import but does not copy CSS, so asset copying is required for the
published package to remain runnable.

**Alternatives considered:** Replacing the build with Vite library mode would
transform CSS Modules but introduce a new build configuration and change the
package's established declaration/output flow. Inline styles and CSS-in-JS
violate the feature requirement.

## Decision: Runtime and test strategy

Implement `Text` with `React.forwardRef`, destructure `as`, `variant`, and
`className` before forwarding the remaining native props, and merge generated
CSS Module classes with consumer `className`. Use server-rendered markup tests
matching the existing package style, plus a dedicated TypeScript type-test
configuration with positive examples and `@ts-expect-error` assertions.

Storybook will expose one focused Text story with controls/examples for element,
variant, native props, class composition, and ref/anchor semantics. Existing
Storybook accessibility and snapshot infrastructure remains the quality gate.

**Rationale:** This directly tests the two risky contracts: runtime omission and
forwarding, and compile-time relationship between `as` and native props/ref.

**Alternatives considered:** A DOM testing-library dependency is unnecessary
for this SSR-friendly primitive. Runtime tests alone cannot prove polymorphic
prop rejection. A runtime registry is unnecessary for a static CSS Module map.

## Resolved clarifications

- Default element: `p`.
- Initial `as` elements: `p`, `span`, `div`, `h1`, `h2`, `h3`, `h4`, `label`,
  `a`, `strong`.
- Initial variants: the existing exported type-token names listed above.
- Variant precedence: variant class follows the element default in the module's
  stylesheet and overrides it at equal specificity.
- Native `style` remains supported and is forwarded; consumers may intentionally
  override the token-derived font through normal inline-style precedence.
- CSS Module class names are implementation details. Tests assert behavior and
  class presence, not hashed names.
