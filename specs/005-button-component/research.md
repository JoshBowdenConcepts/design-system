# Research: Button Component

**Date**: 2026-09-29
**Status**: Complete. Visual inventory retrieved from the Claude Design "Design System" project (see D8).

## Decisions

### D1. Add Button to the existing components package for both platforms

**Decision**: Author the React implementation in `packages/components/src/` and
the SwiftUI implementation in `packages/components/src/ios/`. Export the web
component through the current package barrel. Let the existing component build
copy authored Swift files to its generated SwiftPM target. Do not create a new
package or edit generated `dist/` files.

**Rationale**: The package already owns the web `Text` component and
`DesignSystemComponents` SwiftPM product. Its generator copies Swift sources;
the root Swift manifest already composes components with tokens and icons.

**Alternatives considered**: A separate web/native package would violate the
three-layer architecture and split the public component surface. Authoring in
generated output is not reproducible.

### D2. Preserve platform-native APIs while aligning shared behavior

**Decision**: The web API is a native `<button>` wrapper with standard button
attributes and event handlers. The iOS API is a SwiftUI `Button` with an action
and native view content. Share approved appearances, sizes, layout intent,
disabled behavior, and accessibility outcomes, but do not imitate HTML form
attributes or React content types in Swift.

**Rationale**: The repository's iOS `DesignSystemText` uses a namespaced
SwiftUI `View` and typed Swift API, while web components use typed React props.
Keeping platform APIs idiomatic avoids an artificial cross-platform abstraction.

**Alternatives considered**: A single identical prop signature cannot model
React DOM attributes and SwiftUI actions/views without weakening native types.

### D3. Use consumer-provided icons in platform-native content slots

**Decision**: Web leading/trailing slots accept React content. SwiftUI leading
and trailing slots accept SwiftUI view content. Both slots are optional and may
be supplied together. Button styles control slot layout and foreground
inheritance, not icon artwork. Do not add an SF Symbols mapping or claim native
generated icons in this feature.

**Rationale**: The slots stay consumer-supplied on both platforms, so the
Button never owns icon artwork or an icon inventory of its own.

**Alternatives considered**: Hardcoded platform icon names would fork artwork
and introduce unapproved design choices.

**Superseded in part (2026-09-30)**: this decision originally noted that
`packages/icons` emitted only a Swift namespace stub, so iOS examples had no
design-system icon to pass into these slots and used an SF Symbol stand-in.
The icons generator now emits a real SwiftUI `Shape` per source SVG (see
`packages/icons/README.md`), so the workbench passes the generated
`PlaceholderIcon` — the same artwork the web stories use — into the slots.
The Button's own contract is unchanged: it styles slot layout and foreground
inheritance, never the artwork.

### D4. Model full-width alignment as a small explicit option

**Decision**: Keep `fullWidth` boolean defaulting to `false`. Add a typed content
alignment choice with `center` as the default and `space-between` as the
alternative for full-width buttons. Centered alignment treats label and any
icons as a centered group. Space-between distributes leading icon, label, and
trailing icon across available width; absent slots are omitted.

**Rationale**: This directly represents the clarified request without adding
unrelated layout variants. The intent maps to CSS flex layout and SwiftUI
stacks/spacers.

**Alternatives considered**: Multiple full-width booleans or a general-purpose
layout system create invalid combinations and exceed the required behavior.

### D5. Require an accessible name for icon-only controls

**Decision**: Web icon-only buttons must receive a non-empty `aria-label` or a
valid `aria-labelledby` reference. Native icon-only buttons use SwiftUI's
standard accessibility label. Prefer distinct native API overloads or a typed
content contract that makes a name mandatory for icon-only usage; verify the
accessible element name in tests. Do not use image `alt` text as the button name.

**Rationale**: The accepted clarification selects platform-standard naming.
Icon graphics are not substitutes for the action's accessible name.

**Alternatives considered**: A literal shared `alt` prop misuses image
semantics. Relying on icon names or undocumented inference is not reliable.

### D6. Use token-backed CSS Modules and shared token projections

**Decision**: Implement web presentation in `Button.module.css` with existing
semantic color, type, space, radius, touch-target, and focus tokens. Native
presentation consumes the generated iOS token package. Add a token only if the
approved design needs a role the current token set cannot express, and cover
any addition with generator contract tests.

**Rationale**: This follows the token source-of-truth and generate-not-fork
principles. `Text.module.css` demonstrates the CSS Module pattern; SwiftUI
`Text` demonstrates authored native sources consuming `DesignSystemTokens`.

**Alternatives considered**: Hardcoded values or separate platform style values
would create permanent design drift.

### D7. Gate changes with web and native functional and visual tests

**Decision**: Add focused Vitest behavior/type tests and a Storybook component
story with accessible states for web. Add XCTest coverage for native
initializers/action/disabled/accessibility and workbench snapshot coverage for
the approved appearance, icon, and width states. Tie visual baselines to the
reviewed Claude Design inventory.

**Rationale**: The constitution requires a public Storybook story and visual
regression. Existing Vitest and workbench XCTest/snapshot flows provide these
surfaces; SnapshotTesting is test-only.

**Alternatives considered**: Story examples without assertions or screenshots
without baselines do not gate regression. No new production dependency is
needed.

### D8. Adopt the retrieved Claude Design Button inventory as the visual baseline

**Decision**: Use the Claude Design "Design System" project
(`templates/button/Button.dc.html`, with a `Button.jsx`/`Button.d.ts` design
sketch) as the appearance/size/state source of truth:
- Appearances: `solid` (filled, `--ds-color-primary`/`--ds-color-on-primary`),
  `outline` (`--ds-color-primary` border/text, transparent fill), `text`
  (transparent, `--ds-color-primary` text, no border).
- Sizes: `sm` (30px tall, `--ds-space-50`/`--ds-space-150` padding), `md` (38px
  tall, `--ds-space-100`/`--ds-space-200` padding). Both enforce a
  `--ds-space-300` (24px) min-height/min-width floor; icon-only content reuses
  these two sizes rather than a distinct size.
- States: default, hover (`--ds-color-primary-hover` / `--ds-color-bg-sunken`
  depending on appearance), pressed (`--ds-color-text-primary`+
  `--ds-color-bg-raised` for solid; `--ds-color-primary-subtle`+
  `--ds-color-primary-hover` for outline/text), disabled
  (`--ds-color-bg-sunken`+`--ds-color-text-tertiary` for solid;
  `--ds-color-text-tertiary` text with `--ds-color-border` or transparent
  border for outline/text). No busy/loading state is defined; per accepted
  clarification, busy is out of scope for this feature.
- Shared geometry: `--ds-radius-200` corner radius, `--ds-color-focus-ring`
  focus outline with the layout's focus-ring width/offset tokens.

**Rationale**: This is the live, connected design reference (fetched via the
design-sync tool this planning cycle), not an inference from the repository
style guide. It resolves every appearance/size/state unknown Phase 0 would
otherwise flag as NEEDS CLARIFICATION.

**Alternatives considered**: Waiting for a `.design-sync/previews` local sync
was unnecessary — that mechanism compares a *built* Storybook story against
Claude Design and only applies once the component exists; it does not gate
reading the design source itself.

## Evidence and Repository Findings

- `packages/components/src/Text.tsx` and `Text.module.css` establish the React
  component and CSS Module pattern; `src/index.ts` is the public export barrel.
- `packages/components/src/generate.ts` copies authored `src/ios/*.swift` files
  into the generated iOS component target. Generated `dist/` is gitignored.
- `packages/components/src/ios/Text.swift` establishes public SwiftUI component
  conventions and consumption of `DesignSystemTokens`.
- `packages/components/package.json` exposes build, test, lint, and typecheck
  scripts; `packages/components/vitest.config.ts` runs component tests in Vitest.
- `apps/docs/src/Text.stories.tsx` is the Storybook component documentation
  pattern.
- `apps/ios-workbench/project.yml` targets iOS 15 and includes component XCTest,
  UI tests, and SnapshotTesting. Root `ios:workbench` and `ios:build` scripts
  regenerate and build the native package/workbench.
- `packages/icons/src/generate.ts` creates a React component and a SwiftUI
  `Shape` from each source SVG, so both platforms draw the same artwork from
  one source (the Swift projection was added during this feature — it had been
  a namespace stub).
- `packages/tokens/src/tokens/color.ts` provides semantic action, surface,
  focus, and status candidates; `layout.ts` provides a 44px touch minimum and
  focus geometry. Confirm exact pairings against the design before use.
- `.design-sync/previews/` is empty because no Button story has been built yet
  to compare; it will populate once T-phase implementation stories the web
  Button, per D8 above.
- Claude Design "Design System" project (`projectId 85d331e9-…`) contains
  `templates/button/Button.dc.html` (the approved reference),
  `templates/button/proposal/Button.jsx` / `Button.d.ts` (a design-authored
  code sketch, not the package implementation), and `tokens/tokens.css`.