import { describe, it, expect } from "vitest";
import { normalize } from "../../../src/domain/normalizer.js";

describe("normalize", () => {
  it("preserves clean input", () => {
    const result = normalize("fix login timeout");
    expect(result.original).toBe("fix login timeout");
    expect(result.normalized).toBe("fix login timeout");
    expect(result.normalizedForMatching).toBe("fix login timeout");
  });

  it("trims whitespace", () => {
    const result = normalize("  fix login timeout  ");
    expect(result.normalized).toBe("fix login timeout");
  });

  it("collapses internal whitespace", () => {
    const result = normalize("fix   login    timeout");
    expect(result.normalized).toBe("fix login timeout");
  });

  it("lowercases for matching only", () => {
    const result = normalize("FIX LOGIN TIMEOUT");
    expect(result.normalized).toBe("FIX LOGIN TIMEOUT");
    expect(result.normalizedForMatching).toBe("fix login timeout");
  });

  it("strips trailing punctuation", () => {
    expect(normalize("fix login timeout!!!").normalized).toBe("fix login timeout");
    expect(normalize("fix login timeout.").normalized).toBe("fix login timeout");
    expect(normalize("fix login timeout!.").normalized).toBe("fix login timeout");
  });

  it("preserves casing in normalized but lowercases for matching", () => {
    const result = normalize("Fix OAuth API integration");
    expect(result.normalized).toBe("Fix OAuth API integration");
    expect(result.normalizedForMatching).toBe("fix oauth api integration");
  });

  it("preserves ticket references casing", () => {
    const result = normalize("fix JIRA-42 integration");
    expect(result.normalized).toBe("fix JIRA-42 integration");
    expect(result.normalizedForMatching).toBe("fix jira-42 integration");
  });

  it("handles empty string", () => {
    const result = normalize("");
    expect(result.original).toBe("");
    expect(result.normalized).toBe("");
    expect(result.normalizedForMatching).toBe("");
  });

  it("handles whitespace-only string", () => {
    const result = normalize("   ");
    expect(result.normalized).toBe("");
  });

  it("does not strip internal punctuation", () => {
    expect(normalize("fix auth.token refresh").normalized).toBe("fix auth.token refresh");
  });
});
