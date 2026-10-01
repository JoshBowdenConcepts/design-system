import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Link } from "../src/Link.js";
import linkStyles from "../src/Link.module.css";
import textStyles from "../src/Text.module.css";

describe("Link — inline in running text (US1)", () => {
  it("inherits the surrounding text's size when no size is set", () => {
    render(<Link href="/docs">accessibility guide</Link>);
    const span = screen.getByText("accessibility guide");
    // The nested Text renders `as="span"` with no variant, which resolves to
    // `font: inherit` (Text.module.css `.default-span`) — the same mechanism
    // regardless of what surrounding size wraps it (D3).
    expect(span.className).toContain(textStyles["default-span"]);
    expect(span.className).not.toMatch(/variant-/);
  });

  it.each(["p", "p-sm", "label", "caption"] as const)(
    "applies the %s size via the underlying Text variant",
    (size) => {
      render(
        <Link href="/docs" size={size}>
          Read the docs
        </Link>,
      );
      const span = screen.getByText("Read the docs");
      expect(span.className).toContain(textStyles[`variant-${size}`]);
    },
  );

  it("is underlined in the resting state regardless of size", () => {
    render(<Link href="/docs">Read the docs</Link>);
    const link = screen.getByRole("link", { name: "Read the docs" });
    expect(link.className).toContain(linkStyles.link);
  });

  it("renders a real anchor with the given destination", () => {
    render(<Link href="/docs">Read the docs</Link>);
    expect(screen.getByRole("link", { name: "Read the docs" })).toHaveAttribute(
      "href",
      "/docs",
    );
  });

  it("forwards ref to the native anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link href="/docs" ref={ref}>
        Read the docs
      </Link>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("invokes the click handler once when activated with a pointer", () => {
    const onClick = vi.fn();
    render(
      <Link href="/docs" onClick={onClick}>
        Read the docs
      </Link>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Read the docs" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is reachable and operable by keyboard", () => {
    render(<Link href="/docs">Read the docs</Link>);
    const link = screen.getByRole("link", { name: "Read the docs" });
    link.focus();
    expect(document.activeElement).toBe(link);
  });

  it("merges a consumer className alongside the generated classes", () => {
    render(
      <Link href="/docs" className="consumer-class">
        Read the docs
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Read the docs" });
    expect(link.className).toContain("consumer-class");
    expect(link.className).toContain(linkStyles.link);
  });
});

describe("Link — standalone presentation (US2)", () => {
  it("does not apply the standalone minimum target by default (inline)", () => {
    render(<Link href="/docs">Read the docs</Link>);
    const link = screen.getByRole("link", { name: "Read the docs" });
    expect(link.className).not.toContain(linkStyles.standalone);
  });

  it.each(["p", "p-sm", "label", "caption"] as const)(
    "applies the 24×24 minimum target at the %s size when standalone",
    (size) => {
      render(
        <Link href="/docs" standalone size={size}>
          View all projects
        </Link>,
      );
      const link = screen.getByRole("link", { name: "View all projects" });
      expect(link.className).toContain(linkStyles.standalone);
    },
  );

  it("shows the shared focus-ring treatment class hook when focused via keyboard", () => {
    render(
      <Link href="/docs" standalone>
        View all projects
      </Link>,
    );
    const link = screen.getByRole("link", { name: "View all projects" });
    link.focus();
    expect(document.activeElement).toBe(link);
    expect(link.className).toContain(linkStyles.link);
  });
});

describe("Link — external destinations (US3)", () => {
  it("shows no external indicator or new-context announcement by default", () => {
    render(<Link href="https://example.com">Status page</Link>);
    const link = screen.getByRole("link", { name: "Status page" });
    expect(link.querySelector(`.${linkStyles["external-indicator"]}`)).toBeNull();
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("shows an aria-hidden indicator and includes a new-context statement in the accessible name when external", () => {
    render(
      <Link href="https://example.com" external>
        Status page
      </Link>,
    );
    const link = screen.getByRole("link", {
      name: "Status page (opens in a new tab)",
    });
    const indicator = link.querySelector(`.${linkStyles["external-indicator"]}`);
    expect(indicator).not.toBeNull();
    expect(indicator).toHaveAttribute("aria-hidden", "true");
  });

  it("opens in a new browsing context with no opener access when external", () => {
    render(
      <Link href="https://example.com" external>
        Status page
      </Link>,
    );
    const link = screen.getByRole("link", { name: /Status page/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("Link — unavailable destination (US4)", () => {
  it("renders de-emphasized text with no link role when href is omitted", () => {
    render(<Link>Link text</Link>);
    expect(screen.queryByRole("link")).toBeNull();
    const span = screen.getByText("Link text");
    expect(span.className).toContain(linkStyles.unavailable);
  });

  it("has no href and is not reachable by keyboard Tab order", () => {
    render(<Link>Link text</Link>);
    const span = screen.getByText("Link text");
    expect(span).not.toHaveAttribute("href");
    expect(span).not.toHaveAttribute("tabindex");
  });

  it("ignores external/standalone when no destination is given", () => {
    render(
      <Link external standalone>
        Link text
      </Link>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(
      screen.queryByText("(opens in a new tab)"),
    ).toBeNull();
  });
});
