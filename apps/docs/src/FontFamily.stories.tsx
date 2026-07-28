import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { getGroup } from "./manifest";
import { FontFamilySpecimen, Section } from "./components";

const meta: Meta = {
  title: "Design Tokens/Font Family",
};
export default meta;
type Story = StoryObj;

export const Families: Story = {
  render: () => {
    const group = getGroup("font-family", "font");
    return (
      <Section
        title="Font Family"
        description="Manrope for headings, Inter for body & data, and JetBrains Mono for code/tabular text. Webfonts are pulled from Google Fonts via a single @import in the generated CSS (display=swap), with system fallbacks so text renders immediately."
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          {group.tokens.map((t) => (
            <FontFamilySpecimen key={t.key} token={t} />
          ))}
        </div>
      </Section>
    );
  },
};
