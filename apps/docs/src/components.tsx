import React from "react";
import type { TokenManifestEntry } from "@design-system/tokens";

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          margin: "0 0 0.5rem",
          color: "var(--color-text-primary)",
        }}
      >
        {title}
      </h2>
      {description ? (
        <p
          style={{
            color: "var(--color-text-secondary)",
            margin: "0 0 1.25rem",
            maxWidth: "60ch",
          }}
        >
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}

export function Grid({
  minWidth = 200,
  children,
}: {
  minWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--color-border-default)",
  borderRadius: "0.5rem",
  background: "var(--color-bg-surface-raised)",
  overflow: "hidden",
};

const monoStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontSize: "0.75rem",
  color: "var(--color-text-secondary)",
};

export function ColorSwatch({ token }: { token: TokenManifestEntry }) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          height: 72,
          background: token.cssRef,
          borderBottom: "1px solid var(--color-border-default)",
        }}
      />
      <div style={{ padding: "0.75rem", display: "grid", gap: 6 }}>
        <strong
          style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}
        >
          {token.key}
        </strong>
        {token.kind === "primitive" ? (
          <span style={monoStyle}>{token.value}</span>
        ) : (
          <div style={{ display: "grid", gap: 2 }}>
            {Object.entries(token.modes).map(([mode, { ref, value }]) => (
              <span key={mode} style={monoStyle}>
                <span style={{ opacity: 0.7 }}>{mode}</span> → {ref} ({value})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
