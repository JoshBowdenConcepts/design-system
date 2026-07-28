import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { getGroup } from "./manifest";
import { ColorSwatch, Grid, Section } from "./components";

const meta: Meta = {
  title: "Design Tokens/Color",
};
export default meta;
type Story = StoryObj;

export const Semantic: Story = {
  render: () => {
    const group = getGroup("color", "semantic");
    return (
      <Section
        title="Semantic"
        description="Mode-aware tokens that alias the palette. Use the “Color mode” toolbar control to switch between Light, Dark, and System — every swatch below (and this page) reacts live."
      >
        <Grid minWidth={220}>
          {group.tokens.map((t) => (
            <ColorSwatch key={t.key} token={t} />
          ))}
        </Grid>
      </Section>
    );
  },
};
