import type { ParsedMessage, VaguenessSignals } from "../domain/types.js";

// Default vague words — can be overridden via config in later phases
// Conjugated verb forms (updated, fixing, etc.) belong to the verb extractor, not here
const DEFAULT_VAGUE_WORDS = new Set([
  "test",
  "tests",
  "testing",
  "update",
  "fix",
  "stuff",
  "things",
  "misc",
  "various",
  "change",
  "changes",
  "wip",
  "asdf",
  "foo",
  "bar",
  "baz",
]);

// Default generic phrases
const DEFAULT_GENERIC_PHRASES = [
  "misc fixes",
  "various changes",
  "some updates",
  "minor changes",
  "small fix",
  "random stuff",
  "other changes",
];

export function extractVagueness(
  parsed: ParsedMessage,
  options?: {
    vagueWords?: Set<string>;
    genericPhrases?: string[];
  },
): VaguenessSignals {
  const subject = parsed.subject.toLowerCase();
  const words = subject.split(/\s+/).filter(Boolean);

  const vagueWords = words.filter((w) =>
    (options?.vagueWords ?? DEFAULT_VAGUE_WORDS).has(w),
  );

  const phrases = options?.genericPhrases ?? DEFAULT_GENERIC_PHRASES;
  const genericPhrases = phrases.filter((p) => subject.includes(p));

  return { vagueWords, genericPhrases };
}
