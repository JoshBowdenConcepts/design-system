import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties, ReactNode } from "react";
import { resolvedTokens, tokens } from "@design-system/tokens";

const meta: Meta = { title: "Style Guide" };
export default meta;
type Story = StoryObj;

const variable = (name: string): string => `--ds-${name.replace(/[._]/g, "-")}`;
const tokenValue = (name: string): string => String(tokens[name]?.value ?? "");
const keysFor = (category: string): string[] =>
  Object.keys(tokens)
    .filter((name) => name.startsWith(`${category}.`))
    .map((name) => name.slice(category.length + 1));

const mono: CSSProperties = {
  font: "var(--ds-type-overline)",
  color: "var(--ds-color-text-secondary)",
};

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: "clamp(3rem, 7vw, 7rem)" }}>
      <div style={{ ...mono, textTransform: "uppercase", marginBottom: "var(--ds-space-100)" }}>{eyebrow}</div>
      <h2 style={{ font: "var(--ds-type-h2)", margin: "0 0 var(--ds-space-400)" }}>{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ name }: { name: string }) {
  return (
    <div>
      <div
        style={{
          aspectRatio: "1.35",
          background: `var(${variable(name)})`,
          border: "1px solid var(--ds-color-border)",
          borderRadius: "var(--ds-radius-200)",
        }}
      />
      <div style={{ font: "var(--ds-type-label)", marginTop: "var(--ds-space-100)" }}>{name.replace("color.", "")}</div>
      <div style={mono}>{variable(name)}</div>
    </div>
  );
}

function TokenList({ category }: { category: string }) {
  return (
    <div style={{ display: "grid", gap: "var(--ds-space-200)" }}>
      {keysFor(category).map((key) => {
        const name = `${category}.${key}`;
        return (
          <div key={name} style={{ display: "grid", gridTemplateColumns: "minmax(90px, 0.7fr) 1fr", gap: "var(--ds-space-300)", alignItems: "center" }}>
            <div style={mono}>{key}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-200)" }}>
              <div style={{ flex: 1, height: 8, background: category === "space" ? "var(--ds-color-primary)" : "var(--ds-color-primary-subtle)", borderRadius: `var(${variable("radius.100")})`, maxWidth: category === "space" ? `var(${variable(name)})` : undefined }} />
              <div style={{ ...mono, minWidth: 52, textAlign: "right" }}>{tokenValue(name)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OverridePanel() {
  const rules = resolvedTokens.filter((rule) => rule.name === "color.bg");
  return (
    <div
      style={{
        border: "1px solid var(--ds-color-border-strong)",
        borderRadius: "var(--ds-radius-300)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "var(--ds-space-300)", background: "var(--ds-color-bg-raised)", borderBottom: "1px solid var(--ds-color-border)" }}>
        <div style={{ font: "var(--ds-type-label)" }}>color.bg</div>
        <div style={mono}>one token, five condition sets</div>
      </div>
      {rules.map((rule) => {
        const conditions = [
          rule.conditions.colorMode,
          rule.conditions.minWidth === undefined ? undefined : `${rule.conditions.minWidth}$`,
          rule.conditions.scope === undefined ? undefined : `.${rule.conditions.scope}`,
        ].filter(Boolean).join(" + ") || "base";
        return (
          <div key={conditions} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--ds-space-300)", padding: "var(--ds-space-200) var(--ds-space-300)", borderBottom: "1px solid var(--ds-color-border)" }}>
            <code style={mono}>{conditions}</code>
            <span style={{ font: "var(--ds-type-label)" }}>{String(rule.value)}</span>
          </div>
        );
      })}
      <div
        data-theme="dark"
        style={{ padding: "var(--ds-space-300)", background: "var(--ds-color-bg)", color: "var(--ds-color-text-primary)" }}
      >
        <div className="ds-scope-compact" style={{ padding: "var(--ds-space-200)", background: "var(--ds-color-bg)" }}>
          <div style={{ font: "var(--ds-type-label)" }}>Triple override</div>
          <div style={mono}>dark + 768$ + .compact</div>
        </div>
      </div>
    </div>
  );
}

export const Overview: Story = {
  render: () => (
    <main style={{ maxWidth: "var(--ds-layout-max-width)", margin: "0 auto", padding: "clamp(1rem, 4vw, 3rem) var(--ds-layout-gutter) 6rem" }}>
      <header style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(220px, 0.6fr)", gap: "var(--ds-space-800)", alignItems: "end", paddingBottom: "clamp(3rem, 8vw, 8rem)", borderBottom: "1px solid var(--ds-color-border)" }}>
        <div>
          <div style={{ ...mono, textTransform: "uppercase", marginBottom: "var(--ds-space-300)" }}>DS / 01</div>
          <h1 style={{ font: "var(--ds-type-display)", letterSpacing: 0, margin: 0, maxWidth: "12ch" }}>A quiet system with a clear point of view.</h1>
        </div>
        <p style={{ font: "var(--ds-type-p-sm)", color: "var(--ds-color-text-secondary)", maxWidth: "var(--ds-layout-measure)", margin: 0 }}>
          The shared language for surfaces, type, space, and interaction. Built from semantic tokens so every screen can move together.
        </p>
      </header>

      <Section eyebrow="01 / Color" title="Roles before ramps">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--ds-space-300)" }}>
          {["color.bg", "color.bg-raised", "color.bg-sunken", "color.text-primary", "color.primary", "color.primary-subtle", "color.info", "color.danger"].map((name) => <Swatch key={name} name={name} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--ds-space-300)", marginTop: "var(--ds-space-600)" }}>
          {["text-primary on bg", "on-primary on primary", "primary on primary-subtle"].map((label) => {
            const [fg, bg] = label.split(" on ");
            return <div key={label} style={{ background: `var(${variable(`color.${bg}`)})`, color: `var(${variable(`color.${fg}`)})`, padding: "var(--ds-space-400)", borderRadius: "var(--ds-radius-300)", font: "var(--ds-type-h4)" }}>{label}</div>;
          })}
        </div>
      </Section>

      <Section eyebrow="02 / Type" title="A readable scale with a little character">
        <div style={{ display: "grid", gap: "var(--ds-space-400)" }}>
          {keysFor("type").map((key) => <div key={key} style={{ borderBottom: "1px solid var(--ds-color-border)", paddingBottom: "var(--ds-space-300)" }}><div style={{ font: `var(${variable(`type.${key}`)})` }}>The quick brown fox jumps over the lazy dog.</div><div style={{ ...mono, marginTop: "var(--ds-space-100)" }}>type.{key}</div></div>)}
        </div>
      </Section>

      <Section eyebrow="03 / Rhythm" title="Space and shape">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--ds-space-800)" }}><div><div style={{ ...mono, marginBottom: "var(--ds-space-300)" }}>SPACE</div><TokenList category="space" /></div><div><div style={{ ...mono, marginBottom: "var(--ds-space-300)" }}>RADIUS</div><div style={{ display: "flex", gap: "var(--ds-space-300)", flexWrap: "wrap" }}>{keysFor("radius").map((key) => <div key={key} style={{ width: 72, height: 72, background: "var(--ds-color-primary-subtle)", border: "2px solid var(--ds-color-primary)", borderRadius: `var(${variable(`radius.${key}`)})` }} title={`radius.${key}`} />)}</div></div></div>
      </Section>

      <Section eyebrow="04 / States" title="A small set of dependable actions">
        <div style={{ display: "flex", gap: "var(--ds-space-200)", flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" style={{ border: 0, borderRadius: "var(--ds-radius-full)", background: "var(--ds-color-primary)", color: "var(--ds-color-on-primary)", padding: "0.75rem 1.25rem", font: "var(--ds-type-label)" }}>Continue</button>
          <button type="button" style={{ border: "1px solid var(--ds-color-border-strong)", borderRadius: "var(--ds-radius-full)", background: "transparent", color: "var(--ds-color-text-primary)", padding: "0.7rem 1.25rem", font: "var(--ds-type-label)" }}>Secondary</button>
          <span style={{ padding: "var(--ds-space-100) var(--ds-space-200)", borderRadius: "var(--ds-radius-full)", background: "var(--ds-color-primary-subtle)", color: "var(--ds-color-primary)", font: "var(--ds-type-overline)" }}>ACTIVE</span>
        </div>
      </Section>

      <Section eyebrow="05 / Overrides" title="One token, every context">
        <OverridePanel />
      </Section>
    </main>
  ),
};