# Quickstart: iOS Component Workbench

## Prerequisites

- macOS with Xcode and its command-line tools installed.
- At least one iOS Simulator runtime and device installed in Xcode.
- Node.js 22 or newer, Corepack/pnpm as used by the repository, and the
  repository dependencies installed.
- The checked-in font assets and their license notices from the token package.
- XcodeGen installed for project regeneration (`brew install xcodegen`).

Check the Apple tooling:

```bash
xcodebuild -version
xcrun simctl list devices available
```

## Generate and Inspect the Swift Package

From the repository root:

```bash
pnpm install
pnpm build
swift package describe
```

Expected result: package description lists `DesignSystemTokens`,
`DesignSystemIcons`, and `DesignSystemComponents`. Generated Swift and font
resources exist under `packages/*/dist/ios/`; they are build outputs and are
not hand-edited or committed.

## Launch the Workbench

Run `pnpm ios:workbench`, then select the `iOSComponentWorkbench` scheme and an
installed iPhone Simulator in Xcode. The catalog must list and open the ten
Text roles. Select a role, edit its sample content, and confirm the preview
changes without leaving the app.

## Validate Shared Token Consumption

1. Record the displayed role, family, weight, and size for one Text example.
2. Change that role's value in `packages/tokens/src/tokens/type.ts` using a
   syntactically valid supported font shorthand.
3. Run `pnpm build` and rebuild/relaunch the app.
4. Confirm the native Text preview reflects the changed generated descriptor;
   no independent Swift value is edited.
5. Restore the source token after the experiment and regenerate outputs.

Expected result: generated Swift values and the preview change from the shared
token source. A missing/invalid font resource or unsupported shorthand fails
generation/validation rather than presenting a misleading system-font fallback.

## Run Automated Validation

Run token and web package tests from the repository root:

```bash
pnpm --filter @design-system/tokens test
pnpm --filter @design-system/tokens typecheck
pnpm --filter @design-system/components test
pnpm --filter @design-system/components typecheck
```

Run native unit, visual snapshot, and workbench UI tests for the selected
simulator (the exact scheme names are fixed in the app project):

```bash
xcodebuild test \
  -project apps/ios-workbench/iOSComponentWorkbench.xcodeproj \
  -scheme iOSComponentWorkbench \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```

The Xcode project is generated from `apps/ios-workbench/project.yml`; XcodeGen
sets the deployment target to iOS 15, the minimum supported by the installed
simulator SDK in the validated environment.

Expected result: token mapping/resource assertions pass, the Text gallery and
catalog match committed snapshots for the pinned simulator configuration, and
UI tests can select examples, change content, and inspect accessibility names
and Dynamic Type behavior.

## Known Environment Limits

- The workbench cannot launch without Xcode and an installed iOS Simulator
  runtime; this is distinct from a package generation failure.
- Generated package targets are gitignored, so run `pnpm build` before
  `swift package describe`, opening the local package in Xcode, or running its
  tests after a clean checkout.
- Image snapshots must be recorded and compared on the same simulator/device
  configuration. Snapshot changes are reviewed and committed with the feature
  change that intentionally updates rendered output.
