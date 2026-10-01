# Feature Specification: Link Component

**Feature Branch**: `006-link-component`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "I would like to build a Link component for web and iOS. It should be fairly simple working off of the Text component. It should have only a few sizes, inherit by default then cover everything from body down in size. Headings shouldn't be included in the Link component. Also we need to handle the external properties and accesibility. You can see the designs in cursor design."

## Clarifications

### Session 2026-09-30

- Q: What is the exact supported size set below body, beyond the default
  inheritance? → A: `inherit` + `p`, `p-sm`, `label`, `caption` — the approved
  reference only shows `p`/`p-sm`/`label`, so `caption` is included ahead of
  design sign-off on its visual treatment.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Place a link inside running text (Priority: P1)

A product team puts a link in the middle of a sentence. The link takes its
size and weight from the surrounding copy with no size choice required, stays
underlined so it is identifiable without color, and navigates when activated.

**Why this priority**: Inline links in body copy are the most common use of the
component and the reason size inheritance is the default.

**Independent Test**: Place the link inside paragraph copy at two different
surrounding text sizes and confirm it matches the surrounding text metrics and
navigates on activation.

**Acceptance Scenarios**:

1. **Given** a link with no size chosen placed inside body copy, **When** it
   renders, **Then** it adopts the surrounding text's size and weight rather
   than a fixed size of its own.
2. **Given** the same link placed inside smaller copy, **When** it renders,
   **Then** it adopts that smaller surrounding size without any change to its
   configuration.
3. **Given** an inline link in its resting state, **When** it renders, **Then**
   it is underlined and distinguishable from surrounding text by more than
   color alone.
4. **Given** an inline link, **When** a user activates it by pointer or
   keyboard, **Then** navigation to its destination occurs once.

---

### User Story 2 - Use a standalone link at a chosen size (Priority: P1)

A product team places a link on its own — a "View all projects" affordance
under a list, for example — and chooses one of the supported sizes. Heading
sizes are not offered; a standalone link meets the minimum interactive target
size so it is easy to hit on touch and with imprecise pointers.

**Why this priority**: Standalone navigation links are the second core use and
the only case that needs an explicit size choice and a minimum target size.

**Independent Test**: Render a standalone link at each supported size and
confirm the typography matches the approved design reference and the
interactive target meets the minimum footprint.

**Acceptance Scenarios**:

1. **Given** a consumer chooses a supported size, **When** the standalone link
   renders, **Then** its typography matches the corresponding approved design
   treatment.
2. **Given** a standalone link at the smallest supported size, **When** it
   renders, **Then** its interactive target still meets the 24 x 24 minimum
   footprint.
3. **Given** a consumer requests a heading-scale size, **When** they use the
   public component contract, **Then** the request is rejected rather than
   rendering an undocumented heading-sized link.
4. **Given** a standalone link, **When** a user moves focus to it by keyboard,
   **Then** a visible focus treatment using the shared focus-ring tokens is
   shown.

---

### User Story 3 - Follow a link that leaves the current context (Priority: P2)

A product team marks a destination as external. Users see an indicator that the
link leaves their current context, assistive-technology users hear that fact as
part of the link's name, and the navigation is performed safely.

**Why this priority**: External destinations are an explicit requirement and
carry both an accessibility obligation and a safe-navigation obligation, but
the component is already useful for same-context links without them.

**Independent Test**: Render an external link on web and iOS, inspect its
visible indicator and announced name, and confirm it opens in the platform's
external context.

**Acceptance Scenarios**:

1. **Given** a link marked as external, **When** it renders, **Then** a visual
   indicator shows that the destination opens outside the current context, and
   that indicator is not announced as separate content.
2. **Given** a link marked as external, **When** assistive technology reads it,
   **Then** its accessible name states that the destination opens in a new
   tab or outside the app, in addition to the link's own text.
3. **Given** a link marked as external on web, **When** a user activates it,
   **Then** it opens in a new browsing context without granting that context
   access to the opener.
4. **Given** a link marked as external on iOS, **When** a user activates it,
   **Then** the destination opens in the platform's external browsing context.
5. **Given** a link that is not marked external, **When** it renders, **Then**
   no external indicator or new-context announcement is present.

---

### User Story 4 - Present a destination that is not available (Priority: P3)

A product team has a link whose destination is temporarily or conditionally
unavailable. Rather than a disabled link, the component presents the text in a
de-emphasized treatment with no destination, so it is not reachable by keyboard
and is not announced as a link.

**Why this priority**: Disabled links are a common accessibility failure, so the
component must offer the correct alternative — but the primary flows do not
depend on it.

**Independent Test**: Render the unavailable presentation and confirm it is not
in the tab order, exposes no link role, and uses the de-emphasized treatment.

**Acceptance Scenarios**:

1. **Given** a link with no available destination, **When** it renders, **Then**
   it shows its text in the de-emphasized treatment from the approved reference.
2. **Given** that same presentation, **When** a user navigates by keyboard,
   **Then** it is skipped because it is not in the tab order.
3. **Given** that same presentation, **When** assistive technology reads it,
   **Then** it is not announced as a link.

---

### User Story 5 - Discover the supported link choices on both platforms (Priority: P3)

Consumers and maintainers can see every supported size, the inline and
standalone presentations, the external treatment, the unavailable treatment, and
each interaction state in the design system's public web and iOS documentation,
and can confirm the two platforms agree.

**Why this priority**: Documentation makes the component adoptable and keeps web
and iOS from drifting, but it depends on the component existing first.

**Independent Test**: Review the public web and iOS examples against the
approved design reference and against each other.

**Acceptance Scenarios**:

1. **Given** a consumer consults the public documentation, **When** they choose
   a link option, **Then** its intended use and appearance are identifiable
   without relying on undocumented conventions.
2. **Given** a consumer selects the same size and presentation on web and iOS,
   **When** both render, **Then** they follow the same approved design while
   using each platform's interaction conventions.
3. **Given** the documented examples, **When** accessibility checks run against
   them, **Then** no violations are reported.

---

### Edge Cases

- A link that wraps across lines must keep its underline and remain one
  continuous interactive region, and its focus treatment must stay visible on
  every line fragment.
- An inline link is exempt from the minimum target size; a standalone link is
  not. The component must not force a minimum target on inline links, which
  would disturb line spacing in running text.
- A link whose text is only an icon or indicator with no words must still expose
  a non-empty accessible name.
- An external link must not announce the external indicator as separate,
  meaningless content, and must not omit the new-context announcement.
- A link with no destination must not be rendered as an interactive link with a
  placeholder destination.
- Long link text inside narrow measures must remain legible without clipping or
  overlapping adjacent copy.
- Heading-scale and display-scale sizes must be unavailable through the public
  contract, not merely discouraged.
- Every supported state must keep its required contrast in both light and dark
  color modes.
- A consumer must not be able to use the component for a non-navigating action;
  actions belong to the Button component.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The design system MUST provide public Link components for web and
  iOS for navigating to a destination.
- **FR-002**: The Link MUST render the platform's native link semantics with a
  real destination, and MUST NOT be used to trigger non-navigating actions.
- **FR-003**: The Link MUST take its typography from the existing Text
  component rather than defining its own type treatment.
- **FR-004**: The Link MUST inherit the surrounding text's size by default when
  no size is chosen.
- **FR-005**: The Link MUST offer exactly four explicit sizes — body (`p`),
  small-body (`p-sm`), `label`, and `caption` — in addition to the default size
  inheritance from FR-004. The `caption` size is ahead of the current approved
  reference, which only exercises body, small-body, and label, and needs design
  sign-off before its visual treatment is finalized.
- **FR-006**: Heading-scale and display-scale sizes MUST NOT be available
  through the Link's public contract, and requesting one MUST be rejected by
  the contract rather than rendered.
- **FR-007**: The Link MUST support an inline presentation that does not alter
  the line metrics of the text it sits in, and a standalone presentation that
  meets a 24 x 24 minimum interactive target at every supported size.
- **FR-008**: The Link MUST be underlined in its resting state at every
  supported size and presentation, so it is never distinguished from
  surrounding text by color alone.
- **FR-009**: The Link MUST represent the interaction states shown in the
  approved reference — resting, hover (or the platform's press equivalent),
  focus, and unavailable — and MUST communicate each state distinctly.
- **FR-010**: The Link MUST show a visible focus treatment using the design
  system's shared focus-ring tokens when it receives keyboard focus.
- **FR-011**: The Link MUST provide an explicit option marking a destination as
  external. When set, it MUST show a visual indicator that is hidden from
  assistive technology, MUST include a new-context statement in the link's
  accessible name, MUST open the destination in the platform's external
  browsing context, and on web MUST prevent the opened context from accessing
  its opener.
- **FR-012**: A Link that is not marked external MUST NOT show an external
  indicator or announce a new browsing context.
- **FR-013**: The Link MUST NOT offer a disabled state. For an unavailable
  destination it MUST provide a presentation that renders the text with the
  de-emphasized treatment, exposes no link role, and is absent from the tab
  order.
- **FR-014**: Every Link MUST expose a non-empty accessible name that describes
  its destination; visual content alone MUST NOT substitute for that name.
- **FR-015**: The web Link MUST meet WCAG 2.2 Level AA for its supported sizes,
  presentations, states, color pairings, focus treatment, and interactive target
  — specifically 1.4.1 (use of color), 1.4.3 (contrast), 2.4.4 (link purpose),
  2.4.7 and 2.4.11 (focus visibility and appearance), and 2.5.8 (target size)
  for standalone links. The iOS Link MUST meet the equivalent platform
  accessibility expectations for the same sizes, presentations, and states.
- **FR-016**: Link color pairings MUST keep the resting treatment at or above
  5.4:1 against the page background in light mode and 11:1 in dark mode, and
  MUST keep the hover treatment at or above 4.5:1 in both modes.
- **FR-017**: All Link visual properties MUST come from the design system's
  approved tokens, with no competing hardcoded design values.
- **FR-018**: Public web and iOS documentation MUST show every supported size,
  both presentations, the external treatment, the unavailable treatment, and
  each interaction state with its intended use.
- **FR-019**: Component verification MUST cover size inheritance, each supported
  size, rejection of heading-scale sizes, both presentations, standalone target
  size, external indicator and announcement, external navigation safety, the
  unavailable presentation's absence from the tab order, accessible naming,
  focus visibility, and agreement with the approved design reference on both
  platforms.

### Key Entities *(include if feature involves data)*

- **Link size**: A documented choice from the body text role and smaller roles
  that sets the link's typography, or the default inheritance of the
  surrounding text's size. Heading and display roles are excluded.
- **Link presentation**: Either inline, which preserves the line metrics of
  surrounding text and is exempt from the minimum target size, or standalone,
  which meets the 24 x 24 minimum interactive target.
- **Link destination**: The target a Link navigates to, which is either
  same-context, external (opening outside the current context), or unavailable
  (no destination, rendered as de-emphasized non-interactive text).
- **Approved Link reference**: The current Claude Design artifact
  (`templates/link/Link.dc.html` in the "Design System" project) that defines
  the Link's appearance, sizes, inline and standalone presentations, external
  treatment, resting/hover/focus/unavailable states, and its stated
  accessibility rules.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of supported sizes, presentations, and interaction states on
  web and iOS match the corresponding approved Claude Design reference.
- **SC-002**: A link with no size chosen matches the metrics of its surrounding
  text in 100% of documented surrounding-size examples, with no configuration
  change between them.
- **SC-003**: 100% of attempts to use a heading-scale or display-scale size
  through the public contract are rejected.
- **SC-004**: 100% of standalone link examples meet the 24 x 24 minimum
  interactive target at every supported size, and 0% of inline examples alter
  the line metrics of their surrounding text.
- **SC-005**: 100% of external link examples show the external indicator,
  announce the new browsing context in their accessible name, keep that
  indicator out of the announced content, and open outside the current context
  safely; 0% of non-external examples do any of these.
- **SC-006**: 100% of unavailable-destination examples are absent from the tab
  order and expose no link role, and no disabled link option exists in the
  public contract.
- **SC-007**: Every documented link example reports zero accessibility
  violations in both light and dark color modes, and every supported state meets
  its required contrast ratio in both modes.
- **SC-008**: Consumers can identify the intended use of every documented link
  size, presentation, and state from the public web and iOS documentation.

## Assumptions

- The approved Link designs are maintained in Claude Design (the "Design
  System" project, `templates/link/Link.dc.html`) and are the authority for the
  Link's appearance, size inventory, presentations, and states. That reference
  shows inline links at body and small-body sizes, standalone links at label
  and body sizes, an external example, and resting/hover/focus/unavailable
  states, together with an explicit list of accessibility rules. Per FR-005,
  this specification additionally requires a `caption` size ahead of that
  reference, pending design sign-off on its visual treatment.
- No separate iOS design artifact exists. As with the Button component, the iOS
  Link is a native translation of the same reference — shared sizes,
  presentations, states, and tokens — using iOS interaction conventions. The
  platform press/highlight treatment stands in for web hover.
- The Link builds on the existing Text component for all typography, and does
  not introduce a parallel type scale. Text's existing non-heading roles are the
  pool the Link's size set is drawn from.
- The inline presentation is the default, consistent with size inheritance being
  the default; standalone is opted into explicitly.
- External is an explicit opt-in on the component, not inferred from inspecting
  the destination, so behavior is predictable and testable.
- "Outside the current context" means a new browsing context on web and the
  platform's external browser on iOS. An in-app browser presentation is out of
  scope for this feature.
- The external indicator is the arrow treatment shown in the approved
  reference, sized from the link's own type role; sourcing it from the icons
  package rather than a text glyph is an implementation choice for the plan.
- The public documentation surfaces are Storybook for web and the iOS component
  workbench catalog for iOS, matching the existing Text and Button components.
- Both platforms already have the tokens this component needs (primary and
  primary-hover colors, tertiary text, focus-ring width/offset/color, radius,
  and spacing); no new tokens are expected.
