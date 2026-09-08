import type { Meta, StoryObj } from "@storybook/react";
import { Placeholder } from "@design-system/components";

const meta: Meta<typeof Placeholder> = {
  title: "Components/Placeholder",
  component: Placeholder,
};
export default meta;

type Story = StoryObj<typeof Placeholder>;

export const Default: Story = {};
