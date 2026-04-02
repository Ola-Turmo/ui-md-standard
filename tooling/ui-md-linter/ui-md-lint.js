#!/usr/bin/env node
/**
 * UI.md Linter
 * Validates UI.md files against the UI.md standard specification.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

// Required section headers in order
const REQUIRED_SECTIONS = [
  { pattern: /^#\s+.+/m, name: 'Title' },
  { pattern: /^##\s+1\.\s+Product\s+Mental\s+Model/m, name: '1. Product Mental Model' },
  { pattern: /^##\s+2\.\s+Users\s+and\s+Roles/m, name: '2. Users and Roles' },
  { pattern: /^##\s+3\.\s+Screen\s+Inventory/m, name: '3. Screen Inventory' },
  { pattern: /^##\s+4\.\s+Navigation\s+Model/m, name: '4. Navigation Model' },
  { pattern: /^##\s+5\.\s+Core\s+User\s+Flows/m, name: '5. Core User Flows' },
  { pattern: /^##\s+6\.\s+Interaction\s+Patterns/m, name: '6. Interaction Patterns' },
  { pattern: /^##\s+7\.\s+State\s+Model/m, name: '7. State Model' },
  { pattern: /^##\s+8\.\s+Data\s+Contract/m, name: '8. Data Contract' },
  { pattern: /^##\s+9\.\s+(Appendix:\s+)?Machine-Readable/m, name: '9. Machine-Readable Appendix' },
];

// Load JSON Schema
function loadSchema() {
  const schemaPath = path.join(__dirname, 'schema.json');
  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    return JSON.parse(schemaContent);
  } catch (err) {
    console.error(`${colors.red}Error: Could not load schema.json: ${err.message}${colors.reset}`);
    process.exit(1);
  }
}

// Simple JSON Schema validator (draft-07 compliant subset)
class JSONSchemaValidator {
  constructor(schema) {
    this.schema = schema;
  }

  validate(data, schema = this.schema, path = '') {
    const errors = [];

    // Type validation
    if (schema.type) {
      const typeError = this.validateType(data, schema.type, path);
      if (typeError) errors.push(typeError);
    }

    // Enum validation
    if (schema.enum && data !== undefined) {
      if (!schema.enum.includes(data)) {
        errors.push({
          path,
          message: `Value must be one of: ${schema.enum.join(', ')}`,
          suggestion: `Change value to one of the allowed values`
        });
      }
    }

    // Pattern validation
    if (schema.pattern && typeof data === 'string') {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(data)) {
        errors.push({
          path,
          message: `String must match pattern: ${schema.pattern}`,
          suggestion: `Ensure string matches the required pattern`
        });
      }
    }

    // Object validation
    if (schema.type === 'object' && data !== null && typeof data === 'object' && !Array.isArray(data)) {
      // Required properties
      if (schema.required) {
        for (const prop of schema.required) {
          if (data[prop] === undefined) {
            errors.push({
              path: `${path}.${prop}`,
              message: `Missing required property: ${prop}`,
              suggestion: `Add the "${prop}" property`
            });
          }
        }
      }

      // Properties validation
      if (schema.properties) {
        for (const [key, value] of Object.entries(data)) {
          if (schema.properties[key]) {
            errors.push(...this.validate(data[key], schema.properties[key], `${path}.${key}`));
          }
        }
      }

      // AdditionalProperties
      if (schema.additionalProperties === false) {
        const allowedKeys = Object.keys(schema.properties || {});
        for (const key of Object.keys(data)) {
          if (!allowedKeys.includes(key)) {
            errors.push({
              path: `${path}.${key}`,
              message: `Additional property "${key}" is not allowed`,
              suggestion: `Remove the "${key}" property or add it to the schema`
            });
          }
        }
      }
    }

    // Array validation
    if (schema.type === 'array' && Array.isArray(data)) {
      // Items validation
      if (schema.items) {
        data.forEach((item, index) => {
          errors.push(...this.validate(item, schema.items, `${path}[${index}]`));
        });
      }

      // Array-level constraints
      if (schema.minItems !== undefined && data.length < schema.minItems) {
        errors.push({
          path,
          message: `Array must have at least ${schema.minItems} items`,
          suggestion: `Add more items to the array`
        });
      }
    }

    // String constraints
    if (typeof data === 'string') {
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push({
          path,
          message: `String must be at most ${schema.maxLength} characters`,
          suggestion: `Shorten the string to ${schema.maxLength} characters or less`
        });
      }
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push({
          path,
          message: `String must be at least ${schema.minLength} characters`,
          suggestion: `Expand the string to ${schema.minLength} characters or more`
        });
      }
    }

    // Number constraints
    if (typeof data === 'number') {
      if (schema.max !== undefined && data > schema.max) {
        errors.push({
          path,
          message: `Number must be at most ${schema.max}`,
          suggestion: `Reduce the number to ${schema.max} or less`
        });
      }
      if (schema.min !== undefined && data < schema.min) {
        errors.push({
          path,
          message: `Number must be at least ${schema.min}`,
          suggestion: `Increase the number to ${schema.min} or more`
        });
      }
    }

    return errors;
  }

  validateType(data, type, path) {
    const actualType = Array.isArray(data) ? 'array' : data === null ? 'null' : typeof data;
    
    if (Array.isArray(type)) {
      if (!type.includes(actualType)) {
        return {
          path,
          message: `Expected type ${type.join(' or ')}, got ${actualType}`,
          suggestion: `Change value to one of: ${type.join(', ')}`
        };
      }
    } else if (actualType !== type) {
      return {
        path,
        message: `Expected type "${type}", got "${actualType}"`,
        suggestion: `Change value to the correct type`
      };
    }
    return null;
  }
}

// Extract line number from content and position
function getLineNumber(content, position) {
  let line = 1;
  for (let i = 0; i < position; i++) {
    if (content[i] === '\n') line++;
  }
  return line;
}

// Extract screen IDs from Markdown content
function extractScreenIds(content) {
  const screenIds = new Map(); // id -> line number
  const regex = /###\s+(SCREEN-[A-Za-z][a-zA-Z0-9]*)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    const lineNum = getLineNumber(content, match.index);
    if (screenIds.has(id)) {
      screenIds.get(id).duplicates = true;
    } else {
      screenIds.set(id, { line: lineNum, duplicates: false });
    }
  }
  return screenIds;
}

// Extract state IDs from Markdown content
// Uses greedy matching to capture full state IDs (e.g., STATE-empty-board, not partial STATE-empty)
function extractStateIds(content) {
  const stateIds = new Map(); // id -> line number
  // Pattern requires suffix to have at least one char after hyphen to avoid partial matches
  const regex = /###\s+(STATE-[A-Za-z][a-zA-Z0-9]*(?:-[a-zA-Z0-9]+)?)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    const lineNum = getLineNumber(content, match.index);
    if (stateIds.has(id)) {
      stateIds.get(id).duplicates = true;
    } else {
      stateIds.set(id, { line: lineNum, duplicates: false });
    }
  }
  return stateIds;
}

// Extract role IDs from Markdown content
function extractRoleIds(content) {
  const roleIds = new Map(); // id -> line number
  const regex = /###\s+(ROLE-[A-Za-z][a-zA-Z0-9]*)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    const lineNum = getLineNumber(content, match.index);
    if (roleIds.has(id)) {
      roleIds.get(id).duplicates = true;
    } else {
      roleIds.set(id, { line: lineNum, duplicates: false });
    }
  }
  return roleIds;
}

// Extract JSON appendix from Markdown
function extractJsonAppendix(content) {
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
  const match = content.match(jsonBlockRegex);
  if (!match) {
    return { json: null, line: null };
  }
  
  const jsonContent = match[1];
  const jsonStartIndex = match.index + match[0].indexOf(jsonContent);
  const line = getLineNumber(content, jsonStartIndex);
  
  try {
    return { json: JSON.parse(jsonContent), line };
  } catch (err) {
    return { json: null, line, parseError: err.message };
  }
}

// Extract YAML appendix from Markdown
function extractYamlAppendix(content) {
  const yamlBlockRegex = /```yaml\s*([\s\S]*?)\s*```/i;
  const match = content.match(yamlBlockRegex);
  if (!match) {
    return { yaml: null, line: null };
  }
  
  const yamlContent = match[1];
  const yamlStartIndex = match.index + match[0].indexOf(yamlContent);
  const line = getLineNumber(content, yamlStartIndex);
  
  try {
    const parsed = yaml.load(yamlContent);
    return { yaml: parsed, line };
  } catch (err) {
    return { yaml: null, line, parseError: err.message };
  }
}

// Extract appendix (tries JSON first, then YAML)
function extractAppendix(content) {
  // Try JSON first
  const jsonResult = extractJsonAppendix(content);
  if (jsonResult.json !== null || jsonResult.parseError) {
    return { format: 'json', data: jsonResult.json, line: jsonResult.line, error: jsonResult.parseError };
  }
  
  // Try YAML
  const yamlResult = extractYamlAppendix(content);
  if (yamlResult.yaml !== null || yamlResult.parseError) {
    return { format: 'yaml', data: yamlResult.yaml, line: yamlResult.line, error: yamlResult.parseError };
  }
  
  return { format: null, data: null, line: null, error: null };
}

// Find external appendix file in the same directory as the UI.md file
// Checks for ui-appendix.yaml and ui-appendix.json (yaml takes precedence)
function findExternalAppendix(filePath) {
  const dir = path.dirname(filePath);
  const yamlPath = path.join(dir, 'ui-appendix.yaml');
  const jsonPath = path.join(dir, 'ui-appendix.json');
  
  // Check for YAML first (preferred per spec)
  if (fs.existsSync(yamlPath)) {
    try {
      const content = fs.readFileSync(yamlPath, 'utf8');
      const parsed = yaml.load(content);
      return { format: 'yaml', data: parsed, path: yamlPath, error: null };
    } catch (err) {
      return { format: 'yaml', data: null, path: yamlPath, error: err.message };
    }
  }
  
  // Check for JSON
  if (fs.existsSync(jsonPath)) {
    try {
      const content = fs.readFileSync(jsonPath, 'utf8');
      return { format: 'json', data: JSON.parse(content), path: jsonPath, error: null };
    } catch (err) {
      return { format: 'json', data: null, path: jsonPath, error: err.message };
    }
  }
  
  return { format: null, data: null, path: null, error: null };
}

// Validate JSON or YAML appendix (embedded or external)
function validateJsonAppendix(content, validator, filePath = null) {
  const errors = [];
  
  // First try embedded appendix
  const embeddedResult = extractAppendix(content);
  let appendixData = embeddedResult.data;
  let appendixFormat = embeddedResult.format;
  let appendixLine = embeddedResult.line;
  let appendixError = embeddedResult.error;
  
  // If no embedded appendix, try external file
  if (appendixData === null && filePath) {
    const externalResult = findExternalAppendix(filePath);
    if (externalResult.data !== null) {
      appendixData = externalResult.data;
      appendixFormat = externalResult.format;
      appendixLine = null; // External file doesn't have a line in the markdown
      appendixError = externalResult.error;
      
      if (appendixError) {
        errors.push({
          type: appendixFormat === 'yaml' ? 'yaml-parse' : 'json-parse',
          message: `Invalid ${appendixFormat.toUpperCase()} in external appendix (${externalResult.path}): ${appendixError}`,
          suggestion: `Fix the ${appendixFormat.toUpperCase()} syntax in ${externalResult.path}`,
          line: null
        });
        return errors;
      }
    }
  }
  
  if (appendixFormat === 'json' && appendixError) {
    errors.push({
      type: 'json-parse',
      message: `Invalid JSON in appendix: ${appendixError}`,
      suggestion: 'Fix the JSON syntax in the appendix block',
      line: appendixLine
    });
    return errors;
  }
  
  if (appendixFormat === 'yaml' && appendixError) {
    errors.push({
      type: 'yaml-parse',
      message: `Invalid YAML in appendix: ${appendixError}`,
      suggestion: 'Fix the YAML syntax in the appendix block',
      line: appendixLine
    });
    return errors;
  }
  
  if (appendixData === null) {
    errors.push({
      type: 'appendix-missing',
      message: 'Missing appendix (no embedded block or external ui-appendix file found)',
      suggestion: 'Add a code block (```json or ```yaml) with the machine-readable appendix, or place ui-appendix.yaml or ui-appendix.json in the same directory',
      line: null
    });
    return errors;
  }
  
  // Validate against schema
  const schemaErrors = validator.validate(appendixData);
  for (const err of schemaErrors) {
    errors.push({
      type: 'schema',
      message: err.path ? `[${err.path}] ${err.message}` : err.message,
      suggestion: err.suggestion,
      line: appendixLine
    });
  }
  
  return errors;
}

// Validate Markdown structure
function validateMarkdownStructure(content) {
  const errors = [];
  
  // Check required sections in order
  let lastSectionIndex = -1;
  for (const section of REQUIRED_SECTIONS) {
    const match = content.match(section.pattern);
    if (!match) {
      errors.push({
        type: 'structure',
        message: `Missing required section: ${section.name}`,
        suggestion: `Add a "${section.name}" section to the document`,
        line: null
      });
    } else {
      const sectionIndex = content.indexOf(match[0]);
      if (sectionIndex < lastSectionIndex) {
        errors.push({
          type: 'structure',
          message: `Section "${section.name}" is out of order`,
          suggestion: `Move "${section.name}" to its correct position`,
          line: getLineNumber(content, sectionIndex)
        });
      }
      lastSectionIndex = sectionIndex;
    }
  }
  
  return errors;
}

// Validate screen IDs uniqueness
function validateScreenIds(content) {
  const errors = [];
  const screenIds = extractScreenIds(content);
  
  for (const [id, info] of screenIds) {
    if (info.duplicates) {
      errors.push({
        type: 'duplicate-id',
        message: `Duplicate screen ID: ${id}`,
        suggestion: `Ensure each screen ID appears exactly once`,
        line: info.line
      });
    }
  }
  
  return errors;
}

// Validate state IDs uniqueness
function validateStateIds(content) {
  const errors = [];
  const stateIds = extractStateIds(content);
  
  for (const [id, info] of stateIds) {
    if (info.duplicates) {
      errors.push({
        type: 'duplicate-id',
        message: `Duplicate state ID: ${id}`,
        suggestion: `Ensure each state ID appears exactly once`,
        line: info.line
      });
    }
  }
  
  return errors;
}

// Validate role IDs uniqueness
function validateRoleIds(content) {
  const errors = [];
  const roleIds = extractRoleIds(content);
  
  for (const [id, info] of roleIds) {
    if (info.duplicates) {
      errors.push({
        type: 'duplicate-id',
        message: `Duplicate role ID: ${id}`,
        suggestion: `Ensure each role ID appears exactly once`,
        line: info.line
      });
    }
  }
  
  return errors;
}

// Validate referential integrity between prose and appendix
function validateReferentialIntegrity(content, appendix) {
  const errors = [];
  
  if (!appendix || typeof appendix !== 'object') {
    return errors;
  }
  
  // Extract screen IDs from prose
  const proseScreenIds = new Set();
  const screenIdRegex = /SCREEN-[A-Za-z][a-zA-Z0-9]*/g;
  let match;
  while ((match = screenIdRegex.exec(content)) !== null) {
    proseScreenIds.add(match[0]);
  }
  
  // Extract screen IDs from appendix
  const appendixScreenIds = new Set();
  if (appendix.screens) {
    for (const screen of appendix.screens) {
      if (screen.id) appendixScreenIds.add(screen.id);
    }
  }
  
  // Check for screens in prose but not in appendix
  for (const id of proseScreenIds) {
    if (!appendixScreenIds.has(id)) {
      // Find the line where this ID appears in prose
      const regex = new RegExp(`\\b${id}\\b`, 'g');
      let lineNum = null;
      while ((match = regex.exec(content)) !== null) {
        // Only report if it's in a screen reference context (not in JSON)
        const before = content.substring(0, match.index);
        const lastNewline = before.lastIndexOf('\n');
        const lineContent = content.substring(lastNewline, match.index);
        if (!lineContent.includes('"') && !lineContent.includes("'")) {
          lineNum = getLineNumber(content, match.index);
          break;
        }
      }
      errors.push({
        type: 'referential',
        message: `Screen "${id}" referenced in prose but not defined in appendix`,
        suggestion: `Add screen "${id}" to the screens array in the appendix`,
        line: lineNum
      });
    }
  }
  
  // Validate STATE-* references in prose against appendix states
  const proseStateIds = new Set();
  const stateIdRegex = /STATE-[A-Za-z][a-zA-Z0-9-]*/g;
  while ((match = stateIdRegex.exec(content)) !== null) {
    proseStateIds.add(match[0]);
  }
  
  // Extract state IDs from appendix
  const appendixStateIds = new Set();
  if (appendix.states) {
    for (const state of appendix.states) {
      if (state.id) appendixStateIds.add(state.id);
    }
  }
  
  // Check for STATE-* in prose but not in appendix
  for (const id of proseStateIds) {
    if (!appendixStateIds.has(id)) {
      // Find the line where this ID appears in prose
      const regex = new RegExp(`\\b${id}\\b`, 'g');
      let lineNum = null;
      while ((match = regex.exec(content)) !== null) {
        // Only report if it's in a state reference context (not in JSON string)
        const before = content.substring(0, match.index);
        const lastNewline = before.lastIndexOf('\n');
        const lineContent = content.substring(lastNewline, match.index);
        if (!lineContent.includes('"') && !lineContent.includes("'")) {
          lineNum = getLineNumber(content, match.index);
          break;
        }
      }
      errors.push({
        type: 'referential',
        message: `State "${id}" referenced in prose but not defined in appendix`,
        suggestion: `Add state "${id}" to the states array in the appendix`,
        line: lineNum
      });
    }
  }
  
  // Validate ROLE-* references in screen.roleAccess[] against appendix roles
  if (appendix.screens && appendix.roles) {
    // Extract defined role IDs from appendix.roles[]
    const definedRoleIds = new Set();
    for (const role of appendix.roles) {
      if (role.roleId) definedRoleIds.add(role.roleId);
    }
    
    // Check each screen's roleAccess[] references
    for (const screen of appendix.screens) {
      if (screen.roleAccess && Array.isArray(screen.roleAccess)) {
        for (const roleId of screen.roleAccess) {
          if (!definedRoleIds.has(roleId)) {
            errors.push({
              type: 'referential',
              message: `Screen "${screen.id}" references role "${roleId}" which is not defined in appendix roles[]`,
              suggestion: `Add "${roleId}" to the roles array in the appendix, or remove it from screen "${screen.id}" roleAccess`,
              line: null
            });
          }
        }
      }
    }
  }
  
  // Validate navigation references
  if (appendix.navigation && appendix.screens) {
    const validScreenIds = new Set(appendix.screens.map(s => s.id));
    for (const nav of appendix.navigation) {
      if (!validScreenIds.has(nav.from)) {
        errors.push({
          type: 'referential',
          message: `Navigation "from" references unknown screen: ${nav.from}`,
          suggestion: `Add screen "${nav.from}" to the screens array or fix the navigation entry`,
          line: null
        });
      }
      // Validate 'to' - always check against valid screen IDs
      // (SCREEN-* prefixes are validated, but also catch non-prefixed IDs that reference screens)
      if (!validScreenIds.has(nav.to)) {
        errors.push({
          type: 'referential',
          message: `Navigation "to" references unknown screen: ${nav.to}`,
          suggestion: `Add screen "${nav.to}" to the screens array or fix the navigation entry`,
          line: null
        });
      }
      // Validate 'to' if it references a STATE-*
      if (nav.to.startsWith('STATE-') && !appendixStateIds.has(nav.to)) {
        errors.push({
          type: 'referential',
          message: `Navigation "to" references unknown state: ${nav.to}`,
          suggestion: `Add state "${nav.to}" to the states array or fix the navigation entry`,
          line: null
        });
      }
    }
  }
  
  return errors;
}

// Format error for output
function formatError(filePath, error) {
  const location = error.line ? `line ${error.line}` : 'document';
  return {
    file: filePath,
    line: error.line,
    type: error.type,
    message: error.message,
    suggestion: error.suggestion
  };
}

// Print error in structured format
function printError(error) {
  const location = error.line ? `${error.file}:${error.line}` : error.file;
  console.error(`${colors.red}[${error.type}]${colors.reset} ${location}`);
  console.error(`${colors.dim}  Message: ${error.message}${colors.reset}`);
  if (error.suggestion) {
    console.error(`${colors.blue}  Suggestion: ${error.suggestion}${colors.reset}`);
  }
}

// Main lint function
function lintFile(filePath) {
  const errors = [];
  
  // Check file exists
  if (!fs.existsSync(filePath)) {
    errors.push({
      type: 'file-not-found',
      message: `File not found: ${filePath}`,
      suggestion: 'Check the file path and try again',
      line: null
    });
    return errors;
  }
  
  // Read file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    errors.push({
      type: 'read-error',
      message: `Could not read file: ${err.message}`,
      suggestion: 'Check file permissions',
      line: null
    });
    return errors;
  }
  
  // Load schema and create validator
  const schema = loadSchema();
  const validator = new JSONSchemaValidator(schema);
  
  // Validate Markdown structure
  errors.push(...validateMarkdownStructure(content));
  
  // Validate screen IDs uniqueness
  errors.push(...validateScreenIds(content));
  
  // Validate state IDs uniqueness
  errors.push(...validateStateIds(content));
  
  // Validate role IDs uniqueness
  errors.push(...validateRoleIds(content));
  
  // Validate JSON appendix (including external files)
  errors.push(...validateJsonAppendix(content, validator, filePath));
  
  // Get parsed appendix (JSON or YAML, embedded or external) for referential checks
  let appendix = null;
  const embeddedResult = extractAppendix(content);
  if (embeddedResult.data !== null) {
    appendix = embeddedResult.data;
  } else if (filePath) {
    const externalResult = findExternalAppendix(filePath);
    if (externalResult.data !== null) {
      appendix = externalResult.data;
    }
  }
  
  // Validate referential integrity
  if (!errors.some(e => e.type === 'json-parse' || e.type === 'yaml-parse' || e.type === 'appendix-missing')) {
    errors.push(...validateReferentialIntegrity(content, appendix));
  }
  
  return errors;
}

// Main entry point
function main() {
  const args = process.argv.slice(2);
  
  // Show help if no arguments or --help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.blue}UI.md Linter${colors.reset} - Validate UI.md files against the standard specification

${colors.yellow}Usage:${colors.reset}
  node ui-md-lint.js <file1.md> [file2.md] ...

${colors.yellow}Options:${colors.reset}
  --help, -h     Show this help message

${colors.yellow}Exit codes:${colors.reset}
  0  All files pass validation
  1  One or more validation errors found

${colors.yellow}Error types:${colors.reset}
  structure       Missing or out-of-order required sections
  duplicate-id    Duplicate screen/state/role IDs
  json-parse      Invalid JSON syntax in appendix
  yaml-parse      Invalid YAML syntax in appendix
  appendix-missing Missing JSON or YAML appendix block
  schema          Appendix does not match schema
  referential     References to undefined screens/states/navigation
  file-not-found  File does not exist
  read-error      Could not read file

${colors.yellow}Examples:${colors.reset}
  node ui-md-lint.js UI.md
  node ui-md-lint.js samples/kanban/UI.md samples/mobile-onboarding/UI.md
`);
    process.exit(0);
  }
  
  // Lint each file
  let hasErrors = false;
  let totalErrors = 0;
  
  for (const filePath of args) {
    const errors = lintFile(filePath);
    
    if (errors.length > 0) {
      hasErrors = true;
      totalErrors += errors.length;
      console.error(`\n${colors.red}=== Errors in ${filePath} ===${colors.reset}`);
      for (const error of errors) {
        printError(formatError(filePath, error));
      }
    } else {
      console.log(`${colors.green}✓${colors.reset} ${filePath}`);
    }
  }
  
  if (hasErrors) {
    console.error(`\n${colors.red}Total: ${totalErrors} error(s)${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}All files passed validation!${colors.reset}`);
    process.exit(0);
  }
}

// Export for programmatic use
module.exports = { lintFile, validateMarkdownStructure, validateScreenIds, validateStateIds, validateJsonAppendix, validateReferentialIntegrity };

// Run if executed directly
if (require.main === module) {
  main();
}
