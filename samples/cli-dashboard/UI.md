# CLI Dashboard — UI.md Sample

**Sample Version:** 1.0  
**Standard Version:** 1.0  
**Purpose:** Demonstrate a complete UI.md specification for a developer CLI dashboard with terminal-based UI, live status display, command execution, and configuration management.

---

## 1. Product Mental Model

A CLI dashboard is a terminal-based interface for developers to monitor system status, execute commands, manage configuration, and view output logs. The interface is entirely keyboard-driven with optional mouse support for clickable elements such as URLs and selectable text regions.

The terminal UI uses ANSI escape codes to render colors, cursor positioning, and text attributes. The interface is organized into regions: a status header showing system metrics, a command execution area with a prompt, an optional split panel for logs or help content, and a configurable footer for keyboard shortcut hints.

The core loop is: view status on the dashboard, execute commands to inspect or modify system state, review output in paginated or streaming format, adjust configuration via interactive prompts or flag syntax, and access help for command reference.

---

## 2. Users and Roles

### ROLE-developer

- **Description**: A developer who uses the CLI dashboard to monitor services, execute maintenance commands, and manage configuration for local or remote environments.
- **Capabilities**: View dashboard status, execute commands, pipe output to pager, search command history, view and edit configuration, access help pages, export logs
- **Visible Screens**: SCREEN-dashboard, SCREEN-command, SCREEN-config, SCREEN-help, SCREEN-logs

### ROLE-admin

- **Description**: A privileged developer with elevated access who can modify protected configuration keys, execute destructive commands, and manage plugin or extension settings.
- **Capabilities**: All ROLE-developer capabilities; modify protected config keys; execute force-stop, purge, and reset commands; install or remove plugins
- **Visible Screens**: SCREEN-dashboard, SCREEN-command, SCREEN-config, SCREEN-help, SCREEN-logs

---

## 3. Screen Inventory

### SCREEN-dashboard

**Purpose**: Display a live overview of system status, service health, and key metrics in a terminal dashboard layout with ANSI-colored indicators and real-time refresh.

**Primary Actions**:
- View service status indicators (green/yellow/red based on uptime and response time)
- View resource usage meters (CPU, memory, disk, network)
- Switch between multiple monitored hosts or environments via tab or arrow keys
- Drill into a specific service by pressing Enter or clicking its name
- Toggle auto-refresh on or off

**Entry Conditions**:
- User launches the CLI tool without arguments
- User presses a shortcut key (e.g., `d`) from any screen to return to dashboard

**Exit Conditions**:
- User presses Enter or clicks a service name → transitions to SCREEN-command with that service pre-selected
- User types a command at the prompt → transitions to SCREEN-command
- User presses `c` or types `config` → transitions to SCREEN-config
- User presses `h` or types `help` → transitions to SCREEN-help
- User presses `l` or types `logs` → transitions to SCREEN-logs

**States**: STATE-idle, STATE-refreshing, STATE-error, STATE-offline, STATE-pager

**Role Access**: ROLE-developer, ROLE-admin

---

### SCREEN-command

**Purpose**: Provide a command-line interface for entering, executing, and observing the output of CLI commands with full terminal emulation.

**Primary Actions**:
- Enter a command at the prompt with cursor positioning and line editing
- Use Tab for autocomplete of commands and arguments
- Navigate command history with Up/Down arrow keys
- Interrupt a running command with Ctrl+C
- Background a running command with Ctrl+Z
- Pipe output to a pager when output exceeds terminal height
- Copy selected text to terminal clipboard (if mouse enabled)

**Entry Conditions**:
- User types a command on any screen that has a prompt
- User selects a service from SCREEN-dashboard and presses Enter
- User presses a shortcut key for a specific command

**Exit Conditions**:
- Command completes → SCREEN-command in STATE-success or STATE-error
- User presses Ctrl+C → command interrupted, STATE-idle returns
- User presses Ctrl+Z → command backgrounded, STATE-idle returns
- Output exceeds terminal height → SCREEN-command in STATE-pager
- User types `exit` or presses Ctrl+D → session ends

**States**: STATE-idle, STATE-running, STATE-success, STATE-error, STATE-pager, STATE-scrollback

**Role Access**: ROLE-developer, ROLE-admin

---

### SCREEN-config

**Purpose**: Display and edit configuration values in an interactive terminal UI with inline validation and scope awareness.

**Primary Actions**:
- List all configuration keys with their current values and scopes (global, workspace, local)
- View a specific configuration key's value and documentation
- Edit a configuration value via an interactive prompt with type validation
- Reset a configuration key to its default value
- Search or filter the configuration list by key name or scope
- Export configuration to a file (JSON, YAML, or dotenv format)

**Entry Conditions**:
- User presses `c` or types `config` at any prompt
- User runs `mytool config` from SCREEN-command

**Exit Conditions**:
- User saves changes and exits → returns to previous screen in STATE-success
- User cancels editing → returns to previous screen without saving
- User presses Escape → returns to previous screen

**States**: STATE-idle, STATE-editing, STATE-validation-error, STATE-success, STATE-error

**Role Access**: ROLE-developer, ROLE-admin

---

### SCREEN-help

**Purpose**: Present manual pages and command reference documentation in a terminal-formatted help view with section navigation and examples.

**Primary Actions**:
- View the man page for a specific command
- Navigate help content with arrow keys or j/k (vim-style scroll)
- Search within the help content with `/` followed by search term
- Jump to sections (NAME, SYNOPSIS, OPTIONS, EXAMPLES, EXIT STATUS) via number or name
- Copy example command blocks to the clipboard for use in SCREEN-command
- Toggle between brief (one-screen) and full (paginated) help output

**Entry Conditions**:
- User presses `h` or types `help` at any prompt
- User runs `mytool help <command>` from SCREEN-command
- User runs `mytool <command> --help` from SCREEN-command

**Exit Conditions**:
- User presses `q`, Escape, or Ctrl+C → returns to previous screen
- User presses Enter on a linked subcommand → loads that subcommand's help

**States**: STATE-idle, STATE-pager, STATE-search-active

**Role Access**: ROLE-developer, ROLE-admin

---

### SCREEN-logs

**Purpose**: Display streaming or historical log output in a terminal view with ANSI color-coded severity levels, filtering, and search.

**Primary Actions**:
- View live streaming logs from a selected service or all services
- Scroll through historical logs (paginated)
- Filter logs by severity level (DEBUG, INFO, WARN, ERROR, FATAL)
- Filter logs by service name or tags
- Search logs by regex or plain-text pattern
- Export filtered logs to a file
- Jump to a specific timestamp or log entry number

**Entry Conditions**:
- User presses `l` or types `logs` at any prompt
- User runs `mytool logs` from SCREEN-command

**Exit Conditions**:
- User presses `q`, Escape, or Ctrl+C → returns to previous screen
- User presses Enter on a log entry → expands entry with full stack trace or metadata

**States**: STATE-idle, STATE-streaming, STATE-pager, STATE-search-active, STATE-error

**Role Access**: ROLE-developer, ROLE-admin

---

## 4. Navigation Model

### Navigation Graph

| From | To | Trigger | Condition | Back Stack |
|------|----|---------|-----------|------------|
| SCREEN-dashboard | SCREEN-command | Type command at prompt | Command entered | Push |
| SCREEN-dashboard | SCREEN-command | Enter on service name | Service selected | Push |
| SCREEN-dashboard | SCREEN-config | Press `c` | — | Push |
| SCREEN-dashboard | SCREEN-help | Press `h` | — | Push |
| SCREEN-dashboard | SCREEN-logs | Press `l` | — | Push |
| SCREEN-command | SCREEN-command | Command completes | Exit code 0 | Replace (same screen) |
| SCREEN-command | SCREEN-command | Command completes | Exit code non-zero | Replace (same screen, STATE-error) |
| SCREEN-command | SCREEN-command | Ctrl+Z | Command running | Replace (STATE-idle) |
| SCREEN-command | SCREEN-pager | Output exceeds terminal height | Streaming output | Push (overlay) |
| SCREEN-config | SCREEN-dashboard | Save and exit | — | Pop |
| SCREEN-config | SCREEN-dashboard | Cancel or Escape | — | Pop |
| SCREEN-help | SCREEN-dashboard | Press `q` | — | Pop |
| SCREEN-help | SCREEN-help | Enter on subcommand | Subcommand help | Push |
| SCREEN-logs | SCREEN-dashboard | Press `q` | — | Pop |

### Entry Points

- **Default entry**: SCREEN-dashboard is the primary entry point when launching the CLI tool without arguments.
- **Command mode entry**: Running `mytool <command>` enters directly into SCREEN-command with the command pre-filled and executed.
- **Config entry**: Running `mytool config` or `mytool config edit <key>` enters SCREEN-config directly.
- **Help entry**: Running `mytool help` or `mytool <command> --help` enters SCREEN-help directly.

### Terminal Screens

- **Terminal screens** are full-screen terminal overlays or alternate-buffer views. They replace the main buffer content while active and restore it on exit.
- The **pager** (STATE-pager) uses the alternate screen buffer to allow scrolling through output without destroying the underlying terminal content.

### Conditional Routing

- SCREEN-config editing of protected keys (e.g., `auth.token`, `db.forcePurge`) is available only to ROLE-admin. ROLE-developer attempting to edit a protected key sees STATE-permission-denied inline within SCREEN-config.

---

## 5. Core User Flows

### FLOW-viewDashboard

**Goal**: View live system status and service health metrics.

**Prerequisites**: User has launched the CLI tool.

**Steps**:
1. CLI launches → SCREEN-dashboard displayed in STATE-idle
2. Status indicators refresh automatically every 5 seconds (configurable)
3. User views colored health badges for each monitored service
4. User navigates between hosts with Left/Right arrows
5. User presses Enter on a service → SCREEN-command with service pre-selected

**Success**: Dashboard displays current health status for all monitored services.

**Failure**: Service unreachable → indicator turns red with error tooltip.

---

### FLOW-executeCommand

**Goal**: Execute a CLI command and observe its output.

**Prerequisites**: User is on SCREEN-command.

**Steps**:
1. User types a command at the prompt (e.g., `mytool status --verbose`)
2. User presses Enter
3. SCREEN-command transitions to STATE-running; cursor shows a spinner or throbber
4. Output streams line by line; if output exceeds terminal height, pagination is offered
5. Command completes → SCREEN-command transitions to STATE-success (exit code 0) or STATE-error (non-zero exit)
6. User can press Up arrow to recall the command from history

**Success**: Command output displayed; exit code shown in footer.

**Failure**: Command fails → error output displayed; non-zero exit code shown; user can retry.

---

### FLOW-autocompleteAndHistory

**Goal**: Use Tab completion and command history to speed up command entry.

**Prerequisites**: User is on SCREEN-command in STATE-idle with a partial command entered.

**Steps**:
1. User types `mytool sta` and presses Tab
2. Autocomplete shows options: `status`, `stats`, `start`
3. User continues typing or presses Tab again to confirm completion
4. User presses Up arrow → previous command (`mytool logs --since 1h`) appears at prompt
5. User presses Enter to re-execute, or continues editing

**Success**: Command completed via autocomplete or recalled from history.

**Failure**: Ambiguous completion → list of options displayed; no match → beep or no-op.

---

### FLOW-editConfiguration

**Goal**: Modify a configuration value and persist the change.

**Prerequisites**: User is ROLE-developer or ROLE-admin; accessing SCREEN-config.

**Steps**:
1. User runs `config edit logLevel`
2. SCREEN-config displays current value (`info`) with type annotation
3. User types new value (`debug`) at the interactive prompt
4. SCREEN-config validates type (string) → STATE-editing
5. User confirms with Enter → configuration saved
6. SCREEN-config transitions to STATE-success briefly, then returns to previous screen

**Success**: Configuration updated; change takes effect immediately or on next command run.

**Failure**: Invalid type entered → STATE-validation-error shown inline; user corrects or cancels.

---

### FLOW-viewPaginatedOutput

**Goal**: Navigate through command output that exceeds the terminal display height.

**Prerequisites**: Command output exceeded terminal height on SCREEN-command.

**Steps**:
1. Command completes with output longer than terminal height
2. SCREEN-command transitions to STATE-pager; alternate screen buffer activated
3. User scrolls with Down/Up arrows, j/k, or Page Up/Down
4. User searches with `/` followed by pattern; n/N for next/previous match
5. User presses `q` or Escape → exits pager, returns to STATE-idle on SCREEN-command

**Success**: User navigated all output and exited pager.

**Failure**: (none — pager always dismissible)

---

### FLOW-interruptAndBackground

**Goal**: Interrupt a running command or send it to the background.

**Prerequisites**: User is on SCREEN-command in STATE-running.

**Steps**:
1. Command is executing (STATE-running)
2. User presses Ctrl+C → command receives SIGINT → command terminates
3. SCREEN-command returns to STATE-idle with new empty prompt
4. Alternative: user presses Ctrl+Z → command receives SIGTSTP → suspended
5. SCREEN-command returns to STATE-idle; user can type `bg` to resume or `fg` to bring to foreground

**Success**: Command interrupted or backgrounded; prompt returned.

**Failure**: Command does not respond to SIGINT → Ctrl+C again forces SIGKILL (ROLE-admin only).

---

## 6. Interaction Patterns

### PATTERN-commandEntry

**Trigger**: User types at the command prompt.

**Visual Feedback**:
- Cursor blinks at current position (block or underline cursor, configurable)
- Typed characters appear in the input region; backspace removes characters before cursor
- Tab autocomplete shows a dropdown-style list aligned below the cursor (using ANSI cursor positioning)
- History navigation (Up/Down) replaces the current input with previous/next command

**Result**:
- Complete command submitted on Enter
- Partial command held in input buffer for continued editing

**Error Handling**:
- Syntax error in command → error shown inline below prompt before Enter is pressed (if detectable client-side)

**Accessibility**:
- Screen reader mode: each character announced; autocomplete options read aloud; command result read by sections

---

### PATTERN-keyboardShortcuts

**Trigger**: User presses a keyboard shortcut at any time (not just at prompt).

**Keyboard Shortcuts**:

| Shortcut | Action | Screen |
|----------|--------|--------|
| `Ctrl+C` | Interrupt running command, cancel current input | SCREEN-command |
| `Ctrl+Z` | Background running command (send SIGTSTP) | SCREEN-command |
| `Tab` | Autocomplete command or argument | SCREEN-command |
| `Shift+Tab` | Reverse autocomplete (show all options) | SCREEN-command |
| `Up / Down` | Navigate command history | SCREEN-command |
| `Left / Right` | Move cursor within command line | SCREEN-command |
| `Ctrl+A` | Move cursor to beginning of line | SCREEN-command |
| `Ctrl+E` | Move cursor to end of line | SCREEN-command |
| `Ctrl+K` | Kill text from cursor to end of line | SCREEN-command |
| `Ctrl+U` | Kill text from beginning to cursor | SCREEN-command |
| `Ctrl+L` | Clear screen (redraw dashboard) | All screens |
| `Ctrl+R` | Reverse search through command history | SCREEN-command |
| `Ctrl+C` (idle) | Cancel current operation, return to prompt | SCREEN-command, SCREEN-logs |
| `Escape` | Exit current screen, return to previous | SCREEN-config, SCREEN-help, SCREEN-logs |
| `q` | Quit current screen | SCREEN-help, SCREEN-logs |
| `d` | Return to dashboard | SCREEN-command |
| `c` | Open config | All |
| `h` | Open help | All |
| `l` | Open logs | All |

**Visual Feedback**:
- Shortcut hints displayed in a footer region at the bottom of the terminal (e.g., `^C interrupt  ^Z background  ^L clear  d: dashboard  h: help`)
- Active shortcut region may highlight briefly on press

**Result**: Shortcut action executed immediately.

---

### PATTERN-mouseSupport

**Trigger**: User clicks or scrolls with mouse in a terminal that supports mouse events (e.g., xterm, iTerm2, Windows Terminal).

**Visual Feedback**:
- Clickable regions (URLs, service names, configuration keys) highlight on hover
- Click on URL → opens URL in default browser
- Click on service name → equivalent to Enter on that service
- Scroll wheel → scrolls the current view (pager, logs, help)
- Text selection → selected text highlighted in ANSI reverse-video

**Result**:
- Click action navigated or triggered
- Selected text available for copy

**Error Handling**:
- Mouse events not supported by terminal → interaction ignored; keyboard fallback always available

**Accessibility**:
- Mouse is optional; all interactions achievable via keyboard

---

### PATTERN-streamingOutput

**Trigger**: A long-running command produces output incrementally.

**Visual Feedback**:
- Output lines appear as they are written to stdout/stderr
- ANSI escape codes rendered (colors, cursor movement, clear sequences)
- If output exceeds terminal height, a prompt appears: `-- More --` with space to continue
- New output appended at the bottom; display auto-scrolls unless user has scrolled up (at which point auto-scroll pauses)

**Result**:
- Output accumulated in scrollback buffer
- User can scroll back to view earlier output
- On completion, exit code displayed in footer region

**Error Handling**:
- Stderr output rendered in a distinct color (red) to differentiate from stdout
- If terminal buffer is exhausted, oldest output dropped from scrollback (configurable limit)

**Accessibility**:
- Streaming output paused when user scrolls up; resume indicator shown when reaching bottom

---

## 7. State Model

### STATE-idle

- **Type**: idle
- **Description**: The terminal is ready to accept user input. No command is running, no modal or overlay is active.
- **Indicators**: Prompt displayed (e.g., `mytool > `); cursor blinking at prompt; shortcut hints visible in footer
- **Allowed Actions**: Type command, navigate to other screens, press shortcuts
- **Blocked Actions**: None

---

### STATE-running

- **Type**: loading
- **Description**: A command is actively executing and producing output or waiting for a response.
- **User Message**: (none — output is the feedback)
- **Indicators**: Cursor changes to spinner or throbber; prompt replaced with running-indicator (e.g., `...` or spinning symbol); shortcut hints may be hidden during full-screen output
- **Allowed Actions**: Interrupt (Ctrl+C), background (Ctrl+Z), scroll output
- **Blocked Actions**: Entering a new command (unless using multiplexed shell)

---

### STATE-success

- **Type**: success
- **Description**: A command completed with exit code 0.
- **User Message**: (none — implied by exit code 0)
- **Indicators**: Exit code displayed in footer (e.g., `✓ Done (0) in 1.2s`); brief green flash on status line for non-interactive runs
- **Allowed Actions**: Recall command with Up arrow, enter new command
- **Recovery Action**: None required

---

### STATE-error

- **Type**: error
- **Description**: A command completed with a non-zero exit code or encountered a runtime error.
- **User Message**: Command error message displayed in output region (red text) and exit code in footer (e.g., `✗ Error (1) in 0.4s`)
- **Indicators**: Exit code non-zero; error output in stderr color; error summary in footer
- **Allowed Actions**: Retry command, view error details, check help for exit code meaning
- **Recovery Action**: Fix command invocation based on error message; retry

---

### STATE-pager

- **Type**: pager
- **Description**: Output is longer than terminal height and has been placed in a paginated viewer using the alternate screen buffer.
- **Indicators**: `-- More --` prompt at bottom; page count or percentage; line number range; search highlight when active
- **Allowed Actions**: Scroll (j/k, arrows, Page Up/Down), search (/), quit (q, Escape), jump to line (g, G), navigate matches (n/N)
- **Blocked Actions**: Entering new command (must exit pager first)

---

### STATE-scrollback

- **Type**: scrollback
- **Description**: User has scrolled up in command output or logs to view historical content while a new command could be entered at the bottom.
- **Indicators**: Scroll position indicator (e.g., `[scrollback: lines 1-500 of 2847]`); prompt still visible at bottom; auto-scroll paused indicator if user scrolled away from bottom
- **Allowed Actions**: Scroll further up or down, enter new commands at prompt
- **Blocked Actions**: None

---

### STATE-streaming

- **Type**: loading
- **Description**: Log viewer is receiving and displaying live log entries as they are produced by the monitored service.
- **Indicators**: `[streaming]` badge in header; live indicator (pulsing dot or `LIVE` label); auto-scroll enabled
- **Allowed Actions**: Scroll, filter, search, pause stream, exit
- **Blocked Actions**: None — streaming is non-blocking

---

### STATE-editing

- **Type**: editing
- **Description**: User is actively modifying a configuration value in an inline terminal prompt.
- **Indicators**: Current value shown with cursor at edit position; type annotation and constraints displayed above; inline validation messages below
- **Allowed Actions**: Type new value, cursor movement, Tab to accept suggestion, Enter to confirm, Escape to cancel
- **Blocked Actions**: Navigation to other screens

---

### STATE-validation-error

- **Type**: error
- **Description**: A configuration value entered by the user failed validation (wrong type, out-of-range, prohibited value).
- **User Message**: Validation error message displayed inline below the input field (e.g., `error: 'debug' is not a valid logLevel. Expected one of: info, warn, error`)
- **Indicators**: Red-colored error text; invalid value highlighted; prompt remains in edit mode
- **Allowed Actions**: Retype value, cancel (Escape), view help for valid values
- **Recovery Action**: Enter a valid value matching the expected type and constraints

---

### STATE-permission-denied

- **Type**: permission-denied
- **Description**: User attempted to access or modify a configuration key or command that requires ROLE-admin privileges.
- **User Message**: `error: permission denied. This action requires admin privileges.`
- **Indicators**: Error message inline; access denied indicator in status area
- **Allowed Actions**: Cancel, request admin access, view help for the resource
- **Recovery Action**: Authenticate as admin or request elevated permissions

---

### STATE-offline

- **Type**: offline
- **Description**: The monitored host or service is unreachable; dashboard shows stale or disconnected state.
- **User Message**: `[offline] last seen: 2 minutes ago`
- **Indicators**: Grayed-out or red status badge; last known values shown with timestamp; reconnection attempted automatically
- **Allowed Actions**: Retry connection, view cached data, navigate to other screens
- **Blocked Actions**: Commands targeting the offline service
- **Recovery Action**: Service comes back online; connection restored automatically

---

### STATE-search-active

- **Type**: search-active
- **Description**: User has initiated a search within pager, help, or logs view.
- **Indicators**: Search prompt (`/`) displayed at bottom; match count shown (e.g., `7/23`); current match highlighted
- **Allowed Actions**: Continue typing search; n/N for next/previous match; Enter to jump to match and close search; Escape to cancel search
- **Blocked Actions**: None — search is non-blocking

---

## 8. Data Contract

### ENTITY-command

```
Fields:
- name: string, readOnly, label "Command"
  - The primary command verb (e.g., "status", "logs", "config").
- subcommand: string (nullable), readOnly, label "Subcommand"
  - Optional subcommand following the primary verb (e.g., "edit" in "config edit").
- flags: array of ENTITY-flag, label "Flags"
  - Zero or more flag arguments (e.g., "--verbose", "--since 1h").
- arguments: array of strings, label "Arguments"
  - Positional arguments following flags (e.g., service names, file paths).
- description: string, readOnly, label "Description"
  - One-line description of what the command does.
- exitCode: number (nullable), readOnly, label "Exit Code"
  - Numeric exit code returned by the command (null if not yet run).
- duration: number (nullable), readOnly, label "Duration (ms)"
  - Elapsed time in milliseconds from invocation to completion (null if not yet run).
```

**Command Syntax Examples**:

```
mytool                           # Launch dashboard (SCREEN-dashboard)
mytool status                    # Check service status (SCREEN-command)
mytool status --verbose          # Status with verbose output
mytool status --json             # Status as JSON for scripting
mytool logs --since 1h           # Logs from the last hour (SCREEN-logs)
mytool logs --filter error       # Logs filtered by severity
mytool config list               # List all config keys (SCREEN-config)
mytool config edit logLevel      # Edit logLevel interactively
mytool config set logLevel debug # Set logLevel non-interactively
mytool help                      # Show general help (SCREEN-help)
mytool help status               # Help for status command
mytool status --help             # Alternative help invocation
```

**Screen Usage**: SCREEN-command, SCREEN-dashboard

**Operations**: Execute

---

### ENTITY-config

```
Fields:
- key: string, readOnly, label "Key"
  - Dot-separated configuration key path (e.g., "logLevel", "auth.token").
- value: string, readOnly, label "Value"
  - The current value as a string representation.
- type: string, readOnly, label "Type"
  - JSON Schema type of the value (e.g., "string", "number", "boolean", "array", "object").
- scope: enum, readOnly, label "Scope"
  - One of: global, workspace, local. Indicates where this value is defined.
- isProtected: boolean, readOnly, label "Protected"
  - True if this key requires ROLE-admin to modify.
- description: string, readOnly, label "Description"
  - One-line documentation for this configuration key.
- defaultValue: string, readOnly, label "Default"
  - The factory-default value as a string.
```

**Screen Usage**: SCREEN-config

**Operations**: Read, Update

---

### ENTITY-output

```
Fields:
- text: string, readOnly, label "Output"
  - The raw output text including ANSI escape sequences.
- plainText: string, readOnly, label "Plain Text"
  - Output with ANSI escape sequences stripped for search and export.
- format: enum, readOnly, label "Format"
  - One of: plain, json, table, tree, dot. Indicates output format.
- isTruncated: boolean, readOnly, label "Truncated"
  - True if output exceeded buffer limits and was truncated.
- truncationLimit: number, readOnly, label "Truncation Limit"
  - Maximum lines or bytes retained in scrollback (0 if unlimited).
- lineCount: number, readOnly, label "Line Count"
  - Total number of output lines produced.
- streamTimestamp: date, readOnly, label "Stream Time"
  - Timestamp of when output streaming began.
```

**Screen Usage**: SCREEN-command, SCREEN-logs

**Operations**: Read, Export

---

### ENTITY-status

```
Fields:
- exitCode: number (nullable), readOnly, label "Exit Code"
  - Numeric exit code (0 = success, non-zero = error).
- duration: number, readOnly, label "Duration (ms)"
  - Elapsed time in milliseconds.
- timestamp: date, readOnly, label "Timestamp"
  - Wall-clock time when the command completed.
- signal: string (nullable), readOnly, label "Signal"
  - Signal name if command was terminated by a signal (e.g., "SIGINT", "SIGKILL").
- resourceUsage: ENTITY-resourceUsage (nullable), readOnly, label "Resource Usage"
  - CPU time, memory usage, and I/O stats if available.
```

**Screen Usage**: SCREEN-command

**Operations**: Read

---

### ENTITY-flag

```
Fields:
- name: string, readOnly, label "Flag"
  - Long-form flag name (e.g., "verbose") or short form (e.g., "v").
- value: string (nullable), readOnly, label "Value"
  - Flag value if the flag takes an argument; null for boolean flags.
- isBoolean: boolean, readOnly, label "Is Boolean"
  - True if this flag is a boolean (present = true, absent = false).
```

**Screen Usage**: SCREEN-command

**Operations**: Read

---

### ENTITY-serviceHealth

```
Fields:
- name: string, readOnly, label "Service"
  - Service identifier (e.g., "api-server", "database").
- status: enum, readOnly, label "Status"
  - One of: healthy, degraded, offline, unknown.
- uptimeSeconds: number, readOnly, label "Uptime (s)"
  - Seconds since last restart.
- responseTimeMs: number, readOnly, label "Response Time (ms)"
  - Last measured round-trip latency.
- lastChecked: date, readOnly, label "Last Checked"
  - Timestamp of last health check.
```

**Screen Usage**: SCREEN-dashboard

**Operations**: Read

---

### Pagination, Filtering, and Sorting

**Pagination**: Command output is paginated when it exceeds the terminal height. The pager allows forward/backward navigation by line, page, or percentage. Scrollback history is limited by a configurable buffer size (default: 10,000 lines). Log output is paginated similarly.

**Filtering**: The `logs` command supports filtering by severity level, time range (`--since`), service name (`--service <name>`), and text pattern (`--filter <regex>`). The config list supports filtering by key prefix or scope.

**Sorting**: Command history is sorted by recency (newest first). Config keys are sorted alphabetically by default, with options to sort by scope or last-modified time. Log entries are sorted by timestamp (oldest first in scrollback view; newest first in live streaming).

---

## 9. Machine-Readable Appendix

```json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-dashboard",
      "purpose": "Display live overview of system status, service health, and key metrics in a terminal dashboard layout with ANSI-colored indicators.",
      "primaryActions": [
        "View service status indicators",
        "Navigate between hosts or environments",
        "Drill into a service to run commands",
        "Toggle auto-refresh",
        "Switch to config, help, or logs"
      ],
      "entryConditions": [
        "CLI tool launched without arguments",
        "Shortcut key (d) pressed from any screen"
      ],
      "exitConditions": [
        "Service selected → SCREEN-command",
        "Command typed → SCREEN-command",
        "c pressed → SCREEN-config",
        "h pressed → SCREEN-help",
        "l pressed → SCREEN-logs"
      ],
      "states": ["STATE-idle", "STATE-refreshing", "STATE-error", "STATE-offline", "STATE-pager"],
      "roleAccess": ["ROLE-developer", "ROLE-admin"]
    },
    {
      "id": "SCREEN-command",
      "purpose": "Provide a terminal command-line interface for entering, executing, and observing output of CLI commands.",
      "primaryActions": [
        "Enter command at prompt with cursor editing",
        "Use Tab autocomplete and Up/Down history",
        "Interrupt with Ctrl+C, background with Ctrl+Z",
        "Pipe output to pager when output exceeds terminal height",
        "Clear screen with Ctrl+L"
      ],
      "entryConditions": [
        "User types a command at any prompt",
        "User selects a service from dashboard"
      ],
      "exitConditions": [
        "Command completes (exit code 0 or non-zero)",
        "Ctrl+C pressed → interrupt, STATE-idle",
        "Ctrl+Z pressed → background, STATE-idle",
        "Output exceeds height → STATE-pager",
        "exit or Ctrl+D → session ends"
      ],
      "states": ["STATE-idle", "STATE-running", "STATE-success", "STATE-error", "STATE-pager", "STATE-scrollback"],
      "roleAccess": ["ROLE-developer", "ROLE-admin"]
    },
    {
      "id": "SCREEN-config",
      "purpose": "Display and edit configuration values interactively with inline validation and scope awareness.",
      "primaryActions": [
        "List all configuration keys with values and scopes",
        "View a specific configuration key",
        "Edit a value via interactive prompt",
        "Reset a key to default",
        "Search or filter configuration list",
        "Export configuration to file"
      ],
      "entryConditions": [
        "User presses c or types config",
        "User runs mytool config"
      ],
      "exitConditions": [
        "Save and exit → previous screen in STATE-success",
        "Cancel or Escape → previous screen without saving"
      ],
      "states": ["STATE-idle", "STATE-editing", "STATE-validation-error", "STATE-success", "STATE-error"],
      "roleAccess": ["ROLE-developer", "ROLE-admin"]
    },
    {
      "id": "SCREEN-help",
      "purpose": "Present man pages and command reference in a terminal-formatted help view with section navigation.",
      "primaryActions": [
        "View man page for a specific command",
        "Navigate with arrows or j/k (vim-style)",
        "Search within help with /",
        "Jump to sections by number or name",
        "Copy example commands",
        "Toggle brief vs. full output"
      ],
      "entryConditions": [
        "User presses h or types help",
        "User runs mytool help <command>",
        "User runs mytool <command> --help"
      ],
      "exitConditions": [
        "q, Escape, or Ctrl+C → previous screen",
        "Enter on subcommand → loads subcommand help"
      ],
      "states": ["STATE-idle", "STATE-pager", "STATE-search-active"],
      "roleAccess": ["ROLE-developer", "ROLE-admin"]
    },
    {
      "id": "SCREEN-logs",
      "purpose": "Display streaming or historical log output with ANSI severity coloring, filtering, and search.",
      "primaryActions": [
        "View live streaming logs",
        "Scroll through historical logs",
        "Filter by severity, service, or tags",
        "Search by regex or plain text",
        "Export filtered logs to file",
        "Jump to specific timestamp"
      ],
      "entryConditions": [
        "User presses l or types logs",
        "User runs mytool logs"
      ],
      "exitConditions": [
        "q, Escape, or Ctrl+C → previous screen",
        "Enter on log entry → expands with full details"
      ],
      "states": ["STATE-idle", "STATE-streaming", "STATE-pager", "STATE-search-active", "STATE-error"],
      "roleAccess": ["ROLE-developer", "ROLE-admin"]
    }
  ],
  "states": [
    {
      "id": "STATE-idle",
      "type": "idle",
      "description": "Terminal is ready to accept input. No command running, no overlay active.",
      "indicators": ["Prompt displayed", "Cursor blinking at prompt", "Shortcut hints in footer"],
      "allowedActions": ["Type command", "Navigate screens", "Press shortcuts"],
      "blockedActions": []
    },
    {
      "id": "STATE-running",
      "type": "loading",
      "description": "Command is actively executing and producing output.",
      "indicators": ["Spinner or throbber cursor", "Running indicator in prompt area", "Output streaming"],
      "allowedActions": ["Interrupt (Ctrl+C)", "Background (Ctrl+Z)", "Scroll output"],
      "blockedActions": ["Enter new command (without multiplexed shell)"]
    },
    {
      "id": "STATE-success",
      "type": "success",
      "description": "Command completed with exit code 0.",
      "indicators": ["Exit code 0 in footer", "Green status flash (non-interactive)"],
      "allowedActions": ["Recall command with Up arrow", "Enter new command"],
      "blockedActions": []
    },
    {
      "id": "STATE-error",
      "type": "error",
      "description": "Command completed with non-zero exit code or runtime error.",
      "userMessage": "Error message in stderr color; non-zero exit code in footer",
      "indicators": ["Non-zero exit code displayed", "Error output in stderr color (red)"],
      "allowedActions": ["Retry command", "View error details", "Check help for exit code meaning"],
      "blockedActions": []
    },
    {
      "id": "STATE-pager",
      "type": "loading",
      "description": "Output exceeds terminal height and is displayed in paginated viewer on alternate screen buffer.",
      "indicators": ["-- More -- prompt at bottom", "Page count or percentage", "Search highlight when active"],
      "allowedActions": ["Scroll (j/k, arrows, Page Up/Down)", "Search (/)", "Quit (q, Escape)", "Jump to line (g, G)", "Navigate matches (n/N)"],
      "blockedActions": ["Enter new command (must exit pager first)"]
    },
    {
      "id": "STATE-scrollback",
      "type": "scrollback",
      "description": "User has scrolled up in output to view historical content while prompt remains available.",
      "indicators": ["Scroll position indicator", "Prompt visible at bottom", "Auto-scroll paused indicator"],
      "allowedActions": ["Scroll further up/down", "Enter new commands at prompt"],
      "blockedActions": []
    },
    {
      "id": "STATE-streaming",
      "type": "loading",
      "description": "Log viewer is receiving and displaying live log entries as they are produced.",
      "indicators": ["[streaming] badge", "Live indicator (pulsing dot or LIVE label)", "Auto-scroll enabled"],
      "allowedActions": ["Scroll", "Filter", "Search", "Pause stream", "Exit"],
      "blockedActions": []
    },
    {
      "id": "STATE-editing",
      "type": "editing",
      "description": "User is modifying a configuration value in an inline terminal prompt.",
      "indicators": ["Current value with cursor at edit position", "Type annotation and constraints above", "Inline validation below"],
      "allowedActions": ["Type new value", "Cursor movement", "Tab to accept suggestion", "Enter to confirm", "Escape to cancel"],
      "blockedActions": ["Navigate to other screens"]
    },
    {
      "id": "STATE-validation-error",
      "type": "error",
      "description": "Configuration value entered failed validation (wrong type, out-of-range, prohibited).",
      "userMessage": "error: 'debug' is not a valid logLevel. Expected one of: info, warn, error",
      "indicators": ["Red error text inline", "Invalid value highlighted", "Prompt remains in edit mode"],
      "allowedActions": ["Retype value", "Cancel (Escape)", "View help for valid values"],
      "blockedActions": []
    },
    {
      "id": "STATE-permission-denied",
      "type": "permission-denied",
      "description": "User attempted to access or modify a resource requiring ROLE-admin privileges.",
      "userMessage": "error: permission denied. This action requires admin privileges.",
      "indicators": ["Error message inline", "Access denied indicator in status area"],
      "allowedActions": ["Cancel", "Request admin access", "View help for the resource"],
      "blockedActions": []
    },
    {
      "id": "STATE-offline",
      "type": "offline",
      "description": "Monitored host or service is unreachable; dashboard shows stale or disconnected state.",
      "userMessage": "[offline] last seen: 2 minutes ago",
      "indicators": ["Grayed-out or red status badge", "Last known values with timestamp", "Reconnection attempted automatically"],
      "allowedActions": ["Retry connection", "View cached data", "Navigate to other screens"],
      "blockedActions": ["Commands targeting the offline service"],
      "recoveryAction": "Service comes back online; connection restored automatically"
    },
    {
      "id": "STATE-search-active",
      "type": "search-active",
      "description": "User has initiated a search within pager, help, or logs view.",
      "indicators": ["Search prompt (/) at bottom", "Match count shown (e.g., 7/23)", "Current match highlighted"],
      "allowedActions": ["Continue typing search", "n/N for next/previous match", "Enter to jump and close search", "Escape to cancel search"],
      "blockedActions": []
    }
  ],
  "navigation": [
    { "from": "SCREEN-dashboard", "to": "SCREEN-command", "trigger": "Type command at prompt", "condition": "Command entered", "backStack": "Push" },
    { "from": "SCREEN-dashboard", "to": "SCREEN-command", "trigger": "Enter on service name", "condition": "Service selected", "backStack": "Push" },
    { "from": "SCREEN-dashboard", "to": "SCREEN-config", "trigger": "Press c", "backStack": "Push" },
    { "from": "SCREEN-dashboard", "to": "SCREEN-help", "trigger": "Press h", "backStack": "Push" },
    { "from": "SCREEN-dashboard", "to": "SCREEN-logs", "trigger": "Press l", "backStack": "Push" },
    { "from": "SCREEN-command", "to": "SCREEN-command", "trigger": "Command completes", "condition": "Exit code 0", "backStack": "Replace" },
    { "from": "SCREEN-command", "to": "SCREEN-command", "trigger": "Command completes", "condition": "Exit code non-zero", "backStack": "Replace" },
    { "from": "SCREEN-command", "to": "SCREEN-command", "trigger": "Ctrl+Z", "condition": "Command running", "backStack": "Replace" },
    { "from": "SCREEN-command", "to": "SCREEN-pager", "trigger": "Output exceeds terminal height", "condition": "Streaming output", "backStack": "Push" },
    { "from": "SCREEN-config", "to": "SCREEN-dashboard", "trigger": "Save and exit", "backStack": "Pop" },
    { "from": "SCREEN-config", "to": "SCREEN-dashboard", "trigger": "Cancel or Escape", "backStack": "Pop" },
    { "from": "SCREEN-help", "to": "SCREEN-dashboard", "trigger": "Press q", "backStack": "Pop" },
    { "from": "SCREEN-help", "to": "SCREEN-help", "trigger": "Enter on subcommand", "condition": "Subcommand help", "backStack": "Push" },
    { "from": "SCREEN-logs", "to": "SCREEN-dashboard", "trigger": "Press q", "backStack": "Pop" }
  ],
  "roles": [
    {
      "roleId": "ROLE-developer",
      "name": "Developer",
      "description": "Developer using CLI dashboard to monitor services, execute commands, and manage configuration.",
      "capabilities": ["View dashboard status", "Execute commands", "Pipe output to pager", "Search command history", "View and edit non-protected config", "Access help pages", "Export logs"],
      "visibleScreens": ["SCREEN-dashboard", "SCREEN-command", "SCREEN-config", "SCREEN-help", "SCREEN-logs"]
    },
    {
      "roleId": "ROLE-admin",
      "name": "Admin Developer",
      "description": "Privileged developer with elevated access for protected configuration and destructive commands.",
      "capabilities": ["All ROLE-developer capabilities", "Modify protected config keys", "Execute force-stop, purge, and reset commands", "Install or remove plugins"],
      "visibleScreens": ["SCREEN-dashboard", "SCREEN-command", "SCREEN-config", "SCREEN-help", "SCREEN-logs"]
    }
  ],
  "dataContracts": {
    "command": {
      "entityId": "ENTITY-command",
      "name": "Command",
      "fields": [
        { "name": "name", "label": "Command", "type": "string", "required": true, "readOnly": true },
        { "name": "subcommand", "label": "Subcommand", "type": "string", "required": false, "readOnly": true },
        { "name": "flags", "label": "Flags", "type": "array", "required": false, "readOnly": true },
        { "name": "arguments", "label": "Arguments", "type": "array", "required": false, "readOnly": true },
        { "name": "description", "label": "Description", "type": "string", "required": true, "readOnly": true },
        { "name": "exitCode", "label": "Exit Code", "type": "number", "required": false, "readOnly": true },
        { "name": "duration", "label": "Duration (ms)", "type": "number", "required": false, "readOnly": true }
      ],
      "screenUsage": ["SCREEN-command", "SCREEN-dashboard"],
      "operations": ["Execute"]
    },
    "config": {
      "entityId": "ENTITY-config",
      "name": "Config",
      "fields": [
        { "name": "key", "label": "Key", "type": "string", "required": true, "readOnly": true },
        { "name": "value", "label": "Value", "type": "string", "required": true, "readOnly": false },
        { "name": "type", "label": "Type", "type": "string", "required": true, "readOnly": true },
        { "name": "scope", "label": "Scope", "type": "enum", "constraints": { "values": ["global", "workspace", "local"] }, "required": true, "readOnly": true },
        { "name": "isProtected", "label": "Protected", "type": "boolean", "required": true, "readOnly": true },
        { "name": "description", "label": "Description", "type": "string", "required": true, "readOnly": true },
        { "name": "defaultValue", "label": "Default", "type": "string", "required": true, "readOnly": true }
      ],
      "screenUsage": ["SCREEN-config"],
      "operations": ["Read", "Update"]
    },
    "output": {
      "entityId": "ENTITY-output",
      "name": "Output",
      "fields": [
        { "name": "text", "label": "Output", "type": "string", "required": true, "readOnly": true },
        { "name": "plainText", "label": "Plain Text", "type": "string", "required": true, "readOnly": true },
        { "name": "format", "label": "Format", "type": "enum", "constraints": { "values": ["plain", "json", "table", "tree", "dot"] }, "required": true, "readOnly": true },
        { "name": "isTruncated", "label": "Truncated", "type": "boolean", "required": true, "readOnly": true },
        { "name": "truncationLimit", "label": "Truncation Limit", "type": "number", "required": true, "readOnly": true },
        { "name": "lineCount", "label": "Line Count", "type": "number", "required": true, "readOnly": true },
        { "name": "streamTimestamp", "label": "Stream Time", "type": "date", "required": false, "readOnly": true }
      ],
      "screenUsage": ["SCREEN-command", "SCREEN-logs"],
      "operations": ["Read", "Export"]
    },
    "status": {
      "entityId": "ENTITY-status",
      "name": "Status",
      "fields": [
        { "name": "exitCode", "label": "Exit Code", "type": "number", "required": false, "readOnly": true },
        { "name": "duration", "label": "Duration (ms)", "type": "number", "required": true, "readOnly": true },
        { "name": "timestamp", "label": "Timestamp", "type": "date", "required": true, "readOnly": true },
        { "name": "signal", "label": "Signal", "type": "string", "required": false, "readOnly": true },
        { "name": "resourceUsage", "label": "Resource Usage", "type": "object", "required": false, "readOnly": true }
      ],
      "screenUsage": ["SCREEN-command"],
      "operations": ["Read"]
    },
    "flag": {
      "entityId": "ENTITY-flag",
      "name": "Flag",
      "fields": [
        { "name": "name", "label": "Flag", "type": "string", "required": true, "readOnly": true },
        { "name": "value", "label": "Value", "type": "string", "required": false, "readOnly": true },
        { "name": "isBoolean", "label": "Is Boolean", "type": "boolean", "required": true, "readOnly": true }
      ],
      "screenUsage": ["SCREEN-command"],
      "operations": ["Read"]
    },
    "serviceHealth": {
      "entityId": "ENTITY-serviceHealth",
      "name": "ServiceHealth",
      "fields": [
        { "name": "name", "label": "Service", "type": "string", "required": true, "readOnly": true },
        { "name": "status", "label": "Status", "type": "enum", "constraints": { "values": ["healthy", "degraded", "offline", "unknown"] }, "required": true, "readOnly": true },
        { "name": "uptimeSeconds", "label": "Uptime (s)", "type": "number", "required": true, "readOnly": true },
        { "name": "responseTimeMs", "label": "Response Time (ms)", "type": "number", "required": true, "readOnly": true },
        { "name": "lastChecked", "label": "Last Checked", "type": "date", "required": true, "readOnly": true }
      ],
      "screenUsage": ["SCREEN-dashboard"],
      "operations": ["Read"]
    }
  }
}
```
