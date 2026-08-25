import { describe, it, expect } from "vitest";
import { registerRule, getRule, getAvailableRules, hasRule, UnknownRuleError } from "../../../src/rules/registry.js";
import type { Rule, RuleContext, Violation } from "../../../src/domain/types.js";

class StubRule implements Rule {
  readonly name = "test.stub-rule";
  check(_ctx: RuleContext): Violation[] {
    return [];
  }
}

class AnotherRule implements Rule {
  readonly name = "test.another-rule";
  check(_ctx: RuleContext): Violation[] {
    return [];
  }
}

describe("registry", () => {
  it("registers and retrieves a rule by explicit name", () => {
    registerRule("test.a-retrieval", StubRule);
    expect(hasRule("test.a-retrieval")).toBe(true);
    const rule = getRule("test.a-retrieval");
    expect(rule.name).toBe("test.stub-rule");
  });

  it("returns fresh instance on each getRule call", () => {
    registerRule("test.b-fresh", StubRule);
    const a = getRule("test.b-fresh");
    const b = getRule("test.b-fresh");
    expect(a).not.toBe(b);
  });

  it("lists all registered rules", () => {
    registerRule("test.c-list-a", StubRule);
    registerRule("test.c-list-b", AnotherRule);
    const rules = getAvailableRules();
    expect(rules).toContain("test.c-list-a");
    expect(rules).toContain("test.c-list-b");
  });

  it("throws UnknownRuleError for unknown rule", () => {
    expect(() => getRule("nonexistent")).toThrow(UnknownRuleError);
  });

  it("suggests similar rule names via Levenshtein", () => {
    registerRule("test.d-suggest", StubRule);
    try {
      getRule("test.d-sugesst");
      expect.fail("should throw");
    } catch (e) {
      expect(e).toBeInstanceOf(UnknownRuleError);
      expect((e as Error).message).toContain("test.d-suggest");
    }
  });

  it("throws on duplicate registration", () => {
    registerRule("test.e-dup", StubRule);
    expect(() => registerRule("test.e-dup", StubRule)).toThrow("already registered");
  });
});
