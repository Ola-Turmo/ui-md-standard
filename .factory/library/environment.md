# Environment

## Node.js

- **Minimum version**: Node.js 18 LTS
- **Testing**: Built-in `node --test` runner or any JS test framework

## Dependencies

Install with:
```bash
npm install
```

Required for YAML parsing (if implementing YAML support):
```bash
npm install js-yaml
```

## File Locations

- **Working directory**: `/root/lovkode.no/ui-md-standard`
- **Linter**: `tooling/ui-md-linter/ui-md-lint.js`
- **Schema**: `tooling/ui-md-linter/schema.json`
- **VS Code extension**: `tooling/vscode-extension/`
- **Samples**: `samples/*/UI.md`

## Running the Linter

```bash
# Validate single file
node tooling/ui-md-linter/ui-md-lint.js UI.md

# Validate all samples
node tooling/ui-md-linter/ui-md-lint.js samples/*/UI.md

# Exit codes
# 0 = validation passed
# 1 = validation errors found
# 2 = file not found
```

## VS Code Extension Development

```bash
cd tooling/vscode-extension
npm install
# Package with vsce (if installed globally)
vsce package
```
