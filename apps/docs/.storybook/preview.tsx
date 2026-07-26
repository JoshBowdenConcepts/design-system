import type { Decorator, Preview } from "@storybook/react";
import React, { useEffect } from "react";

// Generated token custom properties (includes color-mode scoping).
import "@design-system/tokens/css";

const withColorMode: Decorator = (Story, context) => {
  const mode = context.globals.colorMode as string;

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") {
      root.removeAttribute("data-color-mode");
    } else {
      root.setAttribute("data-color-mode", mode);
    }
  }, [mode]);

  return (
    <div
      style={{
        background: "var(--color-bg-canvas)",
        color: "var(--color-text-primary)",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        minHeight: "100vh",
        padding: "1.5rem",
        transition: "background 200ms ease, color 200ms ease",
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
  },
  globalTypes: {
    colorMode: {
      description: "Color mode",
      defaultValue: "light",
      toolbar: {
        title: "Color mode",
        icon: "contrast",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "system", title: "System", icon: "browser" },
        ],
      },
    },
  },
  decorators: [withColorMode],
};

export default preview;
