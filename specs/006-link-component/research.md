# Research: Link Component

**Date**: 2026-09-30
**Status**: Complete. Visual inventory retrieved from the Claude Design "Design System" project (see D9).

## Decisions

### D1. Add Link to the existing components package for both platforms

**Decision**: Author the React implementation in `packages/components/src/` and
the SwiftUI implementation in `packages/components/src/ios/`. Export the web
component through the current package barrel (`index.ts`). Let the existing
component build copy authored Swift files into the generated SwiftPM target.
Do not create a new package or edit generated `dist/` files.

**Rationale**: The package already owns `Text` and `Button` on both platforms,
following the same build/export/generation path. Link has no reason to live
anywhere else.

**Alternatives considered**: A separate package would violate the three-layer
architecture (constitution III) and split the public component surface.

### D2. Build Link on top of Text rather than a parallel type treatment

**Decision**: Web `Link` renders `<a href>` wrapping `<Text as="span" variant={size}>`.
iOS `DesignSystemLink` renders its label using `DesignSystemText(_, role:)`
exactly as `Button` already does for its label. Link introduces no typography
of its own.

**Rationale**: This is the literal structure of the approved Claude Design
reference (`Text`-as-`span` nested in every anchor example) and directly
satisfies FR-003. It also means Link's size set is just a restriction of
`TextVariant`/`TextRole`, not a new enum maintained in parallel.

**Alternatives considered**: Reimplementing font/line-height rules on Link
would duplicate Text's CSS Module / `TextRole` typography mapping and risk
drift between the two components (violates constitution II, Generate Do Not
Fork — there is only one place type scale decisions should live).

### D3. "Inherit by default" is `Text`'s existing `span` behavior, not a new mode

**Decision**: `Link`'s `size` prop is optional. When omitted, pass no `variant`
to the underlying `Text` (`as="span"`), which already resolves to
`font: inherit` (`Text.module.css` `.default-span`). On iOS, when `size` is
`nil`, apply no `.font()` override so SwiftUI's environment font (the
surrounding `Text`'s font) is inherited.

**Rationale**: Both platforms already have a documented "inherit the ambient
font" behavior one layer down; Link only needs to pass the absence of a choice
through rather than invent inheritance logic itself.

**Alternatives considered**: An explicit `size="inherit"` enum value would
duplicate `undefined` as a second way to say the same thing and complicate the
type (every other size is a concrete typed value, not a sentinel string).

### D4. Size set is four explicit values plus the FR-004 default, no heading sizes

**Decision**: Typed size values are `p`, `p-sm`, `label`, `caption` — the four
non-heading, non-display `TextVariant`/`TextRole` values at or below body size,
per the accepted `/speckit-specify` clarification. `display` and every heading
level (`h1`–`h4`) are not members of the Link size type, so passing one fails
`tsc`/Swift compilation rather than being rejected at runtime.

**Rationale**: FR-006 requires heading/display sizes to be unavailable through
the contract, not merely discouraged — a type-level restriction is the
strongest, cheapest way to guarantee that on both platforms (constitution V).

**Alternatives considered**: Reusing `TextVariant`/`TextRole` directly and
validating heading values away at runtime would pass an invalid value through
the type system and only fail late; rejected as weaker than a type restriction
for no added flexibility (the UI contract never needs a heading link).

### D5. Presentation is an explicit `standalone` choice; inline is the default

**Decision**: Add a `standalone` boolean (web) / `standalone` Bool (iOS),
defaulting to `false` (inline). Inline renders with no forced min-height/width
and lays out as plain inline content, preserving the surrounding line's
metrics. Standalone adds `display: inline-flex; align-items: center;
box-sizing: border-box; min-height/min-width: var(--ds-space-300)` (24px) on
web and an equivalent `.frame(minWidth:minHeight:)` floor on iOS.

**Rationale**: This matches the reference's own two example groups ("Inline"
vs. "Standalone") and satisfies FR-007/2.5.8 for standalone while keeping
inline links exempt per the reference's own accessibility rule 5 and this
feature's edge cases.

**Alternatives considered**: Always applying the 24×24 floor would inflate
line-height in running text (an explicit edge case this spec forbids).
Inferring presentation from context (e.g., "is this the only child of its
parent?") is unreliable and not testable; an explicit prop is.

### D6. External is an explicit opt-in that reproduces the reference's own technique

**Decision**: Add an `external` boolean, defaulting to `false`. When `true`:
- Web: append an `aria-hidden="true"` `↗` character styled from the active
  size's type token, append a visually-hidden ("sr-only" clip-rect) span
  reading "(opens in a new tab)" inside the anchor (so it becomes part of the
  computed accessible name alongside the visible text), and set
  `target="_blank" rel="noopener noreferrer"`.
- iOS: append the same `↗` glyph (hidden from VoiceOver via
  `.accessibilityHidden(true)`) and compose the accessibility label as
  `"\(visible text), opens in Safari"` via `.accessibilityLabel(_:)` so
  VoiceOver announces the destination fact without a second focusable element.

**Rationale**: This is not an invented pattern — it is the exact technique the
approved reference already implements and names in its own accessibility
rules (rule 6), so Phase 0 has no open design question for FR-011/FR-012. Using
a styled Unicode character rather than an SVG matches the reference pixel-for-
pixel and needs no new asset in `packages/icons` (which today only has
`placeholder.svg`).

**Alternatives considered**: Sourcing the indicator from `packages/icons` would
add a new SVG source asset to a package this feature does not otherwise touch,
for a glyph the reference itself draws as styled text. Rejected as
unnecessary scope growth; revisit only if Claude Design later swaps the arrow
for real iconography.

### D7. Unavailable is the absence of a destination, not a boolean flag

**Decision**: `Link`'s destination prop (`href` on web, `destination: URL?` on
iOS) is the single source of truth for availability. When it is omitted/`nil`,
the component renders the Text content directly — a plain `span` on web with
no `href`/`tabindex`, carrying the de-emphasized `--ds-color-text-tertiary`
treatment and no underline; a plain `DesignSystemText` on iOS with no
interactive wrapper, so it exposes no accessibility traits and is skipped by
VoiceOver swipe navigation. No separate `disabled`/`unavailable` boolean
exists.

**Rationale**: This matches the reference's accessibility rule 7 ("Links can't
be disabled... render plain text with no href") and FR-013 exactly, and it
makes an invalid state ("disabled-looking but still focusable/clickable")
unrepresentable by construction rather than merely untested — the strongest
form of constitution V's "hard to use incorrectly."

**Alternatives considered**: A `disabled` boolean mirroring Button's would
re-introduce the exact failure mode (a focusable, announced-as-link control
that silently does nothing) FR-013 and the reference explicitly rule out.

### D8. iOS press/focus feedback needs a custom pressable view, not SwiftUI's `Link`

**Decision**: Implement `DesignSystemLink` using a SwiftUI `Button` whose
action calls `@Environment(\.openURL)` with the destination, styled with a
custom `ButtonStyle` (the same pattern `DesignSystemButtonStyle` already
establishes) that applies the reference's resting/pressed/focus colors. Correct
the accessibility semantics explicitly with
`.accessibilityAddTraits(.isLink)` and `.accessibilityRemoveTraits(.isButton)`
so VoiceOver and other assistive technology announce it as a link, not a
button, even though a `Button` view provides the pressed-state hook.

**Rationale**: SwiftUI's native `Link(destination:)` view has no supported way
to style a pressed/highlighted state, but FR-009 requires the Button-equivalent
"pressed" treatment from the reference to be represented distinctly on iOS.
Reusing the existing `ButtonStyle` technique keeps one implementation pattern
for pressed-state styling across the package (constitution II) while the
explicit trait correction keeps the exposed semantics a link (FR-002), which
`openURL` plus the corrected traits reproduces faithfully.

**Alternatives considered**: Native `Link` gives correct semantics for free but
no pressed-state styling hook, failing FR-009. A plain `Text` with a tap
gesture would need its own focus-ring and VoiceOver activation handling
reimplemented from scratch, which `Button` already provides.

### D9. Adopt the retrieved Claude Design Link inventory as the visual baseline

**Decision**: Use the Claude Design "Design System" project
(`templates/link/Link.dc.html`) as the appearance/size/state source of truth.
See `design-reference.md` for the full retrieved inventory, token mapping, and
the reference's own eight accessibility rules, which this spec's functional
requirements quote and number against directly.

**Rationale**: This is the live, connected design reference (fetched via the
design-sync tool during `/speckit-specify` and re-confirmed this planning
cycle), not an inference from the repository style guide. It resolves every
size/presentation/state/external/unavailable unknown Phase 0 would otherwise
flag as NEEDS CLARIFICATION — the only genuine open question (the exact size
set) was already resolved during `/speckit-specify` (spec Clarifications,
2026-09-30).

**Alternatives considered**: None — unlike Button, Link has no companion
`.jsx`/`.d.ts` code sketch to reconcile against; the `.dc.html` markup is the
only and complete source.

### D10. Enforce the accessible-name requirement with a type, not a runtime check

**Decision**: `LinkProps` is a discriminated union — `children` present (the
default), or `children` absent with a required non-empty `aria-label` or
`aria-labelledby` — identical in shape to `ButtonProps`. The initial
implementation instead used a dev-mode `console.error` check; this was
replaced after review (2026-09-30) because the codebase's own precedent
(`ButtonProps`, D5 in `005-button-component`'s research) already enforces this
exact FR-014-equivalent requirement (FR-016 there) at the type level, and a
`console.error` only fires if the offending code path actually renders in
development, where a type error blocks it at compile time regardless of code
path or environment.

**Rationale**: Constitution V ("hard to use incorrectly") and consistency with
the one other component (`Button`) that has the same shape of requirement.

**Alternatives considered**: The dev-mode runtime check (initial
implementation) — strictly weaker than a type error and inconsistent with
`ButtonProps`'s existing precedent for no added flexibility.

## Evidence and Repository Findings

- `packages/components/src/Text.tsx` / `Text.module.css`: `.default-span { font:
  inherit; }` is the exact mechanism D3 relies on; `TextVariant` is the
  superset D4 restricts.
- `packages/components/src/ios/Text.swift`: `TextRole` enum and
  `DesignSystemText` establish the native role/typography pattern Link's size
  type and label rendering reuse.
- `packages/components/src/Button.tsx` / `Button.module.css`: establishes the
  CSS Module token-pairing pattern (focus-visible outline using
  `--ds-layout-focus-ring-width`/`-offset`/`--ds-color-focus-ring`, 24px
  `--ds-space-300` floor) this feature reuses verbatim rather than reinventing.
- `packages/components/src/ios/Button.swift`: establishes the
  `ButtonStyle`-with-`isPressed`/`isEnabled` pattern D8 reuses, and the
  `AnyView` optional-slot pattern for the external-indicator glyph.
- `packages/tokens/src/tokens/color.ts`: `primary`, `primary-hover`,
  `text-tertiary`, `focus-ring` all already exist with the light/dark pairings
  the reference specifies; no new token is needed (confirms FR-017/Assumptions).
- `packages/tokens/src/tokens/layout.ts`: `focus-ring-width`/`-offset` already
  exist; `touch-min` (44px) exists but is not the floor used — `--ds-space-300`
  (24px) is, matching both the reference and Button's existing precedent, not
  the general touch-target token.
- `packages/icons/src/svg/`: contains only `placeholder.svg`; no arrow/external
  icon exists, confirming D6's choice not to add one.
- `apps/docs/src/Button.stories.tsx` and `apps/ios-workbench/Sources/Catalog/
  ButtonExamples.swift` / `ComponentCatalogView.swift`: the documentation
  patterns Link's Storybook story and workbench catalog entry will follow.
- Claude Design "Design System" project (`projectId 85d331e9-…`) contains
  `templates/link/Link.dc.html` (the approved reference, no companion code
  sketch) and the shared `tokens/tokens.css`.
