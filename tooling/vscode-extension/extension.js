// UI.md Standard VS Code Extension
// Main entry point

const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

/**
 * Run the UI.md linter and return parsed JSON results
 * @param {string} filePath - Absolute path to the UI.md file
 * @returns {Promise<{passed: boolean, files: Array}>}
 */
function runLinter(filePath) {
  return new Promise((resolve, reject) => {
    const extensionPath = path.dirname(__dirname);
    const linterPath = path.join(extensionPath, 'ui-md-linter', 'ui-md-lint.js');
    
    const proc = spawn('node', [linterPath, '--json', filePath], {
      cwd: extensionPath
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      try {
        // Parse JSON output from stdout
        if (stdout.trim()) {
          const result = JSON.parse(stdout);
          resolve(result);
        } else if (stderr.trim()) {
          // Fallback: try to parse stderr if stdout is empty
          const result = JSON.parse(stderr);
          resolve(result);
        } else {
          // No output at all - file might have passed but produced no JSON
          resolve({ passed: code === 0, files: [], totalErrors: 0 });
        }
      } catch (err) {
        // If JSON parsing fails, try to extract info from stderr
        if (stderr.includes('passed validation')) {
          resolve({ passed: true, files: [], totalErrors: 0 });
        } else {
          reject(new Error(`Failed to parse linter output: ${err.message}\nstdout: ${stdout}\nstderr: ${stderr}`));
        }
      }
    });
    
    proc.on('error', (err) => {
      reject(new Error(`Failed to run linter: ${err.message}`));
    });
  });
}

/**
 * Convert linter error to VS Code Diagnostic
 * @param {object} error - Linter error object
 * @param {vscode.TextDocument} document - The text document
 * @returns {vscode.Diagnostic}
 */
function createDiagnostic(error, document) {
  const range = error.line && error.line > 0
    ? new vscode.Range(error.line - 1, 0, error.line - 1, 200)
    : new vscode.Range(0, 0, 0, 0);
  
  const severity = error.type === 'structure' || error.type === 'referential'
    ? vscode.DiagnosticSeverity.Warning
    : vscode.DiagnosticSeverity.Error;
  
  const diagnostic = new vscode.Diagnostic(range, error.message, severity);
  diagnostic.source = 'UI.md Linter';
  diagnostic.code = error.type;
  
  if (error.suggestion) {
    diagnostic.relatedInformation = [
      new vscode.DiagnosticRelatedInformation(
        new vscode.Location(document.uri, range),
        error.suggestion
      )
    ];
  }
  
  return diagnostic;
}

/**
 * Validate a UI.md document and update diagnostics
 * @param {vscode.TextDocument} document - The document to validate
 * @param {vscode.DiagnosticCollection} diagnosticCollection - The diagnostic collection
 */
async function validateDocument(document, diagnosticCollection) {
  if (!document.fileName.endsWith('.ui.md')) {
    return;
  }
  
  try {
    const result = await runLinter(document.fileName);
    
    const diagnostics = [];
    
    if (!result.passed && result.files) {
      for (const fileResult of result.files) {
        if (!fileResult.passed && fileResult.errors) {
          for (const error of fileResult.errors) {
            diagnostics.push(createDiagnostic(error, document));
          }
        }
      }
    }
    
    diagnosticCollection.set(document.uri, diagnostics);
  } catch (err) {
    // On error, clear diagnostics and log
    diagnosticCollection.set(document.uri, []);
    console.error('Linter error:', err.message);
  }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Create diagnostic collection for UI.md files
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('ui-md');
  
  // Register validation command that uses linter
  const validateCommand = vscode.commands.registerCommand('uiMd.validate', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor');
      return;
    }
    
    const document = editor.document;
    if (!document.fileName.endsWith('.ui.md')) {
      vscode.window.showInformationMessage('Not a UI.md file');
      return;
    }
    
    await validateDocument(document, diagnosticCollection);
    
    const diagnostics = diagnosticCollection.get(document.uri);
    if (!diagnostics || diagnostics.length === 0) {
      vscode.window.showInformationMessage('UI.md validation passed!');
    } else {
      vscode.window.showWarningMessage(
        `UI.md has ${diagnostics.length} issue(s). Check Problems panel.`
      );
    }
  });
  
  // Validate all open UI.md documents on activation
  vscode.workspace.textDocuments.forEach(doc => {
    if (doc.fileName.endsWith('.ui.md')) {
      validateDocument(doc, diagnosticCollection);
    }
  });
  
  // Listen for document changes
  const documentChangeListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
    if (event.document.fileName.endsWith('.ui.md')) {
      // Debounce validation to avoid excessive linter calls
      clearTimeout(documentChangeListener._timeout);
      documentChangeListener._timeout = setTimeout(() => {
        validateDocument(event.document, diagnosticCollection);
      }, 500);
    }
  });
  
  // Listen for document save
  const documentSaveListener = vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.fileName.endsWith('.ui.md')) {
      validateDocument(document, diagnosticCollection);
    }
  });
  
  // Listen for document close
  const documentCloseListener = vscode.workspace.onDidCloseTextDocument((document) => {
    if (document.fileName.endsWith('.ui.md')) {
      diagnosticCollection.set(document.uri, []);
    }
  });
  
  // Register preview command
  const previewCommand = vscode.commands.registerCommand('uiMd.showPreview', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor');
      return;
    }
    
    // Open preview in a new column
    const doc = await vscode.workspace.openTextDocument(editor.document.uri);
    await vscode.commands.executeCommand('markdown.showPreview', doc.uri);
  });
  
  // Register screen template command
  const screenTemplateCommand = vscode.commands.registerCommand('uiMd.insertScreenTemplate', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }
    
    const template = `
### SCREEN-<screen-name>

**Purpose:** <Describe the purpose of this screen>

**Primary Actions:**
- <Action 1>
- <Action 2>

**Entry Conditions:**
- User must be <condition>

**Exit Conditions:**
- Navigates to <screen> on <action>
- Returns to <screen> on <action>

**Associated States:**
- \`STATE-<state-name>\`
`;
    
    editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.start, template);
    });
  });
  
  // Register state template command
  const stateTemplateCommand = vscode.commands.registerCommand('uiMd.insertStateTemplate', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }
    
    const template = `
### STATE-<state-name>

**Type:** <loading|empty|error|success|offline>

**Description:** <Describe this state>

**User Indicators:**
- <What the user sees>

**Transitions:**
- From \`STATE-<from-state>\` when <event>
- To \`STATE-<to-state>\` on <action>
`;
    
    editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.start, template);
    });
  });
  
  // Register completion provider for screen/state IDs
  const completionProvider = vscode.languages.registerCompletionItemProvider('ui-md', {
    provideCompletionItems(document, position) {
      const screenCompletion = new vscode.CompletionItem('SCREEN-');
      screenCompletion.kind = vscode.CompletionItemKind.Class;
      screenCompletion.insertText = new vscode.SnippetString('SCREEN-${1:name}');
      screenCompletion.documentation = new vscode.MarkdownString('Insert a screen ID');
      
      const stateCompletion = new vscode.CompletionItem('STATE-');
      stateCompletion.kind = vscode.CompletionItemKind.Variable;
      stateCompletion.insertText = new vscode.SnippetString('STATE-${1:name}');
      stateCompletion.documentation = new vscode.MarkdownString('Insert a state ID');
      
      return [screenCompletion, stateCompletion];
    }
  }, '-');
  
  // Register hover provider
  const hoverProvider = vscode.languages.registerHoverProvider('ui-md', {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);
      
      if (word.startsWith('SCREEN-')) {
        return new vscode.Hover(`**Screen ID**: ${word}\n\nDefined in: Screen Inventory`);
      }
      if (word.startsWith('STATE-')) {
        return new vscode.Hover(`**State ID**: ${word}\n\nDefined in: State Model`);
      }
      return null;
    }
  });
  
  context.subscriptions.push(
    validateCommand,
    documentChangeListener,
    documentSaveListener,
    documentCloseListener,
    previewCommand,
    screenTemplateCommand,
    stateTemplateCommand,
    completionProvider,
    hoverProvider,
    diagnosticCollection
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
