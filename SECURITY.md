# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### What Constitutes a Vulnerability

A vulnerability in the context of this project includes:

- **Schema validation bypass**: Manipulation of UI.md files that bypasses the validation rules defined in `tooling/ui-md-linter/schema.json`
- **Referential integrity violations**: Crafted inputs that cause the linter to reference non-existent screens, states, or roles
- **Denial of service**: Inputs that cause the linter or associated tooling to crash or hang indefinitely
- **Injection attacks**: Content within UI.md files that could execute malicious code when processed by the linter or any associated tools

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them through one of the following methods:

1. **GitHub Security Advisories** (preferred):  
   Navigate to the [Security Advisories](https://github.com/Ola-Turmo/UI.md/security/advisories) page and click "Report a vulnerability" to submit a private report.

2. **Email**:  
   If you cannot use GitHub Security Advisories, contact the maintainers via the repository's "Security" tab.

### Response Timeline

- **Initial response**: We aim to acknowledge reports within 48 hours
- **Status update**: We provide a more detailed response within 7 days
- **Resolution**: We work to address confirmed vulnerabilities promptly and release patches as needed

### Scope

This security policy applies to:

- The UI.md specification and schema (`SPEC.md`, `tooling/ui-md-linter/schema.json`)
- The linter implementation (`tooling/ui-md-linter/`)
- VS Code extension (`tooling/vscode-extension/`)
- GitHub Actions workflows (`.github/workflows/`)

Policy does **not** apply to:

- Third-party tools or libraries used by the project (report to those projects directly)
- User implementations built on top of UI.md standard
- Sample files in the `samples/` directory (these are example content only)
