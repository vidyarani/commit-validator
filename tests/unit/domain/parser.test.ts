import { describe, it, expect } from "vitest";
import { parse } from "../../../src/domain/parser.js";

describe("parse", () => {
  it("parses plain subject", () => {
    expect(parse("add login")).toEqual({
      subject: "add login",
      body: null,
    });
  });

  it("parses multi-line message", () => {
    const result = parse("fix login timeout\n\nThis fixes the intermittent...");
    expect(result).toEqual({
      subject: "fix login timeout",
      body: "This fixes the intermittent...",
    });
  });

  it("parses conventional commit with scope", () => {
    const result = parse("feat(auth): add login");
    expect(result).toEqual({
      subject: "add login",
      body: null,
      conventional: {
        type: "feat",
        scope: "auth",
        breakingChange: false,
      },
    });
  });

  it("parses conventional commit without scope", () => {
    const result = parse("fix: handle timeout");
    expect(result).toEqual({
      subject: "handle timeout",
      body: null,
      conventional: {
        type: "fix",
        scope: undefined,
        breakingChange: false,
      },
    });
  });

  it("parses breaking change marker", () => {
    const result = parse("fix!: handle null");
    expect(result).toEqual({
      subject: "handle null",
      body: null,
      conventional: {
        type: "fix",
        scope: undefined,
        breakingChange: true,
      },
    });
  });

  it("parses breaking change with scope", () => {
    const result = parse("feat(api)!: remove deprecated endpoint");
    expect(result).toEqual({
      subject: "remove deprecated endpoint",
      body: null,
      conventional: {
        type: "feat",
        scope: "api",
        breakingChange: true,
      },
    });
  });

  it("handles empty input", () => {
    expect(parse("")).toEqual({ subject: "", body: null });
  });

  it("handles single word", () => {
    expect(parse("update")).toEqual({ subject: "update", body: null });
  });

  it("does not confuse colon in body with conventional format", () => {
    const result = parse("add login\n\nNote: this requires migration");
    expect(result).toEqual({
      subject: "add login",
      body: "Note: this requires migration",
    });
  });

  it("handles multiple body paragraphs", () => {
    const result = parse("add login\n\nFirst paragraph.\n\nSecond paragraph.");
    expect(result).toEqual({
      subject: "add login",
      body: "First paragraph.\n\nSecond paragraph.",
    });
  });
});
