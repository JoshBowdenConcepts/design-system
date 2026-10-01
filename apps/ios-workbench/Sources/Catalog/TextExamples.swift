import DesignSystemComponents
import DesignSystemTokens
import SwiftUI

/// Manual gallery for `DesignSystemText`, built the same way `ButtonGalleryView`
/// is: `playgroundSection` is the SwiftUI-native equivalent of Storybook's
/// Controls panel — a Picker and a text field that drive a live preview — and
/// `roleSection` below it renders every role from the same content, since Xcode
/// has no separate "stories with controls" tool the way the web docs app does.
struct TextGalleryView: View {
    private static let sampleContent = "The quick brown fox jumps over the lazy dog."

    @State private var content = Self.sampleContent
    @State private var playgroundRole: TextRole = .p

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                playgroundSection
                roleSection
            }
            .padding()
        }
        .navigationTitle("Text")
    }

    private var playgroundSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionTitle("Playground")

            // Ten roles is far too many for a segmented control, so this one
            // control uses the menu style rather than matching Button's
            // segmented pickers.
            HStack {
                Text("Role")
                Spacer()
                Picker("Role", selection: $playgroundRole) {
                    ForEach(TextRole.allCases) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.menu)
                .labelsHidden()
                .accessibilityIdentifier("playground-role")
            }

            TextField("Preview content", text: $content)
                .textFieldStyle(.roundedBorder)
                .accessibilityIdentifier("playground-content")

            DesignSystemText(content, role: playgroundRole)
                .frame(maxWidth: .infinity, alignment: .leading)
                .accessibilityIdentifier("text-playground-preview")
        }
    }

    private var roleSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            sectionTitle("All roles (follows Preview content above)")
            ForEach(TextRole.allCases) { role in
                VStack(alignment: .leading, spacing: 4) {
                    Text(role.rawValue)
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                    DesignSystemText(content, role: role)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .accessibilityElement(children: .combine)
                .accessibilityIdentifier("text-role-\(role.rawValue)")
            }
        }
    }

    private func sectionTitle(_ title: String) -> some View {
        Text(title.uppercased())
            .font(.caption.monospaced())
            .foregroundStyle(.secondary)
    }
}
