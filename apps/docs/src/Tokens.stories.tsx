import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { resolvedTokens, tokens } from "@design-system/tokens";

/**
 * Token documentation. The generated stylesheet
 * (`@design-system/tokens/tokens.css`, imported in `.storybook/preview.ts`)
 * provides every `--ds-*` custom property; these stories read from the same
 * source object and demonstrate override resolution through the CSS cascade.
 */

const CATEGORIES = ["type", "space", "color"] as const;

const cssVar = (name: string): string =>
  `--ds-${name.replace(/[._]/g, "-").toLowerCase()}`;

function CategoryTable({ category }: { category: string }) {
  const rows = Object.entries(tokens).filter(([name]) => name.startsWith(`${category}.`));
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2 style={{ font: "600 1.125rem/1.4 system-ui, sans-serif", margin: "0 0 0.5rem" }}>
        {category}
      </h2>
      <table style={{ borderCollapse: "collapse", width: "100%", color: "#18181b" }}>
        <thead>
          <tr>
            <th scope="col" style={th}>Token</th>
            <th scope="col" style={th}>Base value</th>
            <th scope="col" style={th}>Reference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, token]) => (
            <tr key={name}>
              <td style={td}><code>{name}</code></td>
              <td style={td}>{String(token.value)}</td>
              <td style={td}><code>var({cssVar(name)})</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const th: CSSProperties = {
  textAlign: "left",
  padding: "0.25rem 1rem 0.25rem 0",
  borderBottom: "2px solid #18181b",
  font: "600 0.875rem/1.4 system-ui, sans-serif",
};
const td: CSSProperties = {
  padding: "0.25rem 1rem 0.25rem 0",
  borderBottom: "1px solid #d4d4d8",
  font: "400 0.875rem/1.4 system-ui, sans-serif",
  verticalAlign: "top",
};

function AllTokens() {
  return (
    <div>
      {CATEGORIES.map((c) => (
        <CategoryTable key={c} category={c} />
      ))}
    </div>
  );
}

function OverrideDemo() {
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const [resolved, setResolved] = useState<{ font: string; space: string; bg: string }>({
    font: "",
    space: "",
    bg: "",
  });

  useEffect(() => {
    const el = scopeRef.current;
    if (!el) return;
    const s = getComputedStyle(el);
    setResolved({
      font: s.getPropertyValue("--ds-type-body").trim(),
      space: s.getPropertyValue("--ds-space-md").trim(),
      bg: s.getPropertyValue("--ds-color-bg").trim(),
    });
  }, [dark, compact]);

  const authored = resolvedTokens
    .filter((r) => r.name === "type.body")
    .map((r) => {
      const parts: string[] = [];
      if (r.conditions.colorMode) parts.push(r.conditions.colorMode);
      if (r.conditions.minWidth !== undefined) parts.push(`${r.conditions.minWidth}$`);
      if (r.conditions.scope) parts.push(`.${r.conditions.scope}`);
      return { key: parts.length ? parts.join(" + ") : "(base)", value: String(r.value) };
    });

  return (
    <div style={{ font: "400 0.9375rem/1.5 system-ui, sans-serif", color: "#18181b" }}>
      <fieldset style={{ border: "1px solid #d4d4d8", marginBottom: "1rem", padding: "0.75rem" }}>
        <legend>Active conditions</legend>
        <label style={{ marginRight: "1.5rem" }}>
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />{" "}
          <code>[data-theme=&quot;dark&quot;]</code>
        </label>
        <label>
          <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />{" "}
          <code>.ds-scope-compact</code>
        </label>
      </fieldset>

      <div
        ref={scopeRef}
        {...(dark ? { "data-theme": "dark" } : {})}
        className={compact ? "ds-scope-compact" : undefined}
        style={{
          background: "var(--ds-color-bg)",
          color: "var(--ds-color-fg)",
          padding: "var(--ds-space-md)",
          border: "1px solid #d4d4d8",
        }}
      >
        <p style={{ font: "var(--ds-type-body)", margin: 0 }}>
          The quick brown fox jumps over the lazy dog. This paragraph uses{" "}
          <code>font: var(--ds-type-body)</code> — one declaration for the whole type style.
        </p>
      </div>

      <dl style={{ marginTop: "1rem" }}>
        <div><dt style={dt}>Resolved <code>--ds-type-body</code></dt><dd style={dd}>{resolved.font}</dd></div>
        <div><dt style={dt}>Resolved <code>--ds-space-md</code></dt><dd style={dd}>{resolved.space}</dd></div>
        <div><dt style={dt}>Resolved <code>--ds-color-bg</code></dt><dd style={dd}>{resolved.bg}</dd></div>
      </dl>

      <h3 style={{ font: "600 1rem/1.4 system-ui, sans-serif" }}>Authored rules for <code>type.body</code></h3>
      <table style={{ borderCollapse: "collapse", color: "#18181b" }}>
        <thead>
          <tr>
            <th scope="col" style={th}>Condition</th>
            <th scope="col" style={th}>Value</th>
          </tr>
        </thead>
        <tbody>
          {authored.map((a) => (
            <tr key={a.key}>
              <td style={td}><code>{a.key}</code></td>
              <td style={td}>{a.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const dt: CSSProperties = { font: "600 0.875rem/1.4 system-ui, sans-serif", float: "left", clear: "left", marginRight: "0.5rem" };
const dd: CSSProperties = { font: "400 0.875rem/1.4 monospace", margin: "0 0 0.25rem" };

const meta: Meta = {
  title: "Tokens",
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj;

export const AllCategories: Story = { render: () => <AllTokens /> };
export const Overrides: Story = { render: () => <OverrideDemo /> };
