import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "@design-system/components";

const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
  args: {
    children: "The quick brown fox jumps over the lazy dog.",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["p", "span", "div", "h1", "h2", "h3", "h4", "label", "strong"],
    },
    variant: {
      control: "select",
      options: ["display", "h1", "h2", "h3", "h4", "p", "p-sm", "label", "caption", "overline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {};

export const SemanticHeading: Story = {
  args: {
    as: "h2",
    variant: "h2",
    children: "Section heading",
  },
};

export const LabelExample: Story = {
  render: () => (
    <Text as="label" htmlFor="email" variant="label">
      Email address
    </Text>
  ),
};

export const VariantOverride: Story = {
  render: () => (
    <>
      <Text as="p" variant="p-sm">Paragraph default variant</Text>
      <Text as="h3" variant="display">Display variant on a heading</Text>
    </>
  ),
};
