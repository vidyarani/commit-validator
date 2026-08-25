import { describe, it, expect } from "vitest";
import { MinLengthRule } from "../../../src/rules/min-length.js";
import type { RuleContext, SignalVector, ParsedMessage } from "../../../src/domain/types.js";

function ctx(subject: string, signals?: Partial<RuleContext["signals"]>): RuleContext {
  const parsed: ParsedMessage = { subject, body: null };
  const wordCount = subject === "" ? 0 : subject.split(/\s+/).filter(Boolean).length;
  const defaultSignals: SignalVector = {
    lexical: { length: subject.length, wordCount },
    verb: { verb: null, verbForm: "unknown" },
    vagueness: { vagueWords: [], genericPhrases: [] },
  };
  return {
    originalMessage: subject,
    normalizedMessage: subject,
    parsed,
    signals: { ...defaultSignals, ...signals },
  };
}

describe("MinLengthRule", () => {
  const rule = new MinLengthRule();

  it("rejects short subjects", () => {
    const violations = rule.check(ctx("test"));
    expect(violations).toHaveLength(1);
    expect(violations[0]!.severity).toBe("error");
    expect(violations[0]!.message).toContain("4 characters");
  });

  it("rejects single character", () => {
    expect(rule.check(ctx("x"))).toHaveLength(1);
  });

  it("rejects empty string", () => {
    expect(rule.check(ctx(""))).toHaveLength(1);
  });

  it("accepts subjects at minimum length", () => {
    expect(rule.check(ctx("1234567890"))).toHaveLength(0);
  });

  it("accepts longer subjects", () => {
    expect(rule.check(ctx("add retry backoff to payment client"))).toHaveLength(0);
  });

  it("has correct rule ID", () => {
    expect(rule.name).toBe("message.too-short");
  });
});
