---
name: tooling-worker
description: Tooling and linter improvement worker for UI.md standard
---

# Tooling Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

This worker handles features related to:
- Linter improvements (YAML support, external appendix, referential integrity)
- Linter test suite creation
- VS Code extension fixes
- CI workflow setup

## Required Skills

None — tooling work is Node.js-based. No external browser/UI testing needed.

## Work Procedure

### 1. Understand the current state

Read the relevant files:
- `tooling/ui-md-linter/ui-md-lint.js` — current linter implementation
- `tooling/ui-md-linter/schema.json` — schema for validation
- `tooling/vscode-extension/` — VS Code extension files
- `samples/kanban/UI.md` — reference sample

### 2. Plan the implementation

For linter features:
1. Identify where in `ui-md-lint.js` to make changes
2. Plan test cases for the new functionality
3. Ensure backward compatibility with existing valid files

For VS Code extension:
1. Identify what needs to change in package.json
2. Determine how to integrate linter as diagnostic engine
3. Fix grammar patterns to match schema

### 3. Implement

**Linter YAML support:**
- Add `extractYamlAppendix()` function similar to `extractJsonAppendix()`
- Update `validateJsonAppendix()` to also handle YAML
- Add yaml parsing as dependency or use safe subset

**Linter external appendix:**
- Add logic to check for `ui-appendix.yaml` or `ui-appendix.json` in same directory
- Fall back to embedded block if external not found

**Referential integrity:**
- Remove the skip comment in `validateReferentialIntegrity()`
- Add STATE-* checking similar to SCREEN-* checking
- Add ROLE-* checking

**VS Code extension:**
- Fix package.json manifest fields
- Update extension.js to call linter subprocess
- Fix TextMate grammar patterns

### 4. Test

```bash
# Test linter on samples (should pass after fixes)
node tooling/ui-md-linter/ui-md-lint.js samples/kanban/UI.md samples/mobile-onboarding/UI.md samples/cli-dashboard/UI.md

# Test new functionality
# YAML: create UI.md with ```yaml appendix, run linter
# External: create ui-appendix.yaml, run linter on UI.md without embedded appendix
# Integrity: create UI.md with broken references, verify errors

# Run test suite (once created)
node --test tooling/ui-md-linter/test*.js
```

### 5. Commit

Commit with descriptive message referencing feature ID.

## Example Handoff

```json
{
  "salientSummary": "Added YAML appendix support to linter. Linter now extracts ```yaml blocks and validates against schema. External appendix file support also added - linter checks for ui-appendix.yaml alongside UI.md.",
  "whatWasImplemented": "Added extractYamlAppendix() function using safe YAML subset parsing. Updated validateJsonAppendix() to handle both JSON and YAML. Added external file discovery logic checking for ui-appendix.yaml before embedded blocks.",
  "whatWasLeftUndone": "YAML parsing uses safe subset (no arbitrary code execution). Full YAML 1.2 compatibility deferred to later version.",
  "verification": {
    "commandsRun": [
      {
        "command": "node tooling/ui-md-linter/ui-md-lint.js test-yaml.md",
        "exitCode": 0,
        "observation": "YAML appendix validated successfully"
      },
      {
        "command": "node tooling/ui-md-linter/ui-md-lint.js test-external/ui.md (with ui-appendix.yaml)",
        "exitCode": 0,
        "observation": "External appendix discovered and validated"
      }
    ]
  },
  "tests": {
    "added": [
      {
        "file": "tooling/ui-md-linter/test-yaml.js",
        "cases": [
          { "name": "parses valid YAML appendix", "verifies": "VAL-LINT-002" },
          { "name": "rejects invalid YAML", "verifies": "VAL-LINT-002" }
        ]
      }
    ]
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- If YAML parsing requires external dependency that needs npm install
- If VS Code extension packaging requires additional tooling
- If test cases reveal spec ambiguity that needs docs-worker
