import type { Decorator, Preview } from "@storybook/react";
import "@design-system/tokens/tokens.css";

/**
 * Colour-mode switcher. The toolbar control (top of the window, "Theme") sets
 * `data-theme` on a wrapper around every story, so `--ds-*` tokens re-resolve
 * through the CSS cascade — the same mechanism a consuming app uses. Stories
 * render on `--ds-color-bg` / `--ds-color-text-primary` so they follow it.
 */
const withTheme: Decorator = (Story, context) => {
  const dark = context.globals.theme === "dark";
  return (
    <div
      {...(dark ? { "data-theme": "dark" } : {})}
      style={{
        background: "var(--ds-color-bg)",
        color: "var(--ds-color-text-primary)",
        font: "var(--ds-type-p)",
        padding: "1.5rem",
        minHeight: "100vh",
      }}
    >
      <Story />
    </div>
  );
};

export const globalTypes = {
  theme: {
    description: "Colour mode",
    toolbar: {
      title: "Theme",
      icon: "circlehollow",
      items: [
        { value: "light", title: "Light", icon: "sun" },
        { value: "dark", title: "Dark", icon: "moon" },
      ],
      dynamicTitle: true,
    },
  },
};

export const initialGlobals = { theme: "light" };

export const decorators = [withTheme];

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
