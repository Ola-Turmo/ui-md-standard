<!--

Thanks for contributing to the UI.md standard! 

Please fill out this PR template to help reviewers understand your changes.

-->

## PR Type

What type of change is this PR?

- [ ] **Spec** — Changes to SPEC.md, schema.json, or sample UI.md files
- [ ] **Tooling** — Changes to linter, VS Code extension, or CLI tools
- [ ] **Docs** — Changes to documentation (README, AGENTS.md, CONTRIBUTING, etc.)
- [ ] **CI/CD** — Changes to GitHub Actions workflows
- [ ] **Community** — Changes to templates, CODEOWNERS, or other community files

## Summary

Briefly describe the changes in this PR:

<!-- Provide a summary of what this PR does and why -->

## Motivation

Why is this change being made?

<!-- 
- What problem does it solve?
- What use case does it address?
- How does it align with the UI.md standard goals?
-->

## Changes Made

List the specific files changed and a brief description of each change:

| File | Change Description |
|------|-------------------|
| `SPEC.md` | <!-- describe --> |
| `tooling/ui-md-linter/schema.json` | <!-- describe --> |
| `tooling/ui-md-linter/ui-md-lint.js` | <!-- describe --> |
| `samples/kanban/UI.md` | <!-- describe --> |
| <!-- add more rows as needed --> |

## Breaking Changes

Does this PR introduce any breaking changes?

- [ ] Yes — This PR contains breaking changes (specify below)
- [ ] No — This PR does not contain breaking changes

<!-- If yes, describe what breaks and how it should be handled -->

## Migration Required

If this PR changes the spec or schema, do existing UI.md files need to be migrated?

- [ ] Yes — Migration steps are described below
- [ ] No — No migration needed
- [ ] N/A — This PR doesn't affect the spec/schema

<!-- If yes, describe how to migrate existing files -->

## Validation

Please confirm you have run the linter and tests:

```bash
# Run the linter
node tooling/ui-md-linter/ui-md-lint.js <changed-files>

# Run tests (if applicable)
npm test
```

- [ ] Linter passes on all changed files
- [ ] Tests pass (if applicable)
- [ ] No new warnings introduced

<!-- Paste linter output below -->
```
<!-- Linter output -->
```

## Checklist

- [ ] My code/style follows the UI.md standard format conventions
- [ ] I have verified all IDs use the correct format (SCREEN-*, STATE-*, ROLE-*, ENTITY-*, PATTERN-*)
- [ ] I have added or updated machine-readable appendix entries as needed
- [ ] I have run the linter: `node tooling/ui-md-linter/ui-md-lint.js <files>`
- [ ] I have reviewed my changes for implementation independence (no React/Vue/Angular, no API paths, no CSS classes)

## Additional Context

Add any other relevant context for reviewers:

<!-- Any additional information reviewers should know -->

## Related Issues

- Fixes #<!-- issue number -->
- Related to #<!-- related issue number -->
