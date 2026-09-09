import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties, ReactNode } from "react";
import { resolvedTokens, tokens } from "@design-system/tokens";

/**
 * Token reference. Every specimen consumes the generated stylesheet
 * (`@design-system/tokens/tokens.css`, imported in `.storybook/preview.tsx`)
 * via `var(--ds-*)`, so the toolbar **Theme** switch (top of the window) drives
 * every colour, and resizing the window drives the responsive `layout.gutter`.
 */

const meta: Meta = { title: "Tokens" };
export default meta;
type Story = StoryObj;

/* ----------------------------------------------------------------- helpers */

const cssVar = (name: string): string => `--ds-${name.replace(/[._]/g, "-")}`;

/** Authored (light) literal value. Colour leaves are already palette-resolved. */
const lightValue = (name: string): string => String(tokens[name]?.value ?? "");

/** The `dark` colour-mode override's value, or the light value if there's none. */
const darkValue = (name: string): string => {
  const rule = resolvedTokens.find(
    (r) =>
      r.name === name &&
      r.conditions.colorMode === "dark" &&
      r.conditions.minWidth === undefined &&
      r.conditions.scope === undefined,
  );
  return rule ? String(rule.value) : lightValue(name);
};

/** Non-base rules for a token, rendered as `cond → value`. */
const overrideSummary = (name: string): string => {
  const rules = resolvedTokens.filter((r) => r.name === name && r.specificity > 0);
  if (rules.length === 0) return "—";
  return rules
    .map((r) => {
      const parts: string[] = [];
      if (r.conditions.colorMode) parts.push(r.conditions.colorMode);
      if (r.conditions.minWidth !== undefined) parts.push(`${r.conditions.minWidth}$`);
      if (r.conditions.scope) parts.push(`.${r.conditions.scope}`);
      return `${parts.join(" + ")} → ${String(r.value)}`;
    })
    .join(", ");
};

const keysFor = (category: string): string[] =>
  Object.keys(tokens)
    .filter((n) => n.startsWith(`${category}.`))
    .map((n) => n.slice(category.length + 1));

/** Numeric-aware sort for `space` / `radius` steps. */
const numericSort = (a: string, b: string): number => {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isNaN(na) || Number.isNaN(nb)) return a < b ? -1 : a > b ? 1 : 0;
  return na - nb;
};

/* ------------------------------------------------------------------ layout */

function Page({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div style={{ maxWidth: "var(--ds-layout-max-width)" }}>
      <h1 style={{ font: "var(--ds-type-h1)", margin: "0 0 0.5rem" }}>{title}</h1>
      <p
        style={{
          font: "var(--ds-type-p)",
          color: "var(--ds-color-text-secondary)",
          maxWidth: "var(--ds-layout-measure)",
          margin: "0 0 var(--ds-space-600)",
        }}
      >
        {intro}
      </p>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: "var(--ds-space-800)" }}>
      <h2
        style={{
          font: "var(--ds-type-h3)",
          margin: "0 0 var(--ds-space-300)",
          paddingBottom: "var(--ds-space-100)",
          borderBottom: "1px solid var(--ds-color-border)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

const meta1: CSSProperties = {
  font: "var(--ds-type-overline)",
  color: "var(--ds-color-text-secondary)",
};
const mono: CSSProperties = { font: "var(--ds-type-overline)", color: "var(--ds-color-text-secondary)" };
const grid = (min: string): CSSProperties => ({
  display: "grid",
  gap: "var(--ds-space-300)",
  gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))`,
});

/* ------------------------------------------------------------------ colour */

const COLOR_GROUPS: ReadonlyArray<{ label: string; keys: readonly string[] }> = [
  { label: "Surfaces", keys: ["bg", "bg-raised", "bg-sunken"] },
  { label: "Text", keys: ["text-primary", "text-secondary", "text-tertiary"] },
  { label: "Borders", keys: ["border", "border-strong"] },
  { label: "Primary", keys: ["primary", "primary-hover", "primary-subtle", "on-primary", "focus-ring"] },
  { label: "Status", keys: ["success", "info", "warning", "danger"] },
];

function Swatch({ k }: { k: string }) {
  const name = `color.${k}`;
  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          height: 72,
          borderRadius: "var(--ds-radius-300)",
          background: `var(${cssVar(name)})`,
          border: "1px solid var(--ds-color-border)",
        }}
      />
      <figcaption style={{ marginTop: "var(--ds-space-100)" }}>
        <div style={{ font: "var(--ds-type-label)" }}>{k}</div>
        <div style={mono}>var({cssVar(name)})</div>
        <div style={mono}>
          light {lightValue(name)} · dark {darkValue(name)}
        </div>
      </figcaption>
    </figure>
  );
}

function Pairing({ fg, bg, label }: { fg: string; bg: string; label: string }) {
  return (
    <div
      style={{
        background: `var(${cssVar(`color.${bg}`)})`,
        color: `var(${cssVar(`color.${fg}`)})`,
        border: "1px solid var(--ds-color-border)",
        borderRadius: "var(--ds-radius-300)",
        padding: "var(--ds-space-300)",
        font: "var(--ds-type-h4)",
      }}
    >
      {label}
      <div style={{ font: "var(--ds-type-overline)", marginTop: "var(--ds-space-50)" }}>
        {fg} on {bg}
      </div>
    </div>
  );
}

export const Colors: Story = {
  render: () => (
    <Page
      title="Colour"
      intro="Semantic roles only — the numbered emerald / neutral ramps live in the private palette. Base value is the light-mode colour; every role also carries a dark value. Flip the Theme switch to compare."
    >
      {COLOR_GROUPS.map((g) => (
        <Section key={g.label} title={g.label}>
          <div style={grid("200px")}>
            {g.keys.map((k) => (
              <Swatch key={k} k={k} />
            ))}
          </div>
        </Section>
      ))}
      <Section title="Pairings">
        <div style={grid("240px")}>
          <Pairing fg="text-primary" bg="bg" label="Body text" />
          <Pairing fg="text-secondary" bg="bg-raised" label="Secondary text" />
          <Pairing fg="on-primary" bg="primary" label="Primary button" />
          <Pairing fg="primary" bg="primary-subtle" label="Selected row" />
        </div>
      </Section>
    </Page>
  ),
};

/* -------------------------------------------------------------- typography */

function TypeRow({ k }: { k: string }) {
  const name = `type.${k}`;
  return (
    <div style={{ padding: "var(--ds-space-300) 0", borderBottom: "1px solid var(--ds-color-border)" }}>
      <div style={{ font: `var(${cssVar(name)})` }}>
        Grumpy wizards make toxic brew for the evil Queen and Jack.
      </div>
      <div style={{ ...meta1, marginTop: "var(--ds-space-100)" }}>
        {k} · {lightValue(name)}
      </div>
    </div>
  );
}

export const Typography: Story = {
  render: () => (
    <Page
      title="Typography"
      intro="Each token is one complete CSS font shorthand — apply a whole style with font: var(--ds-type-h1). Bricolage Grotesque for display sizes, Public Sans for text, IBM Plex Mono for overline. Fonts load from an @import at the top of tokens.css."
    >
      {keysFor("type").map((k) => (
        <TypeRow key={k} k={k} />
      ))}
    </Page>
  ),
};

/* ------------------------------------------------------------- spacing */

export const Spacing: Story = {
  render: () => (
    <Page
      title="Spacing"
      intro="8px base unit = space.100; the step number tracks that multiple ×100. space.25 / space.50 are the sub-base exceptions. Only these steps ship."
    >
      <div style={{ display: "grid", gap: "var(--ds-space-200)" }}>
        {keysFor("space")
          .sort(numericSort)
          .map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-300)" }}>
              <div style={{ width: 120, font: "var(--ds-type-label)" }}>space.{k}</div>
              <div style={{ width: 64, ...mono }}>{lightValue(`space.${k}`)}</div>
              <div
                style={{
                  height: 16,
                  width: `var(${cssVar(`space.${k}`)})`,
                  background: "var(--ds-color-primary)",
                  borderRadius: "var(--ds-radius-100)",
                }}
              />
            </div>
          ))}
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------------- radius */

export const Radius: Story = {
  render: () => (
    <Page title="Radius" intro="Ordinal steps in hundreds, plus radius.full for pills. 100 tags · 200 inputs · 300 cards · 400 sheets · full buttons / avatars.">
      <div style={grid("160px")}>
        {keysFor("radius")
          .sort(numericSort)
          .map((k) => (
            <figure key={k} style={{ margin: 0 }}>
              <div
                style={{
                  height: 96,
                  background: "var(--ds-color-primary-subtle)",
                  border: "2px solid var(--ds-color-primary)",
                  borderRadius: `var(${cssVar(`radius.${k}`)})`,
                }}
              />
              <figcaption style={{ marginTop: "var(--ds-space-100)" }}>
                <div style={{ font: "var(--ds-type-label)" }}>radius.{k}</div>
                <div style={mono}>{lightValue(`radius.${k}`)}</div>
              </figcaption>
            </figure>
          ))}
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------------- layout */

export const Layout: Story = {
  render: () => (
    <Page
      title="Layout"
      intro="Structural values that aren't spacing steps. layout.gutter is the one responsive token — resize the window to watch it step up at 768 and 1024."
    >
      <Section title="Values">
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {["Token", "Base", "Overrides", "Reference"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  style={{
                    textAlign: "left",
                    font: "var(--ds-type-label)",
                    padding: "0 var(--ds-space-300) var(--ds-space-100) 0",
                    borderBottom: "2px solid var(--ds-color-border-strong)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keysFor("layout").map((k) => (
              <tr key={k}>
                <td style={cell}><code style={mono}>layout.{k}</code></td>
                <td style={cell}>{lightValue(`layout.${k}`)}</td>
                <td style={cell}>{overrideSummary(`layout.${k}`)}</td>
                <td style={cell}><code style={mono}>var({cssVar(`layout.${k}`)})</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="gutter">
        <div
          style={{
            border: "1px dashed var(--ds-color-border-strong)",
            padding: "var(--ds-layout-gutter)",
            borderRadius: "var(--ds-radius-300)",
          }}
        >
          <div
            style={{
              background: "var(--ds-color-primary-subtle)",
              border: "1px solid var(--ds-color-primary)",
              borderRadius: "var(--ds-radius-200)",
              padding: "var(--ds-space-200)",
              font: "var(--ds-type-p-sm)",
            }}
          >
            This box is inset by <code style={mono}>var(--ds-layout-gutter)</code>.
          </div>
        </div>
      </Section>

      <Section title="measure">
        <p style={{ font: "var(--ds-type-p)", maxWidth: "var(--ds-layout-measure)", margin: 0 }}>
          Body copy is capped at <code style={mono}>var(--ds-layout-measure)</code> so line length
          stays readable. This paragraph is exactly that wide — around 68 characters per line, the
          upper end of comfortable reading.
        </p>
      </Section>
    </Page>
  ),
};

const cell: CSSProperties = {
  font: "var(--ds-type-p-sm)",
  padding: "var(--ds-space-150) var(--ds-space-300) var(--ds-space-150) 0",
  borderBottom: "1px solid var(--ds-color-border)",
  verticalAlign: "top",
};

/* ------------------------------------------------------- override model */

export const Overrides: Story = {
  render: () => (
    <Page
      title="Override resolution"
      intro="A token's base value plus its axis-marked overrides flatten to one rule per condition-set, ordered by specificity. The cascade — not any runtime code — picks the winner. resolvedTokens exposes the same data to non-CSS consumers."
    >
      {["color.bg", "color.primary", "layout.gutter"].map((name) => (
        <Section key={name} title={name}>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Condition", "Value", "Specificity"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    style={{
                      textAlign: "left",
                      font: "var(--ds-type-label)",
                      padding: "0 var(--ds-space-400) var(--ds-space-100) 0",
                      borderBottom: "2px solid var(--ds-color-border-strong)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resolvedTokens
                .filter((r) => r.name === name)
                .map((r, i) => {
                  const parts: string[] = [];
                  if (r.conditions.colorMode) parts.push(r.conditions.colorMode);
                  if (r.conditions.minWidth !== undefined) parts.push(`${r.conditions.minWidth}$`);
                  if (r.conditions.scope) parts.push(`.${r.conditions.scope}`);
                  return (
                    <tr key={i}>
                      <td style={cell}><code style={mono}>{parts.join(" + ") || "(base)"}</code></td>
                      <td style={cell}>{String(r.value)}</td>
                      <td style={cell}>{r.specificity}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Section>
      ))}
    </Page>
  ),
};
