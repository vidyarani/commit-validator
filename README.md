# commit-validator

Validate commit messages against organizational quality policies.

## Installation

```sh
npm install
```

## Usage

```sh
# Validate with positional message
node --import tsx bin/cv.js validate "add login page for users"

# Validate with -m flag
node --import tsx bin/cv.js validate -m "add login page"

# Validate from file
node --import tsx bin/cv.js validate -f .git/COMMIT_EDITMSG

# Validate from stdin
echo "add login page" | node --import tsx bin/cv.js validate

# JSON output
node --import tsx bin/cv.js validate -m "stuff" --format json

# Help
node --import tsx bin/cv.js --help
```

### Exit codes

| Code | Meaning |
|------|---------|
| 0 | Valid commit message |
| 1 | Invalid (error-severity violations) |
| 2 | Usage or runtime error |

## Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `message.too-short` | error | Subject must be at least 10 characters |
| `message.vague-content` | error | Rejects vague words (`fix`, `update`, `stuff`, `things`, `misc`, `various`, `change`, `changes`, `wip`, `asdf`, `foo`, `bar`, `baz`, `test`, `tests`, `testing`) |
| `message.non-imperative` | warn | First verb should be in base/imperative form (`add` not `added` or `adding`) |
| `message.trailing-period` | info | Subject should not end with a period |

### Severity levels

- **error** — blocks validation (`valid: false`)
- **warn** — flagged but does not block
- **info** — informational, does not block

## Examples

```
✓ Valid commit message
Score: 100/100

✗ Invalid commit message
Score: 0/100

Violations:
  error message.too-short
    Subject is 5 characters (minimum 10)
    Hint: Expand the message to describe what changed and why
  error message.vague-content
    Contains vague words: stuff
    Hint: Describe what changed specifically, e.g. 'add retry logic to payment client'
```

## Development

```sh
npm test          # Run all tests
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript type checking
npm run build     # Build to dist/
```
