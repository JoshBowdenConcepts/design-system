import { createRef } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../src/Button.js";
import styles from "../src/Button.module.css";

describe("Button — appearances and sizes (US1)", () => {
  it.each([
    ["solid", "sm"],
    ["solid", "md"],
    ["outline", "sm"],
    ["outline", "md"],
    ["text", "sm"],
    ["text", "md"],
  ] as const)("applies the %s appearance at the %s size", (variant, size) => {
    render(
      <Button variant={variant} size={size}>
        Action
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Action" });
    expect(button.className).toContain(styles[`variant-${variant}`]);
    expect(button.className).toContain(styles[`size-${size}`]);
  });

  it("defaults to the solid appearance at the md size", () => {
    render(<Button>Action</Button>);
    const button = screen.getByRole("button", { name: "Action" });
    expect(button.className).toContain(styles["variant-solid"]);
    expect(button.className).toContain(styles["size-md"]);
  });

  it("renders all four leading/trailing icon combinations", () => {
    const leading = <svg data-testid="leading-icon" />;
    const trailing = <svg data-testid="trailing-icon" />;

    const { rerender } = render(<Button>Neither</Button>);
    expect(screen.queryByTestId("leading-icon")).toBeNull();
    expect(screen.queryByTestId("trailing-icon")).toBeNull();

    rerender(<Button leadingIcon={leading}>Leading only</Button>);
    expect(screen.getByTestId("leading-icon")).toBeTruthy();
    expect(screen.queryByTestId("trailing-icon")).toBeNull();

    rerender(<Button trailingIcon={trailing}>Trailing only</Button>);
    expect(screen.queryByTestId("leading-icon")).toBeNull();
    expect(screen.getByTestId("trailing-icon")).toBeTruthy();

    rerender(
      <Button leadingIcon={leading} trailingIcon={trailing}>
        Both
      </Button>,
    );
    expect(screen.getByTestId("leading-icon")).toBeTruthy();
    expect(screen.getByTestId("trailing-icon")).toBeTruthy();
  });

  it("scales icon-only padding with size instead of collapsing to one fixed footprint", () => {
    const { rerender } = render(
      <Button aria-label="Add item" size="sm" leadingIcon={<svg />} />,
    );
    const smButton = screen.getByRole("button", { name: "Add item" });
    expect(smButton.className).toContain(styles["icon-only"]);
    expect(smButton.className).toContain(styles["size-sm"]);

    rerender(<Button aria-label="Add item" size="md" leadingIcon={<svg />} />);
    const mdButton = screen.getByRole("button", { name: "Add item" });
    expect(mdButton.className).toContain(styles["icon-only"]);
    expect(mdButton.className).toContain(styles["size-md"]);

    // The size-specific icon-only rule (`.icon-only.size-sm` /
    // `.icon-only.size-md`) must carry real padding so sm/md remain visually
    // distinct — a bare `.icon-only { padding: 0 }` rule collapses both sizes
    // to the same fixed footprint.
    const sheet = readFileSync(
      join(__dirname, "../src/Button.module.css"),
      "utf8",
    );
    expect(sheet).toMatch(/\.icon-only\.size-sm\s*{[^}]*padding:\s*var\(--ds-space-50\)/);
    expect(sheet).toMatch(/\.icon-only\.size-md\s*{[^}]*padding:\s*var\(--ds-space-100\)/);
  });

  it("defaults fullWidth to off and centered alignment", () => {
    render(<Button>Action</Button>);
    const button = screen.getByRole("button", { name: "Action" });
    expect(button.className).not.toContain(styles["full-width"]);
  });

  it("fills available width and centers content by default when fullWidth", () => {
    render(<Button fullWidth>Action</Button>);
    const button = screen.getByRole("button", { name: "Action" });
    expect(button.className).toContain(styles["full-width"]);
    expect(button.className).toContain(styles["align-center"]);
  });

  it("supports space-between alignment when fullWidth", () => {
    render(
      <Button fullWidth contentAlignment="space-between">
        Action
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Action" });
    expect(button.className).toContain(styles["align-space-between"]);
  });

  it("retains its selected alignment with only one icon present", () => {
    render(
      <Button
        fullWidth
        contentAlignment="space-between"
        leadingIcon={<svg data-testid="leading-icon" />}
      >
        Action
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Action" });
    expect(button.className).toContain(styles["align-space-between"]);
    expect(screen.getByTestId("leading-icon")).toBeTruthy();
  });
});

describe("Button — activation and form behavior (US2)", () => {
  it("forwards ref to the native button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Action</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("invokes the click handler once when activated with a pointer", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Action</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Action" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is operable by keyboard, activating once per Enter press", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Action</Button>);
    const button = screen.getByRole("button", { name: "Action" });
    button.focus();
    expect(document.activeElement).toBe(button);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not invoke the click handler while disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Action
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Action" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("defaults the native type to button so it never submits a form implicitly", () => {
    render(<Button>Action</Button>);
    expect(screen.getByRole("button", { name: "Action" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("preserves an explicit submit type", () => {
    render(<Button type="submit">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("preserves an explicit reset type", () => {
    render(<Button type="reset">Clear</Button>);
    expect(screen.getByRole("button", { name: "Clear" })).toHaveAttribute(
      "type",
      "reset",
    );
  });

  it("does not submit a form by default", () => {
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    const html = renderToStaticMarkup(
      <form onSubmit={onSubmit}>
        <Button>Action</Button>
      </form>,
    );
    expect(html).toContain('type="button"');
  });
});

describe("Button — accessible naming (US3)", () => {
  it("requires a non-empty accessible name for icon-only Buttons", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const invalidProps = { leadingIcon: <svg /> } as const;
    render(<Button {...(invalidProps as never)} />);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("requires a non-empty"),
    );
    errorSpy.mockRestore();
  });

  it("accepts a non-empty aria-label for icon-only content without warning", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Button aria-label="Add item" leadingIcon={<svg />} />);
    expect(screen.getByRole("button", { name: "Add item" })).toBeTruthy();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("accepts a valid aria-labelledby reference for icon-only content without warning", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <>
        <span id="add-item-label">Add item</span>
        <Button aria-labelledby="add-item-label" leadingIcon={<svg />} />
      </>,
    );
    expect(screen.getByRole("button", { name: "Add item" })).toBeTruthy();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("preserves visible-label naming without requiring aria-label", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Button>Save changes</Button>);
    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeTruthy();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("shows a visible focus treatment class hook when focused via keyboard", () => {
    render(<Button>Action</Button>);
    const button = screen.getByRole("button", { name: "Action" });
    expect(button.className).toContain(styles.button);
  });
});
