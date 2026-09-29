# Implementation Plan: iOS Component Workbench

**Branch**: `004-ios-component-workbench` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-ios-component-workbench/spec.md`

## Summary

Provide a local SwiftUI component catalog for the existing iOS SwiftPM products,
starting with the ten named Text roles already exposed by the web Text component.
Keep Swift component sources in the existing components layer, derive typed iOS
typography values and font resources from the shared token package, and use a
small Xcode app under `apps/ios-workbench` as the simulator-based preview host.
The app is a consumer of the existing local Swift package, not a fourth
shippable package.

## Technical Context

**Language/Version**: Swift 5.9 package compatibility; build and preview with the repository's installed Xcode toolchain. Token generation remains TypeScript 5.7+ on Node.js 22+.

**Primary Dependencies**: SwiftUI, Swift Package Manager, XcodeGen, existing custom TypeScript token generator, existing pnpm/Turborepo workspace. `pointfreeco/swift-snapshot-testing` is test-target-only for the constitution-required visual regression gate; no production runtime dependency is added.

**Storage**: N/A. Generated Swift token/component outputs and the local app build products are files; no persistent user data.

**Testing**: Existing Vitest contract tests for token output; SwiftPM/XCTest for native component and token contracts; Xcode simulator test target for workbench navigation, accessibility, and committed visual snapshots; `xcodebuild` build/test and `swift package describe` for integration.

**Target Platform**: iOS 15 or newer, with iOS Simulator on macOS for local development and validation. Xcode and an installed iOS Simulator runtime are prerequisites.

**Project Type**: Existing three-layer pnpm monorepo and root Swift package, with one local Xcode app consumer under `apps/ios-workbench`.

**Performance Goals**: With generated package outputs present and Xcode already installed, a developer can launch the workbench and open a Text example in under two minutes. Editing an example input should update its preview within one second during normal simulator use.

**Constraints**: Shared TypeScript token sources remain authoritative; generated Swift under `dist/` is never hand-edited; no fourth `packages/*` layer; the Xcode app consumes the local root Swift package; the same ten web Text roles are exposed natively; initial typography presentation must use the existing type tokens and corresponding font families rather than parallel authored values.

**Scale/Scope**: One local iOS workbench app, one navigable component catalog, one SwiftUI Text component, ten text-role examples, generated iOS typography/font resources, focused generator/native/simulator tests, and developer documentation.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| #   | Principle                                 | Gate for this feature                                                                                                                                                                                                                                                                                                                                                                   | Status |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I   | Tokens Are the Source of Truth            | Text presentation and font assets are projections of existing TypeScript token/font sources; Swift components contain no competing type sizes, weights, line heights, or family decisions.                                                                                                                                                                                              | PASS   |
| II  | Generate, Do Not Fork                     | Token generation produces the iOS typography representation and font resources; native components consume that output. Web and iOS continue to derive from one design source.                                                                                                                                                                                                           | PASS   |
| III | Layered, Independently Shippable Packages | Keep tokens/icons/components as the only package layers. SwiftUI component sources remain in `packages/components`; `apps/ios-workbench` is an app consumer, not a package layer. Dependencies remain components → tokens/icons.                                                                                                                                                        | PASS   |
| IV  | Accessibility Is Non-Negotiable           | Native Text preserves readable native behavior and accessibility semantics. Workbench navigation/controls have accessible names and roles; simulator tests cover accessibility identifiers/labels and supported Dynamic Type behavior.                                                                                                                                                  | PASS   |
| V   | Tooling Enforces the Contract             | Generator contract tests assert emitted iOS typography values/resources; Swift tests cover role mapping and component behavior; simulator snapshot tests gate visual changes; build/test commands are documented and reproducible. SnapshotTesting is confined to the workbench test target because the constitution requires visual regression; it adds no shipped runtime dependency. | PASS   |

**Technology Constraints check**: pnpm + Turborepo ✓ · custom TypeScript token schema/generator retained ✓ · web TypeScript/React/Storybook unchanged ✓ · iOS SwiftUI and SwiftPM ✓ · Node.js 22+ ✓ · no new package layer ✓

**Result (pre-Phase 0)**: No violations. Complexity Tracking is not required.

## Project Structure

### Documentation (this feature)

```text
specs/004-ios-component-workbench/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
design-system/
├── Package.swift                         # existing local SwiftPM products/targets
├── package.json                          # add documented iOS build/workbench commands
├── packages/
│   ├── tokens/
│   │   ├── src/fonts/                     # source font assets + license notices
│   │   ├── src/generate.ts                # typed iOS typography projection/resources
│   │   └── tests/generate.test.ts          # emitted Swift/resource contract coverage
│   └── components/
│       ├── src/ios/Text.swift              # hand-authored SwiftUI Text API
│       ├── src/generate.ts                 # copies native sources to generated SwiftPM target
│       └── tests/ios/                      # native component contract tests
├── Package.swift                           # declare generated token Fonts as resources
└── apps/
    ├── docs/                               # existing web Storybook consumer
    └── ios-workbench/
        ├── iOSComponentWorkbench.xcodeproj/
        ├── Sources/                        # SwiftUI app shell and catalog entries
        ├── Tests/                          # unit and visual snapshot tests
        ├── UITests/                        # catalog navigation/accessibility flows
        ├── Package.resolved                # pinned test-only snapshot dependency
        └── README.md                       # local launch and validation workflow
```

**Structure Decision**: Reuse the existing packages and root SwiftPM manifest.
Hand-authored SwiftUI component sources live in `packages/components/src/ios`
and are copied by the package generator into its existing generated target.
The tokens generator emits typed typography descriptors alongside the existing
base token constants and packages the font files/license notices as resources
of the existing `DesignSystemTokens` target, declared in the root `Package.swift`.
A public resource-bundle accessor
lets the components product load those same font faces. A small Xcode app under
`apps/ios-workbench` consumes the root package by local path and provides the
catalog/preview loop. This app directory does not add a `packages/*` layer or a
new runtime dependency.

The web Text API currently exposes the roles `display`, `h1`, `h2`, `h3`, `h4`,
`p`, `p-sm`, `label`, `caption`, and `overline`; native examples map these roles
to SwiftUI styling while keeping native semantics. `as` is a web-only semantic
element selection and is not copied into the Swift API.

**Re-check (post-Phase 1 design)**: Data and contracts retain the three package
layers, one shared token source, and one local app consumer. Generated native
typography/resources and component source copies are reproducible projections;
Xcode simulator tests enforce accessibility and visual behavior. SnapshotTesting
is test-only and justified by the mandated visual-regression gate. All five
principles remain PASS; no package-layer or runtime-dependency exception is
needed.

## Complexity Tracking

No Constitution Check violations. Complexity tracking is not required.
