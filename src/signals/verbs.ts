import type { ParsedMessage, VerbSignals, VerbForm } from "../domain/types.js";

// Common verb base forms — used to normalize conjugated forms
// This list is intentionally small and extensible via config in later phases
const VERB_BASES: Record<string, string> = {
  // add family
  adds: "add",
  added: "add",
  adding: "add",
  // fix family
  fixes: "fix",
  fixed: "fix",
  fixing: "fix",
  // update family
  updates: "update",
  updated: "update",
  updating: "update",
  // remove family
  removes: "remove",
  removed: "remove",
  removing: "remove",
  // add more as needed
  deletes: "delete",
  deleted: "delete",
  deleting: "delete",
  creates: "create",
  created: "create",
  creating: "create",
  implements: "implement",
  implemented: "implement",
  implementing: "implement",
  refactor: "refactor",
  refactored: "refactor",
  refactoring: "refactor",
  improves: "improve",
  improved: "improve",
  improving: "improve",
  migrates: "migrate",
  migrated: "migrate",
  migrating: "migrate",
  disables: "disable",
  disabled: "disable",
  disabling: "disable",
  enables: "enable",
  enabled: "enable",
  enabling: "enable",
  renames: "rename",
  renamed: "rename",
  renaming: "rename",
  moves: "move",
  moved: "move",
  moving: "move",
  merges: "merge",
  merged: "merge",
  merging: "merge",
  reverts: "revert",
  reverted: "revert",
  reverting: "revert",
};

function classifyForm(word: string, base: string): VerbForm {
  if (word === base) return "base";
  if (word.endsWith("ed")) return "past";
  if (word.endsWith("ing")) return "gerund";
  if (word.endsWith("s") && !word.endsWith("ss")) return "third-person";
  return "unknown";
}

export function extractVerb(parsed: ParsedMessage): VerbSignals {
  const subject = parsed.subject.trim();
  if (subject === "") return { verb: null, verbForm: "unknown" };

  const firstWord = subject.split(/\s+/)[0]?.toLowerCase() ?? "";

  // Direct base form match
  if (firstWord in VERB_BASES) {
    const base = VERB_BASES[firstWord]!;
    return { verb: base, verbForm: classifyForm(firstWord, base) };
  }

  // Check if first word itself is a known base form
  const bases = new Set(Object.values(VERB_BASES));
  if (bases.has(firstWord)) {
    return { verb: firstWord, verbForm: "base" };
  }

  return { verb: null, verbForm: "unknown" };
}
