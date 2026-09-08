# Contract: Build & Dev Commands

The commands the scaffold must expose and their observable behavior. "Workspace"
= repo root; "package" = any of `packages/{tokens,icons,components}`.

## Root (workspace) scripts — `package.json`

| Command | Contract |
|---------|----------|
| `corepack enable` | One-time environment step that activates the repo-pinned pnpm. The only setup before `pnpm install` (FR-004). |
| `pnpm install` | From a clean checkout, installs all workspace deps. No further manual setup needed (FR-004). Together with `pnpm build` this is the two-command path of SC-001. |
| `pnpm build` | Runs `turbo run build`. Builds all three packages in dependency order (tokens → icons → components). Exit 0 with only placeholder content (FR-005). Rebuilds dependents when an upstream package changed (FR-008). Produces each package's `dist/web/**` and `dist/ios/**`. |
| `pnpm dev` | Runs `turbo watch` + `storybook dev -p 6006` for `apps/docs`. A source change in any package propagates to Storybook without publish/install, target < 30 s (SC-003). |
| `pnpm test` | Runs `turbo run test`. Aggregates every package's Vitest project. Exit non-zero on any failure. |
| `pnpm lint` | Runs `turbo run lint` (ESLint flat config). |
| `pnpm check:deps` | Runs `node scripts/check-deps.mjs`. See `dependency-matrix.md`. Exit non-zero + offending-package message on violation (SC-004). |
| `pnpm --filter docs build-storybook` | Emits `apps/docs/storybook-static/` for the CI test-runner and for static hosting. |
| `pnpm --filter docs test-storybook` | Runs `@storybook/test-runner` against the built Storybook: `axe` accessibility assertions on every story + DOM snapshot visual-regression. Exit non-zero on an a11y violation or a snapshot diff (FR-011). Requires Playwright browsers (`npx playwright install chromium`). |

`build` and `test` MUST also be runnable per package via
`pnpm --filter @design-system/<layer> run <script>` (FR-002, SC-002).

## Per-package scripts — `packages/<layer>/package.json`

| Script | Required | Contract |
|--------|----------|----------|
| `build` | yes | Generates `dist/web/**` (+ `dist/ios/**`). Idempotent: re-running on unchanged source yields byte-identical output. Exit 0 on placeholder-only content. |
| `generate` | tokens, icons | Invokes the custom generator (`tsx src/generate.ts`). `build` MAY be `generate && tsc` or call it directly. |
| `test` | yes | Runs the package's Vitest project. Independently runnable (SC-002). |
| `lint` | yes | ESLint over `src/`. |
| `typecheck` | yes | `tsc --noEmit -p tsconfig.json`. Invalid token references fail here, not at consumer runtime (Principle V). |

## Turborepo pipeline — `turbo.json`

| Task | `dependsOn` | `outputs` |
|------|-------------|-----------|
| `build` | `["^build"]` | `["dist/**"]` |
| `test` | `["build"]` | `[]` |
| `lint` | `[]` | `[]` |
| `typecheck` | `["^build"]` | `[]` |

`^build` ordering is the mechanism for FR-008 and the "dependency built before
dependent" edge case. Missing upstream `dist/` → Turborepo builds it first
(never silent empty/stale output).

## iOS command

| Command | Contract |
|---------|----------|
| `swift package describe` (run at repo root, after `pnpm build`) | Resolves the three products with no network fetch, no publish (SC-005, FR-007). Before `pnpm build` it MAY fail because generated Swift under `dist/ios` does not yet exist — this is acceptable (spec requires resolution "after a build"). |

## CI gate order — `.github/workflows/ci.yml`

`corepack enable` → `pnpm install --frozen-lockfile` → `pnpm build` → `pnpm test`
→ `node scripts/check-deps.mjs` → `pnpm lint` → `pnpm --filter docs build-storybook`
→ `npx playwright install --with-deps chromium` → serve `storybook-static` +
`pnpm --filter docs test-storybook`. Any non-zero step fails the workflow
(FR-011 gates a11y + visual regression before merge).

## Exit-code summary

- `0` — success (including placeholder-only content).
- non-zero — build error, test failure, lint error, or dependency-direction
  violation. Dependency violations MUST print the offending package name and the
  disallowed dependency.
