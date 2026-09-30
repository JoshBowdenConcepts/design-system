# Feature Specification: Button Component

**Feature Branch**: `005-button-component`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: "I would like to create a button component based on the designs we have in claude design currently"

## Clarifications

### Session 2026-09-29

- Q: Which platforms should the Button component support? → A: Both web and iOS.
- Q: For icon-only buttons, should screen-reader text use each platform’s standard accessible-name mechanism rather than a literal `alt` prop? → A: Use each platform’s standard accessible-name mechanism.
- Q: The connected Claude Design Button reference shows no fullWidth layout, no centered/space-between alignment choice, and no leading/trailing icon+label combinations — should the spec still require these, or be trimmed to match the reference? → A: Keep as required, ahead of design (flagged as pending design sign-off).
- Q: The reference shows only default/hover/pressed/disabled states, with no busy/loading state — should busy/loading be required for v1? → A: Drop busy state for v1; revisit if Claude Design adds one.
- Q: Should icon-only Buttons get their own size, or follow the existing sm/md sizes? → A: Icon-only follows sm/md, enforcing the 24×24 floor within each size rather than a separate size value.
- Q: The reference file only contains web markup — should iOS be a native translation of the same reference, or is there a separate iOS design source? → A: Translate this same reference; no separate iOS artifact exists.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a designed action button (Priority: P1)

A product team uses the design-system Button for an action and selects from the
approved appearances and sizes shown in the current Claude Design Button
reference. The web and iOS controls follow that reference rather than
introducing undocumented visual treatments, while using the interaction
conventions of each platform.

**Why this priority**: A consistent, reusable action control is the core value
of the component and the reason for creating it from the existing designs.

**Independent Test**: Render each documented appearance and size on web and iOS
and compare them with the corresponding approved design reference.

**Acceptance Scenarios**:

1. **Given** a consumer selects a supported appearance and size, **When** the
   Button is rendered, **Then** its visual treatment matches the corresponding
  Claude Design reference on both web and iOS.
2. **Given** a consumer uses a label or icon arrangement shown in the reference,
   **When** the Button is rendered, **Then** the content is arranged and remains
   legible as designed.
3. **Given** a consumer requests an unsupported appearance, **When** they use
   the public component contract, **Then** the unsupported option is rejected
   rather than silently rendered as a different design.
4. **Given** a consumer chooses the `fullWidth` option, **When** the Button is
  rendered, **Then** it fills its available width and centers its text within
  the control.
5. **Given** a full-width Button with icons, **When** the consumer chooses
  centered or space-between content alignment, **Then** the text and icons use
  the selected arrangement.
6. **Given** a consumer supplies a leading icon, a trailing icon, or both,
  **When** the Button is rendered, **Then** each icon appears in its respective
  position alongside the label.

### User Story 2 - Activate an action predictably (Priority: P1)

A user activates a Button using the input conventions of web or iOS. On web, in
a form, the consumer can choose whether the control performs the default action,
submits the form, or resets it without accidental submission caused by an
unspecified default.

**Why this priority**: Reliable activation and form behavior are essential to
every action control, regardless of its visual appearance.

**Independent Test**: Activate each enabled example using the supported input
methods on web and iOS, and verify web form behavior when rendered inside a
form.

**Acceptance Scenarios**:

1. **Given** an enabled Button, **When** a user activates it with a pointer or
   keyboard, **Then** its action is triggered once.
2. **Given** a Button in a form with no explicit form action type, **When** it
   is activated, **Then** it does not submit the form by default.
3. **Given** a Button configured to submit or reset a form, **When** it is
   activated, **Then** the requested native form behavior occurs.
4. **Given** a disabled Button, **When** a user attempts to activate it,
   **Then** its action is not triggered.

### User Story 3 - Identify and use accessible button choices (Priority: P2)

Consumers can discover the supported appearances, sizes, content arrangements,
and interaction states in the design system's public web and iOS component
documentation. Users receive a clear accessible name and platform-appropriate
focus or interaction feedback.

**Why this priority**: A public component is only dependable when its choices
and interaction behavior are understandable and accessible.

**Independent Test**: Review the public examples for both platforms against the
approved design reference and verify accessible naming and platform-appropriate
interaction feedback.

**Acceptance Scenarios**:

1. **Given** a consumer consults the component documentation, **When** they
   choose a Button option, **Then** its intended use and appearance are
   identifiable without relying on undocumented conventions.
2. **Given** a user navigates to an enabled Button by keyboard, **When** it
   receives focus, **Then** a visible focus treatment is shown.
3. **Given** a Button whose content is icon-only in the approved reference,
   **When** it is presented to assistive technology, **Then** it exposes an
   accessible name.
4. **Given** a consumer uses the Button on web and iOS, **When** they select the
  same approved appearance and size, **Then** both platform controls follow the
  approved design while respecting their platform's interaction conventions.
5. **Given** a consumer creates an icon-only Button, **When** they omit its
  accessible name, **Then** the public component contract reports the missing
  required name.

### Edge Cases

- Long labels and supported icon arrangements must remain legible without
  clipping or obscuring the control's purpose.
- Disabled controls must not trigger their action or appear indistinguishable
  from enabled controls.
- Buttons placed inside forms must not unexpectedly submit or reset them.
- Icon-only Buttons use the sm or md size option like labeled Buttons, meeting
  the 24×24 minimum interactive footprint within that size rather than
  introducing a separate icon-only size.
- An icon-only Button must have an accessible name; visual content alone is not
  sufficient.
- Icon-only buttons must not be exposed to assistive technology with an empty
  accessible name.
- A full-width Button must retain its selected content alignment when only a
  leading icon, only a trailing icon, or both icons are present.
- The control must retain a visible focus treatment in every supported theme.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The design system MUST provide public Button components for web
  and iOS to trigger actions.
- **FR-002**: The Button MUST provide the appearances and sizes represented by
  the current approved Claude Design Button reference — solid, outline, and
  text appearances, each at sm and md sizes — and MUST NOT introduce additional
  appearances or sizes without design approval.
- **FR-003**: Each supported appearance and size MUST have a named, documented
  option that maps to exactly one approved design treatment.
- **FR-004**: The Button MUST represent the interaction states shown in the
  approved reference and MUST communicate each state distinctly to users.
- **FR-005**: The Button MUST support the label and content arrangements shown
  in the approved reference and MUST provide independently optional leading and
  trailing icon content, including both icons together and icon-only content.
- **FR-006**: Each platform's Button MUST use its native interactive semantics
  and support the platform's expected input and focus or interaction feedback.
- **FR-013**: The Button MUST provide a `fullWidth` option that makes it fill
  the available width and centers its text within the control.
- **FR-014**: A full-width Button MUST allow consumers to choose centered
  content alignment or space-between alignment for its text and icons.
- **FR-015**: The Button MUST support a leading icon, a trailing icon, both
  icons, or neither, with placement consistent with the selected content
  alignment.
- **FR-016**: An icon-only Button MUST require a non-empty accessible name using
  the standard accessible-name mechanism for its platform; an image alternative
  text attribute MUST NOT substitute for the Button's accessible name.
- **FR-007**: Disabled Buttons MUST prevent activation and communicate their
  disabled state to users.
- **FR-008**: The web Button MUST default to non-submitting form behavior and
  allow consumers to select the native submit or reset behavior when needed.
- **FR-009**: The web Button MUST meet WCAG 2.2 Level AA for its supported
  content, states, color pairings, focus treatment, and interaction target. The
  iOS Button MUST meet applicable platform accessibility expectations for the
  same content and states.
- **FR-010**: Button visual properties MUST use the design system's approved
  tokens and MUST NOT introduce competing hardcoded design values.
- **FR-011**: Public web and iOS component documentation MUST show every
  supported appearance, size, content arrangement, and interaction state with
  its intended use.
- **FR-012**: Component verification MUST cover supported options, action and
  web form behavior, disabled behavior, accessible naming, platform input
  operation, full-width layout choices, icon arrangements, and agreement with
  the approved design reference on both platforms.

### Key Entities *(include if feature involves data)*

- **Button option**: A documented choice of approved appearance, size, content
  arrangement, full-width behavior, or interaction state available to a
  consumer.
- **Button content arrangement**: A label with an optional leading icon, an
  optional trailing icon, both icons, or icons without a visible label; an
  icon-only arrangement requires an accessible name.
- **Button action**: The action activated by a user, including the native form
  behavior when the web Button is used inside a form and the platform-native
  action behavior on iOS.
- **Approved Button reference**: The current Claude Design artifact that defines
  the component's appearance, sizes, content arrangements, and represented
  states. It defines solid, outline, and text appearances at sm and md sizes,
  default/hover/pressed/disabled states, and an icon-only example; it does not
  yet show fullWidth, content alignment, or leading/trailing icon+label
  combinations, which this specification requires ahead of that reference.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of supported appearances, sizes, content arrangements, and
  interaction states on web and iOS match the corresponding approved Claude
  Design references.
- **SC-002**: 100% of documented Button options can be activated using each
  platform's expected input when enabled, and none can be activated when
  disabled.
- **SC-003**: 100% of icon-only Button examples on both platforms expose an
  accessible name, and each platform provides its expected visible focus or
  interaction feedback.
- **SC-004**: 100% of documented web form examples produce the requested native
  behavior, with non-submitting behavior as the default.
- **SC-005**: Consumers can identify the intended use and supported state of
  every documented Button option from the public web and iOS documentation.
- **SC-006**: Every documented `fullWidth` example fills its available width,
  centers its text, and renders the selected centered or space-between content
  alignment.
- **SC-007**: All four leading/trailing icon combinations (neither, leading
  only, trailing only, and both) render in the documented positions on web and
  iOS.
- **SC-008**: 100% of icon-only Button examples have a non-empty platform-native
  accessible name, and attempts to omit that required name are rejected.

## Assumptions

- The current approved Button designs are maintained in Claude Design (the
  "Design System" project's Button template) and are available to the team
  responsible for planning and implementation. That reference shows solid,
  outline, and text appearances at sm and md sizes, default/hover/pressed/
  disabled states, and an icon-only example.
- Claude Design is the authority for the Button's exact appearance, option
  inventory, and visual states; this specification does not infer those details
  from the style-guide examples already in the repository. Where this
  specification requires capabilities the reference does not yet show
  (fullWidth, content alignment, leading/trailing icon+label combinations), it
  does so explicitly and ahead of design sign-off rather than by inference.
- The feature includes public web and native iOS Button components. No
  separate iOS-specific design artifact exists in Claude Design; the iOS Button
  MUST be a native translation of the same web reference — shared appearances,
  sizes, states, and design tokens — using iOS interaction conventions.
- The platforms share the approved visual options and design tokens while
  preserving platform-appropriate interaction conventions. Web form behavior
  and keyboard interaction are preserved except where an explicit supported
  Button option changes them.
- The `fullWidth` option defaults to false. Full-width content alignment defaults
  to centered; consumers may choose space-between alignment when the Button is
  full width.