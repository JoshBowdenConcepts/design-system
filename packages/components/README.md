# @design-system/components

Part of the [design system](../../README.md) monorepo. **Scaffolding only** — no
real components are authored yet, just a `placeholder` to exercise the pipeline.

## Public entry point

- **Web:** `@design-system/components` → `dist/web/index.js` (+ `index.d.ts`), declared
  via the `exports` field in `package.json`.
- **iOS:** the `DesignSystemComponents` SwiftPM target in the repo-root `Package.swift`,
  generated into `dist/ios/DesignSystemComponents/`.

## Commands

```bash
pnpm --filter @design-system/components run build      # generate dist/web + dist/ios
pnpm --filter @design-system/components run test       # Vitest
pnpm --filter @design-system/components run typecheck  # tsc --noEmit
```

Generated files under `dist/` are never hand-edited.
