import { describe, it, expect } from "vitest";
import { VagueContentRule } from "../../../src/rules/vague-content.js";
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

describe("VagueContentRule", () => {
  const rule = new VagueContentRule();

  it("rejects vague words", () => {
    const violations = rule.check(ctx("update stuff", {
      vagueness: { vagueWords: ["update", "stuff"], genericPhrases: [] },
    }));
    expect(violations).toHaveLength(1);
    expect(violations[0]!.severity).toBe("error");
    expect(violations[0]!.message).toContain("update");
    expect(violations[0]!.message).toContain("stuff");
  });

  it("rejects generic phrases", () => {
    const violations = rule.check(ctx("misc fixes", {
      vagueness: { vagueWords: [], genericPhrases: ["misc fixes"] },
    }));
    expect(violations).toHaveLength(1);
    expect(violations[0]!.message).toContain("misc fixes");
  });

  it("accepts specific messages", () => {
    const violations = rule.check(ctx("add retry backoff to payment client", {
      vagueness: { vagueWords: [], genericPhrases: [] },
    }));
    expect(violations).toHaveLength(0);
  });

  it("has correct rule ID", () => {
    expect(rule.name).toBe("message.vague-content");
  });
});
