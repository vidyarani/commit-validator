import type { NormalizedMessage } from "./types.js";

const TRAILING_PUNCTUATION = /[.!,;:]+$/;
const COLLAPSE_WHITESPACE = /\s+/g;

export function normalize(raw: string): NormalizedMessage {
  const original = raw;

  // Step 1: trim
  let normalized = raw.trim();

  // Step 2: collapse internal whitespace
  normalized = normalized.replace(COLLAPSE_WHITESPACE, " ");

  // Step 3: strip trailing punctuation only (!, ., ,, ;, :)
  normalized = normalized.replace(TRAILING_PUNCTUATION, "");

  // Step 4: normalized for matching = lowercase for case-insensitive comparisons
  const normalizedForMatching = normalized.toLowerCase();

  return { original, normalized, normalizedForMatching };
}
