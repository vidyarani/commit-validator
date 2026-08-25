import type { Rule } from "../domain/types.js";

const MAX_SUGGESTION_DISTANCE = 2;

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[]);

  for (let i = 0; i <= m; i++) d[i]![0] = i;
  for (let j = 0; j <= n; j++) d[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i]![j] = Math.min(
        d[i - 1]![j]! + 1,
        d[i]![j - 1]! + 1,
        d[i - 1]![j - 1]! + cost,
      );
    }
  }

  return d[m]![n]!;
}

export class UnknownRuleError extends Error {
  constructor(name: string, available: string[]) {
    const suggestions = available
      .map((r) => ({ name: r, distance: levenshtein(name, r) }))
      .filter((r) => r.distance <= MAX_SUGGESTION_DISTANCE)
      .sort((a, b) => a.distance - b.distance);

    const hint = suggestions.length > 0
      ? ` Did you mean "${suggestions[0]!.name}"?`
      : "";

    super(`Unknown rule "${name}".${hint}`);
    this.name = "UnknownRuleError";
  }
}

const registry = new Map<string, new () => Rule>();

export function registerRule(name: string, ruleClass: new () => Rule): void {
  if (registry.has(name)) {
    throw new Error(`Rule "${name}" is already registered.`);
  }
  registry.set(name, ruleClass);
}

export function getRule(name: string): Rule {
  const RuleClass = registry.get(name);
  if (!RuleClass) {
    throw new UnknownRuleError(name, Array.from(registry.keys()));
  }
  return new RuleClass();
}

export function getAvailableRules(): string[] {
  return Array.from(registry.keys());
}

export function hasRule(name: string): boolean {
  return registry.has(name);
}
