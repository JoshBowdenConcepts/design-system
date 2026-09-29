import SwiftUI

struct CatalogAvailabilityView: View {
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "rectangle.stack")
                .font(.largeTitle)
                .accessibilityHidden(true)
            Text(message)
                .multilineTextAlignment(.center)
        }
        .padding()
            .accessibilityIdentifier("catalog-unavailable")
    }
}
