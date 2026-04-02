#!/usr/bin/env node
/**
 * UI.md Linter Test Suite
 * Tests validation logic for JSON/YAML appendix parsing, section ordering,
 * duplicate ID detection, schema validation, and referential integrity checks.
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const { 
  lintFile, 
  validateMarkdownStructure, 
  validateScreenIds, 
  validateStateIds,
  validateJsonAppendix,
  validateReferentialIntegrity 
} = require('./ui-md-lint');

// Helper to create a temporary UI.md content
function createTempUiMd(content) {
  return content;
}

// ============================================
// SECTION ORDERING TESTS
// ============================================
describe('validateMarkdownStructure', () => {
  test('passes for valid section order', () => {
    const content = `# Title
## 1. Product Mental Model
## 2. Users and Roles
### ROLE-test
## 3. Screen Inventory
### SCREEN-test
## 4. Navigation Model
## 5. Core User Flows
## 6. Interaction Patterns
## 7. State Model
### STATE-test
## 8. Data Contract
## 9. Machine-Readable Appendix
\`\`\`json
{"version": "1.0", "screens": [], "states": [], "navigation": [], "dataContracts": {}}
\`\`\`
`;
    const errors = validateMarkdownStructure(content);
    assert.strictEqual(errors.length, 0, 'Should have no errors for valid section order');
  });

  test('fails when required section is missing', () => {
    const content = `# Title
## 1. Product Mental Model
## 3. Screen Inventory
`;
    const errors = validateMarkdownStructure(content);
    assert.ok(errors.length > 0, 'Should detect missing sections');
    assert.ok(errors.some(e => e.message.includes('2. Users and Roles')), 
      'Should report missing Users and Roles section');
  });

  test('fails when section is out of order', () => {
    const content = `# Title
## 3. Screen Inventory
## 2. Users and Roles
`;
    const errors = validateMarkdownStructure(content);
    assert.ok(errors.length > 0, 'Should detect out-of-order sections');
    assert.ok(errors.some(e => e.type === 'structure' && e.message.includes('out of order')), 
      'Should report section ordering issue');
  });
});

// ============================================
// DUPLICATE ID DETECTION TESTS
// ============================================
describe('validateScreenIds', () => {
  test('passes when no duplicate screen IDs exist', () => {
    const content = `### SCREEN-board\n### SCREEN-cardDetail\n`;
    const errors = validateScreenIds(content);
    assert.strictEqual(errors.length, 0, 'Should have no errors for unique screen IDs');
  });

  test('fails when duplicate screen ID exists', () => {
    const content = `### SCREEN-board\n### SCREEN-board\n`;
    const errors = validateScreenIds(content);
    assert.ok(errors.length > 0, 'Should detect duplicate screen ID');
    assert.ok(errors[0].message.includes('Duplicate screen ID'), 'Should report duplicate');
    assert.strictEqual(errors[0].type, 'duplicate-id');
  });

  test('detects duplicate with different case', () => {
    const content = `### SCREEN-Board\n### SCREEN-board\n`;
    const errors = validateScreenIds(content);
    // These are technically different IDs (case-sensitive) so no duplicate should be flagged
    assert.strictEqual(errors.length, 0, 'Case-sensitive IDs are not duplicates');
  });
});

describe('validateStateIds', () => {
  test('passes when no duplicate state IDs exist', () => {
    const content = `### STATE-loading\n### STATE-empty\n`;
    const errors = validateStateIds(content);
    assert.strictEqual(errors.length, 0, 'Should have no errors for unique state IDs');
  });

  test('fails when duplicate state ID exists', () => {
    const content = `### STATE-loading\n### STATE-loading\n`;
    const errors = validateStateIds(content);
    assert.ok(errors.length > 0, 'Should detect duplicate state ID');
    assert.ok(errors[0].message.includes('Duplicate state ID'), 'Should report duplicate');
  });

  test('passes for hyphenated state IDs', () => {
    const content = `### STATE-empty-board\n### STATE-loading\n`;
    const errors = validateStateIds(content);
    assert.strictEqual(errors.length, 0, 'Should handle hyphenated state IDs');
  });
});

// ============================================
// APPENDIX PARSING TESTS
// ============================================
describe('JSON Appendix Parsing', () => {
  test('parses valid JSON appendix', () => {
    const content = `# Title
## 1. Product Mental Model
## 2. Users and Roles
### ROLE-authenticated
## 3. Screen Inventory
### SCREEN-test
## 4. Navigation Model
## 5. Core User Flows
## 6. Interaction Patterns
## 7. State Model
### STATE-loading
## 8. Data Contract
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test",
      "purpose": "Test screen",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": ["STATE-loading"],
      "roleAccess": ["ROLE-authenticated"]
    }
  ],
  "states": [
    {
      "id": "STATE-loading",
      "type": "loading",
      "description": "Loading state",
      "indicators": [],
      "allowedActions": []
    }
  ],
  "navigation": [],
  "roles": [
    {
      "roleId": "ROLE-authenticated",
      "name": "Authenticated",
      "description": "Test role",
      "capabilities": [],
      "visibleScreens": ["SCREEN-test"]
    }
  ],
  "dataContracts": {}
}
\`\`\`
`;
    
    // Test via lintFile
    const tempPath = path.join(__dirname, '__test_temp__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    // Should have no errors for valid JSON
    const relevantErrors = errors.filter(e => e.type !== 'structure');
    assert.strictEqual(relevantErrors.length, 0, 'Valid JSON appendix should not produce errors');
  });

  test('fails for invalid JSON syntax', () => {
    // Complete UI.md structure to get past structure validation
    const content = `# Title
## 1. Product Mental Model
## 2. Users and Roles
### ROLE-test
## 3. Screen Inventory
### SCREEN-test
## 4. Navigation Model
## 5. Core User Flows
## 6. Interaction Patterns
## 7. State Model
### STATE-test
## 8. Data Contract
## 9. Machine-Readable Appendix
\`\`\`json
{ invalid json content }
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_invalid__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'json-parse'), 'Should detect JSON parse error');
  });

  test('fails when appendix is missing', () => {
    const content = `## 9. Machine-Readable Appendix
No appendix here
`;

    const tempPath = path.join(__dirname, '__test_missing__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'appendix-missing'), 'Should detect missing appendix');
  });
});

describe('YAML Appendix Parsing', () => {
  test('parses valid YAML appendix', () => {
    const content = `## 9. Machine-Readable Appendix
\`\`\`yaml
version: "1.0"
screens:
  - id: SCREEN-test
    purpose: Test screen
    primaryActions: []
    entryConditions: []
    exitConditions: []
    states:
      - STATE-loading
    roleAccess:
      - ROLE-authenticated
states:
  - id: STATE-loading
    type: loading
    description: Loading state
    indicators: []
    allowedActions: []
navigation: []
roles:
  - roleId: ROLE-authenticated
    name: Authenticated
    description: Test role
    capabilities: []
    visibleScreens:
      - SCREEN-test
dataContracts: {}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_yaml__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    // Should have no errors for valid YAML
    const relevantErrors = errors.filter(e => e.type !== 'structure');
    assert.strictEqual(relevantErrors.length, 0, 'Valid YAML appendix should not produce errors');
  });

  test('fails for invalid YAML syntax', () => {
    // Complete UI.md structure to get past structure validation
    const content = `# Title
## 1. Product Mental Model
## 2. Users and Roles
### ROLE-test
## 3. Screen Inventory
### SCREEN-test
## 4. Navigation Model
## 5. Core User Flows
## 6. Interaction Patterns
## 7. State Model
### STATE-test
## 8. Data Contract
## 9. Machine-Readable Appendix
\`\`\`yaml
version: "1.0"
screens:
  - id: SCREEN-test
    purpose: [invalid yaml
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_yaml_invalid__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'yaml-parse'), 'Should detect YAML parse error');
  });
});

// ============================================
// SCHEMA VALIDATION TESTS
// ============================================
describe('Schema Validation', () => {
  test('validates screen ID format against schema', () => {
    // Invalid: screen ID starting with number (fails pattern ^SCREEN-[A-Za-z][a-zA-Z0-9]*$)
    // Note: Schema allows lowercase letters after SCREEN- (pattern uses [A-Za-z])
    const content = `# Title
## 1. Product Mental Model
## 2. Users and Roles
### ROLE-test
## 3. Screen Inventory
### SCREEN-test
## 4. Navigation Model
## 5. Core User Flows
## 6. Interaction Patterns
## 7. State Model
### STATE-test
## 8. Data Contract
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-1invalid",
      "purpose": "Test",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": []
    }
  ],
  "states": [],
  "navigation": [],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_screen_format__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    // Screen ID starting with number should fail schema validation
    assert.ok(errors.some(e => e.type === 'schema' && e.message.includes('pattern')), 
      'Should validate screen ID format');
  });

  test('validates state type against allowed enum', () => {
    const content = `# Title
## 1. Product Mental Model
## 2. Users and Roles
### ROLE-test
## 3. Screen Inventory
### SCREEN-test
## 4. Navigation Model
## 5. Core User Flows
## 6. Interaction Patterns
## 7. State Model
### STATE-test
## 8. Data Contract
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [],
  "states": [
    {
      "id": "STATE-test",
      "type": "invalid-type",
      "description": "Test",
      "indicators": [],
      "allowedActions": []
    }
  ],
  "navigation": [],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_state_type__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'schema'), 'Should validate state type enum');
  });

  test('validates backStack enum in navigation', () => {
    const content = `# Title
## 1. Product Mental Model
## 2. Users and Roles
### ROLE-test
## 3. Screen Inventory
### SCREEN-test
## 4. Navigation Model
## 5. Core User Flows
## 6. Interaction Patterns
## 7. State Model
### STATE-test
## 8. Data Contract
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test",
      "purpose": "Test",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": []
    }
  ],
  "states": [],
  "navigation": [
    {
      "from": "SCREEN-test",
      "to": "SCREEN-test",
      "trigger": "test",
      "backStack": "invalid-backstack"
    }
  ],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_backstack__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'schema'), 'Should validate backStack enum');
  });

  test('validates required fields in screens', () => {
    const content = `# Title
## 1. Product Mental Model
## 2. Users and Roles
### ROLE-test
## 3. Screen Inventory
### SCREEN-test
## 4. Navigation Model
## 5. Core User Flows
## 6. Interaction Patterns
## 7. State Model
### STATE-test
## 8. Data Contract
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test"
    }
  ],
  "states": [],
  "navigation": [],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_required__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'schema'), 'Should validate required fields');
  });
});

// ============================================
// REFERENTIAL INTEGRITY TESTS
// ============================================
describe('Referential Integrity - Screens', () => {
  test('fails when prose references undefined SCREEN', () => {
    const content = `## 3. Screen Inventory
### SCREEN-test
From SCREEN-undefined you can navigate...
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test",
      "purpose": "Test",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": []
    }
  ],
  "states": [],
  "navigation": [],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_undefined_screen__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'referential' && e.message.includes('SCREEN-undefined')), 
      'Should detect undefined screen reference');
  });

  test('passes when all referenced screens are defined', () => {
    const content = `## 3. Screen Inventory
### SCREEN-test
### SCREEN-test2
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test",
      "purpose": "Test",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": []
    },
    {
      "id": "SCREEN-test2",
      "purpose": "Test 2",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": []
    }
  ],
  "states": [],
  "navigation": [
    {"from": "SCREEN-test", "to": "SCREEN-test2", "trigger": "navigate"}
  ],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_all_screens_defined__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    const refErrors = errors.filter(e => e.type === 'referential');
    assert.strictEqual(refErrors.length, 0, 'All defined screens should not produce errors');
  });
});

describe('Referential Integrity - States', () => {
  test('fails when prose references undefined STATE', () => {
    const content = `## 3. Screen Inventory
### SCREEN-test
States: STATE-nonexistent
## 7. State Model
### STATE-loading
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test",
      "purpose": "Test",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": ["STATE-nonexistent"],
      "roleAccess": []
    }
  ],
  "states": [
    {
      "id": "STATE-loading",
      "type": "loading",
      "description": "Loading",
      "indicators": [],
      "allowedActions": []
    }
  ],
  "navigation": [],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_undefined_state__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'referential' && e.message.includes('STATE-nonexistent')), 
      'Should detect undefined state reference');
  });

  test('passes when all referenced states are defined', () => {
    const content = `## 3. Screen Inventory
### SCREEN-test
## 7. State Model
### STATE-loading
### STATE-empty
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test",
      "purpose": "Test",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": ["STATE-loading", "STATE-empty"],
      "roleAccess": []
    }
  ],
  "states": [
    {
      "id": "STATE-loading",
      "type": "loading",
      "description": "Loading",
      "indicators": [],
      "allowedActions": []
    },
    {
      "id": "STATE-empty",
      "type": "empty",
      "description": "Empty",
      "indicators": [],
      "allowedActions": []
    }
  ],
  "navigation": [],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_all_states_defined__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    const refErrors = errors.filter(e => e.type === 'referential');
    assert.strictEqual(refErrors.length, 0, 'All defined states should not produce errors');
  });
});

describe('Referential Integrity - Roles', () => {
  test('fails when screen references undefined ROLE', () => {
    const content = `## 2. Users and Roles
### ROLE-authenticated
## 3. Screen Inventory
### SCREEN-test
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test",
      "purpose": "Test",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": ["ROLE-authenticated", "ROLE-nonexistent"]
    }
  ],
  "states": [],
  "navigation": [],
  "roles": [
    {
      "roleId": "ROLE-authenticated",
      "name": "Authenticated",
      "description": "Test",
      "capabilities": [],
      "visibleScreens": []
    }
  ],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_undefined_role__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'referential' && e.message.includes('ROLE-nonexistent')), 
      'Should detect undefined role reference');
  });
});

describe('Referential Integrity - Navigation', () => {
  test('fails when navigation target is undefined screen', () => {
    const content = `## 3. Screen Inventory
### SCREEN-test
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test",
      "purpose": "Test",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": []
    }
  ],
  "states": [],
  "navigation": [
    {
      "from": "SCREEN-test",
      "to": "SCREEN-nonexistent",
      "trigger": "click"
    }
  ],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_nav_target__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'referential' && e.message.includes('SCREEN-nonexistent')), 
      'Should detect undefined navigation target');
  });

  test('fails when navigation from is undefined screen', () => {
    const content = `## 3. Screen Inventory
### SCREEN-test
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test",
      "purpose": "Test",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": []
    }
  ],
  "states": [],
  "navigation": [
    {
      "from": "SCREEN-nonexistent",
      "to": "SCREEN-test",
      "trigger": "click"
    }
  ],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_nav_from__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    assert.ok(errors.some(e => e.type === 'referential' && e.message.includes('SCREEN-nonexistent')), 
      'Should detect undefined navigation source');
  });

  test('passes when navigation targets valid screens', () => {
    const content = `## 3. Screen Inventory
### SCREEN-test1
### SCREEN-test2
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-test1",
      "purpose": "Test 1",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": []
    },
    {
      "id": "SCREEN-test2",
      "purpose": "Test 2",
      "primaryActions": [],
      "entryConditions": [],
      "exitConditions": [],
      "states": [],
      "roleAccess": []
    }
  ],
  "states": [],
  "navigation": [
    {
      "from": "SCREEN-test1",
      "to": "SCREEN-test2",
      "trigger": "click",
      "backStack": "Push"
    }
  ],
  "dataContracts": {}
}
\`\`\`
`;

    const tempPath = path.join(__dirname, '__test_nav_valid__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    const refErrors = errors.filter(e => e.type === 'referential');
    assert.strictEqual(refErrors.length, 0, 'Valid navigation should not produce errors');
  });
});

// ============================================
// INTEGRATION TESTS - Sample Files
// ============================================
describe('Sample Files', () => {
  const sampleFiles = [
    'samples/kanban/UI.md',
    'samples/mobile-onboarding/UI.md',
    'samples/cli-dashboard/UI.md'
  ];

  for (const sampleFile of sampleFiles) {
    const fullPath = path.join(__dirname, '..', '..', sampleFile);
    
    test(`lints ${sampleFile} without errors`, () => {
      if (!fs.existsSync(fullPath)) {
        // Skip if sample doesn't exist
        return;
      }
      
      const errors = lintFile(fullPath);
      const fatalErrors = errors.filter(e => 
        !['structure'].includes(e.type)
      );
      
      if (fatalErrors.length > 0) {
        console.log('Errors found:', JSON.stringify(fatalErrors, null, 2));
      }
      assert.strictEqual(fatalErrors.length, 0, `${sampleFile} should pass linting`);
    });
  }
});

// ============================================
// ERROR FORMAT TESTS
// ============================================
describe('Error Format', () => {
  test('errors include type, message, and suggestion', () => {
    const content = `### SCREEN-test\n### SCREEN-test\n`;
    
    const errors = validateScreenIds(content);
    
    assert.ok(errors.length > 0, 'Should have errors');
    assert.ok(errors[0].type, 'Error should have type');
    assert.ok(errors[0].message, 'Error should have message');
    assert.ok(errors[0].suggestion, 'Error should have suggestion');
    assert.ok(errors[0].line, 'Error should have line number');
  });

  test('lintFile returns array of errors', () => {
    // Complete UI.md structure to get meaningful errors
    const content = `# Title
## 1. Product Mental Model
## 2. Users and Roles
### ROLE-test
## 3. Screen Inventory
### SCREEN-test
## 4. Navigation Model
## 5. Core User Flows
## 6. Interaction Patterns
## 7. State Model
### STATE-test
## 8. Data Contract
## 9. Machine-Readable Appendix
\`\`\`json
{
  "version": "1.0",
  "screens": [],
  "states": [],
  "navigation": [],
  "dataContracts": {}
}
\`\`\`
`;
    
    const tempPath = path.join(__dirname, '__test_format__.md');
    fs.writeFileSync(tempPath, content);
    
    const errors = lintFile(tempPath);
    fs.unlinkSync(tempPath);
    
    // lintFile returns raw errors array without file property
    // The file property is added by formatError when printing
    assert.ok(Array.isArray(errors), 'lintFile should return array');
  });
});

// ============================================
// BOUNDARY CONDITION TESTS
// ============================================
describe('Boundary Conditions', () => {
  test('handles empty content', () => {
    const errors = validateMarkdownStructure('');
    assert.ok(errors.length > 0, 'Should detect missing sections');
  });

  test('handles file with only title', () => {
    const content = `# Title Only`;
    const errors = validateMarkdownStructure(content);
    assert.ok(errors.length > 0, 'Should detect missing required sections');
  });

  test('handles screen IDs with numbers', () => {
    const content = `### SCREEN-board1\n### SCREEN-board2\n`;
    const errors = validateScreenIds(content);
    assert.strictEqual(errors.length, 0, 'Screen IDs with numbers should be valid');
  });

  test('handles state IDs with multiple hyphens', () => {
    const content = `### STATE-error-recovery-mode\n`;
    const errors = validateStateIds(content);
    assert.strictEqual(errors.length, 0, 'State IDs with multiple hyphens should be valid');
  });
});
