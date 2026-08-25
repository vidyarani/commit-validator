import type { ParsedMessage, SignalVector } from "../domain/types.js";
import { extractLexical } from "./lexical.js";
import { extractVerb } from "./verbs.js";
import { extractVagueness } from "./vagueness.js";

export function extractSignals(parsed: ParsedMessage): SignalVector {
  return {
    lexical: extractLexical(parsed),
    verb: extractVerb(parsed),
    vagueness: extractVagueness(parsed),
  };
}
