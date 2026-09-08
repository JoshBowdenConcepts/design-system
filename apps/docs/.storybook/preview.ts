import type { Preview } from "@storybook/react";
import "@design-system/tokens/tokens.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: "surface",
      values: [
        { name: "surface", value: "#ffffff" },
        { name: "dark", value: "#111111" },
      ],
    },
  },
};

export default preview;
