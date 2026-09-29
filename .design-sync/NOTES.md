# design-sync notes

## Fixes

- [GENERAL] `[TOKENS_MISSING]` (10 `--ds-type-*` custom properties not found) -> the converter's default token-file search only checks `dist/css`, `css`, `dist`, `.` under the tokens package, but `@design-system/tokens` ships `tokens.css` at `dist/web/tokens.css` -> set `cfg.tokensGlob: "dist/web/*.css"` (paired with explicit `cfg.tokensPkg`).
- Reference storybook build: running `npx storybook build` from the repo root resolves a fresh npx-downloaded Storybook (mismatched major version, breaks `@storybook/react-vite` preset resolution). Must `cd apps/docs` first so npx picks up the repo's pinned `storybook@^8.4.7` devDependency, then run `npx storybook build -c .storybook -o <repo-root>/.design-sync/sb-reference`.

## Re-sync risks

- Extremely small DS surface today: only `Text` is a real, storied component. `Placeholder` exists only to prove the tokens/icons consumption chain and is explicitly marked "delete when the first real component lands" in its own doc comment — it has no story file, so design-sync correctly excludes it from the sync. When `Placeholder` is deleted and/or new real components land with stories, re-run the sync to pick them up.
- `StyleGuide.stories.tsx` (`title: "Style Guide"`, no `meta.component`) is a token/style documentation page, not a component — the converter correctly drops it via `[TITLE_UNMAPPED]`. No action needed unless it grows a `component` field.
- Typography values (`--ds-type-*`) load `Bricolage Grotesque`, `Public Sans`, `IBM Plex Mono` from Google Fonts CDN via `@import url(...)` inside `tokens.css` itself (not local `@font-face` files) — so there's nothing for `cfg.extraFonts` to manage, but designs rendered offline/without CDN egress will fall back to system fonts. Not currently an issue for compare grading (both panels load the same CDN import).
- `Text` is a polymorphic component (`as` prop changes the rendered element) with a generic type signature — worth a spot-check on a future re-sync if TypeScript/generic-prop handling in `.d.ts` extraction ever changes upstream.
