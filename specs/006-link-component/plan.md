# Implementation Plan: Link Component

**Branch**: `006-link-component` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-link-component/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a public `Link` component to the existing `packages/components` package for
web (React) and iOS (SwiftUI), built directly on the existing `Text` component
for typography rather than a parallel type scale. The component defaults to
inheriting the surrounding text's size, offers four explicit non-heading sizes
(`p`, `p-sm`, `label`, `caption`), supports an inline presentation (exempt from
the minimum target) and a standalone presentation (24×24 minimum target), an
explicit `external` option that reproduces the approved reference's own
hidden-indicator-plus-accessible-name-suffix technique, and an "unavailable"
destination state expressed by omitting the destination rather than a
`disabled` flag. The approved Claude Design "Design System" project
(`templates/link/Link.dc.html`) is the visual and accessibility-rule source of
truth; see `research.md` (D9) and `design-reference.md`.

## Technical Context

**Language/Version**: TypeScript (React 18/19) for web; Swift 5.9 / SwiftUI for iOS — matches the existing `Text`/`Button` components.

**Primary Dependencies**: Existing in-repo `Text` component and `clsx` (web); existing `DesignSystemTokens` Swift target (iOS). No new production dependency.

**Storage**: N/A

**Testing**: Vitest + the package's existing component/type-test pattern (web); XCTest + the iOS workbench's SnapshotTesting setup (iOS) — both already in use for `Text` and `Button`.

**Target Platform**: Web (Vite/Storybook-built browser bundle) and iOS 15+ (existing `apps/ios-workbench` target).

**Project Type**: Component library addition — single package, two platform projections (web + iOS), no new package layer.

**Performance Goals**: No feature-specific goal beyond standard component render cost; inherits `Text`'s existing performance characteristics on both platforms.

**Constraints**: WCAG 2.2 AA (web) / equivalent iOS platform accessibility expectations (constitution IV); all visual values from existing design tokens, no new token added (constitution I); no new package or circular dependency (constitution III); typed public API with heading/display sizes unrepresentable at compile time (constitution V).

**Scale/Scope**: One new component, 2 platforms, 4 explicit sizes + 1 default, 2 presentations, 2 boolean options (`standalone`, `external`), 3 destination states (same-context/external/unavailable). No new package, no new token, no new icon asset.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|---|---|---|
| I | Tokens Are the Source of Truth | Link color, type, spacing, radius, and focus values use existing semantic tokens (`--ds-color-primary`/`-hover`/`-text-tertiary`/`-focus-ring`, `--ds-radius-100`, `--ds-space-50/300`, `--ds-layout-focus-ring-*`) on both platforms; typography comes entirely from existing `Text`/`TextRole` tokens, never duplicated. No new token is added. | PASS |
| II | Generate, Do Not Fork | Link introduces no parallel type scale — it renders through `Text` (web) and `DesignSystemText`/`TextRole` (iOS), the same single typography source `Button`'s label already uses. The external indicator reuses the reference's own styled-glyph technique rather than a new icon asset. | PASS |
| III | Layered, Independently Shippable Packages | Link stays in `packages/components`; consumes `Text` (same package) and tokens in the existing one-way dependency direction; adds no package layer. | PASS |
| IV | Accessibility Is Non-Negotiable | Native link semantics on both platforms (real `<a href>` / native tappable control with `.isLink` trait); always-on underline so color is never the sole indicator; required non-empty accessible name, with an explicit new-context statement when external; no disabled state — unavailable destinations are removed from the tab order/VoiceOver order entirely rather than left as an inert, confusingly-focusable control. Validated against WCAG 2.2 AA on web and platform accessibility expectations on iOS. | PASS |
| V | Tooling Enforces the Contract | Typed public contract makes heading/display sizes and a "disabled-but-focusable" state unrepresentable at compile time rather than merely untested. Component tests, Storybook documentation, native XCTest/workbench snapshot coverage, and visual regression gate the appearance, matching `Text`/`Button` precedent. | PASS |

**Technology Constraints check**: pnpm/Turborepo ✓ · TypeScript/React/Storybook ✓ · SwiftUI/SwiftPM ✓ · Node.js 22+ ✓ · existing three package layers ✓ · no new production dependency ✓ · no new design token ✓

**Result (pre-Phase 0)**: No constitution violations. The Claude Design Link
reference has been retrieved (inline/standalone × inherit/`p`/`p-sm`/`label`,
external, resting/hover/focus/unavailable); the one genuine open question (the
exact size set) was already resolved during `/speckit-specify`. No unresolved
design input blocks Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/006-link-component/
├── plan.md
├── research.md
├── data-model.md
├── design-reference.md
├── quickstart.md
├── contracts/link-api.md
├── checklists/requirements.md
└── tasks.md              # Created by /speckit-tasks
```

### Source Code (repository root)
```text
packages/components/
├── src/
│   ├── Link.tsx
│   ├── Link.module.css
│   ├── index.ts
│   ├── generate.ts
│   └── ios/Link.swift
└── tests/
    ├── Link.test.tsx
    ├── Link.types.tsx
    └── ios/DesignSystemLinkTests.swift

apps/docs/src/Link.stories.tsx
apps/ios-workbench/Sources/Catalog/
apps/ios-workbench/Tests/
```

**Structure Decision**: Extend the existing components package and generated
iOS projection, exactly as `Button` did. Keep the web CSS Module adjacent to
the React component; hand-authored SwiftUI code belongs under `src/ios` and is
copied by the current generator into `dist/ios`. Use Storybook for web
documentation and the existing iOS workbench catalog for native examples. Do
not edit generated files.

**Design handoff**: The Claude Design "Design System" project's
`templates/link/Link.dc.html` is the approved reference (see
`design-reference.md` for the full retrieved inventory, token mapping, and the
reference's own eight accessibility rules, which this feature's functional
requirements quote and number against directly). Unlike Button, Link has no
companion `.jsx`/`.d.ts` design sketch — the `.dc.html` markup is the only and
complete source. The reference shows inline links at `p`/`p-sm` and standalone
links at `label`/`p`; the `caption` size is required ahead of that reference
per the accepted `/speckit-specify` clarification and is flagged for design
sign-off on its visual treatment. iOS has no separate design artifact and must
visually match this same web reference, using the native-trait-correction
technique from `research.md` D8 to reconcile SwiftUI's pressed-state styling
needs with correct `.isLink` semantics.

**Re-check (post-Phase 1 design)**: `data-model.md` and `contracts/link-api.md`
preserve one shared design intent — size, presentation, external, and
destination-state concepts are identical across platforms — expressed through
React and SwiftUI-native APIs built on each platform's existing `Text`
component. No new token, package, or production dependency is introduced; the
unavailable-destination design (derived from the absence of a destination
value, not a boolean) makes the forbidden disabled-link state unrepresentable
by construction. Storybook, component tests, XCTest, and simulator snapshots
cover the full public contract. All five principles remain PASS; no exception
or new package layer is required.

## Complexity Tracking

No Constitution Check violations. Complexity tracking is not required.
