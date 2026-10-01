# Link Component Validation Quickstart

## Prerequisites

- Node.js 22 or newer, pnpm dependencies installed, and the repository root as
  the working directory.
- For native validation: macOS with Xcode command-line tools, XcodeGen, and an
  installed iOS 15+ Simulator runtime/device.
- The approved Claude Design Link reference (inline/standalone × inherit/`p`/
  `p-sm`/`label`, plus the ahead-of-reference `caption` size; external;
  resting/hover/focus/unavailable) is recorded in `research.md` (D9) and
  `design-reference.md`; use it for the visual-baseline review. Do not approve
  inferred variants.

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

3. Build Storybook from its app directory and inspect the Link stories:

   ```sh
   cd apps/docs
   pnpm build-storybook
   ```

4. Confirm: a Link with no size set matches the metrics of surrounding copy at
   two different surrounding sizes; each explicit size (`p`, `p-sm`, `label`,
   `caption`) matches its approved treatment; a heading/display size is
   rejected by TypeScript, not just at runtime; inline links do not disturb
   line height while standalone links meet the 24×24 minimum target; external
   links show the hidden-from-AT indicator, announce "(opens in a new tab)" as
   part of their accessible name, and open with `rel="noopener noreferrer"`; a
   Link with no `href` renders as de-emphasized text with no link role and is
   skipped by keyboard Tab order; focus-visible shows the shared focus ring.

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

3. Verify: a Link with `size: nil` inherits the ambient font; each explicit
   size matches the approved design; standalone links meet the 24×24 minimum
   frame; external links show the indicator (hidden from VoiceOver) and their
   accessibility label states the destination opens in Safari; activating a
   Link opens the system browser; a Link with `destination: nil` exposes no
   `.isLink` trait and is skipped by VoiceOver swipe navigation; the control
   exposes `.isLink` (never `.isButton`) to assistive technology regardless of
   the underlying pressable view used for pressed-state styling. Review
   snapshot diffs against Claude Design before recording updated baselines.

## Expected Outcome

- Web component build, tests, typecheck, Storybook build, and accessibility
  checks pass with zero violations in both light and dark color modes.
- Native component/workbench build, XCTest/UI tests, accessibility checks, and
  reviewed visual snapshots pass.
- No generated `dist/` output is edited by hand, no unapproved visual variant
  (in particular, no heading or display size) is reachable through the public
  contract, and the same shared token decisions and Text/TextRole typography
  drive both platforms.
