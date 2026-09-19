# Feature Specification: Text Component

**Feature Branch**: `003-text-component`

**Created**: 2026-09-09

**Status**: Draft

**Input**: User description: "I want to create a Text component that allows the user to set the variant and or an as prop. The as prop will set the underlying HTML element with type. The variant would be a style override to this prop. With as being the default styling based on element selected. I want this component to have css modules used to style it. It should carry the type of the selected HTML element with all props that come with that."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Render semantic text with an element override (Priority: P1)

A consumer renders one `Text` component and chooses the semantic HTML element with
the `as` prop. If `as` is omitted, the component renders its documented default
element. The rendered element receives the native props and children supported by
that element.

**Why this priority**: Correct semantics and native prop behavior are the core
value of a polymorphic text primitive.

**Independent Test**: Render the component with and without `as`, inspect the
element type, and pass an intrinsic prop valid for the selected element.

**Acceptance Scenarios**:

1. **Given** no `as` prop, **When** `Text` renders, **Then** it uses the default
   text element and its matching default style.
2. **Given** `as="h1"`, **When** `Text` renders, **Then** the output element is
   an `h1` and accepts the native `h1` props.
3. **Given** `as="label"` with `htmlFor`, **When** `Text` renders, **Then** the
  output is a label and forwards `htmlFor` and other label props.

### User Story 2 - Apply a named text variant (Priority: P1)

A consumer applies a named `variant` to select a text style. The variant is a
style override layered on top of the style associated with `as`, so the same
variant can intentionally be used with multiple semantic elements.

**Why this priority**: Design-system consumers need a stable visual vocabulary
without losing control of document semantics.

**Independent Test**: Render each supported variant with and without `as`, then
verify the expected CSS Module classes are present and the variant wins.

**Acceptance Scenarios**:

1. **Given** `as="p"` and no `variant`, **When** `Text` renders, **Then** it
   uses the paragraph default style.
2. **Given** `as="p"` and a supported `variant`, **When** `Text` renders,
   **Then** the variant style overrides the paragraph default.
3. **Given** a variant and an element whose default style differs, **When** both
   are rendered, **Then** the element remains semantic while the variant controls
   the visual style.

### User Story 3 - Discover and use the public component contract (Priority: P2)

Maintainers can see the component's supported elements, variants, prop behavior,
and rendered examples in Storybook. The implementation uses CSS Modules so styles
are locally scoped and do not leak into consuming applications.

**Why this priority**: A typed primitive is only adoptable when its behavior and
visual choices are visible in the canonical documentation surface.

**Independent Test**: Build the components package and Storybook, then inspect
the Storybook story and generated CSS/module output.

**Acceptance Scenarios**:

1. **Given** the public component story, **When** a maintainer changes `as` or
   `variant`, **Then** the example updates to show the resulting semantics and
   style.
2. **Given** two consumers use the component, **When** their styles are loaded,
   **Then** Text styles remain locally scoped through CSS Modules.

### Edge Cases

- An unsupported `as` value or `variant` value must fail TypeScript typechecking.
- Props valid for one intrinsic element must not become valid for an incompatible
  selected element.
- `as` and `variant` must not be forwarded as unknown DOM attributes.
- A consumer-provided `className` must be preserved alongside component classes.
- Children must be forwarded without alteration, including fragments and inline
  elements.
- The component must not require a runtime registry or style injection mechanism.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The components package MUST export a `Text` React component.
- **FR-002**: `Text` MUST accept an optional `as` prop selecting a documented
  intrinsic HTML element and MUST default to `p` when `as` is omitted.
- **FR-003**: The `as` prop MUST determine the rendered intrinsic element.
- **FR-003A**: `Text` is intentionally text-only; anchor/link semantics are handled
  by a separate component and are not part of the `Text` API.
- **FR-004**: The component's props MUST be polymorphically typed so the selected
  element carries all of that element's native React props, including ref typing.
- **FR-005**: `Text` MUST accept a typed `variant` prop from the documented
  variant set.
- **FR-006**: The style associated with `as` MUST be the default style, and a
  supplied `variant` MUST override that default style.
- **FR-007**: Text styling MUST be implemented with a CSS Module imported by the
  component; styles MUST use existing design tokens rather than duplicated raw
  design values.
- **FR-008**: `Text` MUST merge consumer `className` with its generated classes
  and MUST omit `as` and `variant` from the DOM.
- **FR-009**: The component MUST preserve children and forward valid native props
  to the selected element.
- **FR-010**: The components package MUST include focused tests covering default
  rendering, each supported `as`/variant behavior, prop forwarding, type safety,
  class merging, and DOM attribute omission.
- **FR-011**: Storybook MUST document the public `Text` API with examples of
  semantic elements, variants, native props, and composition.
- **FR-012**: The implementation MUST meet WCAG 2.2 AA expectations for the
  semantics it renders and MUST not remove native keyboard or accessibility
  behavior from selected elements.

### Key Entities

- **Text props contract**: The public polymorphic prop surface containing `as`,
  `variant`, `className`, children, and the selected element's native props/ref.
- **Text variant**: A named visual style that overrides the default style mapped
  from the selected semantic element.
- **Text style module**: The locally scoped CSS Module containing element defaults
  and variant styles, composed through generated class names.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of supported `as` values render their corresponding intrinsic
  HTML element in component tests.
- **SC-002**: Type tests reject an invalid variant and props from an unrelated
  intrinsic element.
- **SC-003**: Every supported variant renders with its expected CSS Module class,
  and variant styling wins over the selected element default.
- **SC-004**: The components package and Storybook build successfully with no new
  TypeScript or lint errors.
- **SC-005**: Accessibility checks report no new violations for the Text stories.

## Assumptions

- The initial supported `as` set is `p`, `span`, `div`, `h1`, `h2`, `h3`, `h4`,
  `h5`, `h6`, `label`, `a`, and `strong`; the plan may refine this set from
  existing package conventions.
- The initial variant set is the existing type-token roles (`display`, heading
  levels, paragraph sizes, `label`, `caption`, and `overline`) unless the plan
  identifies a smaller established public set.
- React 18/19 intrinsic JSX types are the source of truth for native props and
  refs; no custom reimplementation of every HTML attribute is required.
- CSS Modules support is available or can be enabled through the existing Vite,
  TypeScript, and package build configuration without adding a runtime styling
  dependency.
- This feature is web-only and does not change the iOS package.
