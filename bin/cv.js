#!/usr/bin/env node
import { run } from "../src/adapters/cli/cli.js";

const result = await run(process.argv.slice(2), process.stdin);
process.stdout.write(result.output + "\n");
process.exit(result.exitCode);
