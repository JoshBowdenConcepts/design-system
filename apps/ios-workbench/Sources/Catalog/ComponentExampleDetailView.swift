import SwiftUI
import DesignSystemComponents

struct ComponentExampleDetailView: View {
    let example: ComponentExample
    @State private var content: String

    init(example: ComponentExample) {
        self.example = example
        _content = State(initialValue: example.initialContent)
    }

    var body: some View {
        Form {
            Section("Preview") {
                Group {
                    if let role = example.role {
                        DesignSystemText(content, role: role)
                    } else {
                        Text(content)
                    }
                }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .accessibilityIdentifier("example-preview")
            }
            Section("Content") {
                TextField("Preview content", text: $content)
                    .accessibilityIdentifier("example-content")
            }
        }
        .navigationTitle(example.title)
    }
}
