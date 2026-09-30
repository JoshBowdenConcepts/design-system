# Tasks: Button Component

**Input**: Design documents from `/specs/005-button-component/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/button-api.md`, and `quickstart.md`

**Tests**: Included because the specification requires component, accessibility, and visual-regression verification on both platforms.

**Organization**: Tasks are grouped by the prioritized user stories in `spec.md`. Appearance/size/state names come from the approved Claude Design inventory recorded in `research.md` (D8): appearances `solid`, `outline`, `text`; sizes `sm` (30px) and `md` (38px); states default/hover/pressed/disabled (no busy/loading state); icon-only content uses the same `sm`/`md` sizes with a 24×24 minimum footprint. `fullWidth`, content alignment, and leading/trailing icon+label combinations are required per an accepted spec clarification even though the current design reference does not show them yet.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks because files and prerequisites do not overlap.
- **[Story]**: User story associated with a story-phase task.
- Every task includes its target file path.

## Phase 1: Setup

**Purpose**: Confirm the workspace is ready to consume the approved design inventory before implementation.

- [X] T001 [P] Confirm `@design-system/tokens` and `@design-system/icons` build outputs are current (`pnpm --filter @design-system/tokens build`, `pnpm --filter @design-system/icons build`) so Button can consume the existing `--ds-color-*`, `--ds-space-*`, `--ds-radius-*`, and `--ds-color-focus-ring` tokens.
- [X] T002 [P] Create `specs/005-button-component/design-reference.md` recording the approved Button inventory from `research.md` (D8): appearances (`solid`/`outline`/`text`), sizes (`sm` 30px / `md` 38px), states (default/hover/pressed/disabled, no busy state), the icon-only 24×24 floor within `sm`/`md`, and the specific `--ds-*` token per appearance/state. This is the baseline reviewers compare implementation output against.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure the existing components package can ship both platform implementations and the web style asset.

- [X] T003 Update the generator in `packages/components/src/generate.ts` to register Button in the generated iOS component list and copy `Button.module.css` into `dist/web` alongside `Text.module.css`, without editing generated output.

**Checkpoint**: Design inventory is recorded and package generation supports the Button sources/assets; user-story implementation can begin.

---

## Phase 3: User Story 1 - Choose a Designed Action Button (Priority: P1) 🎯 MVP

**Goal**: Consumers can select the three approved appearances at both approved sizes, choose leading/trailing icon content, and control full-width content alignment on web and iOS.

**Independent Test**: Render each of the three appearances at both sizes and each icon-slot combination on both platforms; verify `fullWidth` defaults off and its centered/space-between layouts match `design-reference.md`.

### Tests for User Story 1

- [X] T004 [P] [US1] Add Vitest cases for Button default width, centered/space-between alignment, the three appearances (`solid`/`outline`/`text`) at both sizes (`sm`/`md`), and all four leading/trailing icon combinations in `packages/components/tests/Button.test.tsx`.
- [X] T005 [P] [US1] Add SwiftUI component tests for the three appearances at both sizes, width/alignment defaults, and all four leading/trailing icon combinations in `packages/components/tests/ios/DesignSystemButtonTests.swift`.

### Implementation for User Story 1

- [X] T006 [P] [US1] Implement the typed React Button content/layout API (`variant: 'solid' | 'outline' | 'text'`, `size: 'sm' | 'md'`, `fullWidth`, content alignment, leading icon, trailing icon props) in `packages/components/src/Button.tsx`.
- [X] T007 [P] [US1] Implement token-backed styles for each of the three appearances at both sizes and for centered/space-between full-width layouts, using the tokens recorded in `design-reference.md`, in `packages/components/src/Button.module.css`.
- [X] T008 [P] [US1] Implement the native SwiftUI Button view with typed appearance (`solid`/`outline`/`text`), size (`sm`/`md`), and alignment options plus optional leading/trailing view content in `packages/components/src/ios/Button.swift`.
- [X] T009 [US1] Export the web Button and its public prop/option types from `packages/components/src/index.ts` and verify the package build includes the CSS Module through `packages/components/src/generate.ts`.
- [X] T010 [US1] Add the native Button type to the generated component manifest in `packages/components/src/generate.ts` and verify its Swift source is copied into the generated target.

**Checkpoint**: Each platform renders only the three approved appearances at both approved sizes, and full-width alignment and all icon-slot combinations work independently of action wiring.

---

## Phase 4: User Story 2 - Activate an Action Predictably (Priority: P1)

**Goal**: Enabled Buttons activate once through native input, disabled Buttons do not activate, and web form behavior is predictable.

**Independent Test**: Activate the web and iOS Button examples, verify disabled actions do not run, and confirm web form buttons default to `type="button"` while explicit submit/reset types retain native behavior.

### Tests for User Story 2

- [X] T011 [P] [US2] Add Vitest tests for click-handler forwarding, keyboard/native button semantics, disabled activation, default `type="button"`, and explicit submit/reset behavior in `packages/components/tests/Button.test.tsx`.
- [X] T012 [P] [US2] Add XCTest coverage for native action invocation, disabled state, and accessible button role in `packages/components/tests/ios/DesignSystemButtonTests.swift`.

### Implementation for User Story 2

- [X] T013 [US2] Forward native React button attributes and event handlers, default the web `type` to `button`, and prevent activation when disabled in `packages/components/src/Button.tsx`.
- [X] T014 [US2] Wire the SwiftUI Button action and disabled state through its native initializer in `packages/components/src/ios/Button.swift`.

**Checkpoint**: Web and iOS activation and disabled behavior pass independently; web form defaults and overrides behave natively.

---

## Phase 5: User Story 3 - Identify and Use Accessible Button Choices (Priority: P2)

**Goal**: Icon-only buttons require a platform-standard accessible name, and consumers can discover every supported appearance, size, and state in the canonical web and iOS documentation surfaces.

**Independent Test**: Verify accessible names for icon-only controls, visible web keyboard focus, native accessibility labels, complete Storybook/workbench examples, and matching visual baselines.

### Tests for User Story 3

- [X] T015 [P] [US3] Add tests that reject unnamed icon-only Buttons and accept a non-empty `aria-label` or valid `aria-labelledby` while preserving visible-label naming in `packages/components/tests/Button.test.tsx`.
- [X] T016 [P] [US3] Add XCTest assertions for visible-label and icon-only accessibility names and native accessibility role in `packages/components/tests/ios/DesignSystemButtonTests.swift`.

### Implementation for User Story 3

- [X] T017 [US3] Enforce the icon-only accessible-name contract in the React Button API and preserve visible keyboard focus and disabled announcements in `packages/components/src/Button.tsx` and `packages/components/src/Button.module.css`.
- [X] T018 [US3] Provide a native icon-only Button API that requires a non-empty accessibility label and applies it to the SwiftUI Button in `packages/components/src/ios/Button.swift`.
- [X] T019 [P] [US3] Document the three appearances, two sizes, states, icon arrangements, and full-width alignments in `apps/docs/src/Button.stories.tsx`.
- [X] T020 [P] [US3] Add matching native Button examples and catalog registration for the three appearances, icon arrangements, and width/alignment choices in `apps/ios-workbench/Sources/Catalog/ButtonExamples.swift` and `apps/ios-workbench/Sources/Catalog/ComponentCatalogView.swift`.
- [X] T021 [US3] Run `pnpm --filter docs test-storybook` against the built Storybook, then review the generated WCAG 2.2 AA and DOM snapshot results from `apps/docs/.storybook/test-runner.ts` under `apps/docs/src/__snapshots__/Button.stories.tsx.snap`.
- [X] T022 [P] [US3] Add iOS snapshots for the three appearances, icon, and full-width alignment gallery in `apps/ios-workbench/Tests/WorkbenchSnapshotTests.swift` and record reviewed baselines under `apps/ios-workbench/Tests/__Snapshots__/WorkbenchSnapshotTests/`.

**Checkpoint**: Icon-only controls have required accessible names, and both canonical documentation surfaces show the approved and tested Button choices.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Re-run package-wide quality gates and keep consumer documentation aligned with the public APIs.

- [X] T023 [P] Document the web and iOS Button APIs, the `design-reference.md` inventory, icon content expectations, and validation commands in `packages/components/README.md`.
- [X] T024 Run the web and iOS commands in `specs/005-button-component/quickstart.md`, fix any Button-related failures, and record reviewed visual-regression results against `specs/005-button-component/design-reference.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 and T002 can run in parallel; no prior dependencies.
- **Foundational (Phase 2)**: T003 follows Setup and enables generated package exports/assets; blocks implementation verification for all stories.
- **US1 (Phase 3)**: Depends on Setup and Foundational; delivers the visual options and content/layout contract.
- **US2 (Phase 4)**: Depends on US1 because it wires activation into the styled public component.
- **US3 (Phase 5)**: Depends on US1 and US2 because accessibility and documentation cover the completed API and states.
- **Polish (Phase 6)**: Depends on all user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Setup and Foundational package generation. It is independently renderable and is the visual/layout MVP.
- **US2 (P1)**: Follows US1 because it adds action behavior to the same control; its activation and form tests remain independently verifiable.
- **US3 (P2)**: Follows US1 and US2 so accessible-name enforcement and docs cover the complete component behavior.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T004 and T005 can be written in parallel because they target web and native test files.
- After the US1 contract tests are in place, T006, T007, and T008 can be implemented in parallel in separate platform/style files.
- T011 and T012 can be written in parallel across web and native tests; T013 and T014 can then be implemented in parallel.
- In US3, web and iOS accessibility tests and docs/examples/snapshot files can be split across contributors.

## Parallel Example: User Story 1

```text
Task: T004 Web layout/icon tests in packages/components/tests/Button.test.tsx
Task: T005 iOS layout/icon tests in packages/components/tests/ios/DesignSystemButtonTests.swift

After those tests are defined:
Task: T006 React API/layout in packages/components/src/Button.tsx
Task: T007 Token styles in packages/components/src/Button.module.css
Task: T008 SwiftUI view/layout in packages/components/src/ios/Button.swift
```

## Implementation Strategy

### MVP First

1. Complete T001–T003, including the recorded design-reference baseline.
2. Complete US1 to deliver the three appearances at both sizes and icon/full-width layouts on both platforms.
3. Validate US1 independently with component rendering and reviewed visual comparisons.
4. Continue with US2 activation behavior, then US3 accessibility/docs and cross-platform visual gates.

### Incremental Delivery

1. Setup + foundation → recorded design inventory and reproducible package assets.
2. US1 → independently renderable visual/layout MVP.
3. US2 → predictable enabled/disabled actions and web form semantics.
4. US3 → accessible icon-only APIs and complete web/native documentation.
5. Polish → quickstart validation and final reviewed snapshots.

## Independent Test Criteria

- **US1**: Render each of the three appearances and both sizes, all four leading/trailing icon combinations, `fullWidth=false/true`, and both full-width alignments on web and iOS; compare output with `design-reference.md`.
- **US2**: Activate enabled controls, ensure disabled controls do not invoke actions, and verify web default/explicit button types inside a form.
- **US3**: Verify icon-only controls reject missing accessible names, visible-label controls expose their names, web keyboard focus is visible, and Storybook/workbench cover the approved inventory.

## Notes

- Every task uses the required unchecked checkbox, sequential ID, applicable parallel/story labels, and a concrete file path.
- Tests are included because FR-012 explicitly requires component verification; visual tests also satisfy the constitution's visual-regression gate.
- No task introduces an inferred visual variant or a new production dependency.
