import SwiftUI
import DesignSystemTokens

enum WorkbenchEnvironment {
    static let fontRegistrationError: String? = {
        do {
            try DesignSystemTokenFonts.register()
            return nil
        } catch {
            return "Design-system fonts are unavailable. Run pnpm build and reopen the workbench."
        }
    }()
}

@main
struct WorkbenchApp: App {
    var body: some Scene {
        WindowGroup {
            ComponentCatalogView()
        }
    }
}
