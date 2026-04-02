# UI.md Standard

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0-green.svg)](./SPEC.md)

**UI.md is a behavioral contract that keeps AI agents, designers, and developers in sync.** When multiple AI agents build the same UI, they don't automatically know how their parts must fit together. UI.md describes every screen, state, and interaction in one Markdown file—and machines validate the contract.

---

## The Coordination Problem

When multiple AI agents work on the same UI, they don't know when their outputs need to fit together. An agent writing the login flow doesn't automatically know what the dashboard expects from it. A backend agent doesn't know which fields the frontend will render. Without a shared contract:

- **Agents produce screens that don't connect** — navigation graphs silently diverge
- **State handling becomes inconsistent** — one agent models loading states, another doesn't
- **Data contracts drift apart** — the "user" entity has different fields in different agents' outputs
- **Validation is manual and slow** — review becomes a bottleneck instead of automation

UI.md solves this by giving every agent (and human) the same answer to: **"What screens exist? What states do they have? What can users do? What data do they show?"**

---

## Quick Start

### Prerequisites

- Node.js ≥18 (for the linter)

### Step 1: Explore a Sample

Browse the [`samples/`](./samples) directory to see UI.md in practice:

```markdown
## Screen Inventory

### SCREEN-board
- **Purpose:** Main Kanban board view displaying all columns and cards
- **Primary Actions:** View cards, drag cards between columns, open card detail
- **Entry:** User navigates to board URL or clicks board link
- **Exit:** User opens card detail, applies filter, or navigates away
- **States:** STATE-loading, STATE-empty, STATE-error, STATE-syncing
```

### Step 2: Create Your First UI.md

Create a `UI.md` file in your project root:

```markdown
# My App UI

## Screen Inventory

### SCREEN-home
- **Purpose:** Application landing screen
- **Primary Actions:** Navigate to main features, view status summary
- **Entry:** User opens app URL
- **Exit:** User navigates to a feature screen
- **States:** STATE-loading, STATE-ready, STATE-error

## Navigation Graph

| From | Action | To |
|------|--------|-----|
| SCREEN-home | User clicks feature card | SCREEN-feature |
| SCREEN-feature | User clicks back | SCREEN-home |
```

### Step 3: Add the Machine-Readable Appendix

```yaml
# ui-appendix.yaml
version: "1.0"
screens:
  - id: SCREEN-home
  - id: SCREEN-feature
states:
  - id: STATE-loading
  - id: STATE-ready
  - id: STATE-error
navigation:
  - from: SCREEN-home
    action: "User clicks feature card"
    to: SCREEN-feature
```

### Step 4: Validate Your UI.md

The linter is invoked directly via Node.js — no global install required:

```bash
node tooling/ui-md-linter/ui-md-lint.js ./UI.md
```

### Step 5: Validate

```bash
node tooling/ui-md-linter/ui-md-lint.js ./UI.md
# Pass: UI.md validated successfully
# Fail: Error details with line numbers and fix suggestions
```

---

## Comparison with Alternatives

UI.md occupies a specific niche—not a full design spec, not a component catalog, not a PRD:

| Document | What It Covers | UI.md Differentiation |
|----------|---------------|----------------------|
| **DESIGN.md** | Visual design tokens: colors, typography, spacing, iconography | UI.md describes behavior, not visuals. A "Submit" button's color belongs in DESIGN.md; its loading state and disabled behavior belong in UI.md |
| **PRD / SPEC.md** | Product features, business logic, acceptance criteria | UI.md doesn't define what features exist—it defines how those features manifest as screens and interactions |
| **Storybook** | Component library: reusable components, props, variants | UI.md describes complete user flows across multiple screens, not individual components |
| **API.md** | Backend contracts: endpoints, request/response payloads | UI.md describes user-facing labels and data needs, not internal API implementation |
| **Figma / Sketch** | Visual mockups and high-fidelity prototypes | UI.md is text-based and machine-verifiable. Two agents can read UI.md and converge on behavior without seeing a visual design |

---

## Adoption Evidence

UI.md is designed for teams building complex, multi-agent workflows. See real examples in [`samples/`](./samples):

- [`samples/kanban/`](./samples/kanban) — Full Kanban board with drag-drop, filters, and real-time states
- [`samples/mobile-onboarding/`](./samples/mobile-onboarding) — Stepped mobile flow with permissions and progress persistence
- [`samples/cli-dashboard/`](./samples/cli-dashboard) — Terminal dashboard with keyboard navigation and streaming output

Each sample demonstrates: screen inventory, state modeling, navigation graphs, data contracts, and machine-readable appendices.

---

## Linter Installation and Usage

The `ui-md-linter` validates your UI.md files against the standard schema.

### Prerequisites

- **Node.js** ≥18
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/Ola-Turmo/UI.md.git
cd UI.md

# Install dependencies (if needed)
npm install
```

### Validate a UI.md File

```bash
node tooling/ui-md-linter/ui-md-lint.js ./UI.md
```

### Validate All Samples

```bash
node tooling/ui-md-linter/ui-md-lint.js samples/kanban/UI.md
node tooling/ui-md-linter/ui-md-lint.js samples/mobile-onboarding/UI.md
node tooling/ui-md-linter/ui-md-lint.js samples/cli-dashboard/UI.md
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Validation passed |
| `1` | Validation failed with errors |
| `2` | File not found or unreadable |

---

## Badges

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version 1.0](https://img.shields.io/badge/Version-1.0-green.svg)](./SPEC.md)

---

## Contributing

We welcome contributions! See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for:
- How to propose changes to the standard
- Spec vs. tooling change process
- Required validation before submitting PRs
- Code of conduct and review guidelines

---

## Further Reading

- [`SPEC.md`](./SPEC.md) — Full UI.md standard specification
- [`AGENTS.md`](./AGENTS.md) — AI agent guidance for reading and producing UI.md files
- [`tooling/ui-md-linter/`](./tooling/ui-md-linter) — JSON Schema and validation tooling
- [`tooling/vscode-extension/`](./tooling/vscode-extension) — VS Code extension for syntax highlighting and validation
