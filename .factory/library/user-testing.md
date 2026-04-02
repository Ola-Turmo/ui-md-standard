# User Testing

This is a documentation/tooling improvement mission. There is no user-facing application to test via browser or terminal UI.

## Validation Approach

Validation is done through:

1. **Linter execution**: Running `node tooling/ui-md-linter/ui-md-lint.js` on sample files
2. **File inspection**: Verifying correct content in SPEC.md, schema.json, package.json, etc.
3. **CI workflow**: GitHub Actions validates on push/PR

## What to Verify

| Feature | Verification Method |
|---------|---------------------|
| Linter YAML support | Run linter on UI.md with ```yaml appendix |
| External appendix | Place ui-appendix.yaml next to UI.md, run linter |
| State integrity | Create file with broken STATE reference, verify error |
| VS Code manifest | Inspect package.json fields |
| CI workflow | Verify .github/workflows/ contents |

## No Browser/UI Testing Required

This mission does not involve:
- Web applications
- Terminal UI applications
- Any user-interactable interface

All verification is done through file inspection and CLI execution.
