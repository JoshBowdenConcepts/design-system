# Link Design Reference

Source: Claude Design "Design System" project (`projectId 85d331e9-dfea-4312-b38e-2b335f79474e`),
`templates/link/Link.dc.html`. Retrieved and recorded in `research.md` (decision D9)
during `/speckit-plan`. No companion `.jsx`/`.d.ts` code sketch exists for Link
(unlike Button); the `.dc.html` markup itself is the only artifact.

## Approved inventory

| Axis | Values |
|---|---|
| Presentation | Inline (inside running text, no min-target box) and standalone (own line, 24×24 min target) |
| Size | Inherit (default, matches surrounding text) · `p` · `p-sm` · `label` — **no heading or display sizes** |
| External | Off (default) and on (adds visual + accessible "opens in a new tab" indicator) |
| State | default, hover, focus, **unavailable** — **no disabled state, no busy/loading state** |

The reference shows inline links at `p` and `p-sm` sizes, standalone links at
`label` and `p` sizes, and one external standalone example at `label` size. Per
the accepted `/speckit-specify` clarification, this feature additionally
requires a `caption` size ahead of this reference (pending design sign-off on
its visual treatment); every other value above is drawn directly from the file.

## Structure

Every example is `Text` (`as="span"`) nested inside a real `<a href>` — Link
has no typography of its own, it borrows the Text component's variant styles
and inherits the font when no variant/size is set (`font: inherit` on
`Text`'s `span` default). This is the literal basis for FR-003/FR-004.

## Tokens per state

| State | Treatment |
|---|---|
| Default | `color: var(--ds-color-primary)`, `text-decoration-line: underline`, `text-decoration-thickness: 1px`, `text-underline-offset: 0.18em` |
| Hover | `color: var(--ds-color-primary-hover)`, `text-decoration-thickness: 2px` |
| Focus | `outline: var(--ds-layout-focus-ring-width) solid var(--ds-color-focus-ring)`, `outline-offset: var(--ds-layout-focus-ring-offset)` |
| Unavailable | `color: var(--ds-color-text-secondary)` (implementation correction — see below), no underline, no `href`, not focusable |

**Implementation correction (found during `/speckit-implement`, 2026-09-30)**: the
reference's own markup uses `--ds-color-text-tertiary` for the Unavailable
state. Measured against `--ds-color-bg`, that pairing is only ~4.29:1 in light
mode — below the 4.5:1 AA floor (WCAG 1.4.3) for normal text. Button's
*disabled* state also uses `text-tertiary`, but a disabled control is an
inactive UI component exempt from 1.4.3; Link's unavailable presentation is
static text a user reads, with no such exemption. The shipped implementation
uses `--ds-color-text-secondary` instead (9.76:1 light / 10.84:1 dark) — still
visually de-emphasized relative to body text, but AA-passing. Caught by the
Storybook accessibility gate (`test-storybook`), not by inspection. Flag for
Claude Design: the Unavailable row in `Link.dc.html` itself should move to
`text-secondary`.

Shared geometry: `border-radius: var(--ds-radius-100)` (focus-outline rounding,
smaller than Button's `--ds-radius-200`), standalone min target
`var(--ds-space-300)` (24px) height/width floor, inline-to-standalone gap
`var(--ds-space-50)` between an icon and label.

## External treatment

- A `↗` character, `aria-hidden="true"`, styled with `font: var(--ds-type-label)` —
  not an SVG/icon-package asset.
- A visually-hidden (clip-rect) span reading "(opens in a new tab)" placed
  inside the anchor, so it becomes part of the link's accessible name.
- `target="_blank" rel="noopener noreferrer"` on the anchor.

## Unavailable treatment

Rendered as plain `Text` (no `<a>`, no `href`, `tabindex` absent rather than
`-1` so it is never in the tab order), colored `--ds-color-text-tertiary`, no
underline. The reference's grid demo wraps it in a layout box purely for
row-alignment in that demo table — not a component requirement.

## Accessibility rules (verbatim from the reference's own "Accessibility rules" section)

1. Always render a real `<a href>`. Use Button for actions that don't navigate.
2. Underline is always on; color alone doesn't mark a link (WCAG 1.4.1).
3. Link text describes the destination out of context. Avoid "click here" and
   "read more" (2.4.4).
4. Primary on bg is at least 5.4:1 in light and 11:1 in dark; hover stays above
   4.5:1 (1.4.3).
5. Standalone links get a 24 × 24px minimum target; inline links are exempt
   (2.5.8).
6. New-tab links show ↗ (hidden from screen readers) plus visually hidden
   "(opens in a new tab)" text and `rel="noopener noreferrer"`.
7. Links can't be disabled. When a destination is unavailable, render plain
   text with no `href` so it leaves the tab order.
8. Focus uses the shared 3px focus ring with a 2px offset, which meets 2.4.7
   and 2.4.11.

These eight rules map directly to FR-002, FR-008, FR-010 through FR-017 of the
spec and are treated as binding, not illustrative.

## Visual regression review log

- 2026-09-30: Web Storybook stories (`apps/docs/src/Link.stories.tsx`) pass the
  `test-storybook` accessibility + DOM-snapshot gate — 0 axe violations across
  all 8 story variants (sizes, both presentations, external, unavailable,
  inline-in-paragraph). Baselines recorded in
  `apps/docs/src/__snapshots__/Link.stories.tsx.snap`.
- 2026-09-30: iOS `LinkGalleryView` snapshot
  (`apps/ios-workbench/Tests/__Snapshots__/WorkbenchSnapshotTests/testLinkGallerySnapshot.1.png`)
  and the updated `ComponentCatalogView` catalog snapshot (now listing Button /
  Link / Text) recorded and reviewed — sizes, presentations, external
  indicator, and the unavailable treatment match this reference's token
  pairings, with the `text-secondary` correction below applied on both
  platforms.
- The implementation found and corrected one defect in the reference itself:
  the Unavailable state's `--ds-color-text-tertiary` fails WCAG 1.4.3 (~4.29:1
  against `--ds-color-bg` in light mode); both platforms use
  `--ds-color-text-secondary` instead. See "Implementation correction" above.
