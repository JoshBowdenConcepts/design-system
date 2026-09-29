import SwiftUI

struct ComponentCatalogView: View {
    var body: some View {
        NavigationView {
            Group {
                if let error = WorkbenchEnvironment.fontRegistrationError {
                    CatalogAvailabilityView(message: error)
                } else if ComponentCatalog.validatedExamples.isEmpty {
                    CatalogAvailabilityView(message: "No component examples are available.")
                } else {
                    List(ComponentCatalog.validatedExamples) { example in
                        NavigationLink(destination: ComponentExampleDetailView(example: example)) {
                            Text(example.title)
                        }
                        .accessibilityIdentifier("catalog-\(example.id)")
                    }
                }
            }
            .navigationTitle("Components")
        }
    }
}
