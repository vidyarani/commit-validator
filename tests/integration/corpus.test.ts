import { describe, it, expect } from "vitest";
import { validateCommit } from "../../src/engine/validator.js";
import validCorpus from "../corpus/valid.json";
import invalidCorpus from "../corpus/invalid.json";
import warningsCorpus from "../corpus/warnings.json";

describe("golden corpus — valid messages", () => {
  for (const message of validCorpus) {
    it(`passes: "${message}"`, () => {
      const report = validateCommit(message);
      expect(report.valid, `expected "${message}" to be valid`).toBe(true);
      expect(
        report.violations.filter((v) => v.severity === "error"),
        `expected no errors for "${message}"`,
      ).toHaveLength(0);
    });
  }
});

describe("golden corpus — invalid messages", () => {
  for (const message of invalidCorpus) {
    it(`rejects: "${message}"`, () => {
      const report = validateCommit(message);
      expect(report.valid, `expected "${message}" to be invalid`).toBe(false);
      expect(
        report.violations.filter((v) => v.severity === "error").length,
        `expected at least one error for "${message}"`,
      ).toBeGreaterThanOrEqual(1);
    });
  }
});

describe("golden corpus — warnings (valid but flagged)", () => {
  for (const message of warningsCorpus) {
    it(`warns: "${message}"`, () => {
      const report = validateCommit(message);
      expect(report.valid, `expected "${message}" to be valid (no errors)`).toBe(true);
      expect(
        report.violations.some((v) => v.severity === "warn" || v.severity === "info"),
        `expected at least one warning/info for "${message}"`,
      ).toBe(true);
    });
  }
});

describe("golden corpus — edge cases", () => {
  it("handles all-caps", () => {
    const report = validateCommit("FIX LOGIN TIMEOUT");
    expect(report.violations.length).toBeGreaterThanOrEqual(1);
  });

  it("handles trailing period", () => {
    const report = validateCommit("add login feature.");
    expect(report.violations.some((v) => v.rule === "message.trailing-period")).toBe(true);
  });

  it("handles whitespace padding", () => {
    const report = validateCommit("  add login page  ");
    expect(report.valid).toBe(true);
  });

  it("handles conventional commit format", () => {
    const report = validateCommit("feat(auth): add login page");
    expect(report.valid).toBe(true);
  });

  it("handles breaking change marker", () => {
    const report = validateCommit("fix!: handle null");
    expect(report.valid).toBe(true);
  });

  it("handles multi-line messages", () => {
    const report = validateCommit("add login\n\nThis adds the new login page");
    expect(report.valid).toBe(true);
  });

  it("handles numeric-only input", () => {
    const report = validateCommit("1234567890");
    expect(report.valid).toBe(true);
  });
});
