# Tasks: Text Component

**Input**: Design documents from `/specs/003-text-component/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), and [contracts/](./contracts/)

**Tests**: Included because the feature specification explicitly requires runtime tests, type tests, build validation, and accessibility coverage.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the existing component package and documentation surfaces for a CSS Module-backed public component.

- [x] T001 Confirm the `@design-system/components` package build, test, lint, and Storybook commands in `packages/components/package.json` and `apps/docs/package.json`
- [x] T002 [P] Add CSS Module type declarations for `*.module.css` imports in `packages/components/src/css-modules.d.ts`
- [x] T003 [P] Add the Text Storybook entry scaffold in `apps/docs/src/Text.stories.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared type and styling foundations required by every user story.

**Checkpoint**: CSS Module imports typecheck, token CSS is available to components, and the package build has a defined path for published CSS assets.

- [x] T004 Define the supported `TextElement` and `TextVariant` unions and polymorphic prop/ref contract in `packages/components/src/Text.tsx`
- [x] T005 [P] Create token-based default element and variant rules in `packages/components/src/Text.module.css`
- [x] T006 Update the components generator to copy `Text.module.css` into `packages/components/dist/web` during `packages/components/src/generate.ts` execution
- [x] T007 Update component package output metadata and side-effect declarations for the emitted CSS asset in `packages/components/package.json`
- [x] T008 Export `Text`, `TextElement`, and `TextVariant` from `packages/components/src/index.ts`

---

## Phase 3: User Story 1 - Render Semantic Text With an Element Override (Priority: P1) 🎯 MVP

**Goal**: Render a typed Text primitive that defaults to `p`, supports each documented intrinsic element, forwards valid native props and refs, preserves children, and omits component-only props from the DOM.

**Independent Test**: Run the Text runtime and type tests; confirm the default and every supported `as` value render the requested element and preserve selected-element prop/ref typing.

### Tests for User Story 1

- [x] T009 [P] [US1] Add SSR tests for default `p` rendering, every supported `as` element, children preservation, and omission of `as`/`variant` in `packages/components/tests/Text.test.tsx`
- [x] T010 [P] [US1] Add positive and negative intrinsic-prop/ref type cases for the polymorphic Text API in `packages/components/tests/Text.types.tsx`

### Implementation for User Story 1

- [x] T011 [US1] Implement default element resolution, generic `forwardRef`, native prop forwarding, and component-prop destructuring in `packages/components/src/Text.tsx`
- [x] T012 [US1] Add element-default CSS Module class mappings using `--ds-type-*` variables in `packages/components/src/Text.module.css`
- [x] T013 [US1] Run the focused Text runtime test and component typecheck, repairing `packages/components/src/Text.tsx`, `packages/components/src/Text.module.css`, or `packages/components/tests/Text.types.tsx` until the semantic rendering contract passes

**Checkpoint**: User Story 1 is independently functional and testable as a semantic, polymorphic Text component.

---

## Phase 4: User Story 2 - Apply a Named Text Variant (Priority: P1)

**Goal**: Apply a typed variant that visually overrides the selected element's default style while preserving its semantic HTML element and native props.

**Independent Test**: Render each supported variant with and without `as`, inspect generated module classes, and verify variant CSS rules are ordered after element defaults.

### Tests for User Story 2

- [x] T014 [P] [US2] Add runtime tests for every supported variant, variant/default class composition, consumer className merging, and variant prop omission in `packages/components/tests/Text.test.tsx`
- [x] T015 [P] [US2] Add compile-time rejection cases for unsupported variant values and valid variant/element combinations in `packages/components/tests/Text.types.tsx`

### Implementation for User Story 2

- [x] T016 [US2] Implement variant class selection and deterministic class merging after the element default in `packages/components/src/Text.tsx`
- [x] T017 [US2] Add all documented variant CSS Module rules using the corresponding `--ds-type-*` token variables in `packages/components/src/Text.module.css`
- [x] T018 [US2] Run the focused Text tests and type tests, repairing variant precedence or typing in `packages/components/src/Text.tsx`, `packages/components/src/Text.module.css`, or `packages/components/tests/Text.test.tsx`

**Checkpoint**: User Stories 1 and 2 are independently functional; semantic element selection and visual variant selection work together.

---

## Phase 5: User Story 3 - Discover and Use the Public Component Contract (Priority: P2)

**Goal**: Document Text as a canonical Storybook component with semantic elements, variants, native props, class composition, and accessible usage examples.

**Independent Test**: Build Storybook, open the Text story, exercise its controls/examples, and confirm the rendered HTML semantics and token-based appearance.

### Tests for User Story 3

- [x] T019 [P] [US3] Add Storybook stories and controls for default Text, headings, label props, variants, and consumer class composition in `apps/docs/src/Text.stories.tsx`
- [x] T020 [US3] Add or update Storybook snapshot coverage for the public Text story in `apps/docs/src/__snapshots__/Text.stories.tsx.snap`

### Implementation for User Story 3

- [x] T021 [US3] Complete the Text Storybook documentation with accessible semantic examples and native prop demonstrations in `apps/docs/src/Text.stories.tsx`
- [x] T022 [US3] Verify the Storybook preview loads component CSS Modules and token CSS without leaking styles into unrelated stories in `apps/docs/.storybook/preview.tsx`
- [x] T023 [US3] Run Storybook accessibility and visual checks for `apps/docs/src/Text.stories.tsx`, repairing any new violations or snapshot regressions

**Checkpoint**: The public Text API is discoverable, visually documented, and covered by the repository's canonical Storybook quality gates.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate package publication behavior, generated assets, and the complete feature against the design documents.

- [x] T024 [P] Add a package build assertion that `packages/components/dist/web/Text.module.css` exists and is reachable from emitted component output in `packages/components/tests/build.test.tsx`
- [x] T025 [P] Update the components package README with Text usage, supported `as` elements, variants, CSS Module behavior, and native prop typing in `packages/components/README.md`
- [x] T026 Run `pnpm --filter @design-system/components test` and `pnpm --filter @design-system/components typecheck` for the complete component test and type suites
- [x] T027 Run `pnpm --filter @design-system/components lint` and `pnpm --filter @design-system/components build` to validate linting, declarations, emitted JavaScript, Swift output, and CSS asset copying
- [x] T028 Run `pnpm --filter docs typecheck` and `pnpm --filter docs build-storybook` to validate the documented public component
- [x] T029 Run the scenarios in `specs/003-text-component/quickstart.md` and confirm the component API and CSS Module contracts remain satisfied

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No feature dependencies; inspect existing commands and create CSS Module/story scaffolds.
- **Foundational (Phase 2)**: Depends on Setup; establishes the shared Text types, styles, export, and CSS asset handling.
- **User Story 1 (Phase 3)**: Depends on Phase 2; delivers the MVP semantic polymorphic component.
- **User Story 2 (Phase 4)**: Depends on Phase 3's Text implementation; extends it with the variant contract.
- **User Story 3 (Phase 5)**: Depends on Phases 3 and 4 so documentation can demonstrate the complete public API.
- **Polish (Phase 6)**: Depends on all desired user stories; validates package and documentation outputs.

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational; MVP scope.
- **US2 (P1)**: Depends on US1's component contract and shared CSS Module.
- **US3 (P2)**: Depends on US1 and US2 to document the complete behavior, but its Storybook scaffold can begin during Setup.

### Parallel Opportunities

- T002 and T003 can run in parallel during Setup.
- T005, T006, T007, and T008 can be split across files after the type contract in T004 is agreed.
- T009 and T010 can run in parallel before US1 implementation.
- T014 and T015 can run in parallel before US2 implementation.
- T019 and T020 can be prepared in parallel once the Storybook story shape is established.
- T024 and T025 can run in parallel during Polish.
- US1 and the initial US3 Storybook scaffold can overlap after foundational setup; US2 should complete before the final docs validation.

## Parallel Example: User Story 1

```text
Task T009: Add SSR behavior tests in packages/components/tests/Text.test.tsx
Task T010: Add polymorphic type tests in packages/components/tests/Text.types.tsx
```

## Parallel Example: User Story 2

```text
Task T014: Add variant runtime tests in packages/components/tests/Text.test.tsx
Task T015: Add variant type tests in packages/components/tests/Text.types.tsx
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational prerequisites.
3. Complete Phase 3 User Story 1.
4. Run the focused runtime tests and type tests.
5. Demo the semantic `Text` component before adding variants and Storybook polish.

### Incremental Delivery

1. Add US1 for semantic element selection and native props/ref typing.
2. Add US2 for token-backed variants and precedence.
3. Add US3 for Storybook documentation and accessibility coverage.
4. Complete Polish for package asset publication, README, and full validation.

## Format Validation

All implementation tasks use the required checklist format: `- [ ]`, sequential
`T###` ID, optional `[P]`, required `[US#]` label in user-story phases, and an
exact repository file path in every description.
