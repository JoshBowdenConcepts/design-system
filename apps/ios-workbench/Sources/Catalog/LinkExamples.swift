import DesignSystemComponents
import DesignSystemTokens
import SwiftUI

/// Manual gallery for `DesignSystemLink`, built the same way `TextGalleryView`
/// and `ButtonGalleryView` are: `playgroundSection` is the SwiftUI-native
/// equivalent of Storybook's Controls panel, and the sections below it render
/// every size/presentation/state from the same reference, since Xcode has no
/// separate "stories with controls" tool the way the web docs app does.
struct LinkGalleryView: View {
    private static let exampleURL = URL(string: "https://example.com")!

    @State private var playgroundSize: LinkSize?
    @State private var playgroundStandalone = false
    @State private var playgroundExternal = false
    @State private var playgroundAvailable = true

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                playgroundSection
                inlineSection
                sizeSection
                standaloneSection
                externalSection
                unavailableSection
            }
            .padding()
        }
        .navigationTitle("Link")
    }

    private var playgroundSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("Playground")

            HStack {
                Text("Size")
                Spacer()
                Picker("Size", selection: $playgroundSize) {
                    Text("inherit").tag(LinkSize?.none)
                    ForEach(LinkSize.allCases) { Text($0.rawValue).tag(LinkSize?.some($0)) }
                }
                .pickerStyle(.menu)
                .labelsHidden()
                .accessibilityIdentifier("playground-size")
            }

            Toggle("Standalone", isOn: $playgroundStandalone)
                .accessibilityIdentifier("playground-standalone")
            Toggle("External", isOn: $playgroundExternal)
                .accessibilityIdentifier("playground-external")
            Toggle("Available", isOn: $playgroundAvailable)
                .accessibilityIdentifier("playground-available")

            DesignSystemLink(
                "Link text",
                destination: playgroundAvailable ? Self.exampleURL : nil,
                size: playgroundSize,
                standalone: playgroundStandalone,
                external: playgroundExternal
            )
            .accessibilityIdentifier("link-playground-preview")
        }
    }

    private var inlineSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            sectionTitle("Inline")
            // SwiftUI's `Text` concatenation (`+`) is the native equivalent of
            // nesting an inline link inside a paragraph on web — SwiftUI has
            // no way to embed a real pressable `DesignSystemLink` inside
            // flowing text, so this segment is colored/underlined from the
            // same `--ds-color-primary` token rather than reusing the
            // component itself. The inherited (non-`.font()`-overridden)
            // segment demonstrates the same ambient-size inheritance
            // `DesignSystemLink(size: nil)` uses.
            (Text("Links inside running text inherit the paragraph style and are always underlined. Read the ")
                + Text("accessibility guide").underline().foregroundColor(DesignSystemTokens.colorPrimary)
                + Text(" before shipping."))
                .accessibilityIdentifier("link-inline-example")
        }
    }

    private var sizeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("Sizes (inherit + explicit)")
            DesignSystemLink("Inherit (default)", destination: Self.exampleURL)
                .accessibilityIdentifier("link-size-inherit")
            ForEach(LinkSize.allCases) { size in
                DesignSystemLink("Link text (\(size.rawValue))", destination: Self.exampleURL, size: size)
                    .accessibilityIdentifier("link-size-\(size.rawValue)")
            }
        }
    }

    private var standaloneSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("Standalone (24×24 minimum target)")
            DesignSystemLink("View all projects", destination: Self.exampleURL, size: .label, standalone: true)
                .accessibilityIdentifier("link-standalone-label")
            DesignSystemLink("View all projects", destination: Self.exampleURL, size: .p, standalone: true)
                .accessibilityIdentifier("link-standalone-p")
        }
    }

    private var externalSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("External")
            DesignSystemLink("Status page", destination: Self.exampleURL, size: .label, standalone: true, external: true)
                .accessibilityIdentifier("link-external")
        }
    }

    private var unavailableSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("Unavailable (no destination — never disabled)")
            DesignSystemLink("Link text", destination: nil, size: .label)
                .accessibilityIdentifier("link-unavailable-label")
            DesignSystemLink("Link text", destination: nil, size: .p)
                .accessibilityIdentifier("link-unavailable-p")
        }
    }

    private func sectionTitle(_ title: String) -> some View {
        Text(title.uppercased())
            .font(.caption.monospaced())
            .foregroundStyle(.secondary)
    }
}
