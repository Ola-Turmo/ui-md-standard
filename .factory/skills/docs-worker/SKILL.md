---
name: docs-worker
description: Documentation and spec coherence worker for UI.md standard improvements
---

# Docs Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

This worker handles features related to:
- SPEC.md and schema.json alignment (state types, back-stack, ID formats)
- Documentation fixes (repo references, install story, Node.js version)
- Community health files (SECURITY.md, CODEOWNERS, templates)

## Required Skills

None — this is a documentation-only worker. No external testing tools needed.

## Work Procedure

### 1. Understand the current state

Read the relevant files to understand current state:
- SPEC.md for the area being fixed
- schema.json for machine-readable definitions
- Any docs that need fixing

### 2. Plan the fix

Determine the correct behavior based on:
- PRD requirements
- Consistency across all artifacts
- Minimal breaking changes

### 3. Implement the fix

For spec/schema alignment:
1. Update SPEC.md prose to match the intended canonical behavior
2. Update schema.json if schema was incorrect
3. Update samples if they use non-compliant formats (coordinate with tooling-worker)

For docs fixes:
1. Fix all occurrences of wrong repo name
2. Update install instructions to be accurate
3. Normalize Node.js version requirements

For community files:
1. Create SECURITY.md with vulnerability reporting instructions
2. Create .github/CODEOWNERS with ownership rules
3. Create issue/PR templates

### 4. Verify

Run linter on samples if any structural changes:
```bash
node tooling/ui-md-linter/ui-md-lint.js samples/kanban/UI.md samples/mobile-onboarding/UI.md samples/cli-dashboard/UI.md
```

Check for broken references:
```bash
grep -r "ui-md-standard" --include="*.md" .
grep -h "Node.js" README.md tooling/*/README.md
```

### 5. Commit

Commit with descriptive message referencing the feature ID.

## Example Handoff

```json
{
  "salientSummary": "Aligned SPEC.md and schema.json on state types by expanding SPEC enum to include all 13 types from schema (loading, empty, error, success, offline, permission-denied, idle, scrollback, editing, search-active, streaming, refreshing, field-selected). Added migration note for v1.1.",
  "whatWasImplemented": "Updated SPEC.md Section 9.2 and Appendix A to enumerate all 13 state types. Updated SPEC.md Appendix A Quick Reference. Added v1.1 changelog note explaining the expansion.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      {
        "command": "grep -A20 'State Type Enumerations' SPEC.md",
        "exitCode": 0,
        "observation": "Shows all 13 state types now listed"
      }
    ]
  },
  "tests": { "added": [] },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- If fixing one artifact would break another in a way that requires another worker's help
- If the correct behavior is ambiguous and needs clarification
