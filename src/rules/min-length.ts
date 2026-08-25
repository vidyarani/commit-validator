import type { Rule, RuleContext, Violation } from "../domain/types.js";

const DEFAULT_MIN_LENGTH = 10;

export class MinLengthRule implements Rule {
  readonly name = "message.too-short";

  check(ctx: RuleContext): Violation[] {
    const length = ctx.signals.lexical?.length ?? 0;
    if (length < DEFAULT_MIN_LENGTH) {
      return [
        {
          rule: this.name,
          severity: "error",
          message: `Subject is ${length} characters (minimum ${DEFAULT_MIN_LENGTH})`,
          hint: "Expand the message to describe what changed and why",
        },
      ];
    }
    return [];
  }
}
