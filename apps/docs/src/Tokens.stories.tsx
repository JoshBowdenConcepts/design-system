import type { Meta, StoryObj } from "@storybook/react";
import { tokens } from "@design-system/tokens";

/**
 * Placeholder token story. Reads the value from `@design-system/tokens` and
 * also shows the resolved CSS custom property (`--ds-placeholder`) coming from
 * `@design-system/tokens/tokens.css` (imported in `.storybook/preview.ts`).
 */
function TokenTable() {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ textAlign: "left", paddingRight: "2rem" }}>Token</th>
          <th style={{ textAlign: "left", paddingRight: "2rem" }}>Source value</th>
          <th style={{ textAlign: "left" }}>CSS custom property</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(tokens).map(([name, token]) => (
          <tr key={name}>
            <td style={{ paddingRight: "2rem" }}>
              <code>{name}</code>
            </td>
            <td style={{ paddingRight: "2rem" }}>{String(token.value)}</td>
            <td>
              <code>var(--ds-{name})</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const meta: Meta<typeof TokenTable> = {
  title: "Tokens/Placeholder",
  component: TokenTable,
};
export default meta;

type Story = StoryObj<typeof TokenTable>;

export const AllTokens: Story = {};
