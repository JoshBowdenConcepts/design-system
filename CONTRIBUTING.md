# Contributing

## Placeholder vs. real content

This repo is currently **scaffolding**. Each package ships exactly one artifact
named/labelled `placeholder` (`--ds-placeholder`, `PlaceholderIcon`,
`Placeholder`) that carries **no design intent**. Its only job is to exercise
the generate → build → consume pipeline.

A value is **real** (and belongs in a dedicated feature, not here) if a consumer
would reasonably use it directly in shipped UI — a spacing step, a brand colour,
a typographic scale, an actual icon glyph, a real component.

When real content lands, delete the placeholder file and its barrel entry.

## Generated files are never hand-edited

Everything under any `dist/` directory is generated (`dist/` is gitignored). The
sources of truth are:

| Output | Generated from |
|--------|----------------|
| `packages/tokens/dist/web/tokens.css`, `dist/ios/**` | `packages/tokens/src/**` via `src/generate.ts` |
| `packages/tokens/dist/web/*.js` / `*.d.ts` | `packages/tokens/src/**` via `tsc` |
| `packages/icons/dist/**` | `packages/icons/src/svg/*.svg` via `src/generate.ts` |
| `packages/components/dist/web/**` | `packages/components/src/*.tsx` via `tsc` |
| `packages/components/dist/ios/**` | `src/generate.ts` |
| Swift build inputs referenced by `Package.swift` | the `dist/ios/**` above |

Regenerating from unchanged sources produces byte-identical output.

## Dependency direction

One-way: `tokens → icons → components`. Enforced by `pnpm check:deps`
(`scripts/check-deps.mjs`) in CI and by an ESLint import-boundary rule. Do not
add a package under `packages/` other than these three.

## Before opening a PR

```bash
pnpm build && pnpm test && pnpm lint && node scripts/check-deps.mjs \
  && pnpm --filter docs build-storybook \
  && pnpm --filter docs exec concurrently -k -s first -n sb,test \
       "http-server storybook-static --port 6006 --silent" \
       "wait-on tcp:127.0.0.1:6006 && test-storybook --url http://127.0.0.1:6006 --ci"
```

If a Storybook DOM snapshot legitimately changed, refresh the baseline with
`test-storybook … --updateSnapshot` and commit `apps/docs/src/__snapshots__/`.
