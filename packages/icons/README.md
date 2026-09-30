# @design-system/icons

Part of the [design system](../../README.md) monorepo. **Scaffolding only** — no
real icons are authored yet, just a `placeholder` to exercise the pipeline.

## Public entry point

- **Web:** `@design-system/icons` → `dist/web/index.js` (+ `index.d.ts`), declared
  via the `exports` field in `package.json`.
- **iOS:** the `DesignSystemIcons` SwiftPM target in the repo-root `Package.swift`,
  generated into `dist/ios/DesignSystemIcons/`.

## Both platforms from one SVG

Each `src/svg/*.svg` produces two projections of the same artwork:

- Web: a React component whose `<path>` uses the source `d` verbatim, filled
  with `currentColor`.
- iOS: a SwiftUI `Shape` whose `path(in:)` replays the same path as native
  drawing commands, scaled from the icon's viewBox to the frame the caller
  gives it. It is a `Shape` rather than a `View` with a baked-in `.fill(...)`,
  so it inherits the ambient foreground style the way `currentColor` does:

  ```swift
  PlaceholderIcon()
      .frame(width: 14, height: 14)   // inherits the surrounding foreground color
  ```

The path translator supports `M/L/H/V/C/Z` (absolute and relative). An
unsupported command (arcs, quadratic or shorthand curves) fails the build
naming the command, rather than silently emitting wrong artwork.

## Commands

```bash
pnpm --filter @design-system/icons run build      # generate dist/web + dist/ios
pnpm --filter @design-system/icons run test       # Vitest
pnpm --filter @design-system/icons run typecheck  # tsc --noEmit
```

Generated files under `dist/` are never hand-edited.
