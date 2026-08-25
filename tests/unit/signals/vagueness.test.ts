import { describe, it, expect } from "vitest";
import { extractVagueness } from "../../../src/signals/vagueness.js";
import type { ParsedMessage } from "../../../src/domain/types.js";

function parsed(subject: string): ParsedMessage {
  return { subject, body: null };
}

describe("extractVagueness", () => {
  it("detects vague words", () => {
    const result = extractVagueness(parsed("update stuff"));
    expect(result.vagueWords).toEqual(["update", "stuff"]);
  });

  it("returns empty for specific messages", () => {
    const result = extractVagueness(parsed("add retry backoff to payment client"));
    expect(result.vagueWords).toEqual([]);
    expect(result.genericPhrases).toEqual([]);
  });

  it("detects generic phrases", () => {
    const result = extractVagueness(parsed("misc fixes and various changes"));
    expect(result.genericPhrases).toEqual(["misc fixes", "various changes"]);
  });

  it("does not match partial words", () => {
    // "update" should NOT match inside "updated" — different token
    const result = extractVagueness(parsed("updated docs"));
    expect(result.vagueWords).toEqual([]);
  });

  it("handles empty subject", () => {
    const result = extractVagueness(parsed(""));
    expect(result.vagueWords).toEqual([]);
    expect(result.genericPhrases).toEqual([]);
  });

  it("is case insensitive", () => {
    const result = extractVagueness(parsed("UPDATE STUFF"));
    expect(result.vagueWords).toEqual(["update", "stuff"]);
  });
});
