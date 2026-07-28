import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { getGroup } from "./manifest";
import { Section, SpaceRow } from "./components";

const meta: Meta = {
  title: "Design Tokens/Space",
};
export default meta;
type Story = StoryObj;

export const Scale: Story = {
  render: () => {
    const group = getGroup("space");
    return (
      <Section
        title="Spacing"
        description="Rem-based spacing scale (1rem = 16px). Key 100 = 8px, so rem = key / 200. Fine steps (25/50/75) cover 2–6px; the main scale steps by hundreds up to 1000 (80px)."
      >
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {group.tokens.map((t) => (
            <SpaceRow key={t.key} token={t} />
          ))}
        </div>
      </Section>
    );
  },
};
