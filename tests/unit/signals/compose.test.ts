import { describe, it, expect } from "vitest";
import { extractSignals } from "../../../src/signals/index.js";
import type { ParsedMessage } from "../../../src/domain/types.js";

function parsed(subject: string): ParsedMessage {
  return { subject, body: null };
}

describe("extractSignals", () => {
  it("produces full signal vector for a good message", () => {
    const result = extractSignals(parsed("add retry backoff to payment client"));
    expect(result).toEqual({
      lexical: { length: 35, wordCount: 6 },
      verb: { verb: "add", verbForm: "base" },
      vagueness: { vagueWords: [], genericPhrases: [] },
    });
  });

  it("produces full signal vector for a vague message", () => {
    const result = extractSignals(parsed("update stuff"));
    expect(result).toEqual({
      lexical: { length: 12, wordCount: 2 },
      verb: { verb: "update", verbForm: "base" },
      vagueness: { vagueWords: ["update", "stuff"], genericPhrases: [] },
    });
  });

  it("produces full signal vector for past-tense message", () => {
    const result = extractSignals(parsed("fixed login timeout"));
    expect(result).toEqual({
      lexical: { length: 19, wordCount: 3 },
      verb: { verb: "fix", verbForm: "past" },
      vagueness: { vagueWords: [], genericPhrases: [] },
    });
  });
});
