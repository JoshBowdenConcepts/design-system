---
description: "Task list for iOS Component Workbench"
---

# Tasks: iOS Component Workbench

**Input**: Design documents from `/specs/004-ios-component-workbench/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included because the feature is an iOS component testing workbench and the constitution requires generator contract tests and visual regression coverage. Tests are placed before their story implementation where feasible.

**Organization**: Tasks are grouped by user story. Shared token projection and native package plumbing are foundational because both the public Text component and the workbench consume them.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Tasks touch different files and have no dependency on incomplete tasks.
- **[Story]**: User-story task label; setup, foundational, and polish tasks have no story label.
- Every task names its target file or path.

## Path Conventions

This is the existing pnpm/Turborepo monorepo with Swift Package Manager products. TypeScript sources and tests live under `packages/tokens/` and `packages/components/`; the Xcode consumer lives under `apps/ios-workbench/`; generated Swift/resources remain under gitignored `packages/*/dist/ios/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the local Xcode host and source assets without adding a fourth package layer.

- [X] T001 Create the iOSComponentWorkbench Xcode project, app target, unit-test target, UI-test target, shared scheme, iOS 15 deployment target, and local root-package product references in `apps/ios-workbench/project.yml` and generated `apps/ios-workbench/iOSComponentWorkbench.xcodeproj/` using XcodeGen.
- [X] T002 [P] Add the font faces and corresponding license/attribution notices required by `packages/tokens/src/tokens/type.ts` under `packages/tokens/src/fonts/`, sourcing Bricolage Grotesque (400/600/800), Public Sans (400/500/700), and IBM Plex Mono (400/500) from their official licensed font distributions.

**Checkpoint**: Xcode recognizes the app/test targets and the source font assets have clear redistribution terms.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Generate native typography/resources from the shared source and make authored Swift component files consumable by the existing SwiftPM targets.

**CRITICAL**: User-story work depends on these generated package contracts.

- [X] T003 [P] Add typography projection contract tests in `packages/tokens/tests/generate.test.ts` covering all ten role names, CSS shorthand conversions, deterministic Swift output, malformed shorthand rejection, unsupported weights, and missing font files.
- [X] T004 Implement strict parsing and validation of the current type-token font shorthand in `packages/tokens/src/typography.ts`, deriving point size from `rem`, weight, font face, and line-height multiplier before any generated output is replaced.
- [X] T005 Emit typed role descriptors to `packages/tokens/dist/ios/DesignSystemTokens/Typography.swift` from `packages/tokens/src/generate.ts` while preserving existing `Tokens.swift` base-value constants and mapping all ten source roles exactly once.
- [X] T006 Copy the required font resources into `packages/tokens/dist/ios/DesignSystemTokens/Fonts/` deterministically from `packages/tokens/src/fonts/` as part of `packages/tokens/src/generate.ts`.
- [X] T007 Declare the generated Fonts directory as a resource of `DesignSystemTokens` in the root `Package.swift`; update `packages/tokens/src/generate.ts` to copy the authored `packages/tokens/src/ios/TokenFonts.swift` accessor into the generated target, where it resolves resources through the token module bundle.
- [X] T008 Extend `packages/components/src/generate.ts` to copy authored Swift files from `packages/components/src/ios/` into `packages/components/dist/ios/DesignSystemComponents/` on every build, preserving the generated namespace file and continuing to support the empty initial source directory.
- [X] T009 Add native token-package tests in `packages/tokens/tests/ios/TokenTypographyTests.swift` to verify all role descriptors, generated font-resource presence/registration, and failure rather than silent fallback when a required resource is unavailable.
- [X] T010 Add the `pointfreeco/swift-snapshot-testing` package dependency only to the iOS workbench test target in `apps/ios-workbench/project.yml`, pin its resolved version in `apps/ios-workbench/iOSComponentWorkbench.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`, and verify it is absent from production target dependencies.

**Checkpoint**: `pnpm build` and `swift package describe` resolve generated token typography, font resources, and component Swift sources without changing the three-product package graph.

---

## Phase 3: User Story 1 - Preview iOS Components During Development (Priority: P1) 🎯 MVP

**Goal**: Launch a local native catalog, browse examples, and open a live preview without a consuming product application.

**Independent Test**: Build and run `apps/ios-workbench/iOSComponentWorkbench.xcodeproj` on an iOS Simulator, open a catalog example, change its editable sample input, and verify that the preview updates. Verify the empty/unavailable state and accessibility labels.

### Tests for User Story 1

- [X] T011 [P] [US1] Add simulator UI tests in `apps/ios-workbench/UITests/WorkbenchCatalogUITests.swift` for app launch, catalog visibility, opening an example, changing its sample input, and returning to the catalog.
- [X] T012 [P] [US1] Add unit tests in `apps/ios-workbench/Tests/WorkbenchCatalogTests.swift` for unique example identifiers, non-empty titles, and stable ordering.
- [X] T013 [P] [US1] Add catalog visual snapshot tests in `apps/ios-workbench/Tests/WorkbenchSnapshotTests.swift` for the initial catalog screen using a fixed iPhone SE portrait snapshot configuration rendered in the iPhone 17 Pro simulator.

### Implementation for User Story 1

- [X] T014 [P] [US1] Define the typed `ComponentExample` model and catalog validation in `apps/ios-workbench/Sources/Catalog/ComponentExample.swift` with stable ID, title, typed initial content, and optional Text role.
- [X] T015 [US1] Implement the SwiftUI app entry and navigation catalog in `apps/ios-workbench/Sources/WorkbenchApp.swift` and `apps/ios-workbench/Sources/Catalog/ComponentCatalogView.swift`, displaying independently selectable examples.
- [X] T016 [US1] Add an editable native preview and state flow in `apps/ios-workbench/Sources/Catalog/ComponentExampleDetailView.swift` so changing example content refreshes its preview without restarting the app.
- [X] T017 [US1] Implement accessible empty-catalog and missing-generated-data states in `apps/ios-workbench/Sources/Catalog/CatalogAvailabilityView.swift`, with actionable messages and accessibility labels distinct from a valid preview.
- [X] T018 [US1] Add an `ios:workbench` launch command to the root `package.json` and document Xcode/Simulator prerequisites, generated-package setup, and catalog launch steps in `apps/ios-workbench/README.md`.

**Checkpoint**: The app starts from its documented workflow and catalog navigation/input editing work independently of the product application.

---

## Phase 4: User Story 2 - Evaluate the iOS Text Component (Priority: P1)

**Goal**: Provide the native Text component and viewable examples for every web Text role, consuming generated typography while retaining SwiftUI semantics and Dynamic Type behavior.

**Independent Test**: Run the components Swift tests and the workbench on Simulator; verify default paragraph role, each of the ten role mappings, editable content, registered custom fonts, line-height behavior, Dynamic Type scaling, and accessible text semantics.

### Tests for User Story 2

- [X] T019 [P] [US2] Add native component tests in `packages/components/tests/ios/DesignSystemTextTests.swift` for default role, all ten role-to-token mappings, content rendering, registered font faces, and generated font/line-height use.
- [X] T020 [P] [US2] Add SwiftUI snapshot tests for the ten-role gallery in `apps/ios-workbench/Tests/WorkbenchSnapshotTests.swift` using a fixed iPhone SE portrait snapshot configuration and committed reference-image location.

### Implementation for User Story 2

- [X] T021 [US2] Define the public `TextRole` enum and `DesignSystemText` SwiftUI component in `packages/components/src/ios/Text.swift`, defaulting to `p` and consuming generated `DesignSystemTokens` typography descriptors without copying style values.
- [X] T022 [US2] Map every generated typography descriptor to its registered custom font, native Dynamic Type reference style, and line-height multiplier in `packages/components/src/ios/Text.swift`, preserving SwiftUI accessibility behavior and avoiding HTML-only `as` semantics.
- [X] T023 [US2] Add one catalog entry per Text role with editable sample content and role selection in `apps/ios-workbench/Sources/Catalog/ComponentExample.swift`, and register those entries in `apps/ios-workbench/Sources/Catalog/ComponentCatalogView.swift`.
- [X] T024 [US2] Render a deterministic Text-role gallery and accessibility labels for snapshot/UI inspection in `apps/ios-workbench/Sources/Catalog/TextRoleGalleryView.swift`.
- [X] T025 [US2] Record initial catalog and Text gallery snapshot baselines under `apps/ios-workbench/Tests/__Snapshots__/WorkbenchSnapshotTests/` using the fixed iPhone SE portrait configuration and review that all ten roles resolve to registered faces.

**Checkpoint**: The workbench demonstrates the complete native Text role set; component sources remain reusable from the existing components product.

---

## Phase 5: User Story 3 - Verify Shared Design-Token Updates (Priority: P2)

**Goal**: A source token change propagates through generation into the native descriptor and refreshed workbench preview without a separately authored Swift value.

**Independent Test**: Change a supported role value in `packages/tokens/src/tokens/type.ts`, run the documented generation/build and app refresh workflow, and verify that the displayed native role changes while other source roles remain unchanged.

### Tests for User Story 3

- [X] T026 [P] [US3] Add a token-propagation integration test in `packages/tokens/tests/ios/typography-projection.integration.test.ts` that changes a fixture role value and asserts only the matching generated Swift descriptor changes.
- [X] T027 [P] [US3] Add a components integration test in `packages/components/tests/ios/TextTokenIntegrationTests.swift` verifying `DesignSystemText` resolves its typography through generated token descriptors rather than local numeric/family constants.

### Implementation for User Story 3

- [X] T028 [US3] Add a repeatable `ios:build` command to the root `package.json` that runs the shared `pnpm build` before the workbench build, and update `apps/ios-workbench/README.md` with the rebuild/relaunch steps after token edits.
- [X] T029 [US3] Add a token-change verification scenario to `specs/004-ios-component-workbench/quickstart.md` that records the source edit, generated descriptor change, refreshed preview, and cleanup/restore step without hand-editing generated files.
- [X] T030 [US3] Verify an edited shared type token in `packages/tokens/src/tokens/type.ts` changes the `packages/tokens/dist/web/tokens.css` and `packages/tokens/dist/ios/DesignSystemTokens/Typography.swift` outputs, then restore the source and regenerate baseline outputs.

**Checkpoint**: A shared token edit is the sole source change required to update its corresponding native Text presentation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Gate native quality and document the complete development loop.

- [X] T031 [P] Add a macOS CI job in `.github/workflows/ci.yml` that installs Node/pnpm dependencies, runs `pnpm build`, generates the Xcode project, and runs workbench Simulator unit/UI/snapshot tests.
- [X] T032 [P] Document the iOS product APIs, shared font resources, build/test commands, and three-layer package boundaries in `packages/tokens/README.md` and `packages/components/README.md`.
- [X] T033 [P] Add the quick workbench command and Xcode/Simulator setup instructions to the root `./README.md` command reference.
- [X] T034 Run `specs/004-ios-component-workbench/quickstart.md` generation, `swift package describe`, simulator UI/component tests, token propagation check, and visual snapshot tests; restore `packages/tokens/src/tokens/type.ts` and regenerate baseline outputs.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; establish the Xcode consumer and licensed source assets.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories because native components and the app consume generated typography/resources and copied Swift sources.
- **US1 (Phase 3)**: Depends on Foundational; delivers the standalone catalog and live preview loop.
- **US2 (Phase 4)**: Depends on Foundational; component tests can run independently, with catalog examples integrated when US1 is present. For a complete in-app Text journey, US1 and US2 are both required.
- **US3 (Phase 5)**: Depends on Foundational and US2; verifies changed source-token values flow through the generator into the rendered native Text. Its token generator contract test can run independently after Foundational.
- **Polish (Phase 6)**: Depends on the stories being delivered; CI and documentation cover the complete local loop.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational. It has a built-in native sample preview so the catalog is demonstrable before the public Text component lands.
- **US2 (P1)**: Can start after Foundational. Component API/token mapping tests are independently runnable; catalog integration uses the US1 host.
- **US3 (P2)**: Requires US2 to prove token updates in the native Text rendering; the generator fixture test is independently runnable after Foundational.

### Parallel Opportunities

- Setup: T001 and T002 can proceed in parallel.
- Foundational: T003, T008, and T010 can start independently; T004 follows its contract tests, T005/T006 follow parser/generation work, and T007 depends on the generated resource location being fixed.
- US1: T011, T012, and T013 are parallel test files; T014 can be authored alongside those tests, while catalog/detail views depend on the model.
- US2: T019 and T020 are parallel tests; T021/T022 implement the component, while T023 integrates examples after US1 catalog models exist.
- US3: T026 and T027 are separate integration tests; T028/T029 touch different files and may proceed in parallel.
- Polish: T031, T032, and T033 touch separate files and can proceed in parallel; T034 follows all of them.

## Parallel Example: User Story 2

```text
Task: "Add native component contract tests in packages/components/tests/ios/DesignSystemTextTests.swift"
Task: "Add SwiftUI role-gallery snapshot tests in apps/ios-workbench/Tests/WorkbenchSnapshotTests.swift"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete US1 to launch and browse the native catalog with an editable preview.
3. Validate the catalog independently on Simulator; this proves the fast preview loop.
4. Complete US2 to replace the sample preview with the reusable token-driven Text API and all ten role examples.

### Incremental Delivery

1. Setup + Foundational produce the local native package/app baseline and typed generated typography.
2. US1 delivers the standalone component workbench loop.
3. US2 delivers the reusable native Text component and role catalog.
4. US3 proves source-token edits propagate to the iOS preview.
5. Polish gates/document the complete native development loop.

## Notes

- Every task uses the required `- [ ] T### [P?] [US#?] ... path` checklist format.
- Test tasks are included because both the feature and repository constitution require them; snapshots use a pinned simulator to limit rendering drift.
- Generated files under `packages/*/dist/ios/` are build outputs and must never be edited directly.
- `Package.swift` remains the only manifest exposing the three existing package products; `apps/ios-workbench` is an application consumer, not a new package layer.
