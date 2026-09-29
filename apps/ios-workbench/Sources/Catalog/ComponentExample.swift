import SwiftUI
import DesignSystemComponents

struct ComponentExample: Identifiable {
    let id: String
    let title: String
    let initialContent: String
    let role: TextRole?
}

enum ComponentCatalog {
    static let examples = TextRole.allCases.map { role in
        ComponentExample(
            id: "components.text.\(role.rawValue)",
            title: "Text / \(role.rawValue)",
            initialContent: "The quick brown fox jumps over the lazy dog.",
            role: role
        )
    }

    static var validatedExamples: [ComponentExample] {
        precondition(Set(examples.map(\.id)).count == examples.count, "Catalog example IDs must be unique")
        precondition(examples.allSatisfy { !$0.title.isEmpty }, "Catalog example titles must not be empty")
        return examples.sorted { $0.id < $1.id }
    }
}
