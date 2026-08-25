#!/usr/bin/env node
import { run } from "../src/adapters/cli/cli.js";

run(process.argv.slice(2), process.stdin);
