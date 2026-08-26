import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { run } from "../../../src/adapters/cli/cli.js";
import { Readable } from "node:stream";

function createStdin(text: string): NodeJS.ReadStream {
  const readable = Readable.from([text]);
  return readable as unknown as NodeJS.ReadStream;
}

function createTtyStdin(): NodeJS.ReadStream {
  const stream = new Readable({ read() {} }) as unknown as NodeJS.ReadStream;
  Object.defineProperty(stream, "isTTY", { value: true, writable: false });
  return stream;
}

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cv-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("CLI adapter", () => {
  describe("input sources", () => {
    it("--message flag validates a valid message", async () => {
      const result = await run(["--message", "add login page for users"], createTtyStdin());
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Valid commit message");
    });

    it("--message flag rejects an invalid message", async () => {
      const result = await run(["--message", "stuff"], createTtyStdin());
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("Invalid commit message");
    });

    it("-m shorthand works", async () => {
      const result = await run(["-m", "add login page"], createTtyStdin());
      expect(result.exitCode).toBe(0);
    });

    it("--file flag reads from file", async () => {
      const filePath = path.join(tmpDir, "commit-msg.txt");
      fs.writeFileSync(filePath, "add login page for users\n");
      const result = await run(["--file", filePath], createTtyStdin());
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Valid commit message");
    });

    it("--file flag with missing file returns error", async () => {
      const result = await run(["--file", "/nonexistent/file.txt"], createTtyStdin());
      expect(result.exitCode).toBe(2);
      expect(result.output).toContain("Error reading file");
    });

    it("stdin input works", async () => {
      const result = await run([], createStdin("add login page for users\n"));
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Valid commit message");
    });

    it("no input returns error", async () => {
      const result = await run([], createTtyStdin());
      expect(result.exitCode).toBe(2);
      expect(result.output).toContain("No commit message provided");
    });
  });

  describe("format", () => {
    it("--format human produces readable output", async () => {
      const result = await run(["-m", "stuff", "--format", "human"], createTtyStdin());
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("Invalid commit message");
      expect(result.output).toContain("Violations:");
    });

    it("--format json produces valid JSON", async () => {
      const result = await run(["-m", "stuff", "--format", "json"], createTtyStdin());
      expect(result.exitCode).toBe(1);
      const parsed = JSON.parse(result.output);
      expect(parsed.valid).toBe(false);
      expect(parsed.score).toBeDefined();
      expect(Array.isArray(parsed.violations)).toBe(true);
    });

    it("default format is human", async () => {
      const result = await run(["-m", "add login page"], createTtyStdin());
      expect(result.output).toContain("Valid commit message");
    });
  });

  describe("help", () => {
    it("--help returns usage text", async () => {
      const result = await run(["--help"], createTtyStdin());
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Usage: cv");
      expect(result.output).toContain("validate");
      expect(result.output).toContain("--message");
      expect(result.output).toContain("--format");
    });

    it("-h shorthand works", async () => {
      const result = await run(["-h"], createTtyStdin());
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Usage:");
    });

    it("validate --help works", async () => {
      const result = await run(["validate", "--help"], createTtyStdin());
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("validate");
    });
  });

  describe("error handling", () => {
    it("unknown argument returns error", async () => {
      const result = await run(["--unknown"], createTtyStdin());
      expect(result.exitCode).toBe(2);
      expect(result.output).toContain("Unknown argument: --unknown");
    });

    it("invalid format returns error", async () => {
      const result = await run(["-m", "test", "--format", "xml"], createTtyStdin());
      expect(result.exitCode).toBe(2);
      expect(result.output).toContain("Invalid format");
    });
  });

  describe("subcommand", () => {
    it("validate subcommand with -m flag", async () => {
      const result = await run(["validate", "-m", "add login page for users"], createTtyStdin());
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Valid commit message");
    });

    it("validate subcommand with positional message", async () => {
      const result = await run(["validate", "add login page for users"], createTtyStdin());
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Valid commit message");
    });

    it("validate subcommand with positional message rejects invalid", async () => {
      const result = await run(["validate", "stuff"], createTtyStdin());
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain("Invalid commit message");
    });

    it("no subcommand defaults to validate", async () => {
      const result = await run(["add login page"], createTtyStdin());
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Valid commit message");
    });

    it("validate subcommand with --file flag", async () => {
      const filePath = path.join(tmpDir, "commit-msg.txt");
      fs.writeFileSync(filePath, "add login page for users\n");
      const result = await run(["validate", "--file", filePath], createTtyStdin());
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Valid commit message");
    });
  });

  describe("output content", () => {
    it("valid message shows score", async () => {
      const result = await run(["-m", "add login page for users"], createTtyStdin());
      expect(result.output).toContain("Score: 100/100");
    });

    it("invalid message shows violations with rule IDs", async () => {
      const result = await run(["-m", "stuff"], createTtyStdin());
      expect(result.output).toContain("message.vague-content");
      expect(result.output).toContain("message.too-short");
    });

    it("json format includes signals", async () => {
      const result = await run(["-m", "add login page", "--format", "json"], createTtyStdin());
      const parsed = JSON.parse(result.output);
      expect(parsed.signals).toBeDefined();
    });
  });
});
