// Severity levels for violations
export type Severity = "error" | "warn" | "info";

// A single policy violation
export interface Violation {
  rule: string;
  severity: Severity;
  message: string;
  hint?: string;
}

// Normalized form of a commit message (three tiers)
export interface NormalizedMessage {
  original: string;
  normalized: string;
  normalizedForMatching: string;
}

// Parsed structure of a commit message
export interface ParsedMessage {
  subject: string;
  body: string | null;
  conventional?: {
    type?: string;
    scope?: string;
    breakingChange: boolean;
  };
}

// Lexical signals about the message
export interface LexicalSignals {
  length: number;
  wordCount: number;
}

// Verb-related signals
export type VerbForm = "base" | "past" | "gerund" | "third-person" | "unknown";

export interface VerbSignals {
  verb: string | null;
  verbForm: VerbForm;
}

// Vagueness signals
export interface VaguenessSignals {
  vagueWords: string[];
  genericPhrases: string[];
}

// Full signal vector — all fields optional for forward-compatibility
export interface SignalVector {
  lexical?: LexicalSignals;
  verb?: VerbSignals;
  vagueness?: VaguenessSignals;
}

// Internal quality classification (not exposed in Report)
export type Classification = "CLEARLY_GOOD" | "AMBIGUOUS" | "CLEARLY_BAD";

// The result of validating a commit message
export interface Report {
  valid: boolean;
  score: number;
  violations: Violation[];
  signals: SignalVector;
}

// Context passed to rules during evaluation
export interface RuleContext {
  originalMessage: string;
  normalizedMessage: string;
  parsed: ParsedMessage;
  signals: SignalVector;
}

// Rule interface — all rules are synchronous in Phase 1
export interface Rule {
  readonly name: string;
  check(ctx: RuleContext): Violation[];
}

// Configuration for a single rule
export interface RuleConfig {
  enabled: boolean;
  severity?: Severity;
  params?: Record<string, unknown>;
}

// Application configuration
export interface Config {
  version: number;
  rules: Record<string, RuleConfig>;
}
