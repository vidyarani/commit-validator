import type { Rule, RuleContext, Violation } from "../domain/types.js";

export class TrailingPeriodRule implements Rule {
  readonly name = "message.trailing-period";

  check(ctx: RuleContext): Violation[] {
    if (ctx.normalizedMessage.endsWith(".")) {
      return [
        {
          rule: this.name,
          severity: "info",
          message: "Subject ends with a period",
          hint: "Remove the trailing period",
        },
      ];
    }
    return [];
  }
}
