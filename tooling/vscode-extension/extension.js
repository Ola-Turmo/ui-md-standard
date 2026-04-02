// UI.md Standard VS Code Extension
// Main entry point

const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Register validation command
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
    
    // Simple validation - check for required sections
    const text = document.getText();
    const requiredSections = [
      'Screen Inventory',
      'Navigation Graph',
      'State Model',
      'Interaction Patterns',
      'Data Contract'
    ];
    
    const missingSections = requiredSections.filter(
      section => !text.includes(`## ${section}`)
    );
    
    if (missingSections.length === 0) {
      vscode.window.showInformationMessage('UI.md validation passed!');
    } else {
      vscode.window.showWarningMessage(
        `Missing sections: ${missingSections.join(', ')}`
      );
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
    previewCommand,
    screenTemplateCommand,
    stateTemplateCommand,
    completionProvider,
    hoverProvider
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
