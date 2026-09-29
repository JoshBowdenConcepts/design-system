import DesignSystemComponents
import SwiftUI

struct TextRoleGalleryView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                ForEach(TextRole.allCases) { role in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(role.rawValue)
                            .font(.caption.monospaced())
                            .foregroundStyle(.secondary)
                        DesignSystemText("The quick brown fox jumps over the lazy dog.", role: role)
                    }
                    .accessibilityElement(children: .combine)
                    .accessibilityIdentifier("text-role-\(role.rawValue)")
                }
            }
            .padding()
        }
        .navigationTitle("Text roles")
    }
}