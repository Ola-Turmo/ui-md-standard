# UI.md Standard VS Code Extension

A VS Code extension that provides language support, validation diagnostics, and preview capabilities for [UI.md](https://github.com/Ola-Turmo/UI.md) files.

## Features

### 1. Syntax Highlighting
The extension provides syntax highlighting for `.ui.md` files, recognizing:
- Section headers (Screen Inventory, Navigation Graph, etc.)
- Screen and state IDs (`SCREEN-<name>`, `STATE-<name>`)
- Data entity definitions
- JSON/YAML code blocks in the machine-readable appendix

### 2. Validation Diagnostics
When enabled, the extension validates UI.md files against the [UI.md schema](../../ui-md-linter/schema.json):
- Checks for required sections (Screen Inventory, Navigation Graph, State Model, etc.)
- Validates screen and state ID uniqueness
- Ensures machine-readable appendix conforms to schema
- Reports errors with line numbers and fix suggestions

### 3. UI.md Preview
Provides a preview panel for viewing rendered UI.md content with proper formatting.

## Installation from Source

### Prerequisites
- [Node.js](https://nodejs.org/) v16+ 
- [VS Code](https://code.visualstudio.com/) v1.75+

### Steps

1. **Clone the repository** (if not already):
   ```bash
   git clone https://github.com/Ola-Turmo/UI.md.git
   cd UI.md
   ```

2. **Install dependencies**:
   ```bash
   cd tooling/vscode-extension
   npm install
   ```

3. **Package the extension** (requires `vsce`):
   ```bash
   npm install -g vsce
   vsce package
   ```
   This creates a `.vsix` file.

4. **Install the `.vsix` file**:
   - Open VS Code
   - Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
   - Click the `...` menu in the top-right
   - Select "Install from VSIX..."
   - Choose the generated `.vsix` file

### Alternative: Development Mode

To run the extension in development mode without packaging:

1. Open the `tooling/vscode-extension` folder in VS Code
2. Press `F5` to launch the Extension Development Host
3. The extension will be active in the new window

## Usage

### Opening UI.md Files

Once installed, the extension activates automatically when you open a `.ui.md` file. You'll see:

- **Syntax highlighting** applied immediately
- **Validation errors** shown in the Problems panel (`Ctrl+Shift+M` / `Cmd+Shift+M`)
- **Hover information** on screen/state IDs

### Configuration

The extension provides the following settings (accessible via `Ctrl+,` / `Cmd+,`):

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `uiMd.enableDiagnostics` | boolean | `true` | Enable/disable validation diagnostics |
| `uiMd.enablePreview` | boolean | `true` | Enable/disable preview panel |

### Validation Rules

The linter validates:
- Presence of required sections
- Unique screen IDs (format: `SCREEN-<name>`)
- Unique state IDs (format: `STATE-<name>`)
- Valid machine-readable appendix (JSON/YAML)
- Navigation graph referential integrity

### Command Palette

The following commands are available via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **UI.md: Validate Current File** — Run validation on the active editor
- **UI.md: Show Preview** — Open the preview panel
- **UI.md: Insert Screen Template** — Insert a new screen definition template
- **UI.md: Insert State Template** — Insert a new state definition template

## File Structure

```
tooling/vscode-extension/
├── package.json              # Extension manifest
├── README.md                 # This file
├── extension.js              # Main extension entry point
├── language-configuration.json # Language settings (brackets, comments)
└── syntaxes/
    └── ui-md.tmLanguage.json # TextMate grammar for syntax highlighting
```

## Schema

The extension validates UI.md files against the [UI.md Schema](../../ui-md-linter/schema.json) defined in the `ui-md-linter` tooling.

## License

MIT — See [LICENSE](../../LICENSE) in the repository root.
