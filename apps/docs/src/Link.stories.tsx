import type { Meta, StoryObj } from "@storybook/react";
import { Link, Text } from "@design-system/components";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  args: {
    href: "#",
    children: "Link text",
    standalone: false,
    external: false,
  },
  argTypes: {
    href: {
      control: "text",
      description: "Omit (undefined) to render the unavailable presentation.",
    },
    size: {
      control: "select",
      options: [undefined, "p", "p-sm", "label", "caption"],
      description: "Omitted inherits the surrounding text's size.",
    },
    standalone: {
      control: "boolean",
      description: "Meets the 24×24 minimum interactive target.",
    },
    external: {
      control: "boolean",
      description:
        "Shows the hidden-from-AT indicator and opens safely outside the current context.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {};

export const InlineInParagraph: Story = {
  render: () => (
    <Text as="p" variant="p" style={{ maxWidth: "var(--ds-layout-measure)" }}>
      Links inside running text inherit the paragraph style and are always
      underlined, so they never rely on color alone. Read the{" "}
      <Link href="#">accessibility guide</Link> before shipping.
    </Text>
  ),
};

export const InlineInSmallParagraph: Story = {
  render: () => (
    <Text
      as="p"
      variant="p-sm"
      style={{
        maxWidth: "var(--ds-layout-measure)",
        color: "var(--ds-color-text-secondary)",
      }}
    >
      Smaller copy works the same way. See the{" "}
      <Link href="#">release notes</Link> for details.
    </Text>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--ds-space-200)",
        alignItems: "flex-start",
      }}
    >
      <Link href="#">
        Inherit (default — matches this paragraph's ambient size)
      </Link>
      {(["p", "p-sm", "label", "caption"] as const).map((size) => (
        <Link key={size} href="#" size={size}>
          Link text ({size})
        </Link>
      ))}
    </div>
  ),
};

export const Standalone: Story = {
  args: { standalone: true, size: "label" },
};

export const External: Story = {
  args: { external: true, children: "Status page" },
};

export const Unavailable: Story = {
  render: () => <Link>Link text</Link>,
};

export const AllStatesAtEachSize: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px max-content max-content",
        gap: "var(--ds-space-300) var(--ds-space-600)",
        alignItems: "center",
      }}
    >
      <div />
      <Text
        as="span"
        variant="label"
        style={{ color: "var(--ds-color-text-secondary)" }}
      >
        Small
      </Text>
      <Text
        as="span"
        variant="label"
        style={{ color: "var(--ds-color-text-secondary)" }}
      >
        Medium
      </Text>

      <Text as="span" variant="label">
        Default
      </Text>
      <Link href="#" size="label">
        Link text
      </Link>
      <Link href="#" size="p">
        Link text
      </Link>

      <Text as="span" variant="label">
        External
      </Text>
      <Link href="#" size="label" external>
        Link text
      </Link>
      <Link href="#" size="p" external>
        Link text
      </Link>

      <Text as="span" variant="label">
        Unavailable
      </Text>
      <Link size="label">Link text</Link>
      <Link size="p">Link text</Link>
    </div>
  ),
};
