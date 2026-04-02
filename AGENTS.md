# AGENTS.md — AI Agent Guidance for UI.md

**Version:** 1.0  
**Schema Version:** UI.md 1.0 (see `tooling/ui-md-linter/schema.json`)  
**Status:** Stable

This document provides actionable guidance for AI agents tasked with reading, writing, reviewing, or validating UI.md files. Follow this guidance to produce consistent, machine-verifiable UI contracts that enable multiple AI agents to converge on compatible implementations.

---

## 1. Reading a UI.md File

When an AI agent receives a UI.md file, extract information in the prescribed order. This order ensures you capture dependencies before referencing them.

### 1.1 Section Reading Order

Read sections in this order to respect internal dependencies:

1. **Version and Schema Declaration** — Check the machine-readable appendix for the schema version. All IDs must conform to the format rules for that version.
2. **Users and Roles** — Extract role definitions first. Screens reference roles; understanding who can access what comes before understanding what they access.
3. **Screen Inventory** — Extract all screen IDs, purposes, entry/exit conditions, and associated states. Each screen ID must follow `SCREEN-<PascalCaseName>` format.
4. **State Model** — Extract state definitions. Each state ID must follow `STATE-<PascalCaseName>` format. States are referenced by screens; extract them before reading navigation.
5. **Navigation Graph** — Extract transitions between screens. Each `from` and `to` reference must match a screen ID defined in the Screen Inventory. Back-stack behavior (`Push`, `Replace`, `No`, `Modal`) affects flow modeling.
6. **Core User Flows** — Extract named flows that describe step-by-step sequences through screens and states.
7. **Interaction Patterns** — Extract reusable interaction behaviors (`PATTERN-<name>`) referenced by screens or flows.
8. **Data Contract** — Extract entity definitions with field schemas. Each entity ID must follow `ENTITY-<PascalCaseName>` format. Data entities are referenced by screens for read/write operations.
9. **Machine-Readable Appendix** — Validate structural integrity: version, screens array, states array, navigation array, dataContracts object. Verify referential integrity (all referenced IDs exist).

### 1.2 What to Extract from Each Section

**Screen Inventory:**
- Screen ID (`SCREEN-<name>`)
- Purpose statement
- Primary actions (2-5 most important)
- Entry conditions (what must be true before showing this screen)
- Exit conditions (what happens when leaving)
- Associated state IDs
- Role access (which roles can access this screen)

**State Model:**
- State ID (`STATE-<name>`)
- State type: `loading`, `empty`, `error`, `success`, `offline`, `permission-denied`
- Description of when this state occurs
- User-visible indicators (spinner, empty illustration, error banner)
- Allowed actions in this state
- Blocked actions in this state
- Recovery action (how to exit this state)

**Navigation Graph:**
- Source screen ID (`from`)
- Destination screen ID (`to`)
- Trigger (user action or system event)
- Condition (optional prerequisite)
- Back-stack behavior (`Push`, `Replace`, `No`, `Modal`)

**Data Contract:**
- Entity ID (`ENTITY-<name>`)
- Field definitions: name, label, type, constraints, required, readOnly, format
- Screen usage (which screens display this entity)
- Operations available (Create, Read, Update, Delete)

### 1.3 Consistency Checks During Reading

As you read, verify:
- All `SCREEN-*` IDs referenced in navigation exist in the screen inventory
- All `STATE-*` IDs referenced by screens exist in the state model
- All `ROLE-*` IDs referenced by screens exist in the roles section
- All `ENTITY-*` field type references resolve to entities in the data contract
- No duplicate screen, state, or entity IDs
- State type values are from the allowed set: `loading`, `empty`, `error`, `success`, `offline`, `permission-denied`
- Navigation back-stack values are from the allowed set: `Push`, `Replace`, `No`, `Modal`

---

## 2. Producing a New UI.md from Product Specs

When given a product description and asked to produce a UI.md file, follow this workflow.

### 2.1 Discovery Phase

1. **Identify users and roles** — Extract distinct user categories from the product spec. Assign each a `ROLE-<PascalCaseName>` ID. Common roles: `ROLE-authenticated`, `ROLE-admin`, `ROLE-guest`, `ROLE-anonymous`.

2. **Identify screens** — Extract every distinct UI surface the user interacts with. Assign each a `SCREEN-<PascalCaseName>` ID. Screens include: authentication, primary workspace, detail views, creation flows, settings, error/empty states.

3. **Identify states** — For each screen, determine all possible states. Model the complete lifecycle: initial load (`STATE-loading`), data present (`STATE-success`), no data (`STATE-empty`), operation failed (`STATE-error`), network unavailable (`STATE-offline`), access denied (`STATE-permission-denied`).

4. **Identify navigation** — Map how users move between screens. For each transition, note the trigger, any conditions, and back-stack behavior.

5. **Identify data** — Determine what information users see and manipulate. Define entity schemas with field-level constraints.

### 2.2 Authoring Phase

1. **Write the Screen Inventory first** — Define each screen with ID, purpose, primary actions, entry/exit conditions, associated states, and role access.

2. **Write the State Model second** — Define each state with ID, type, description, indicators, allowed actions, blocked actions, and recovery action.

3. **Write the Navigation Graph third** — Create a table or Mermaid diagram showing transitions. Verify every referenced screen and state exists.

4. **Write Core User Flows fourth** — Document primary tasks as step-by-step sequences referencing screens and states.

5. **Write Interaction Patterns fifth** — Define reusable interaction behaviors (click, drag, type, keyboard, gesture) with trigger, feedback, result, and error handling.

6. **Write the Data Contract sixth** — Define entities with field schemas. Reference entities from screen definitions.

7. **Write the Machine-Readable Appendix last** — Produce a JSON or YAML appendix with version, screens array, states array, navigation array, roles array, and dataContracts object. Ensure all IDs reference correctly.

### 2.3 Validation Phase

1. Run `node tooling/ui-md-linter/ui-md-lint.js <your-file>` — address all errors before considering the file complete.
2. Verify all screen IDs follow `SCREEN-<PascalCaseName>` format.
3. Verify all state IDs follow `STATE-<PascalCaseName>` format.
4. Verify all role IDs follow `ROLE-<PascalCaseName>` format.
5. Verify all entity IDs follow `ENTITY-<PascalCaseName>` format.
6. Search for implementation terms: `grep -i 'react\|vue\|svelte\|material\|bootstrap\|/api/\|endpoint' <your-file>` — must return zero results.

---

## 3. Prompt Templates

Use these templates as starting points. Replace all `[PLACEHOLDER]` markers with project-specific content.

### 3.1 Template: Generate UI.md from Product Description

```
You are an AI agent tasked with producing a UI.md file from a product description.

## Your Task

Produce a complete UI.md file for the following product:

[PLACEHOLDER: Full product description including user types, primary features, workflows, and any known constraints]

## Requirements

1. Follow UI.md Standard version 1.0 as defined in SPEC.md (https://github.com/Ola-Turmo/UI.md/blob/main/SPEC.md)

2. Use these ID formats consistently:
   - Screens: SCREEN-<PascalCaseName> (e.g., SCREEN-documentList)
   - States: STATE-<PascalCaseName> (e.g., STATE-loading, STATE-empty-board)
   - Roles: ROLE-<PascalCaseName> (e.g., ROLE-authenticated, ROLE-admin)
   - Entities: ENTITY-<PascalCaseName> (e.g., ENTITY-document)
   - Patterns: PATTERN-<PascalCaseName> (e.g., PATTERN-dragCard)

3. Include all required sections:
   - Users and Roles (with roleId, name, description, capabilities, visibleScreens, restrictions)
   - Screen Inventory (with id, purpose, primaryActions, entryConditions, exitConditions, states, roleAccess)
   - Navigation Graph (with from, to, trigger, condition, backStack)
   - State Model (with id, type, description, indicators, allowedActions, blockedActions, recoveryAction)
   - Core User Flows (step-by-step sequences)
   - Interaction Patterns (with trigger, visualFeedback, result, errorHandling, accessibility)
   - Data Contract (with entityId, name, fields, screenUsage, operations)
   - Machine-Readable Appendix (JSON or YAML with version, screens, states, navigation, roles, dataContracts)

4. State types must be from: loading, empty, error, success, offline, permission-denied

5. Navigation back-stack values must be from: Push, Replace, No, Modal

6. Every screen must have at least one state defined.

7. Every navigation transition must reference screens that exist.

8. Every state referenced by a screen must exist in the state model.

9. Do NOT include:
   - Framework names (React, Vue, Svelte, Angular)
   - Component library names (Material UI, Bootstrap, Tailwind)
   - API paths or endpoint URLs
   - CSS class names or selectors
   - Implementation-specific code snippets

## Output Format

Produce a single UI.md file with all sections filled in. End with a machine-readable appendix in YAML format.

## Validation

Before finalizing, run: node tooling/ui-md-linter/ui-md-lint.js <your-file>
Address all errors before completing.
```

### 3.2 Template: Review and Validate Existing UI.md

```
You are an AI agent tasked with reviewing and validating a UI.md file for correctness, completeness, and consistency.

## Your Task

Review the following UI.md file:

[PLACEHOLDER: Paste the full content of the UI.md file to review]

## Validation Checklist

### Structural Completeness

- [ ] All required sections present: Users and Roles, Screen Inventory, Navigation Graph, State Model, Core User Flows, Interaction Patterns, Data Contract, Machine-Readable Appendix
- [ ] Machine-readable appendix is present and parseable (JSON or YAML)
- [ ] Appendix version field is set and non-empty

### ID Format Consistency

- [ ] All screen IDs follow SCREEN-<PascalCaseName> pattern
- [ ] All state IDs follow STATE-<PascalCaseName> pattern
- [ ] All role IDs follow ROLE-<PascalCaseName> pattern
- [ ] All entity IDs follow ENTITY-<PascalCaseName> pattern
- [ ] All pattern IDs follow PATTERN-<PascalCaseName> pattern
- [ ] No duplicate IDs anywhere in the document

### Referential Integrity

- [ ] Every screen referenced in navigation exists in the screen inventory
- [ ] Every state referenced by a screen exists in the state model
- [ ] Every role referenced by a screen exists in the roles section
- [ ] Every entity referenced in field types exists in the data contract
- [ ] All STATE-* references in the appendix navigation array resolve to states

### State Model Coverage

- [ ] At least one loading state defined (STATE-loading or equivalent)
- [ ] At least one empty state defined (STATE-empty or equivalent)
- [ ] At least one error state defined (STATE-error or equivalent)
- [ ] At least one success state defined (STATE-success or equivalent)
- [ ] Offline states modeled if the product has offline functionality
- [ ] Permission-denied states modeled if the product has access control

### Navigation Completeness

- [ ] Entry point screens identified (where users start)
- [ ] Terminal screens identified (where flows end)
- [ ] Back-stack behavior specified for each transition (Push, Replace, No, Modal)
- [ ] Conditional navigation branches documented (auth vs. anonymous, permission-gated)

### Data Contract Specificity

- [ ] Each entity has sufficient fields (minimum 4 fields per entity)
- [ ] Field types are specified (string, number, date, boolean, enum, array)
- [ ] Required fields marked as required
- [ ] Read-only fields marked as readOnly
- [ ] Constraints specified where relevant (maxLength, min, max, pattern, enumValues)
- [ ] Format hints provided where relevant (date format, currency, email)

### Implementation Independence

- [ ] No framework names present (search: react, vue, svelte, angular)
- [ ] No component library names present (search: material, bootstrap, tailwind, chakra)
- [ ] No API paths or endpoint URLs present (search: /api/, /v1/, /endpoint)
- [ ] No CSS class names or selectors present
- [ ] No implementation-specific code snippets present

### Appendix-Prose Alignment

- [ ] Screen IDs in appendix match screen IDs in prose exactly
- [ ] State IDs in appendix match state IDs in prose exactly
- [ ] Navigation edges in appendix match navigation graph in prose
- [ ] Role IDs in appendix match roles in prose
- [ ] Data entities in appendix match entities in prose

## Output Format

For each validation check, report:
- **PASS** or **FAIL** with specific line numbers or IDs if failing
- For each failure: the root cause and a corrective action

End with an overall assessment: **APPROVED**, **APPROVED WITH MINOR ISSUES**, or **REJECTED** (requires revision)

If the file has errors severe enough to fail linting, note: "This file will not pass `node tooling/ui-md-linter/ui-md-lint.js` until the following issues are addressed: [list issues]"

## Remediation

If you find issues, produce a revised version of the UI.md file with corrections applied. Use diff notation to show what changed and why.
```

---

## 4. Error Catalog

This catalog lists common UI.md authoring mistakes, their root causes, and corrective actions.

### Error 1: Missing Required Section

**Error Name:** `MISSING_REQUIRED_SECTION`  
**Description:** A mandatory section is absent from the UI.md file.  
**Root Cause:** Author skipped a section they considered unnecessary, or misunderstood scope boundaries.  
**Corrective Action:** Ensure all required sections are present: Users and Roles, Screen Inventory, Navigation Graph, State Model, Core User Flows, Interaction Patterns, Data Contract, Machine-Readable Appendix. Each section must have substantive content, not just a heading.

---

### Error 2: Inconsistent ID Format

**Error Name:** `INCONSISTENT_ID_FORMAT`  
**Description:** Screen, state, role, or entity IDs do not follow the prescribed format.  
**Root Cause:** Author used ad-hoc naming conventions instead of `SCREEN-<PascalCaseName>`, `STATE-<PascalCaseName>`, `ROLE-<PascalCaseName>`, `ENTITY-<PascalCaseName>` patterns.  
**Corrective Action:** Rename all IDs to conform to the format. Search for `SCREEN-` without PascalCase, `STATE-` without PascalCase, etc. Update all internal references after renaming. Run linter to confirm.

---

### Error 3: Orphaned State Reference

**Error Name:** `ORPHANED_STATE_REFERENCE`  
**Description:** A screen references a state ID that is not defined in the state model.  
**Root Cause:** Author added a state reference to a screen but forgot to define the state, or defined it under a different ID.  
**Corrective Action:** Check all `states` arrays in screen entries. For each referenced state ID, verify the state exists in the state model with a matching ID. Add missing state definitions or correct the reference.

---

### Error 4: Undefined Screen Navigation Target

**Error Name:** `UNDEFINED_NAVIGATION_TARGET`  
**Description:** A navigation transition references a screen ID that does not exist in the screen inventory.  
**Root Cause:** Author added a navigation edge with a `to` or `from` value for a screen that was never defined, or mistyped the ID.  
**Corrective Action:** List all screen IDs in the screen inventory. For each navigation edge, verify the `from` and `to` values match an existing screen ID. Add missing screen definitions or correct the typo.

---

### Error 5: Invalid State Type

**Error Name:** `INVALID_STATE_TYPE`  
**Description:** A state has a `type` value not in the allowed set: `loading`, `empty`, `error`, `success`, `offline`, `permission-denied`.  
**Root Cause:** Author invented a custom state type not defined in the standard, or misspelled an allowed type.  
**Corrective Action:** Review all state `type` values. Ensure each is lowercase and from the allowed set. Correct typos. If a genuinely new state type is needed, this is a spec change — propose it through the CONTRIBUTING.md process.

---

### Error 6: Duplicate Screen ID

**Error Name:** `DUPLICATE_SCREEN_ID`  
**Description:** The same screen ID appears multiple times in the screen inventory.  
**Root Cause:** Author accidentally duplicated a screen entry, or defined the same screen twice with different IDs.  
**Corrective Action:** Search for duplicate `SCREEN-<name>` values. Remove duplicates, merging content if necessary. Ensure each screen ID is unique.

---

### Error 7: Missing Machine-Readable Appendix

**Error Name:** `MISSING_APPENDIX`  
**Description:** The UI.md file lacks a machine-readable appendix (JSON or YAML).  
**Root Cause:** Author wrote prose content but omitted the structured appendix, or placed it in a separate file without a reference path.  
**Corrective Action:** Add a machine-readable appendix as a fenced code block (JSON or YAML) at the end of the file. Include: `version`, `screens` array, `states` array, `navigation` array, `roles` array (if present), and `dataContracts` object. Verify the appendix matches the prose content.

---

### Error 8: Broken Entity Reference in Data Contract

**Error Name:** `BROKEN_ENTITY_REFERENCE`  
**Description:** A field in a data entity references an entity type (e.g., `ENTITY-user`) that does not exist in the data contract.  
**Root Cause:** Author referenced an entity in a field type but forgot to define the entity, or defined it under a different name.  
**Corrective Action:** For each entity field with a type referencing another entity, verify the referenced entity exists in the data contract. Add missing entity definitions or correct the reference.

---

### Error 9: Implementation-Specific Content Leak

**Error Name:** `IMPLEMENTATION_LEAK`  
**Description:** The UI.md file contains framework names, component library names, API paths, or CSS class names.  
**Root Cause:** Author included implementation details from a reference implementation or mental model.  
**Corrective Action:** Search for: `react`, `vue`, `svelte`, `angular`, `material`, `bootstrap`, `tailwind`, `/api/`, `/v1/`, `endpoint`, `.css`, `class=`. Remove or rephrase any hits to be implementation-agnostic. Replace "Click the Submit button" with "Submit the form". Replace "The API returns..." with "The system provides...".

---

### Error 10: Invalid Back-Stack Behavior

**Error Name:** `INVALID_BACK_STACK`  
**Description:** A navigation transition has a `backStack` value not in the allowed set: `Push`, `Replace`, `No`, `Modal`.  
**Root Cause:** Author used a freeform value like "back" or "pop" instead of the prescribed options.  
**Corrective Action:** Review all navigation entries. Ensure `backStack` values are exactly: `Push` (adds to back stack), `Replace` (replaces current), `No` (not added to back stack), or `Modal` (overlay behavior). Correct any deviations.

---

## 5. Version Migration Guidance

When the UI.md standard evolves, existing UI.md files may need migration. This section explains how to detect version, migrate content, and maintain backward compatibility.

### 5.1 Detecting the Current Version

Check the `version` field in the machine-readable appendix:

```yaml
# ui-appendix.yaml
version: "1.0"
```

If no appendix exists, assume version `0.x` (pre-standard). The file needs significant rework to conform to the current standard.

If an appendix exists but the version is older than the current schema version in `tooling/ui-md-linter/schema.json`, migration is required.

### 5.2 Migration Procedure

When migrating from version X to version Y (where Y > X):

1. **Read the changelog** — Check `SPEC.md` for version-specific migration notes. Breaking changes are documented.

2. **Update the version field** — Change `version` in the appendix to the new version number.

3. **Address structural changes** — If the new version adds required sections or changes ID formats:
   - Add any missing required sections
   - Rename IDs to conform to new format requirements
   - Update all internal references to reflect renamed IDs

4. **Run the linter** — `node tooling/ui-md-linter/ui-md-lint.js <file>` — address all errors before considering migration complete.

5. **Update prose consistency** — Ensure prose descriptions reflect any structural changes made during migration.

6. **Verify appendix-prose alignment** — Confirm all IDs in the appendix still match IDs in prose after migration.

### 5.3 Backward Compatibility

UI.md is designed for forward compatibility within a major version:

- **Within major version (e.g., 1.0 → 1.1):** Additive changes (new optional fields, new allowed values) do not break existing files. Existing files remain valid.

- **Across major versions (e.g., 1.0 → 2.0):** Breaking changes require migration. The changelog in SPEC.md will specify what changed and how to migrate.

- **Appendix vs. prose:** The machine-readable appendix must always be consistent with prose. If prose is updated but appendix is not, the linter will catch the mismatch.

### 5.4 Schema Version Reference

| Schema Version | Status | Breaking Changes |
|---------------|--------|-----------------|
| 1.0 | Current | None (initial stable release) |

---

## 6. Multi-Agent Coordination Workflow

When multiple AI agents collaborate on a UI.md file, use this workflow to divide labor, merge contributions, and handle concurrent edits.

### 6.1 Agent Roles

**Role: Screen Author**

Responsible for: Defining screen inventory, navigation graph, and core user flows.

Outputs:
- Screen entries with IDs, purposes, primary actions, entry/exit conditions, states, role access
- Navigation graph table or diagram
- Core user flow descriptions

Does not modify: State model definitions, data contract schemas (unless clarifying entity usage).

**Role: State and Data Model Author**

Responsible for: Defining complete state model and data contract.

Outputs:
- State entries with IDs, types, descriptions, indicators, allowed/blocked actions, recovery actions
- Data entity schemas with field definitions, constraints, types, formats
- Ensures state and entity IDs are consistent with screen author outputs

Does not modify: Screen purposes, navigation structure, core flow steps.

**Role: Validation and Integration Author**

Responsible for: Reviewing merged content, ensuring consistency, writing the machine-readable appendix.

Outputs:
- Appendix draft aligned with prose
- Consistency report identifying mismatches
- Final lint pass

### 6.2 Merge Strategy

1. **Parallel drafting:** Screen Author and State/Data Author work from the same input (product description) in parallel. Each produces a partial document covering their responsibilities.

2. **Cross-reference pass:** Before merging, each author reviews the other's draft to identify ID references that must align. Screen Author notes which states and entities each screen uses. State/Data Author notes which screens each state and entity appears on.

3. **Merge:** Combine drafts into a single document. Resolve conflicts:
   - If two authors assigned different IDs to the same concept: Screen Author's IDs take precedence for screens; State/Data Author's IDs take precedence for states and entities.
   - If two authors described the same transition differently: Use the more specific description.

4. **Integration pass:** Validation Author reviews merged document for:
   - All screen references in navigation resolve to defined screens
   - All state references in screens resolve to defined states
   - All entity references in fields resolve to defined entities
   - Appendix IDs match prose IDs exactly

5. **Final lint:** Run `node tooling/ui-md-linter/ui-md-lint.js <file>` — address all errors.

### 6.3 Concurrent Edit Handling

When two agents must edit the same file simultaneously:

**Strategy A: Section-based locking**

- Assign non-overlapping sections to each agent. Screen Author owns Screen Inventory, Navigation Graph, Core User Flows. State/Data Author owns State Model, Data Contract. Validation Author owns Appendix.
- Agents do not modify each other's sections without explicit coordination.

**Strategy B: Staged editing with diff review**

- Agent A produces a draft. Agent B reviews and proposes changes via diff notation.
- Agent A reviews diff, accepts or rejects changes, produces final version.
- Example: Agent B proposes "Add `STATE-timeout` between SCREEN-login and SCREEN-error" as a diff comment. Agent A incorporates if consistent with design.

**Strategy C: Sequential ownership**

- Agent A completes their sections and commits. Agent B pulls, completes their sections, and commits.
- Requires sequential availability; not suitable for real-time collaboration.

**Conflict resolution:** If concurrent edits produce contradictory information (e.g., one agent says a screen has `STATE-loading`, another says it has `STATE-error` but neither defines the other's state), the contradiction must be resolved with the product owner or by reviewing the product spec. Do not silently drop either claim.

---

## 7. Boundary Condition Examples

These examples show how to handle complex scenarios that are common in real products but not trivial to model.

### Example 1: Optional Screens (Conditional Presence)

**Scenario:** A settings screen may or may not exist depending on user role. Admin users see SCREEN-adminSettings; regular users do not see any settings screen.

**Problem:** Navigation graph cannot assume SCREEN-adminSettings exists for all users. Screen inventory must account for optional screens.

**Solution:**
1. In the Screen Inventory, note conditional presence in the screen's role access: `SCREEN-adminSettings` has `roleAccess: [ROLE-admin]` only.
2. In the Navigation Graph, model conditional transitions:
   ```
   | From | To | Trigger | Condition | Back Stack |
   | SCREEN-settings | SCREEN-adminSettings | Click "Admin" tab | ROLE-admin | Push |
   ```
3. For non-admin roles, SCREEN-adminSettings is not in `visibleScreens`; navigation to it is not possible.
4. If a flow references an optional screen, note the condition explicitly in the Core User Flow.

**Key Principle:** Optional screens are defined as normal screens with restricted `roleAccess`. Navigation graph transitions to optional screens must include a `condition` column explaining when the transition is valid.

---

### Example 2: Undo/Redo Flow

**Scenario:** A user can create, edit, and delete cards on a Kanban board. Each operation can be undone (except deletion of a card that was created in the same session).

**Problem:** Modeling undo/redo requires tracking operation history and state reversibility without proliferating states.

**Solution:**
1. Define `PATTERN-undoableOperation` as a reusable interaction pattern:
   - **Trigger:** User initiates a create, edit, or delete operation
   - **Feedback:** Operation completes with success indicator
   - **Result:** Operation applied; undo option appears
   - **Undo behavior:** Returns to previous state; may have constraints (e.g., "Cannot undo after session ends")
   - **Redo behavior:** Re-applies the operation if undo was invoked

2. For specific operations, define undo constraints:
   - **Card creation:** Can undo within session; undone by deleting the card
   - **Card edit:** Can undo immediately after edit; undone by restoring previous field values
   - **Card deletion:** Cannot undo if card was created in same session and session has ended; can undo if card existed before session

3. In the state model, undo affects which state is shown after reversal:
   - After undo of edit: Return to the screen showing the restored values
   - After undo of delete: Return to `STATE-success` with card re-appearing

**Key Principle:** Undo/redo is modeled as an interaction pattern with constraints, not as a separate state for every operation. The state model reflects the outcome of undo/redo (returning to a prior state), not the undo/redo mechanism itself.

---

### Example 3: Permission-Gated UI

**Scenario:** Some actions (e.g., deleting a card) require admin role even though the screen is accessible to all authenticated users. The delete button is hidden or disabled for non-admin users.

**Problem:** Role access is at the screen level, but permissions often apply at the action level within a screen.

**Solution:**
1. In the Screen Inventory entry for `SCREEN-cardDetail`, include the action in `primaryActions` but note the permission requirement:
   ```
   **Primary Actions**:
   - View card details (all roles)
   - Edit card details (ROLE-authenticated, subject to FIELD-LEVEL-permissions)
   - Delete card (ROLE-admin only)
   ```

2. In the Data Contract for `ENTITY-card`, define a permission constraint:
   ```
   - operation: Delete
     allowedRoles: [ROLE-admin]
   ```

3. In the State Model, define a permission-denied state that surfaces when a user attempts a gated action:
   ```
   **STATE-permission-denied-delete**
   - Type: permission-denied
   - Description: User attempted to delete a card but lacks admin role
   - Indicators: Error message "You don't have permission to delete this card"
   - Allowed Actions: Dismiss error, contact admin
   - Blocked Actions: Delete operation
   - Recovery Action: Request admin access or cancel
   ```

4. In the Interaction Pattern for delete:
   ```
   **PATTERN-deleteCard**
   - Trigger: User clicks delete button
   - Condition: User has ROLE-admin
   - Result if allowed: Card deleted, transition to SCREEN-board in STATE-success
   - Result if denied: Transition to STATE-permission-denied-delete
   ```

**Key Principle:** Permission-gated UI is modeled at three levels: screen role access (who can see the screen), action role access (who can perform the action, defined in data contract), and state-level permission denial (what happens when a non-permitted user tries). All three levels must be consistent.

---

### Example 4: Real-Time Screens (Live Updates)

**Scenario:** A dashboard screen shows live metrics that update automatically without user action. Data arrives via WebSocket or polling. Users can also interact with the dashboard while live updates occur.

**Problem:** Standard state model assumes user-initiated transitions. Real-time updates introduce system-initiated state changes that can interrupt user actions.

**Solution:**
1. Define a base set of states for the dashboard:
   - `STATE-loading` — Initial data fetch
   - `STATE-success` — Data loaded and displayed
   - `STATE-error` — Fetch failed
   - `STATE-offline` — Connection lost

2. Add real-time-specific states or indicators:
   - Live indicator: A pulsing dot or "Live" badge in the UI header
   - Stale data indicator: "Last updated X minutes ago" warning when polling interval is exceeded
   - Conflict indicator: "Data has changed" banner when server state diverges from client state during user edit

3. In the State Model, describe system-initiated transitions:
   ```
   **STATE-success** (with live updates active)
   - Description: Dashboard displaying current data with live update active
   - System-initiated transitions:
     - New data arrives → refresh display in place (no state change, no user action required)
     - Data significantly changed → show "Data has changed" indicator
     - Connection lost → transition to STATE-offline
   ```

4. In the Interaction Patterns, define behavior during live updates:
   ```
   **PATTERN-optimisticUpdate**
   - Trigger: User edits a field while live updates are active
   - Result: UI updates immediately (optimistic); background sync confirms
   - Conflict: If server data changed since last fetch, show conflict indicator
   - Resolution: User chooses "Keep mine" or "Accept server version"
   ```

**Key Principle:** Real-time screens extend the standard state model with system-initiated transitions and conflict states. The state model describes what can happen system-initiated, not just user-initiated.

---

### Example 5: Multi-Step Transaction

**Scenario:** A checkout flow spans multiple screens: Cart Review → Shipping Address → Payment → Confirmation. Each step is a separate screen. The transaction must be atomic — if payment fails, the user must be able to retry or cancel, but the cart contents must not be consumed until the transaction commits.

**Problem:** Modeling atomic transactions across multiple screens with state persistence and rollback.

**Solution:**
1. Define each step as a separate screen with navigation:
   ```
   SCREEN-cartReview → SCREEN-shipping → SCREEN-payment → SCREEN-confirmation
   ```

2. Define a transaction-scoped state to track progress:
   ```
   **STATE-transaction-in-progress**
   - Type: loading (subtype: transaction)
   - Description: Checkout transaction active; cart contents reserved but not consumed
   - Indicators: "Processing payment..." with spinner
   - Allowed Actions: Cancel transaction, retry payment
   - Blocked Actions: Modify cart (cart is locked during transaction)
   - Recovery Action: Cancel returns to SCREEN-cartReview; retry re-attempts payment
   ```

3. Define success and failure end states:
   ```
   **STATE-transaction-success**
   - Type: success
   - Description: Payment committed; cart consumed; order created
   
   **STATE-transaction-failed**
   - Type: error
   - Description: Payment failed; cart contents still reserved; retry available
   - Indicators: Error message with reason (card declined, network error)
   - Allowed Actions: Retry with same payment method, change payment method, cancel
   - Recovery Action: Cancel releases cart reservation and returns to SCREEN-cartReview
   ```

4. In the Navigation Graph, model transaction-scoped transitions:
   ```
   | From | To | Trigger | Condition | Back Stack |
   | SCREEN-payment | SCREEN-confirmation | Payment success | — | Replace |
   | SCREEN-payment | STATE-transaction-failed | Payment declined | — | No (overlay) |
   | SCREEN-payment | SCREEN-cartReview | Cancel | — | Replace |
   ```

5. In the Data Contract, define the `ENTITY-order` created on success:
   ```
   ENTITY-order:
   - id: string (readOnly)
   - items: array of ENTITY-cartItem
   - shippingAddress: ENTITY-address
   - paymentMethod: ENTITY-paymentMethod (reference)
   - totalAmount: number
   - status: enum (pending, confirmed, shipped, cancelled)
   ```

**Key Principle:** Multi-step transactions use a combination of linear navigation (step progression) and transaction-scoped states that persist across screens. The state model tracks the transaction lifecycle (in-progress, success, failed) independently of which step screen is displayed.

---

## 8. Linter Integration

The `ui-md-linter` validates UI.md files against the standard schema. This section explains how to invoke the linter, interpret errors, and integrate with CI pipelines.

### 8.1 CLI Usage

```bash
# Validate a single file
node tooling/ui-md-linter/ui-md-lint.js ./UI.md

# Validate multiple files
node tooling/ui-md-linter/ui-md-lint.js ./UI.md ./samples/kanban/UI.md

# Validate all sample files using glob pattern
node tooling/ui-md-linter/ui-md-lint.js samples/*/UI.md

# Show detailed error output
node tooling/ui-md-linter/ui-md-lint.js ./UI.md --verbose
```

### 8.2 Exit Codes

| Exit Code | Meaning |
|-----------|---------|
| `0` | Validation passed — no errors found |
| `1` | Validation failed — one or more errors reported |
| `2` | File not found or unreadable |

### 8.3 Error Output Format

When validation fails, the linter outputs structured error information:

```
ERROR: Missing required section
  File: ./UI.md
  Line: 42
  Section: State Model
  Message: "The State Model section is missing. Every UI.md must define a state model."
  Suggestion: "Add a '## State Model' section after the Navigation Graph section."

ERROR: Inconsistent ID format
  File: ./UI.md
  Line: 78
  ID: screen-dashboard
  Message: "Screen ID 'screen-dashboard' does not match required format SCREEN-<PascalCaseName>."
  Suggestion: "Rename to SCREEN-dashboard (remove lowercase and hyphens)."

ERROR: Orphaned state reference
  File: ./UI.md
  Line: 134
  Screen: SCREEN-board
  State: STATE-pending
  Message: "Screen SCREEN-board references STATE-pending, but STATE-pending is not defined in the state model."
  Suggestion: "Add STATE-pending to the state model, or correct the reference."
```

### 8.4 Error Interpretation Guide

| Error Type | What It Means | How to Fix |
|-----------|---------------|------------|
| `MISSING_REQUIRED_SECTION` | A mandatory section heading is absent | Add the missing section with substantive content |
| `INCONSISTENT_ID_FORMAT` | ID does not match `SCREEN-`, `STATE-`, `ROLE-`, `ENTITY-` + PascalCase pattern | Rename the ID to conform; update all references |
| `ORPHANED_STATE_REFERENCE` | A screen references a state that doesn't exist | Add the missing state definition, or correct the ID |
| `UNDEFINED_NAVIGATION_TARGET` | Navigation transition references a screen that doesn't exist | Add the missing screen, or correct the ID |
| `INVALID_STATE_TYPE` | State type value not in allowed set | Use only: loading, empty, error, success, offline, permission-denied |
| `DUPLICATE_SCREEN_ID` | Same screen ID defined twice | Remove duplicate; merge content if needed |
| `MISSING_APPENDIX` | Machine-readable appendix absent | Add appendix as fenced code block at end of file |
| `BROKEN_ENTITY_REFERENCE` | Field type references non-existent entity | Add the entity definition, or correct the type reference |
| `IMPLEMENTATION_LEAK` | Framework, library, API path, or CSS class detected | Remove or rephrase to be implementation-agnostic |
| `INVALID_BACK_STACK` | Back-stack value not in allowed set | Use only: Push, Replace, No, Modal |

### 8.5 CI Integration Snippet

Add this to your CI pipeline to validate UI.md files on every push:

```yaml
# .github/workflows/ui-md-validation.yml
name: UI.md Validation

on:
  push:
    paths:
      - '**.md'
      - 'tooling/ui-md-linter/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Validate UI.md files
        run: |
          for file in UI.md samples/*/UI.md; do
            echo "Validating $file"
            node tooling/ui-md-linter/ui-md-lint.js "$file"
            if [ $? -ne 0 ]; then
              echo "Validation failed for $file"
              exit 1
            fi
          done
          echo "All UI.md files passed validation"
```

For GitHub Actions matrix builds (to validate in parallel):

```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        file: [UI.md, samples/kanban/UI.md, samples/mobile-onboarding/UI.md, samples/cli-dashboard/UI.md]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Validate ${{ matrix.file }}
        run: node tooling/ui-md-linter/ui-md-lint.js ${{ matrix.file }}
```

For GitLab CI:

```yaml
# .gitlab-ci.yml
validate-ui-md:
  stage: test
  script:
    - node tooling/ui-md-linter/ui-md-lint.js UI.md
    - node tooling/ui-md-linter/ui-md-lint.js samples/kanban/UI.md
    - node tooling/ui-md-linter/ui-md-lint.js samples/mobile-onboarding/UI.md
    - node tooling/ui-md-linter/ui-md-lint.js samples/cli-dashboard/UI.md
  rules:
    - if: '$CI_PIPELINE_SOURCE == "push"'
      changes:
        - '**.md'
        - tooling/ui-md-linter/**/*
```

---

## Appendix A. Terminology Quick Reference

This table defines key terms used in UI.md and AGENTS.md consistently.

| Term | Definition |
|------|------------|
| **Screen** | A distinct UI surface a user interacts with, identified by a unique `SCREEN-<name>` ID |
| **State** | A condition affecting what users see or can do on a screen, identified by `STATE-<name>` ID |
| **State Type** | A category of state: `loading`, `empty`, `error`, `success`, `offline`, `permission-denied` |
| **Role** | A category of user with specific permissions, identified by `ROLE-<name>` ID |
| **Entity** | A data object visible to users, identified by `ENTITY-<name>` ID |
| **Pattern** | A reusable interaction behavior, identified by `PATTERN-<name>` ID |
| **Navigation** | A directed transition from one screen to another |
| **Back Stack** | How a navigation transition affects the back button history: `Push`, `Replace`, `No`, `Modal` |
| **Appendix** | The machine-readable (JSON or YAML) portion of UI.md containing structured IDs and schemas |
| **Linter** | The `ui-md-lint.js` tool that validates UI.md files against the standard schema |
| **Implementation-Independent** | Free of framework names, component library names, API paths, or CSS class names |
| **Referential Integrity** | All IDs referenced in one part of UI.md exist in their respective definitions |

---

## Appendix B. ID Format Summary

| ID Type | Format | Example |
|---------|--------|---------|
| Screen | `SCREEN-<PascalCaseName>` | `SCREEN-documentList` |
| State | `STATE-<PascalCaseName>` | `STATE-loading` |
| Role | `ROLE-<PascalCaseName>` | `ROLE-authenticated` |
| Entity | `ENTITY-<PascalCaseName>` | `ENTITY-document` |
| Pattern | `PATTERN-<PascalCaseName>` | `PATTERN-dragCard` |

---

## Appendix C. Allowed Enumerations

**State Types:**
```
loading | empty | error | success | offline | permission-denied
```

**Navigation Back-Stack Values:**
```
Push | Replace | No | Modal
```

**Data Entity Field Types:**
```
string | number | date | boolean | enum | array
```

---

*End of AGENTS.md*
