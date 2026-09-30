import DesignSystemComponents
import DesignSystemIcons
import DesignSystemTokens
import SwiftUI

/// Manual gallery for `DesignSystemButton`. `interactiveSection` is a live
/// tap-count demo `WorkbenchCatalogUITests` drives end to end; `playgroundSection`
/// is the SwiftUI-native equivalent of Storybook's Controls panel — Toggle/
/// Picker controls that drive a live preview and the icon-combination rows
/// below it, since Xcode has no separate "stories with controls" tool the
/// way the web docs app does.
struct ButtonGalleryView: View {
    @State private var tapCount = 0

    @State private var playgroundVariant: ButtonVariant = .solid
    @State private var playgroundSize: ButtonSize = .md
    @State private var playgroundFullWidth = false
    @State private var playgroundContentAlignment: ButtonContentAlignment = .center
    @State private var playgroundLeadingIcon = false
    @State private var playgroundTrailingIcon = false

    /// The real design-system icon (generated from the same SVG the web
    /// `PlaceholderIcon` component uses), sized to match the button label's
    /// type scale — the native equivalent of the web icon's `1em` sizing.
    private var icon: AnyView {
        AnyView(
            PlaceholderIcon()
                .frame(width: DesignSystemTypographyTokens.label.pointSize, height: DesignSystemTypographyTokens.label.pointSize)
        )
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                interactiveSection
                playgroundSection
                appearanceSection
                iconOnlySection
            }
            .padding()
        }
        .navigationTitle("Button")
    }

    private var interactiveSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            sectionTitle("Interactive")
            Text("Tap count: \(tapCount)")
            DesignSystemButton("Tap me", action: { tapCount += 1 })
                .accessibilityIdentifier("button-interactive-enabled")
            DesignSystemButton("Disabled", action: { tapCount += 1 })
                .disabled(true)
                .accessibilityIdentifier("button-interactive-disabled")
        }
    }

    private var playgroundSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("Playground")

            Picker("Variant", selection: $playgroundVariant) {
                ForEach(ButtonVariant.allCases) { Text($0.rawValue).tag($0) }
            }
            .pickerStyle(.segmented)

            Picker("Size", selection: $playgroundSize) {
                ForEach(ButtonSize.allCases) { Text($0.rawValue).tag($0) }
            }
            .pickerStyle(.segmented)

            Toggle("Full width", isOn: $playgroundFullWidth)
                .accessibilityIdentifier("playground-full-width")

            Picker("Content alignment", selection: $playgroundContentAlignment) {
                Text("center").tag(ButtonContentAlignment.center)
                Text("space-between").tag(ButtonContentAlignment.spaceBetween)
            }
            .pickerStyle(.segmented)
            .disabled(!playgroundFullWidth)

            Toggle("Leading icon", isOn: $playgroundLeadingIcon)
                .accessibilityIdentifier("playground-leading-icon")
            Toggle("Trailing icon", isOn: $playgroundTrailingIcon)
                .accessibilityIdentifier("playground-trailing-icon")

            DesignSystemButton(
                "Button text",
                variant: playgroundVariant,
                size: playgroundSize,
                fullWidth: playgroundFullWidth,
                contentAlignment: playgroundContentAlignment,
                leadingIcon: playgroundLeadingIcon ? icon : nil,
                trailingIcon: playgroundTrailingIcon ? icon : nil,
                action: {}
            )
            .accessibilityIdentifier("button-playground-preview")

            Divider().padding(.vertical, 4)

            sectionTitle("Icon combinations (follows Full width / Content alignment above)")
            VStack(alignment: .leading, spacing: 12) {
                DesignSystemButton(
                    "Neither",
                    variant: playgroundVariant,
                    size: playgroundSize,
                    fullWidth: playgroundFullWidth,
                    contentAlignment: playgroundContentAlignment,
                    action: {}
                )
                DesignSystemButton(
                    "Leading only",
                    variant: playgroundVariant,
                    size: playgroundSize,
                    fullWidth: playgroundFullWidth,
                    contentAlignment: playgroundContentAlignment,
                    leadingIcon: icon,
                    action: {}
                )
                DesignSystemButton(
                    "Trailing only",
                    variant: playgroundVariant,
                    size: playgroundSize,
                    fullWidth: playgroundFullWidth,
                    contentAlignment: playgroundContentAlignment,
                    trailingIcon: icon,
                    action: {}
                )
                DesignSystemButton(
                    "Both",
                    variant: playgroundVariant,
                    size: playgroundSize,
                    fullWidth: playgroundFullWidth,
                    contentAlignment: playgroundContentAlignment,
                    leadingIcon: icon,
                    trailingIcon: icon,
                    action: {}
                )
            }
        }
    }

    private var appearanceSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("Appearances × sizes")
            ForEach(ButtonVariant.allCases) { variant in
                HStack(spacing: 12) {
                    ForEach(ButtonSize.allCases) { size in
                        DesignSystemButton("Button text", variant: variant, size: size, action: {})
                            .accessibilityIdentifier("button-\(variant.rawValue)-\(size.rawValue)")
                    }
                }
            }
        }
    }

    private var iconOnlySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("Icon only (sm / md)")
            HStack(spacing: 12) {
                DesignSystemButton(iconOnlyAccessibilityLabel: "Add item", size: .sm, icon: icon, action: {})
                    .accessibilityIdentifier("button-icon-only-sm")
                DesignSystemButton(iconOnlyAccessibilityLabel: "Add item", size: .md, icon: icon, action: {})
                    .accessibilityIdentifier("button-icon-only-md")
            }
        }
    }

    private func sectionTitle(_ title: String) -> some View {
        Text(title.uppercased())
            .font(.caption.monospaced())
            .foregroundStyle(.secondary)
    }
}
