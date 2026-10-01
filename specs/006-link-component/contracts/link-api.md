# Link Public UI Contract

This contract describes consumer-visible behavior, not implementation code.
Size, presentation, and state values are fixed by the approved Claude Design
Link reference (`Design System` project, `templates/link/Link.dc.html`), with
the `caption` size added ahead of that reference per the accepted
`/speckit-specify` clarification.

## Shared Behavior

- Provide one web Link and one native iOS Link in the existing components
  package, both built on the existing Text component for typography (no
  parallel type scale).
- Support exactly four explicit sizes (`p`, `p-sm`, `label`, `caption`) plus
  the default: omitting size inherits the surrounding text's size. Heading and
  display sizes are not members of the size type and cannot be requested.
- Support exactly two presentations: inline (default, exempt from the minimum
  interactive target) and standalone (24 × 24 minimum interactive target at
  every supported size).
- Always render underlined in the resting state, at every size and
  presentation — color is never the only indicator that content is a link.
- Support an explicit `external` choice, defaulting to `false`. When `true`,
  show a visual indicator hidden from assistive technology, add a statement
  that the destination opens outside the current context to the accessible
  name, and open the destination in the platform's external browsing context
  (web: a new browsing context with no opener access).
- Have no `disabled` option. A Link with no destination renders as
  de-emphasized, non-interactive text: no link role, no destination, and
  absent from keyboard/VoiceOver navigation order.
- Visual values come from shared design tokens; no new token is introduced by
  this feature. Each platform retains native focus/press feedback and
  accessible-name computation.

## Web API

- Render a native `<a>` when a destination is supplied; render de-emphasized
  text with no `href` and no interactive semantics when it is not.
- Accept `href` as the destination. Omit it (not a boolean) to express the
  unavailable state.
- Accept the typed `size` prop (`p` | `p-sm` | `label` | `caption`), optional;
  omitted inherits the ambient text size.
- Accept a `standalone` boolean, defaulting to `false`.
- Accept an `external` boolean, defaulting to `false`. When `true`, the
  component manages `target`/`rel` itself (`target="_blank" rel="noopener
  noreferrer"`); the component does not accept consumer-supplied `target` or
  `rel` overrides, so the safety guarantee cannot be weakened by a passthrough
  prop.
- Accept visible children as the default accessible name source; when
  `children` is omitted, the type requires a non-empty `aria-label` or
  `aria-labelledby` instead — the same discriminated-union contract
  `ButtonProps` already uses, so a content-less Link with no accessible name
  is a type error, not a runtime warning.
- Preserve native keyboard activation and focus-visible behavior for every
  destination state except unavailable, which is never focusable.

## iOS API

- Accept `destination: URL?`. A non-`nil` value renders a native link-styled,
  tappable control; `nil` renders de-emphasized, non-interactive text with no
  accessibility traits identifying it as a link.
- Accept the typed `size` (`p` | `p-sm` | `label` | `caption`), optional `nil`
  meaning inherit the ambient font, mirroring the web default.
- Accept a `standalone: Bool`, defaulting to `false`.
- Accept an `external: Bool`, defaulting to `false`. When `true`, the rendered
  control shows the same hidden-from-VoiceOver indicator and appends a
  new-context statement to its accessibility label; activation opens the
  destination in the platform's external browser.
- Accept a visible text label as the default accessible name source, and an
  optional accessibility-label override for cases where the visible label does
  not itself describe the destination.
- Expose the `.isLink` accessibility trait (not `.isButton`) regardless of the
  underlying interactive control used to implement press-state styling, so
  VoiceOver and other assistive technology announce it correctly.
- Keep the API compatible with the existing iOS 15+ components target.

## Documentation and Verification

- Storybook documents every supported size (including the default inherited
  size), both presentations, the external treatment, the unavailable
  treatment, and every interaction state with its intended use.
- The iOS workbench presents matching native cases, including accessibility
  labels and traits, for automated verification.
- Component tests verify: size inheritance when no size is set, each explicit
  size, rejection of heading/display sizes at the type level, both
  presentations, the standalone minimum target, the external indicator and
  accessible-name suffix, external navigation safety (`noopener`/`noreferrer`
  on web), the unavailable presentation's absence from the tab order and link
  role, non-empty accessible naming, and focus visibility.
- Visual regression compares web and iOS output with reviewed baselines
  derived from the approved design reference.
