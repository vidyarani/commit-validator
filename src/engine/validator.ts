import { normalize } from "../domain/normalizer.js";
import { parse } from "../domain/parser.js";
import { extractSignals } from "../signals/index.js";
import { MinLengthRule } from "../rules/min-length.js";
import type { Report, Severity } from "../domain/types.js";

const PENALTY: Record<Severity, number> = {
  error: -50,
  warn: -10,
  info: 0,
};

const severityOrder: Record<Severity, number> = { error: 0, warn: 1, info: 2 };

// Built-in rules — instantiated fresh per validation run
const BUILT_IN_RULES = [new MinLengthRule()];

export function validateCommit(text: string): Report {
  const normalized = normalize(text);
  const parsed = parse(normalized.normalized);
  const signals = extractSignals(parsed);

  const ctx = {
    originalMessage: normalized.original,
    normalizedMessage: normalized.normalized,
    parsed,
    signals,
  };

  const violations = BUILT_IN_RULES.flatMap((rule) => rule.check(ctx));

  violations.sort((a, b) => {
    const s = severityOrder[a.severity]! - severityOrder[b.severity]!;
    return s !== 0 ? s : a.rule.localeCompare(b.rule);
  });

  const penalty = violations.reduce((sum, v) => sum + (PENALTY[v.severity] ?? 0), 0);
  const score = Math.max(0, Math.min(100, 100 + penalty));

  const valid = violations.every((v) => v.severity !== "error");

  return { valid, score, violations, signals };
}
