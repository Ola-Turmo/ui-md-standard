# Contributing to UI.md Standard

Thank you for your interest in contributing to the UI.md Standard. This document defines the change management process for the standard specification, tooling, and documentation. Following these guidelines ensures that changes are properly reviewed, tested, and backward-compatible.

---

## Table of Contents

1. [Branching Strategy](#branching-strategy)
2. [Change Types](#change-types)
3. [Validation Requirements](#validation-requirements)
4. [Pull Request Process](#pull-request-process)
5. [Review Guidelines](#review-guidelines)
6. [Spec vs. Tooling Changes](#spec-vs-tooling-changes)
7. [Version Bump Policy](#version-bump-policy)

---

## Branching Strategy

### Overview

We use a **fork-based contribution model** with a stable main branch. This model is appropriate for an open standard that multiple tools and products may implement independently.

### Branch Types

| Branch Type | Naming Pattern | Purpose |
|-------------|----------------|---------|
| `main` | `main` | Stable, deployable state. Always releasable. |
| Feature branch | `feat/<short-description>` | Proposed changes from contributors |
| Spec revision | `spec/<change-type>/<description>` | Changes to the UI.md standard itself |
| Tooling fix | `tooling/<tool-name>/<description>` | Changes to linter, VS Code extension, or other tooling |
| Docs update | `docs/<area>/<description>` | Documentation-only changes |

### Workflow

1. **Fork** the repository into your own GitHub account
2. **Clone** your fork locally: `git clone https://github.com/<your-username>/UI.md.git`
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/my-new-feature
   # or for spec changes:
   git checkout -b spec/non-breaking/add-new-state-type
   ```
4. **Make your changes** following the validation requirements below
5. **Push** to your fork: `git push origin feat/my-new-feature`
6. **Open a Pull Request** against `main`

### Branch Lifetime

- Feature branches should be short-lived (days, not weeks)
- If a branch grows stale (no activity for 14 days), it may be closed
- All branches must pass validation before merge
- After merge, branches are deleted

### Release Branches

Release branches (`release/<version>`) may be created for long-term maintenance of older spec versions if needed. These are managed by the core maintainers and are not typically needed for the initial standard (1.0).

---

## Change Types

Every change to the repository falls into one of four categories. The category determines the review process, validation requirements, and version bump obligations.

### Category 1: Breaking Spec Changes

**Description:** Changes that alter the UI.md contract in a way that breaks existing implementations.

**Examples:**
- Removing a required field from the screen schema
- Changing an ID format (e.g., `SCREEN-<name>` → `SCR-<name>`)
- Removing or renaming a state type (e.g., removing `permission-denied`)
- Changing allowed values in an enumeration (e.g., back-stack values)
- Removing a required section from the standard

**Impact:** Existing UI.md files that conform to the old version will fail validation against the new version.

**Review bar:** Requires RFC, community discussion, and approval from at least 2 core maintainers.

**Version bump:** Major version increment (e.g., 1.0 → 2.0).

---

### Category 2: Non-Breaking Spec Changes

**Description:** Additive or clarifying changes that extend the standard without breaking existing conformant files.

**Examples:**
- Adding a new optional field to an existing schema
- Adding a new state type (existing files remain valid)
- Adding a new section (if marked optional)
- Clarifying ambiguous language in existing descriptions
- Adding new allowed values to enumerations (as additions, not replacements)
- Adding new ID patterns (e.g., `PATTERN-<name>`)

**Impact:** Existing UI.md files remain valid; new files can use new features.

**Review bar:** Requires review from at least 1 core maintainer; async review acceptable.

**Version bump:** Minor version increment (e.g., 1.0 → 1.1).

**Sample updates required:** New or modified samples demonstrating the new feature must be provided.

---

### Category 3: Tooling Changes

**Description:** Changes to the linter, VS Code extension, or other developer tooling in `tooling/`.

**Examples:**
- Adding new validation rules to the linter
- Fixing linter bugs
- Improving error messages or suggestions
- VS Code extension feature additions
- New tooling utilities

**Impact:** Tooling changes are independent of the spec. They do not require sample updates unless the tooling change affects validation behavior that existing samples depend on.

**Review bar:** Requires review from at least 1 core maintainer; fast-track review acceptable for bug fixes.

**Version bump:** Tooling follows its own versioning (e.g., `tooling/ui-md-linter@1.2.0`). The spec version is unaffected.

---

### Category 4: Docs-Only Changes

**Description:** Changes that affect only documentation files, with no impact on spec, tooling, or samples.

**Examples:**
- Fixing typos in README.md, SPEC.md, or AGENTS.md
- Improving clarity of existing documentation
- Adding examples to AGENTS.md
- Fixing broken links
- Updating contributor guidelines

**Impact:** No functional impact on spec or tooling.

**Review bar:** Requires review from at least 1 maintainer; trivial fixes may be fast-tracked.

**Version bump:** None required.

---

## Validation Requirements

All changes must pass validation before a pull request can be merged. The validation requirements vary by change type.

### For All Changes

1. **No placeholder text**: All files must be free of `TODO`, `FIXME`, or `TBD` markers.
2. **No implementation-specific terms**: Files must not contain framework names, component libraries, API paths, or CSS class names.
3. **Lint passes**: Run `node tooling/ui-md-linter/ui-md-lint.js <file>` on affected files.

### For Spec Changes (Breaking and Non-Breaking)

1. **All samples pass linting**:
   ```bash
   node tooling/ui-md-linter/ui-md-lint.js samples/kanban/UI.md
   node tooling/ui-md-linter/ui-md-lint.js samples/mobile-onboarding/UI.md
   node tooling/ui-md-linter/ui-md-lint.js samples/cli-dashboard/UI.md
   ```
   All three must exit with code 0.

2. **Cross-sample consistency verified**: All samples use identical section structure, consistent ID formats, and consistent terminology.

3. **Appendix-prose alignment confirmed**: Machine-readable appendix IDs match prose definitions exactly.

4. **Implementation independence verified**: Run this check and confirm zero results:
   ```bash
   grep -i 'react\|vue\|svelte\|material\|bootstrap\|/api/\|endpoint\|css' samples/*/UI.md SPEC.md AGENTS.md
   # Must return zero results
   ```

### For Tooling Changes

1. **Existing samples still pass linting**: Tooling changes must not break existing validation.
2. **New lint behavior tested**: If adding new rules, create a test case that exercises them.

### For Docs-Only Changes

1. **Links valid**: No broken links introduced.
2. **Markdown renders correctly**: No syntax errors that would break GitHub rendering.

---

## Pull Request Process

### Before Submitting

1. **Check for related issues**: Search existing issues and PRs to avoid duplication.
2. **Open an issue first** for spec changes (especially breaking changes) to discuss before implementing.
3. **Create a branch** following the branching strategy above.
4. **Make targeted changes**: Each PR should address one change type (spec, tooling, or docs), not mix them.

### PR Description Template

Use this template for PR descriptions:

```markdown
## Summary

Brief description of what this PR changes.

## Change Type

- [ ] Breaking spec change
- [ ] Non-breaking spec change
- [ ] Tooling change
- [ ] Docs-only change

## Affected Area

- [ ] SPEC.md
- [ ] AGENTS.md
- [ ] README.md
- [ ] CONTRIBUTING.md
- [ ] tooling/ui-md-linter/
- [ ] tooling/vscode-extension/
- [ ] samples/kanban/
- [ ] samples/mobile-onboarding/
- [ ] samples/cli-dashboard/

## Validation

- [ ] All sample UI.md files pass linting
- [ ] No implementation-specific terms added
- [ ] No placeholder text (TODO/FIXME/TBD) added
- [ ] Appendix IDs match prose definitions

## Breaking Change Notice (if applicable)

[Explain how this breaks existing implementations and what migration steps are required]
```

### What to Include

| Change Type | Required in PR |
|-------------|---------------|
| Breaking spec | Migration guide, at least 2 sample UI.md files updated to new format |
| Non-breaking spec | Updated samples demonstrating the new feature |
| Tooling | Test cases for new behavior |
| Docs-only | List of files changed, purpose of changes |

### PR Size Guidelines

- **Small PRs (< 200 lines changed)**: Ideal for tooling fixes, docs updates, minor clarifications
- **Medium PRs (200-500 lines)**: Appropriate for non-breaking spec additions, new sample content
- **Large PRs (500+ lines)**: Should be avoided; split into multiple PRs where possible

For large spec changes, consider breaking into:
1. PR 1: Draft spec change (RFC)
2. PR 2: Sample updates
3. PR 3: Documentation updates

### CI Requirements

All CI checks must pass before merge:
- Lint validation on all affected files
- Sample validation (if spec or tooling changed)
- No broken links (if docs changed)

---

## Review Guidelines

### Who Reviews

| Change Type | Required Reviewers |
|-------------|-------------------|
| Breaking spec | At least 2 core maintainers; public RFC period |
| Non-breaking spec | At least 1 core maintainer |
| Tooling | At least 1 core maintainer |
| Docs-only | At least 1 maintainer or community member |

### Review Criteria

Reviewers evaluate PRs against these criteria:

#### For Spec Changes

1. **Correctness**: Does the change accurately model the described behavior?
2. **Completeness**: Are all required cases covered (screens, states, transitions)?
3. **Consistency**: Does the change align with existing conventions (ID formats, terminology)?
4. **Clarity**: Is the language unambiguous and implementable by AI agents?
5. **Backward compatibility**: Does a non-breaking change truly not break existing files?
6. **Sample coverage**: Do samples adequately demonstrate the new feature?

#### For Tooling Changes

1. **Correctness**: Does the tooling produce accurate results?
2. **Error messages**: Are error messages clear, actionable, and include fix suggestions?
3. **Performance**: Does the tooling complete in reasonable time?
4. **Compatibility**: Does the change maintain compatibility with existing samples?

#### For Documentation

1. **Accuracy**: Is the documentation correct and up-to-date?
2. **Clarity**: Can a new reader understand the material?
3. **Consistency**: Does the documentation use consistent terminology with other files?

### Review Process

1. **Automated checks run first**: CI validates linting and sample passes.
2. **Maintainer review**: At least one maintainer reviews the change.
3. **Feedback cycle**: Reviewers may request changes via PR comments.
4. **Approval**: When all criteria are met, a maintainer approves the PR.
5. **Merge**: Only approved PRs are merged to `main`.

### What Rejects a PR

- Failing CI (lint errors, sample validation failures)
- Breaking spec change without migration path
- Introduction of implementation-specific terms
- Placeholder text remaining
- Incomplete samples (missing screens, states, or transitions)
- Unclear or ambiguous specifications
- No consensus on breaking changes (requires RFC)

---

## Spec vs. Tooling Changes

This section explicitly distinguishes how each type of change is handled.

### Summary Table

| Aspect | Spec Changes | Tooling Changes |
|--------|-------------|----------------|
| Scope | `SPEC.md`, `AGENTS.md`, `samples/` | `tooling/` directory |
| Version impact | May bump spec version | Independent tooling versioning |
| Review time | Longer (days to weeks) | Shorter (hours to days) |
| Sample updates | Required for new features | Not required unless behavior changes |
| Breaking change | Possible (RFC required) | Rare (try to avoid) |
| CI impact | All samples re-validated | Existing samples must still pass |

### Spec Change Process

1. **Open RFC issue** for breaking changes or significant non-breaking changes
2. **Draft the change** in a `spec/` branch
3. **Update affected samples** to reflect the new standard
4. **Run full validation suite**:
   ```bash
   node tooling/ui-md-linter/ui-md-lint.js samples/kanban/UI.md
   node tooling/ui-md-linter/ui-md-lint.js samples/mobile-onboarding/UI.md
   node tooling/ui-md-linter/ui-md-lint.js samples/cli-dashboard/UI.md
   ```
5. **Submit PR** with change type clearly marked
6. **Await review** (longer review period for spec changes)
7. **Merge** after approval

### Tooling Change Process

1. **Create a `tooling/` branch**
2. **Implement the change** (bug fix or feature)
3. **Verify existing samples still pass**:
   ```bash
   node tooling/ui-md-linter/ui-md-lint.js samples/kanban/UI.md
   ```
4. **Add test cases** if new behavior is introduced
5. **Submit PR** with tooling change clearly marked
6. **Fast-track review** for bug fixes
7. **Merge** after approval

### Why the Distinction Matters

The UI.md Standard is a **contract**. When someone implements UI.md in a tool or product, they build against the spec. Tooling is an implementation aid, not part of the contract.

- **Spec changes** affect the contract itself. They require careful review, sample updates, and version bumps because downstream implementations may depend on the old behavior.
- **Tooling changes** are improvements to the development experience. They can be updated independently because they don't affect what conformant UI.md files look like.

This distinction protects implementers from unexpected breaking changes while allowing tooling to evolve rapidly.

---

## Version Bump Policy

### When to Bump

| Change Type | Version Change | Example |
|-------------|---------------|---------|
| Breaking spec | Major (1.x → 2.0) | Removing required fields, changing ID formats |
| Non-breaking spec | Minor (1.0 → 1.x) | Adding optional fields, new state types |
| Tooling | Patch or minor | Bug fixes, new lint rules |
| Docs-only | None | No version change |

### Version in the Appendix

The version is stored in the `version` field of the machine-readable appendix:

```yaml
# Machine-readable appendix (at end of UI.md file)
version: "1.0"
```

When bumping versions:
1. Update `version` in SPEC.md header
2. Update `version` in the machine-readable appendix schema in SPEC.md
3. Update `version` in all sample UI.md files' appendices
4. Add a changelog entry in SPEC.md documenting what changed

### Backward Compatibility

Within a major version (e.g., 1.x), all changes must be backward-compatible:
- Existing conformant UI.md files must remain valid
- New features must be additive and optional
- Existing tooling must continue to work

Breaking changes require a major version bump and a migration guide.

---

## Questions?

If you have questions about the contribution process, open an issue for discussion. For clarifications on whether a change is breaking or non-breaking, the core maintainers can provide guidance.

---

## Code of Conduct

By participating in this project, you agree to uphold our community standards:

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the technical merits of proposals
- Help new contributors get started

---

*Last updated: 2026-04-02*
