# Tasks: Link Component

**Input**: Design documents from `/specs/006-link-component/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/link-api.md`, `design-reference.md`, and `quickstart.md`

**Tests**: Included because FR-019 explicitly requires component verification covering size inheritance, each size, type-level rejection of heading/display sizes, both presentations, standalone target size, external indicator/navigation safety, the unavailable presentation, accessible naming, and focus visibility on both platforms.

**Organization**: Tasks are grouped by the five prioritized user stories in `spec.md`. Size/presentation/state names come from the approved Claude Design inventory recorded in `research.md` (D9) and `design-reference.md`: sizes `p`, `p-sm`, `label`, `caption` (plus the default size-inheritance behavior); presentations `inline` (default) and `standalone` (24×24 minimum target); destination states same-context, external, and unavailable (no `disabled` state). `caption` is required ahead of the current design reference per the accepted `/speckit-specify` clarification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks because files and prerequisites do not overlap.
- **[Story]**: User story associated with a story-phase task.
- Every task includes its target file path.

## Phase 1: Setup

**Purpose**: Confirm the workspace is ready to consume the approved design inventory before implementation.

- [X] T001 [P] Confirm `@design-system/tokens` build output is current (`pnpm --filter @design-system/tokens build`) so Link can consume the existing `--ds-color-primary`/`-primary-hover`/`-text-tertiary`/`-focus-ring`, `--ds-radius-100`, `--ds-space-50`/`-300`, and `--ds-layout-focus-ring-*` tokens; no new token is introduced by this feature.
- [X] T002 [P] Review `specs/006-link-component/design-reference.md` against the live `templates/link/Link.dc.html` in the Claude Design "Design System" project to confirm the recorded inventory (sizes, presentations, external treatment, states, and the eight accessibility rules) is still current before implementation begins.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure the existing components package can ship both platform implementations and the web style asset.

- [X] T003 Update the generator in `packages/components/src/generate.ts` to register Link in the generated iOS component list and copy `Link.module.css` into `dist/web` alongside `Text.module.css`/`Button.module.css`, without editing generated output.

**Checkpoint**: Design inventory is confirmed and package generation supports the Link sources/assets; user-story implementation can begin.

---

## Phase 3: User Story 1 - Place a Link Inside Running Text (Priority: P1) 🎯 MVP

**Goal**: A Link placed inside body copy inherits the surrounding text's size and weight by default, stays underlined, and navigates once on activation — the core inline Link contract built directly on `Text`.

**Independent Test**: Place the Link inside paragraph copy at two different surrounding text sizes with no size chosen, inspect its computed size against the surrounding text, confirm the underline, and activate it by pointer and keyboard.

### Tests for User Story 1

- [X] T004 [P] [US1] Add Vitest cases for an `<a>` with no `size` set inheriting `font: inherit` from `Text as="span"` (per D3), the four explicit sizes (`p`/`p-sm`/`label`/`caption`) resolving to their matching `Text` variant, the always-on underline in the resting state, and `href`/click-handler forwarding for navigation, in `packages/components/tests/Link.test.tsx`.
- [X] T005 [P] [US1] Add a type-test file asserting a `Link` with no `size` compiles, each of the four explicit sizes compiles, and `size="h1"`/`size="display"` fail with `@ts-expect-error` (per FR-006/D4) in `packages/components/tests/Link.types.tsx`.
- [X] T006 [P] [US1] Add SwiftUI component tests for `DesignSystemLink` with `size: nil` inheriting the ambient font, each of the four explicit `LinkSize` cases resolving to the matching `TextRole`, the always-on underline, and that activation invokes `openURL` with the given destination, in `packages/components/tests/ios/DesignSystemLinkTests.swift`.

### Implementation for User Story 1

- [X] T007 [P] [US1] Implement the typed React `Link` component (`href`, optional `size: 'p' | 'p-sm' | 'label' | 'caption'`, `className`, children, native anchor props except `target`/`rel`) wrapping `<a>` around `<Text as="span" variant={size}>` per D2/D3, in `packages/components/src/Link.tsx`.
- [X] T008 [P] [US1] Implement token-backed resting/hover/focus-visible underline styles (`--ds-color-primary`/`-primary-hover`/`-focus-ring`, `--ds-radius-100`, `--ds-layout-focus-ring-*`) for the base (inline) presentation, using the tokens recorded in `design-reference.md`, in `packages/components/src/Link.module.css`.
- [X] T009 [P] [US1] Implement the native SwiftUI `DesignSystemLink` view with a `LinkSize?` option (`p`/`pSm`/`label`/`caption`, `nil` inherits the ambient font per D3), an `@Environment(\.openURL)`-backed `Button` action per D8, and the resting/pressed/focus color treatment from `design-reference.md`, in `packages/components/src/ios/Link.swift`.
- [X] T010 [US1] Export the web `Link` component and its public prop/size types from `packages/components/src/index.ts` and verify the package build includes the CSS Module through `packages/components/src/generate.ts`.
- [X] T011 [US1] Add the native Link type to the generated component manifest in `packages/components/src/generate.ts` and verify its Swift source is copied into the generated target.

**Checkpoint**: An inline Link with no size set matches its surrounding text, each explicit size renders correctly, heading sizes are rejected at compile time, and activation navigates on both platforms — independently testable before standalone/external/unavailable behavior exists.

---

## Phase 4: User Story 2 - Use a Standalone Link at a Chosen Size (Priority: P1)

**Goal**: A Link placed on its own meets the 24×24 minimum interactive target at every supported size and shows a visible focus treatment, with heading sizes unavailable through the contract.

**Independent Test**: Render a standalone Link at each supported size, confirm its typography and 24×24 minimum footprint, confirm a heading-scale size is rejected by the type system, and move keyboard focus to it to confirm the visible focus ring.

### Tests for User Story 2

- [X] T012 [P] [US2] Add Vitest cases for the `standalone` prop applying the 24×24 minimum height/width box at each of the four explicit sizes, inline links (the default) having no such minimum applied, and `:focus-visible` applying the shared focus-ring tokens, in `packages/components/tests/Link.test.tsx`.
- [X] T013 [P] [US2] Add SwiftUI component tests for `standalone: true` applying the 24×24 minimum frame at each explicit `LinkSize`, `standalone: false` (default) applying no such minimum, and the focus-ring treatment being present when focused via Full Keyboard Access, in `packages/components/tests/ios/DesignSystemLinkTests.swift`.

### Implementation for User Story 2

- [X] T014 [US2] Add the `standalone` boolean (default `false`) to the `Link` component's prop type and class resolution in `packages/components/src/Link.tsx`.
- [X] T015 [US2] Add the standalone presentation's `display: inline-flex; align-items: center; box-sizing: border-box; min-height/min-width: var(--ds-space-300)` treatment, scoped so the inline (default) presentation is unaffected, in `packages/components/src/Link.module.css`.
- [X] T016 [US2] Add the `standalone: Bool` option (default `false`) to `DesignSystemLink` and apply the equivalent 24×24 `.frame(minWidth:minHeight:)` floor only when `standalone` is `true`, in `packages/components/src/ios/Link.swift`.

**Checkpoint**: Standalone Links meet the minimum interactive target at every size, inline Links remain unaffected, heading sizes stay unavailable, and focus is visible on both platforms — independently testable from US1's inline behavior.

---

## Phase 5: User Story 3 - Follow a Link That Leaves the Current Context (Priority: P2)

**Goal**: A Link marked `external` shows a visual indicator hidden from assistive technology, states the new-context fact in its accessible name, and opens its destination safely outside the current context on both platforms.

**Independent Test**: Render an external Link on web and iOS, inspect its visible indicator and computed accessible name, and confirm it opens in a new browsing context (web, with no opener access) or the system browser (iOS).

### Tests for User Story 3

- [X] T017 [P] [US3] Add Vitest cases for `external` rendering the `aria-hidden` `↗` glyph, a visually-hidden "(opens in a new tab)" span that is part of the computed accessible name, `target="_blank" rel="noopener noreferrer"` on the anchor, and that a non-external Link renders none of these, in `packages/components/tests/Link.test.tsx`.
- [X] T018 [P] [US3] Add a type-test asserting `target`/`rel` are not accepted `Link` props (per the contract's consumer-cannot-override-safety guarantee) with `@ts-expect-error`, in `packages/components/tests/Link.types.tsx`.
- [X] T019 [P] [US3] Add SwiftUI/XCTest cases for `external: true` showing the `↗` glyph hidden from VoiceOver (`.accessibilityHidden(true)`), the accessibility label including a new-context statement, and `external: false` (default) showing neither, in `packages/components/tests/ios/DesignSystemLinkTests.swift`.

### Implementation for User Story 3

- [X] T020 [US3] Add the `external` boolean (default `false`) to `Link`, rendering the `aria-hidden` `↗` indicator sized from the active size's type token, a visually-hidden "(opens in a new tab)" span inside the anchor, and `target="_blank" rel="noopener noreferrer"` when `true`, in `packages/components/src/Link.tsx`.
- [X] T021 [P] [US3] Add the visually-hidden ("sr-only" clip-rect) utility class and the external-indicator glyph's sizing/spacing styles in `packages/components/src/Link.module.css`.
- [X] T022 [US3] Add the `external: Bool` option (default `false`) to `DesignSystemLink`, rendering the `↗` glyph hidden from VoiceOver and composing the accessibility label as the visible text plus a new-context statement when `true`, in `packages/components/src/ios/Link.swift`.

**Checkpoint**: External Links are visually and programmatically distinguishable from same-context Links on both platforms and navigate safely, independent of the standalone/unavailable work.

---

## Phase 6: User Story 4 - Present a Destination That Is Not Available (Priority: P3)

**Goal**: A Link with no destination renders as de-emphasized, non-interactive text — never a disabled-looking but still focusable/announced link.

**Independent Test**: Render the unavailable presentation and confirm it uses the de-emphasized treatment, is skipped by keyboard Tab order, and is not announced as a link by assistive technology.

### Tests for User Story 4

- [X] T023 [P] [US4] Add Vitest cases asserting that omitting `href` renders a non-anchor element with the de-emphasized (`--ds-color-text-tertiary`) treatment, no underline, no `href`/`role="link"`, and that it is excluded from the Tab order, in `packages/components/tests/Link.test.tsx`.
- [X] T024 [P] [US4] Add SwiftUI/XCTest cases asserting that `destination: nil` renders plain `DesignSystemText` with the de-emphasized treatment, no `.isLink` accessibility trait, and that it is skipped by VoiceOver swipe navigation, in `packages/components/tests/ios/DesignSystemLinkTests.swift`.

### Implementation for User Story 4

- [X] T025 [US4] Make `href` the sole determinant of availability in `Link`: when absent, render the children through `Text as="span" variant={size}` with the de-emphasized treatment and no interactive attributes, instead of an `<a>`, per D7, in `packages/components/src/Link.tsx`.
- [X] T026 [P] [US4] Add the de-emphasized (`--ds-color-text-tertiary`, no underline) presentation style for the unavailable case in `packages/components/src/Link.module.css`.
- [X] T027 [US4] Make `destination: URL?` the sole determinant of availability in `DesignSystemLink`: when `nil`, render plain `DesignSystemText` with the de-emphasized treatment and no interactive wrapper or `.isLink` trait, instead of the pressable `Button`-backed view, per D7, in `packages/components/src/ios/Link.swift`.

**Checkpoint**: A Link with no destination is unmistakably non-interactive on both platforms, independent of the size/presentation/external work in earlier phases.

---

## Phase 7: User Story 5 - Discover the Supported Link Choices on Both Platforms (Priority: P3)

**Goal**: Consumers and maintainers can see every supported size, both presentations, the external treatment, the unavailable treatment, and each interaction state in the canonical web and iOS documentation, and confirm the two platforms agree.

**Independent Test**: Review the public web and iOS examples against `design-reference.md` and against each other; run accessibility checks against the documented examples.

### Implementation for User Story 5

- [X] T028 [P] [US5] Document the default-inherited size, the four explicit sizes, both presentations, the external treatment, the unavailable treatment, and resting/hover/focus states in `apps/docs/src/Link.stories.tsx`, including at least one inline-in-paragraph example.
- [X] T029 [P] [US5] Add matching native Link examples (default-inherited size, each explicit size, both presentations, external, and unavailable) and catalog registration in `apps/ios-workbench/Sources/Catalog/LinkExamples.swift` and `apps/ios-workbench/Sources/Catalog/ComponentCatalogView.swift`.
- [X] T030 [US5] Run `pnpm --filter docs test-storybook` against the built Storybook, then review the generated WCAG 2.2 AA and DOM snapshot results from `apps/docs/.storybook/test-runner.ts` under `apps/docs/src/__snapshots__/Link.stories.tsx.snap`.
- [X] T031 [P] [US5] Add iOS snapshots for the size, presentation, external, and unavailable gallery in `apps/ios-workbench/Tests/WorkbenchSnapshotTests.swift` and record reviewed baselines under `apps/ios-workbench/Tests/__Snapshots__/WorkbenchSnapshotTests/`.

**Checkpoint**: Both canonical documentation surfaces show the complete, tested Link inventory and agree with each other and with `design-reference.md`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Re-run package-wide quality gates and keep consumer documentation aligned with the public APIs.

- [X] T032 [P] Document the web and iOS Link APIs, the `design-reference.md` inventory, the inherit-by-default/explicit-size behavior, and validation commands in `packages/components/README.md`.
- [X] T033 Run the web and iOS commands in `specs/006-link-component/quickstart.md`, fix any Link-related failures, and record reviewed visual-regression results against `specs/006-link-component/design-reference.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 and T002 can run in parallel; no prior dependencies.
- **Foundational (Phase 2)**: T003 follows Setup and enables generated package exports/assets; blocks implementation verification for all stories.
- **US1 (Phase 3)**: Depends on Setup and Foundational; delivers the core inline Link contract every later story builds on.
- **US2 (Phase 4)**: Depends on US1 because it adds the `standalone` option to the same component.
- **US3 (Phase 5)**: Depends on US1 (adds `external` to the same component); independent of US2's `standalone` option.
- **US4 (Phase 6)**: Depends on US1 (adds the no-destination branch to the same component); independent of US2 and US3.
- **US5 (Phase 7)**: Depends on US1–US4 because documentation covers the complete size/presentation/external/unavailable surface.
- **Polish (Phase 8)**: Depends on all user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Setup and Foundational package generation. It is independently renderable and is the inline MVP.
- **US2 (P1)**: Follows US1 because `standalone` is an option on the same component; its 24×24-target and focus tests remain independently verifiable.
- **US3 (P2)**: Follows US1; independent of US2 — can be implemented in parallel with US2 by a different contributor once US1 lands.
- **US4 (P3)**: Follows US1; independent of US2 and US3 — can be implemented in parallel with either once US1 lands.
- **US5 (P3)**: Follows US1–US4 so documentation and visual regression cover the finished contract.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T004, T005, and T006 can be written in parallel because they target separate web test files and the native test file.
- After the US1 tests are in place, T007, T008, and T009 can be implemented in parallel in separate platform/style files.
- Once US1 is complete, US2 (Phase 4), US3 (Phase 5), and US4 (Phase 6) can proceed in parallel by different contributors, since each adds an independent option (`standalone`, `external`, no-destination branch) to the same already-built component.
- Within US3, T017/T018 (web) and T019 (iOS) can be written in parallel; T020/T021 (web) and T022 (iOS) can then be implemented in parallel.
- Within US5, T028 (Storybook) and T029 (iOS catalog) can be done in parallel; T030 and T031 can then run in parallel.

## Parallel Example: User Story 1

```text
Task: T004 Web size/underline/navigation tests in packages/components/tests/Link.test.tsx
Task: T005 Web type-level size-rejection tests in packages/components/tests/Link.types.tsx
Task: T006 iOS size/underline/navigation tests in packages/components/tests/ios/DesignSystemLinkTests.swift

After those tests are defined:
Task: T007 React Link component in packages/components/src/Link.tsx
Task: T008 Token styles in packages/components/src/Link.module.css
Task: T009 SwiftUI DesignSystemLink view in packages/components/src/ios/Link.swift
```

## Implementation Strategy

### MVP First

1. Complete T001–T003, including confirming the design-reference baseline is current.
2. Complete US1 to deliver the inline, size-inheriting Link contract on both platforms.
3. Validate US1 independently with component rendering and reviewed visual comparisons.
4. Continue with US2 (standalone), US3 (external), and US4 (unavailable) — each independently, in any order or in parallel — then US5 documentation and cross-platform visual gates.

### Incremental Delivery

1. Setup + foundation → confirmed design inventory and reproducible package assets.
2. US1 → independently renderable inline Link MVP.
3. US2 → standalone presentation with the minimum interactive target.
4. US3 → safe, accessible external navigation.
5. US4 → correct non-interactive presentation for unavailable destinations.
6. US5 → complete web/native documentation and visual regression.
7. Polish → quickstart validation and final reviewed snapshots.

## Independent Test Criteria

- **US1**: Render a Link with no size inside two different surrounding text sizes and confirm it matches each; render each of the four explicit sizes; confirm `size="h1"` fails to typecheck; activate by pointer and keyboard.
- **US2**: Render a standalone Link at each size and confirm the 24×24 minimum target; confirm inline Links are unaffected; confirm visible focus.
- **US3**: Render an external Link and confirm the hidden indicator, the accessible-name suffix, and safe external navigation; confirm a non-external Link shows neither.
- **US4**: Render a Link with no destination and confirm the de-emphasized treatment, absence from Tab order, and absence of link role/trait.
- **US5**: Review Storybook and the iOS workbench catalog against `design-reference.md` and confirm zero accessibility violations.

## Notes

- Every task uses the required unchecked checkbox, sequential ID, applicable parallel/story labels, and a concrete file path.
- Tests are included because FR-019 explicitly requires component verification; visual tests also satisfy the constitution's visual-regression gate.
- No task introduces a new token, a new package, a new production dependency, or an inferred visual variant.
- `caption` is required ahead of the current design reference per the accepted `/speckit-specify` clarification (FR-005); T002 includes re-confirming whether Claude Design has since added it before T007–T009 implement it as if approved.
