import type { ParsedMessage } from "./types.js";

// Conventional commit format: type(scope)!: subject
// e.g. feat(auth): add login
// e.g. fix!: handle null
const CONVENTIONAL_PATTERN = /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.+)/;

export function parse(normalizedText: string): ParsedMessage {
  const lines = normalizedText.split(/\n\n+/);
  const subjectLine = (lines[0] ?? "").trim();
  const body = lines.length > 1 ? lines.slice(1).join("\n\n").trim() || null : null;

  // Try to extract conventional commit metadata from subject
  const match = subjectLine.match(CONVENTIONAL_PATTERN);
  if (match) {
    const [, type, scope, bang, subject] = match;
    return {
      subject: subject ?? "",
      body,
      conventional: {
        type: type ?? undefined,
        scope: scope ?? undefined,
        breakingChange: bang === "!",
      },
    };
  }

  return { subject: subjectLine, body };
}
