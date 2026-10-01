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
                    List {
                        Section("Components") {
                            ForEach(ComponentCatalog.validatedExamples) { example in
                                NavigationLink(destination: gallery(for: example)) {
                                    Text(example.title)
                                }
                                .accessibilityIdentifier("catalog-\(example.id)")
                            }
                        }
                    }
                }
            }
            .navigationTitle("Components")
        }
    }

    @ViewBuilder
    private func gallery(for example: ComponentExample) -> some View {
        switch example.component {
        case .button: ButtonGalleryView()
        case .link: LinkGalleryView()
        case .text: TextGalleryView()
        }
    }
}
