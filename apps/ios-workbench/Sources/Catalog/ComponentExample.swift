import SwiftUI

/// One entry in the workbench catalog: a component, not a single variation of
/// one. Each component owns a gallery view carrying its own controls — the
/// native stand-in for one Storybook page with a Controls panel — so the
/// catalog list stays one row per component.
struct ComponentExample: Identifiable {
    enum Component {
        case button
        case text
    }

    let id: String
    let title: String
    let component: Component
}

enum ComponentCatalog {
    static let examples = [
        ComponentExample(id: "components.button", title: "Button", component: .button),
        ComponentExample(id: "components.text", title: "Text", component: .text),
    ]

    static var validatedExamples: [ComponentExample] {
        precondition(Set(examples.map(\.id)).count == examples.count, "Catalog example IDs must be unique")
        precondition(examples.allSatisfy { !$0.title.isEmpty }, "Catalog example titles must not be empty")
        return examples.sorted { $0.id < $1.id }
    }
}
