import { describe, it, expect } from "vitest";
import { ImperativeVerbRule } from "../../../src/rules/imperative-verb.js";
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

describe("ImperativeVerbRule", () => {
  const rule = new ImperativeVerbRule();

  it("warns on past tense", () => {
    const violations = rule.check(ctx("added retry", {
      verb: { verb: "add", verbForm: "past" },
    }));
    expect(violations).toHaveLength(1);
    expect(violations[0]!.severity).toBe("warn");
    expect(violations[0]!.message).toContain("add");
    expect(violations[0]!.message).toContain("past");
  });

  it("warns on gerund", () => {
    const violations = rule.check(ctx("adding retry", {
      verb: { verb: "add", verbForm: "gerund" },
    }));
    expect(violations).toHaveLength(1);
    expect(violations[0]!.severity).toBe("warn");
  });

  it("warns on third-person", () => {
    const violations = rule.check(ctx("updates docs", {
      verb: { verb: "update", verbForm: "third-person" },
    }));
    expect(violations).toHaveLength(1);
    expect(violations[0]!.severity).toBe("warn");
  });

  it("accepts base form", () => {
    const violations = rule.check(ctx("add retry", {
      verb: { verb: "add", verbForm: "base" },
    }));
    expect(violations).toHaveLength(0);
  });

  it("ignores unknown verb form", () => {
    const violations = rule.check(ctx("login page fix", {
      verb: { verb: null, verbForm: "unknown" },
    }));
    expect(violations).toHaveLength(0);
  });

  it("has correct rule ID", () => {
    expect(rule.name).toBe("message.non-imperative");
  });
});
