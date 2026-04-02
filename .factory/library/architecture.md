# UI.md Standard Architecture

## Overview

UI.md is a behavioral UX/UI contract format — a Markdown file with structured appendix that describes screens, states, navigation, and data contracts for a software product.

## Components

### Specification Layer

- **SPEC.md**: Canonical prose specification defining the UI.md standard
- **AGENTS.md**: AI agent guidance for reading and producing UI.md files
- **CONTRIBUTING.md**: Contribution guidelines for the standard

### Tooling Layer

- **tooling/ui-md-linter/ui-md-lint.js**: Node.js CLI linter that validates UI.md files
- **tooling/ui-md-linter/schema.json**: JSON Schema defining valid appendix structure
- **tooling/vscode-extension/**: VS Code extension for syntax highlighting and diagnostics

### Reference Implementations

- **samples/kanban/**: Kanban board UI.md sample
- **samples/mobile-onboarding/**: Mobile onboarding UI.md sample
- **samples/cli-dashboard/**: CLI dashboard UI.md sample

## Data Flow

```
UI.md File
    |
    v
ui-md-lint.js (extracts appendix)
    |
    v
schema.json (validates structure)
    |
    v
Validation Result (exit code 0 or 1)
```

## Appendix Formats

The machine-readable appendix can be:
1. Embedded JSON: ```json ... ```
2. Embedded YAML: ```yaml ... ```
3. External file: ui-appendix.json or ui-appendix.yaml alongside UI.md

## ID Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Screen | SCREEN-{name} | SCREEN-board, SCREEN-login |
| State | STATE-{name} | STATE-loading, STATE-empty |
| Role | ROLE-{name} | ROLE-authenticated, ROLE-admin |
| Entity | ENTITY-{name} | ENTITY-user, ENTITY-card |
| Pattern | PATTERN-{name} | PATTERN-dragCard |

## State Types

- loading
- empty
- error
- success
- offline
- permission-denied

## Navigation Back-Stack Values

- Push
- Pop
- Replace
- No
- Modal

## Key Files

| File | Purpose |
|------|---------|
| `tooling/ui-md-linter/ui-md-lint.js` | Main linter CLI |
| `tooling/ui-md-linter/schema.json` | JSON Schema for appendix validation |
| `tooling/ui-md-linter/README.md` | Linter documentation |
| `tooling/vscode-extension/package.json` | VS Code extension manifest |
| `tooling/vscode-extension/extension.js` | VS Code extension entry point |
