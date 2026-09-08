# Contract: Package Manifest & Public Entry Point

Every `packages/<layer>/package.json` MUST satisfy this shape (FR-002).

## Required fields

| Field | Value / rule |
|-------|--------------|
| `name` | `@design-system/tokens` \| `@design-system/icons` \| `@design-system/components` — literal `@design-system` scope (FR-001) |
| `version` | semver, independent per package; scaffold starts `0.0.0` |
| `type` | `"module"` |
| `exports` | `"." : { "types": "./dist/web/index.d.ts", "import": "./dist/web/index.js" }`; tokens also exports `"./tokens.css": "./dist/web/tokens.css"` |
| `types` | `./dist/web/index.d.ts` (documented public entry point) |
| `files` | `["dist/web", "dist/ios"]` |
| `sideEffects` | `false` (tokens: `["*.css"]`) |
| `scripts` | `build`, `generate` (tokens/icons), `test`, `lint`, `typecheck` — see `build-commands.md` |
| `dependencies` | Only what the Dependency Matrix allows; internal deps use `workspace:*` |
| `peerDependencies` | icons/components: `react` (and `react-dom` for components) as peers, not deps |
| `publishConfig` | `{ "access": "public" }` (not published in this feature; present for later) |

## Public entry point (`src/index.ts`)

- MUST be typed; consumers get full `.d.ts`.
- tokens: re-exports token values + the token schema types.
- icons: re-exports generated React icon components (`PlaceholderIcon`).
- components: re-exports React components (`Placeholder`).
- No deep imports required by consumers — the barrel is the contract.

## Root `apps/docs/package.json`

- `private: true`, no `version` semantics relied on (it is an app, not a
  package — Principle III).
- `dependencies` include all three `@design-system/*` packages as `workspace:*`.
- `devDependencies` include Storybook (`storybook`, `@storybook/react-vite`,
  `@storybook/addon-a11y`), `vite` + `@vitejs/plugin-react`, and the FR-011 gate
  tooling (`@storybook/test-runner`, `playwright`, `axe-playwright`,
  `http-server`, `wait-on`, `concurrently`).
- `scripts`: `storybook` = `storybook dev -p 6006`, `build-storybook` =
  `storybook build`, `test-storybook` = `test-storybook`.
- Not counted by `check-deps.mjs` (it scans `packages/*`, not `apps/*`).

## Enforcement

`scripts/check-deps.mjs` reads these manifests and validates `name`,
`dependencies`, and that no extra `packages/*` directory exists. ESLint verifies
no source file imports across a disallowed boundary.
