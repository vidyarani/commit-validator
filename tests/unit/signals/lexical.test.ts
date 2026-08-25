import { describe, it, expect } from "vitest";
import { extractLexical } from "../../../src/signals/lexical.js";
import type { ParsedMessage } from "../../../src/domain/types.js";

function parsed(subject: string, body?: string): ParsedMessage {
  return { subject, body: body ?? null };
}

describe("extractLexical", () => {
  it("counts characters", () => {
    expect(extractLexical(parsed("add login"))).toEqual({
      length: 9,
      wordCount: 2,
    });
  });

  it("counts words correctly", () => {
    expect(extractLexical(parsed("add retry backoff to payment client"))).toEqual({
      length: 35,
      wordCount: 6,
    });
  });

  it("handles single word", () => {
    expect(extractLexical(parsed("update"))).toEqual({
      length: 6,
      wordCount: 1,
    });
  });

  it("handles empty string", () => {
    expect(extractLexical(parsed(""))).toEqual({
      length: 0,
      wordCount: 0,
    });
  });

  it("ignores body length", () => {
    const result = extractLexical(parsed("add login", "This is a very long body...".repeat(10)));
    expect(result.length).toBe(9);
    expect(result.wordCount).toBe(2);
  });
});
