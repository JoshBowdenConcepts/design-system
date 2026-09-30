# Implementation Plan: Button Component

**Branch**: `005-button-component` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-button-component/spec.md`

## Summary

Add token-backed Button components for React/web and SwiftUI/iOS in the existing
components package. Both platforms expose the three approved appearances (solid,
outline, text) at two approved sizes (sm, md), optional leading and trailing
consumer-provided icons, a `fullWidth` layout with centered or space-between
content alignment, disabled behavior, and accessible icon-only actions. Use CSS
Modules and Storybook on web, authored SwiftUI sources copied into the existing
generated SwiftPM target on iOS, and the existing iOS workbench for native
examples and snapshots. Exact appearance/size/state visuals come from the
reviewed Claude Design Button reference (`Design System` project,
`templates/button/Button.dc.html`); `fullWidth`, content alignment, and
leading/trailing icon+label combinations extend beyond that reference and are
required ahead of design sign-off per an accepted spec clarification. iOS has no
separate design artifact and is a native translation of the same web reference.

## Technical Context

**Language/Version**: TypeScript 5.7+ with React 18/19; Swift 5.9 package compatibility and SwiftUI; Node.js 22+.

**Primary Dependencies**: Existing `@design-system/tokens`, `@design-system/icons`, `clsx`, React, SwiftUI, Swift Package Manager, Storybook 8.4, Vitest, XCTest, XcodeGen, and the existing test-only SnapshotTesting dependency in the iOS workbench.

**Storage**: N/A. Component state is controlled by native props/actions; no persistent data.

**Testing**: Vitest component behavior/type tests; Storybook documentation and visual/accessibility checks; XCTest for SwiftUI behavior and accessible naming; workbench simulator snapshots; package build/typecheck and Xcode simulator build/test.

**Target Platform**: Web (React 18/19) and iOS 15+ (SwiftUI), using the existing packages and app workbench.

**Project Type**: Existing pnpm/Turborepo design-system monorepo with a React library, a SwiftPM projection of the components package, Storybook documentation, and a local iOS workbench app.

**Performance Goals**: No additional runtime or rendering cost beyond a native button and its content; visual state changes occur in the same interaction frame under normal browser/simulator use.

**Constraints**: Preserve exactly three package layers; source visual values from shared tokens; do not edit generated `dist/`; keep the native API platform-appropriate; default `fullWidth` to false and its alignment to centered; distribute leading icon, label, and trailing icon across available width for space-between alignment. Appearance/size/state visuals are fixed by the reviewed Claude Design Button reference (solid/outline/text × sm/md; default/hover/pressed/disabled — no busy state); icon-only Buttons use the same sm/md sizes with a 24×24 minimum footprint rather than a separate size. Avoid new production dependencies.

**Scale/Scope**: One public web Button and one public native Button; approved appearance/size/state options; label plus four icon-presence combinations; full-width centered and space-between layouts; disabled and icon-only accessible-name behavior; web Storybook stories and iOS workbench examples/tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|---|---|---|
| I | Tokens Are the Source of Truth | Button colors, type, spacing, radius, focus and sizing use existing semantic tokens on both platforms; add tokens only if approved design values cannot be expressed with the current set. | PASS |
| II | Generate, Do Not Fork | The same approved design decisions and token source drive React and SwiftUI projections; platform-native interaction behavior may differ without a second visual authority. | PASS |
| III | Layered, Independently Shippable Packages | Keep Button in `packages/components`; consume tokens/icons in the existing one-way dependency direction; do not add a package layer. | PASS |
| IV | Accessibility Is Non-Negotiable | Use native button semantics, input/focus behavior, disabled state, and platform accessible names; icon-only controls require a non-empty name. Validate web against WCAG 2.2 AA and iOS with accessibility tests. | PASS |
| V | Tooling Enforces the Contract | Add typed public contracts, component tests, Storybook documentation, native XCTest coverage, and web/iOS visual regression; generated iOS output remains reproducible. | PASS |

**Technology Constraints check**: pnpm/Turborepo ✓ · TypeScript/React/Storybook ✓ · SwiftUI/SwiftPM ✓ · Node.js 22+ ✓ · existing three package layers ✓ · no new production dependencies ✓

**Result (pre-Phase 0)**: No constitution violations. The Claude Design Button reference has been retrieved (solid/outline/text × sm/md; default/hover/pressed/disabled); no unresolved design input blocks Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-button-component/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/button-api.md
└── tasks.md              # Created by /speckit-tasks
```

### Source Code (repository root)
```text
packages/components/
├── src/
│   ├── Button.tsx
│   ├── Button.module.css
│   ├── index.ts
│   ├── generate.ts
│   └── ios/Button.swift
└── tests/
    ├── Button.test.tsx
    ├── Button.types.tsx
    └── ios/DesignSystemButtonTests.swift

apps/docs/src/Button.stories.tsx
apps/ios-workbench/Sources/Catalog/
apps/ios-workbench/Tests/
```

**Structure Decision**: Extend the existing components package and generated
iOS projection. Keep the web CSS Module adjacent to the React component;
hand-authored SwiftUI code belongs under `src/ios` and is copied by the current
generator into `dist/ios`. Use Storybook for web documentation and the existing
workbench for native examples. Do not edit generated files. Icon slots accept
consumer-supplied platform content on both platforms; `@design-system/icons`
generates the icon components themselves (a React component on web, a SwiftUI
`Shape` on iOS) from the same source SVGs.

**Design handoff**: The Claude Design "Design System" project's
`templates/button/Button.dc.html` is the approved reference: solid, outline,
and text appearances at sm (30px) and md (38px) sizes, default/hover/pressed/
disabled states (no busy state), and a 24×24 icon-only example using the same
sm/md sizes rather than a distinct size. Its companion `Button.jsx`/`Button.d.ts`
proposal is a design sketch, not the package implementation; the web component
still follows the existing CSS Module pattern (`Text.module.css`) consuming the
same semantic tokens the proposal references (`--ds-color-primary`,
`--ds-color-primary-hover`, `--ds-color-text-primary`, `--ds-color-bg-raised`,
`--ds-color-bg-sunken`, `--ds-color-primary-subtle`, `--ds-color-text-tertiary`,
`--ds-color-border`, `--ds-radius-200`, `--ds-space-50/100/150/200/300`,
`--ds-color-focus-ring` and its width/offset tokens). The workspace has no
synced Button source under `.design-sync/previews` yet — that local
Storybook-vs-Claude-Design comparison only populates once the web component is
built and storied, so it is a Phase-3+ implementation step, not an open design
question. `fullWidth`, content alignment, and leading/trailing icon+label
combinations are not shown in the reference; they are required anyway per the
accepted clarification, flagged as ahead of design sign-off. iOS has no
separate design artifact and must visually match this same web reference.

**Re-check (post-Phase 1 design)**: Data and contracts preserve one shared
design intent with React and SwiftUI-native APIs; visual values consume shared
tokens, and generated Swift remains reproducible. Storybook, component tests,
XCTest, and simulator snapshots cover the public contract. All five principles
remain PASS; no exception or new package layer is required.

## Complexity Tracking

No Constitution Check violations. Complexity tracking is not required.
