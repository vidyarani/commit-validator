import type { Rule, RuleContext, Violation } from "../domain/types.js";

export class VagueContentRule implements Rule {
  readonly name = "message.vague-content";

  check(ctx: RuleContext): Violation[] {
    const vagueWords = ctx.signals.vagueness?.vagueWords ?? [];
    const genericPhrases = ctx.signals.vagueness?.genericPhrases ?? [];
    const violations: Violation[] = [];

    if (vagueWords.length > 0) {
      violations.push({
        rule: this.name,
        severity: "error",
        message: `Contains vague words: ${vagueWords.join(", ")}`,
        hint: "Describe what changed specifically, e.g. 'add retry logic to payment client'",
      });
    }

    if (genericPhrases.length > 0) {
      violations.push({
        rule: this.name,
        severity: "error",
        message: `Contains generic phrases: ${genericPhrases.join(", ")}`,
        hint: "Replace with a specific description of the change",
      });
    }

    return violations;
  }
}
