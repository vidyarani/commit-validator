import type { ParsedMessage, LexicalSignals } from "../domain/types.js";

export function extractLexical(parsed: ParsedMessage): LexicalSignals {
  const subject = parsed.subject;
  const length = subject.length;
  const wordCount = subject === "" ? 0 : subject.split(/\s+/).filter(Boolean).length;
  return { length, wordCount };
}
