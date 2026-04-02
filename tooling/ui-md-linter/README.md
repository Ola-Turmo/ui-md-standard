# UI.md Linter

A reference implementation of a linter for the UI.md standard — a behavioral UX/UI contract format for AI-assisted software development.

## Overview

The UI.md linter validates that a `UI.md` file conforms to the [UI.md Standard Specification](../SPEC.md). It checks both the human-readable Markdown structure and the machine-readable JSON appendix.

## Installation

No installation required — the linter is a standalone Node.js script.

**Prerequisites:**
- Node.js ≥18 (Node.js 18 LTS recommended)

**Quick start:**
```bash
# Validate a single file
node tooling/ui-md-linter/ui-md-lint.js UI.md

# Validate multiple files
node tooling/ui-md-linter/ui-md-lint.js samples/kanban/UI.md samples/mobile-onboarding/UI.md samples/cli-dashboard/UI.md

# Validate all sample files
node tooling/ui-md-linter/ui-md-lint.js samples/*/UI.md
```

## Usage

### Command Line

```bash
node ui-md-lint.js <file1.md> [file2.md] ...
```

### Options

| Option | Description |
|--------|-------------|
| `--help`, `-h` | Show help message |

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All files pass validation |
| `1` | One or more validation errors found |

## Validation Rules

The linter checks the following:

### Markdown Structure

1. **Required sections** — The document must contain all required sections in the correct order:
   - Title
   - 1. Product Mental Model
   - 2. Users and Roles
   - 3. Screen Inventory
   - 4. Navigation Model
   - 5. Core User Flows
   - 6. Interaction Patterns
   - 7. State Model
   - 8. Data Contract
   - 9. Appendix: Machine-Readable Contract

2. **Unique screen IDs** — Each `SCREEN-*` ID must appear exactly once in the document
3. **Unique state IDs** — Each `STATE-*` ID must appear exactly once in the document
4. **Unique role IDs** — Each `ROLE-*` ID must appear exactly once in the document

### JSON Appendix

1. **Valid JSON** — The JSON code block must be parseable
2. **Schema compliance** — The JSON must match the schema defined in `schema.json`
3. **Referential integrity** — All screen and state references in the Markdown prose must be defined in the appendix
4. **Navigation validity** — All navigation `from` and `to` references must point to defined screens

## Error Reference

| Error Type | Description | Suggestion |
|------------|-------------|------------|
| `structure` | Missing or out-of-order required section | Add the missing section or reorder sections |
| `duplicate-id` | Screen/state/role ID appears multiple times | Ensure each ID appears exactly once |
| `json-parse` | Invalid JSON syntax | Fix JSON syntax errors |
| `json-missing` | No JSON appendix block found | Add a ```json code block with the appendix |
| `schema` | JSON doesn't match schema | Check required fields and types |
| `referential` | Reference to undefined screen/state | Add the missing definition to the appendix |
| `file-not-found` | File doesn't exist | Check the file path |
| `read-error` | Cannot read file | Check file permissions |

## Error Output Format

Each error is reported with:

- **file**: The file path where the error was found
- **line**: The line number (if determinable)
- **type**: The category of error
- **message**: A description of the problem
- **suggestion**: How to fix the error

Example output:
```
[duplicate-id] sample.md:42
  Message: Duplicate screen ID: SCREEN-board
  Suggestion: Ensure each screen ID appears exactly once
```

## Schema

The linter uses `schema.json` (JSON Schema draft-07+) to validate the machine-readable appendix. The schema defines:

- `version`: UI.md schema version (e.g., "1.0")
- `screens[]`: Array of screen definitions with id, purpose, primaryActions, entryConditions, exitConditions, states, roleAccess
- `states[]`: Array of state definitions with id, type, description, indicators, allowedActions
- `navigation[]`: Array of navigation edges with from, to, trigger, condition, backStack
- `roles[]`: Array of role definitions with roleId, name, description, capabilities, visibleScreens
- `dataContracts{}`: Object mapping entity names to data contract definitions

## Integration

### CI/CD Integration

Add the linter to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Lint UI.md files
  run: node tooling/ui-md-linter/ui-md-lint.js UI.md
```

### Pre-commit Hook

To run automatically before commits, add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
node tooling/ui-md-linter/ui-md-lint.js $(git diff --cached --name-only | grep '\.md$' | grep -v '^samples/')
```

## Files

- `ui-md-lint.js` — The linter script
- `schema.json` — JSON Schema for the machine-readable appendix
- `README.md` — This file

## See Also

- [UI.md Standard Specification](../SPEC.md)
- [AGENTS.md](../AGENTS.md) — AI agent guidance for UI.md
- [Sample UI.md files](../samples/)
