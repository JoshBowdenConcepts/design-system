# Button Component Validation Quickstart

## Prerequisites

- Node.js 22 or newer, pnpm dependencies installed, and the repository root as
  the working directory.
- For native validation: macOS with Xcode command-line tools, XcodeGen, and an
  installed iOS 15+ Simulator runtime/device.
- The approved Claude Design Button reference (solid/outline/text × sm/md;
  default/hover/pressed/disabled) is recorded in `research.md` (D8); use it for
  the visual-baseline review. Do not approve inferred variants.

## Web Validation

1. Build workspace package outputs:

   ```sh
   pnpm build
   ```

2. Run components tests and typecheck:

   ```sh
   pnpm --filter @design-system/components test
   pnpm --filter @design-system/components typecheck
   ```

3. Build Storybook from its app directory and inspect the Button stories:

   ```sh
   cd apps/docs
   pnpm build-storybook
   ```

4. Confirm documented variants match the approved design, full-width content
   alignment works in both modes, all leading/trailing icon combinations render,
   disabled buttons do not activate, and icon-only controls have an accessible
   name. Verify web button `type` defaults to `button` and explicit submit/reset
   values retain native form behavior.

## iOS Validation

1. Generate package outputs and launch the iOS workbench:

   ```sh
   pnpm ios:workbench
   ```

2. Run the iOS simulator tests using the repository's supported destination:

   ```sh
   xcodebuild test \
     -project apps/ios-workbench/iOSComponentWorkbench.xcodeproj \
     -scheme iOSComponentWorkbench \
     -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
   ```

3. Verify native action/disabled behavior, accessible labels for icon-only
   buttons, full-width centered and space-between layouts, all icon slot
   combinations, and the approved design appearance. Review snapshot diffs
   against Claude Design before recording updated baselines.

## Expected Outcome

- Web component build, tests, typecheck, Storybook build, and accessibility
  checks pass.
- Native component/workbench build, XCTest/UI tests, accessibility checks, and
  reviewed visual snapshots pass.
- No generated `dist/` output is edited by hand, no unapproved visual variant is
  introduced, and the same shared token decisions drive both platforms.