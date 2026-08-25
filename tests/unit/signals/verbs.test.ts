import { describe, it, expect } from "vitest";
import { extractVerb } from "../../../src/signals/verbs.js";
import type { ParsedMessage } from "../../../src/domain/types.js";

function parsed(subject: string): ParsedMessage {
  return { subject, body: null };
}

describe("extractVerb", () => {
  it("detects base form", () => {
    expect(extractVerb(parsed("add retry"))).toEqual({
      verb: "add",
      verbForm: "base",
    });
  });

  it("detects past tense and normalizes", () => {
    expect(extractVerb(parsed("added retry"))).toEqual({
      verb: "add",
      verbForm: "past",
    });
  });

  it("detects gerund and normalizes", () => {
    expect(extractVerb(parsed("adding retry"))).toEqual({
      verb: "add",
      verbForm: "gerund",
    });
  });

  it("detects third-person", () => {
    expect(extractVerb(parsed("updates docs"))).toEqual({
      verb: "update",
      verbForm: "third-person",
    });
  });

  it("returns unknown when no leading verb found", () => {
    expect(extractVerb(parsed("login page fix"))).toEqual({
      verb: null,
      verbForm: "unknown",
    });
  });

  it("handles empty subject", () => {
    expect(extractVerb(parsed(""))).toEqual({
      verb: null,
      verbForm: "unknown",
    });
  });

  it("normalizes 'removed' to base 'remove'", () => {
    expect(extractVerb(parsed("removed unused code"))).toEqual({
      verb: "remove",
      verbForm: "past",
    });
  });

  it("normalizes 'refactoring' to base 'refactor'", () => {
    expect(extractVerb(parsed("refactoring auth module"))).toEqual({
      verb: "refactor",
      verbForm: "gerund",
    });
  });
});
