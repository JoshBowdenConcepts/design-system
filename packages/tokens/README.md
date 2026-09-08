# @design-system/tokens

Part of the [design system](../../README.md) monorepo. **Scaffolding only** — no
real tokens are authored yet, just a `placeholder` to exercise the pipeline.

## Public entry point

- **Web:** `@design-system/tokens` → `dist/web/index.js` (+ `index.d.ts`), declared
  via the `exports` field in `package.json`.
- **Web CSS:** `@design-system/tokens/tokens.css` → CSS custom properties.
- **iOS:** the `DesignSystemTokens` SwiftPM target in the repo-root `Package.swift`,
  generated into `dist/ios/DesignSystemTokens/`.

## Commands

```bash
pnpm --filter @design-system/tokens run build      # generate dist/web + dist/ios
pnpm --filter @design-system/tokens run test       # Vitest
pnpm --filter @design-system/tokens run typecheck  # tsc --noEmit
```

Generated files under `dist/` are never hand-edited.
