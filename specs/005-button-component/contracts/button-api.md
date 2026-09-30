# Button Public UI Contract

This contract describes consumer-visible behavior, not implementation code.
Appearance, size, and state values are fixed by the approved Claude Design
Button reference (`Design System` project, `templates/button/Button.dc.html`).

## Shared Behavior

- Provide one web Button and one native iOS Button in the existing components
  package.
- Support exactly three appearances (`solid`, `outline`, `text`) at exactly two
  sizes (`sm`, `md`); icon-only content uses these same sizes. No busy/loading
  state is supported.
- Accept an optional leading icon, optional trailing icon, both, or neither.
- `fullWidth` defaults to `false`; when true the control fills its available
  horizontal space.
- Full-width content alignment defaults to `center`. `space-between` places
  present leading icon, label, and trailing icon slots across the available
  width; absent slots are omitted.
- Disabled buttons do not invoke their action and expose a disabled state.
- Visual values come from shared design tokens. Each platform retains native
  input, focus/pressed feedback, and accessibility behavior.

## Web API

- Render a native `<button>` and accept appropriate native button props,
  including consumer event handlers and `type`.
- Default `type` to `button`; preserve explicit `submit` and `reset` values.
- Accept visible label content and independently optional leading/trailing
  React content.
- Expose typed `fullWidth` and content-alignment choices. Alignment is only
  meaningful when `fullWidth` is true.
- When the visible label is absent, require a non-empty `aria-label` or valid
  `aria-labelledby` reference. Image alternative text does not substitute for
  the button's accessible name.
- Preserve native keyboard activation, focus visibility, and disabled
  semantics.

## iOS API

- Wrap a native SwiftUI `Button` action and preserve native activation,
  accessibility, and disabled semantics.
- Accept a visible text label and independently optional leading/trailing
  SwiftUI view content; consumers may supply an image or other native view.
- Expose `fullWidth` and the same conceptual centered/space-between alignment
  choice using typed Swift values.
- When the visible label is absent, require a non-empty SwiftUI accessibility
  label through the icon-only API. Do not assume an image description names the
  action.
- Keep the API compatible with the existing iOS 15+ components target.

## Documentation and Verification

- Storybook documents every approved web appearance, size, content combination,
  width/alignment option, and interaction state.
- The iOS workbench presents matching native cases and test identifiers or
  accessibility labels for automated verification.
- Component tests verify defaults, native props/actions, alignment, all icon
  slot combinations, disabled state, form type behavior, and icon-only naming.
- Visual regression compares web and iOS output with reviewed baselines derived
  from the approved design inventory.