import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@design-system/components";
import { PlaceholderIcon } from "@design-system/icons";

const icon = <PlaceholderIcon aria-hidden />;

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Button text",
    fullWidth: false,
    contentAlignment: "center",
    leadingIcon: false,
    trailingIcon: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outline", "text"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    fullWidth: {
      control: "boolean",
    },
    contentAlignment: {
      control: "select",
      options: ["center", "space-between"],
      description: "Only meaningful when fullWidth is true.",
    },
    leadingIcon: {
      control: "boolean",
      mapping: { true: icon, false: undefined },
      description: "Pulls the icon from @design-system/icons when enabled.",
    },
    trailingIcon: {
      control: "boolean",
      mapping: { true: icon, false: undefined },
      description: "Pulls the icon from @design-system/icons when enabled.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const TextAppearance: Story = {
  args: { variant: "text" },
};

export const Small: Story = {
  args: { size: "sm" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const LeadingIcon: Story = {
  args: { leadingIcon: true },
};

export const TrailingIcon: Story = {
  args: { trailingIcon: true },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Button {...args} />
    </div>
  ),
};

export const AppearancesAndSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-200)" }}>
      {(["solid", "outline", "text"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: "var(--ds-space-200)", alignItems: "center" }}>
          <Button variant={variant} size="sm">
            Button text
          </Button>
          <Button variant={variant} size="md">
            Button text
          </Button>
        </div>
      ))}
    </div>
  ),
};

export const IconCombinations: Story = {
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--ds-space-200)",
        alignItems: args.fullWidth ? "stretch" : "flex-start",
        width: args.fullWidth ? 320 : undefined,
      }}
    >
      <Button variant={args.variant} size={args.size} fullWidth={args.fullWidth} contentAlignment={args.contentAlignment}>
        Neither
      </Button>
      <Button
        variant={args.variant}
        size={args.size}
        fullWidth={args.fullWidth}
        contentAlignment={args.contentAlignment}
        leadingIcon={icon}
      >
        Leading only
      </Button>
      <Button
        variant={args.variant}
        size={args.size}
        fullWidth={args.fullWidth}
        contentAlignment={args.contentAlignment}
        trailingIcon={icon}
      >
        Trailing only
      </Button>
      <Button
        variant={args.variant}
        size={args.size}
        fullWidth={args.fullWidth}
        contentAlignment={args.contentAlignment}
        leadingIcon={icon}
        trailingIcon={icon}
      >
        Both
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--ds-space-200)", alignItems: "center" }}>
      <Button aria-label="Add item" size="sm" leadingIcon={icon} />
      <Button aria-label="Add item" size="md" leadingIcon={icon} />
    </div>
  ),
};

export const InsideAForm: Story = {
  render: () => (
    <form
      style={{ display: "flex", gap: "var(--ds-space-200)" }}
      onSubmit={(event) => event.preventDefault()}
    >
      <Button>Default (no submit)</Button>
      <Button type="submit" variant="outline">
        Submit
      </Button>
      <Button type="reset" variant="text">
        Reset
      </Button>
    </form>
  ),
};
