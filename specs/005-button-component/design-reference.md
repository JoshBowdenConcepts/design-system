# Button Design Reference

Source: Claude Design "Design System" project (`projectId 85d331e9-dfea-4312-b38e-2b335f79474e`),
`templates/button/Button.dc.html`, with a `templates/button/proposal/Button.jsx` /
`Button.d.ts` code sketch. Retrieved and recorded in `research.md` (decision D8)
during `/speckit-plan`.

## Approved inventory

| Axis | Values |
|---|---|
| Appearance | `solid`, `outline`, `text` |
| Size | `sm` (30px tall), `md` (38px tall) |
| State | default, hover, pressed, disabled — **no busy/loading state** |
| Icon-only | 24×24 minimum footprint, within `sm`/`md` (not a distinct size) |

## Tokens per appearance/state

| Appearance | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| `solid` | bg `--ds-color-primary`, fg `--ds-color-on-primary` | bg `--ds-color-primary-hover` | bg `--ds-color-text-primary`, fg `--ds-color-bg-raised` | bg `--ds-color-bg-sunken`, fg `--ds-color-text-tertiary` |
| `outline` | border/fg `--ds-color-primary`, bg transparent | bg `--ds-color-bg-sunken` | bg `--ds-color-primary-subtle`, border/fg `--ds-color-primary-hover` | fg `--ds-color-text-tertiary`, border `--ds-color-border` |
| `text` | fg `--ds-color-primary`, bg transparent | bg `--ds-color-bg-sunken` | bg `--ds-color-primary-subtle`, fg `--ds-color-primary-hover` | fg `--ds-color-text-tertiary` |

Shared geometry: `--ds-radius-200` corner radius, `--ds-color-focus-ring` focus
outline (`--ds-layout-focus-ring-width` / `--ds-layout-focus-ring-offset`),
`--ds-space-300` (24px) minimum height/width floor.

Sizes: `sm` padding `--ds-space-50` `--ds-space-150`; `md` padding
`--ds-space-100` `--ds-space-200`. Icon-only uses zero padding within the same
floor. Icon-to-label gap: `--ds-space-50`.

## Ahead of the current reference

Per the accepted spec clarification, these are required now even though the
current Claude Design reference does not yet show them:

- `fullWidth` layout and centered/space-between content alignment.
- Leading/trailing icon + label combinations (the reference only shows an
  icon-only example, not icon+label).

Re-review against Claude Design if/when it adds these treatments.

## Visual regression review log

- 2026-09-29: Web Storybook stories (`apps/docs/src/Button.stories.tsx`) pass
  the `test-storybook` accessibility + DOM-snapshot gate — 0 axe violations
  across all 11 story variants. Baselines recorded in
  `apps/docs/src/__snapshots__/Button.stories.tsx.snap`.
- 2026-09-29: iOS `ButtonGalleryView` snapshot
  (`apps/ios-workbench/Tests/__Snapshots__/WorkbenchSnapshotTests/testButtonGallerySnapshot.1.png`)
  and the updated `ComponentCatalogView` catalog snapshot recorded and
  reviewed — appearances, sizes, icon combinations, and full-width alignments
  match this reference's token pairings.
