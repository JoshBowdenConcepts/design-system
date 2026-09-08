# @design-system/icons

Part of the [design system](../../README.md) monorepo. **Scaffolding only** — no
real icons are authored yet, just a `placeholder` to exercise the pipeline.

## Public entry point

- **Web:** `@design-system/icons` → `dist/web/index.js` (+ `index.d.ts`), declared
  via the `exports` field in `package.json`.
- **iOS:** the `DesignSystemIcons` SwiftPM target in the repo-root `Package.swift`,
  generated into `dist/ios/DesignSystemIcons/`.

## Commands

```bash
pnpm --filter @design-system/icons run build      # generate dist/web + dist/ios
pnpm --filter @design-system/icons run test       # Vitest
pnpm --filter @design-system/icons run typecheck  # tsc --noEmit
```

Generated files under `dist/` are never hand-edited.
