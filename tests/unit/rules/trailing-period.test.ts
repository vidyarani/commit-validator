import { describe, it, expect } from "vitest";
import { TrailingPeriodRule } from "../../../src/rules/trailing-period.js";
import type { RuleContext, SignalVector, ParsedMessage } from "../../../src/domain/types.js";

function ctx(normalized: string): RuleContext {
  const parsed: ParsedMessage = { subject: normalized, body: null };
  return {
    originalMessage: normalized,
    normalizedMessage: normalized,
    parsed,
    signals: {
      lexical: { length: normalized.length, wordCount: 1 },
      verb: { verb: null, verbForm: "unknown" },
      vagueness: { vagueWords: [], genericPhrases: [] },
    },
  };
}

describe("TrailingPeriodRule", () => {
  const rule = new TrailingPeriodRule();

  it("flags trailing period", () => {
    const violations = rule.check(ctx("fix login timeout."));
    expect(violations).toHaveLength(1);
    expect(violations[0]!.severity).toBe("info");
  });

  it("ignores messages without period", () => {
    expect(rule.check(ctx("fix login timeout"))).toHaveLength(0);
  });

  it("ignores internal periods", () => {
    expect(rule.check(ctx("fix auth.token refresh"))).toHaveLength(0);
  });

  it("has correct rule ID", () => {
    expect(rule.name).toBe("message.trailing-period");
  });
});
