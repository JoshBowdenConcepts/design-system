# iOS Component Workbench

## Prerequisites

- macOS with Xcode and command-line tools installed.
- An iOS Simulator runtime and device installed through Xcode.
- Node.js 22 or newer and the repository dependencies installed.
- The workbench and SwiftUI component target iOS 15 or newer, matching the
  minimum supported by the installed simulator SDK.

## Launch

From the repository root, run `pnpm ios:workbench`. This builds the generated
Swift package sources, regenerates the Xcode project from `project.yml`, and
opens the project in Xcode. Select the `iOSComponentWorkbench` scheme and an
installed iPhone simulator, then run the app.

The root Swift package targets files under gitignored `packages/*/dist/ios/`.
After a clean checkout or token/component source change, run `pnpm build`
before resolving or opening the package in Xcode. Do not edit generated files.

## Tests

Run app, component, visual snapshot, and UI tests with:

```bash
xcodebuild test \
  -project apps/ios-workbench/iOSComponentWorkbench.xcodeproj \
  -scheme iOSComponentWorkbench \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro'
```

The project uses XcodeGen; regenerate the project with
`xcodegen generate --spec apps/ios-workbench/project.yml` after editing its
declarative configuration. XcodeGen is required for regeneration.

Visual references are stored under `Tests/__Snapshots__/WorkbenchSnapshotTests`
and rendered with a fixed iPhone SE portrait snapshot configuration. Review and
commit snapshot changes when an intentional component visual change is made.
