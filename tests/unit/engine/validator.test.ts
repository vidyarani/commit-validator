import { describe, it, expect } from "vitest";
import { validateCommit } from "../../../src/engine/validator.js";

describe("validateCommit", () => {
  it("rejects short messages", () => {
    const report = validateCommit("test");
    expect(report.valid).toBe(false);
    expect(report.violations).toHaveLength(1);
    expect(report.violations[0]!.rule).toBe("message.too-short");
    expect(report.violations[0]!.severity).toBe("error");
    expect(report.score).toBe(50);
  });

  it("rejects single word", () => {
    const report = validateCommit("update");
    expect(report.valid).toBe(false);
    expect(report.violations[0]!.rule).toBe("message.too-short");
  });

  it("rejects empty string", () => {
    const report = validateCommit("");
    expect(report.valid).toBe(false);
  });

  it("accepts messages at minimum length", () => {
    const report = validateCommit("1234567890");
    expect(report.valid).toBe(true);
    expect(report.score).toBe(100);
    expect(report.violations).toHaveLength(0);
  });

  it("accepts good messages", () => {
    const report = validateCommit("add retry backoff to payment client");
    expect(report.valid).toBe(true);
    expect(report.score).toBe(100);
    expect(report.violations).toHaveLength(0);
  });

  it("includes signals in report", () => {
    const report = validateCommit("add retry backoff to payment client");
    expect(report.signals.lexical).toBeDefined();
    expect(report.signals.verb).toBeDefined();
    expect(report.signals.vagueness).toBeDefined();
  });

  it("handles multi-line messages", () => {
    const report = validateCommit("fix login timeout\n\nThis fixes the intermittent timeout");
    expect(report.valid).toBe(true);
  });

  it("trims whitespace before validation", () => {
    const report = validateCommit("  test  ");
    expect(report.valid).toBe(false);
  });

  it("deterministic: same input always produces same output", () => {
    const results = Array.from({ length: 10 }, () => validateCommit("update"));
    const serialized = results.map((r) => JSON.stringify(r));
    expect(new Set(serialized).size).toBe(1);
  });
});
