import * as fs from "node:fs";
import { validateCommit } from "../../engine/validator.js";
import type { Report, Severity } from "../../domain/types.js";

export interface CliOptions {
  subcommand: "validate";
  format: "human" | "json";
  message: string | null;
  file: string | null;
  help: boolean;
}

interface CliResult {
  exitCode: number;
  output: string;
}

const SEVERITY_LABELS: Record<Severity, string> = {
  error: "error",
  warn: "warn",
  info: "info",
};

const SEVERITY_COLORS: Record<Severity, string> = {
  error: "\x1b[31m",
  warn: "\x1b[33m",
  info: "\x1b[36m",
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    subcommand: "validate",
    format: "human",
    message: null,
    file: null,
    help: false,
  };

  let i = 0;

  // Skip subcommand if present
  if (i < argv.length && !argv[i]!.startsWith("-") && argv[i]! === "validate") {
    i++;
  }

  while (i < argv.length) {
    const arg = argv[i]!;

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--format") {
      const next = argv[++i];
      if (next !== "human" && next !== "json") {
        throw new Error(`Invalid format: ${next}. Must be "human" or "json".`);
      }
      options.format = next;
    } else if (arg === "--message" || arg === "-m") {
      options.message = argv[++i] ?? null;
    } else if (arg === "--file" || arg === "-f") {
      options.file = argv[++i] ?? null;
    } else if (!arg.startsWith("-")) {
      // Positional arg = message (if --message not already set)
      if (!options.message) {
        options.message = arg;
      } else {
        throw new Error(`Unexpected argument: ${arg}`);
      }
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }

    i++;
  }

  return options;
}

async function readStdin(stream: NodeJS.ReadStream): Promise<string> {
  if (stream.isTTY) {
    return "";
  }

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8").trim();
}

function readFile(path: string): string {
  return fs.readFileSync(path, "utf-8").trim();
}

function formatHuman(report: Report): string {
  const lines: string[] = [];

  if (report.valid) {
    lines.push(`${BOLD}✓ Valid commit message${RESET}`);
  } else {
    lines.push(`${BOLD}✗ Invalid commit message${RESET}`);
  }

  lines.push(`${DIM}Score: ${report.score}/100${RESET}`);
  lines.push("");

  if (report.violations.length === 0) {
    return lines.join("\n");
  }

  lines.push(`${BOLD}Violations:${RESET}`);
  for (const v of report.violations) {
    const color = SEVERITY_COLORS[v.severity];
    const label = SEVERITY_LABELS[v.severity];
    lines.push(`  ${color}${label}${RESET} ${v.rule}`);
    lines.push(`    ${v.message}`);
    if (v.hint) {
      lines.push(`    ${DIM}Hint: ${v.hint}${RESET}`);
    }
  }

  return lines.join("\n");
}

function formatJson(report: Report): string {
  return JSON.stringify(report, null, 2);
}

function getUsage(): string {
  return `Usage: cv [validate] [options]

Validate a commit message against quality policies.

Commands:
  validate               Validate a commit message (default)

Options:
  --message, -m <text>   Commit message to validate
  --file, -f <path>      Read commit message from file
  --format <human|json>  Output format (default: human)
  --help, -h             Show this help message

Input (in order of priority):
  1. Positional argument:  cv validate "add login page"
  2. --message flag:       cv validate -m "add login page"
  3. --file flag:          cv validate -f .git/COMMIT_EDITMSG
  4. stdin (pipe):         echo "add login page" | cv validate

Examples:
  cv validate "add login page for users"
  cv validate -m "add login page"
  cv validate -f .git/COMMIT_EDITMSG
  cv validate "msg" --format json
  echo "add login page" | cv validate`;
}

async function resolveInput(options: CliOptions, stdin: NodeJS.ReadStream): Promise<string | null> {
  if (options.message) {
    return options.message;
  }

  if (options.file) {
    return readFile(options.file);
  }

  return readStdin(stdin);
}

export async function run(argv: string[], stdin: NodeJS.ReadStream): Promise<CliResult> {
  let options: CliOptions;

  try {
    options = parseArgs(argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { exitCode: 2, output: `Error: ${message}\n\nRun "cv validate --help" for usage.` };
  }

  if (options.help) {
    return { exitCode: 0, output: getUsage() };
  }

  let input: string | null;
  try {
    input = await resolveInput(options, stdin);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { exitCode: 2, output: `Error reading file: ${message}` };
  }

  if (!input) {
    return { exitCode: 2, output: "Error: No commit message provided.\n\nUse --message, --file, or pipe to stdin." };
  }

  const report = validateCommit(input);

  const output = options.format === "json" ? formatJson(report) : formatHuman(report);
  const exitCode = report.valid ? 0 : 1;

  return { exitCode, output };
}
