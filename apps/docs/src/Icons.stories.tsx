import type { Meta, StoryObj } from "@storybook/react";
import { PlaceholderIcon } from "@design-system/icons";

const meta: Meta<typeof PlaceholderIcon> = {
  title: "Icons/Placeholder",
  component: PlaceholderIcon,
  args: { "aria-label": "Placeholder icon", role: "img" },
};
export default meta;

type Story = StoryObj<typeof PlaceholderIcon>;

export const Default: Story = {};

export const Large: Story = {
  args: { style: { fontSize: "3rem" } },
};
