import type { Rule, RuleContext, Violation } from "../domain/types.js";

export class ImperativeVerbRule implements Rule {
  readonly name = "message.non-imperative";

  check(ctx: RuleContext): Violation[] {
    const verbForm = ctx.signals.verb?.verbForm;
    const verb = ctx.signals.verb?.verb;

    if (verbForm === "unknown" || verb === null) {
      return [];
    }

    if (verbForm !== "base") {
      return [
        {
          rule: this.name,
          severity: "warn",
          message: `Expected imperative verb ("${verb}"), got ${verbForm} form`,
          hint: `Use base form: "${verb}" instead`,
        },
      ];
    }

    return [];
  }
}
