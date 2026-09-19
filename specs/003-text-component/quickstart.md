# Text Component Validation Guide

## Prerequisites

- Node.js 22 or newer
- pnpm installed at the repository root

## Component validation

From the repository root:

```bash
pnpm --filter @design-system/components test
pnpm --filter @design-system/components typecheck
pnpm --filter @design-system/components lint
pnpm --filter @design-system/components build
```

Expected outcomes:

- SSR tests confirm default `p`, every supported `as` element, native prop/ref
  forwarding, class merging, children preservation, and omission of `as` and
  `variant` from DOM output.
- Typechecking confirms valid intrinsic props/ref combinations and rejects an
  unsupported element, variant, or incompatible native prop.
- Build output contains the emitted component JavaScript/declarations and the
  CSS Module asset required by the import.

## Storybook validation

```bash
pnpm --filter docs storybook
```

Open the Text story and verify:

- default paragraph rendering;
- semantic heading, label, and anchor examples;
- variant selection changes style while preserving the selected element;
- native anchor props and consumer class names are represented;
- no accessibility violations are reported by the Storybook test runner.

For a production bundle:

```bash
pnpm --filter docs build-storybook
```

The command must complete successfully and include the Text story.

See [component-api.md](contracts/component-api.md) for the public prop contract
and [css-module-build.md](contracts/css-module-build.md) for the package asset
requirement.
