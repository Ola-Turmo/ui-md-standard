# Kanban Board — UI.md Sample

**Sample Version:** 1.0  
**Standard Version:** 1.0  
**Purpose:** Demonstrate a complete UI.md specification for a Kanban task manager with drag-and-drop, real-time collaboration, filtering, and board management.

---

## 1. Product Mental Model

A Kanban board is a visual task-management surface organized into vertical columns. Each column represents a work stage (e.g., To Do, In Progress, Done). Cards represent individual tasks that users create, assign, move, and track. The board is shared among team members who can work simultaneously, with changes reflected in real time.

The core loop is: create a card, place it in a column, move it across columns as work progresses, filter to focus on relevant work, and close or archive completed cards.

---

## 2. Users and Roles

### ROLE-authenticated

- **Description**: A logged-in user who can view, create, and manage cards on boards they have access to.
- **Capabilities**: View board, create card, edit card, move card (drag-drop), delete card, apply filters, open settings
- **Visible Screens**: SCREEN-board, SCREEN-cardDetail, SCREEN-createCard, SCREEN-filter, SCREEN-settings

### ROLE-admin

- **Description**: A privileged user who can manage board settings, column configuration, and membership.
- **Capabilities**: All ROLE-authenticated capabilities; configure columns, manage board members, set WIP limits, delete board
- **Visible Screens**: SCREEN-board, SCREEN-cardDetail, SCREEN-createCard, SCREEN-filter, SCREEN-settings

---

## 3. Screen Inventory

### SCREEN-board

**Purpose**: Display the Kanban board with all columns and cards as the primary workspace.

**Primary Actions**:
- Open a card by clicking on it
- Drag a card to a different column
- Create a new card via the column header button
- Open the filter panel
- Open board settings

**Entry Conditions**:
- User is authenticated (ROLE-authenticated or ROLE-admin)
- Board data has been successfully loaded from the server

**Exit Conditions**:
- User clicks a card → transitions to SCREEN-cardDetail
- User clicks the add-card button → transitions to SCREEN-createCard
- User clicks the filter toggle → transitions to SCREEN-filter
- User clicks settings → transitions to SCREEN-settings
- User logs out → transitions to login screen (out of scope for this sample)

**States**: STATE-empty-board, STATE-empty-column, STATE-loading, STATE-success, STATE-error, STATE-offline

**Role Access**: ROLE-authenticated, ROLE-admin

---

### SCREEN-cardDetail

**Purpose**: Show full card details in a panel or overlay, allowing the user to read, edit, comment, and manage the card lifecycle.

**Primary Actions**:
- Edit card fields (title, description, assignee, due date, tags)
- Delete the card
- Move the card to a different column
- Close the detail panel and return to the board

**Entry Conditions**:
- User clicked a card on SCREEN-board
- Card data has been loaded

**Exit Conditions**:
- User clicks close or presses Escape → returns to SCREEN-board
- User clicks "Save" after editing → returns to SCREEN-board with updated data
- User clicks "Delete" → card is removed, returns to SCREEN-board

**States**: STATE-loading, STATE-success, STATE-error

**Role Access**: ROLE-authenticated, ROLE-admin

---

### SCREEN-createCard

**Purpose**: Display a form for creating a new card in a selected column.

**Primary Actions**:
- Enter card title (required)
- Enter card description (optional)
- Select an assignee (optional)
- Set a due date (optional)
- Add tags (optional)
- Submit the form to create the card
- Cancel and return to the board

**Entry Conditions**:
- User clicked the add-card button on SCREEN-board
- Target column was selected

**Exit Conditions**:
- User submits valid form → card created, returns to SCREEN-board in STATE-success
- User clicks cancel or presses Escape → returns to SCREEN-board without creating
- Validation failure → form remains in STATE-field-error

**States**: STATE-loading, STATE-field-error, STATE-success, STATE-error

**Role Access**: ROLE-authenticated, ROLE-admin

---

### SCREEN-filter

**Purpose**: Display a panel for filtering cards by assignee, tags, due date range, and text search.

**Primary Actions**:
- Select one or more assignees to filter by
- Select one or more tags to filter by
- Set a due date range (from/to)
- Enter a text search query (searches card title and description)
- Apply filters (immediately updates the board view)
- Clear all filters
- Close the filter panel

**Entry Conditions**:
- User clicked the filter toggle on SCREEN-board

**Exit Conditions**:
- User clicks "Apply" or "Clear" → filter applied or removed, returns to SCREEN-board
- User clicks close or presses Escape → returns to SCREEN-board without changing filters

**States**: STATE-loading (while fetching filtered results), STATE-success

**Role Access**: ROLE-authenticated, ROLE-admin

---

### SCREEN-settings

**Purpose**: Display board settings for administrative users, including column management, WIP limits, and membership.

**Primary Actions**:
- Add a new column
- Rename an existing column
- Delete an empty column
- Set or update WIP (Work In Progress) limits per column
- Add or remove board members
- Change board name
- Save changes

**Entry Conditions**:
- User is ROLE-admin
- User clicked the settings button on SCREEN-board

**Exit Conditions**:
- User clicks "Save" → settings saved, returns to SCREEN-board in STATE-success
- User clicks cancel or presses Escape → returns to SCREEN-board without saving

**States**: STATE-loading, STATE-success, STATE-error, STATE-permission-denied

**Role Access**: ROLE-admin

---

## 4. Navigation Model

### Navigation Graph

| From | To | Trigger | Condition | Back Stack |
|------|----|---------|-----------|------------|
| SCREEN-board | SCREEN-cardDetail | Click card | Card selected | Push |
| SCREEN-board | SCREEN-createCard | Click add-card button | Column selected | Modal |
| SCREEN-board | SCREEN-filter | Click filter toggle | — | Push |
| SCREEN-board | SCREEN-settings | Click settings button | ROLE-admin | Push |
| SCREEN-cardDetail | SCREEN-board | Click close / Escape | — | Pop |
| SCREEN-cardDetail | SCREEN-board | Save card | Card saved | Pop |
| SCREEN-createCard | SCREEN-board | Submit valid form | Card created | Pop (Modal) |
| SCREEN-createCard | SCREEN-board | Click cancel / Escape | — | Pop (Modal) |
| SCREEN-filter | SCREEN-board | Click close / Escape | — | Pop |
| SCREEN-settings | SCREEN-board | Click save | Settings saved | Pop |
| SCREEN-settings | SCREEN-board | Click cancel / Escape | — | Pop |

### Entry Points

- **Authenticated entry**: SCREEN-board is the primary entry point for authenticated users.

### Terminal Screens

- No terminal screens in this sample; all flows return to SCREEN-board.

### Conditional Routing

- SCREEN-settings is accessible only to ROLE-admin. Authenticated users who are not admin see no settings button; if accessed via direct URL, they are shown STATE-permission-denied.

---

## 5. Core User Flows

### FLOW-viewBoard

**Goal**: View the Kanban board with all columns and cards.

**Prerequisites**: User is authenticated.

**Steps**:
1. User lands on SCREEN-board
2. System loads board data (STATE-loading)
3. If board has cards: SCREEN-board in STATE-success, cards displayed
4. If board has no cards: SCREEN-board in STATE-empty-board

**Success**: Board displayed with all visible cards.

**Failure**: Load error → STATE-error with retry option.

---

### FLOW-createCard

**Goal**: Create a new card in a selected column.

**Prerequisites**: User is authenticated and viewing SCREEN-board.

**Steps**:
1. User clicks the "+" button on any column header on SCREEN-board
2. System transitions to SCREEN-createCard with the target column pre-selected
3. User enters card title (required), description, assignee, due date, and tags
4. User clicks "Create"
5. System validates input
6. If invalid: STATE-field-error shown on form
7. If valid: card created (STATE-success), system transitions back to SCREEN-board
8. New card appears in the selected column

**Success**: Card created, visible in correct column, user returned to board.

**Failure**: Validation error (STATE-field-error), network error (STATE-error with retry option).

---

### FLOW-moveCard

**Goal**: Move a card from one column to another via drag-and-drop.

**Prerequisites**: User is authenticated and viewing SCREEN-board in STATE-success.

**Steps**:
1. User initiates drag on a card
2. Card becomes semi-transparent; ghost card follows cursor
3. Valid drop zones highlight with border indication
4. User drops card on target column
5. System updates card position optimistically (STATE-success immediately)
6. Background sync confirms server update
7. If server update fails: card returns to original position, STATE-error shown with retry

**Success**: Card appears in new column, position confirmed by server.

**Failure**: Server rejection → card reverts to original column, user notified.

---

### FLOW-editCard

**Goal**: Edit an existing card's fields.

**Prerequisites**: User is authenticated and viewing SCREEN-cardDetail.

**Steps**:
1. User clicks "Edit" on SCREEN-cardDetail
2. Relevant fields become editable
3. User modifies fields (title, description, assignee, due date, tags)
4. User clicks "Save"
5. System validates input
6. If invalid: STATE-field-error shown
7. If valid: card updated, returns to SCREEN-board in STATE-success

**Success**: Card updated with new values.

**Failure**: Validation error, network error.

---

### FLOW-filterCards

**Goal**: Narrow the board view to cards matching specific criteria.

**Prerequisites**: User is authenticated and viewing SCREEN-board.

**Steps**:
1. User clicks the filter toggle → SCREEN-filter opens
2. User selects assignee(s), tag(s), date range, and/or text query
3. User clicks "Apply"
4. System filters cards (STATE-loading briefly)
5. SCREEN-board updates to show only matching cards
6. If no cards match: SCREEN-board in STATE-empty-column (filtered empty)

**Success**: Board view shows only cards matching the filter criteria.

**Failure**: Network error during filter fetch → STATE-error.

---

### FLOW-manageSettings

**Goal**: Update board settings including columns, WIP limits, and members.

**Prerequisites**: User is ROLE-admin.

**Steps**:
1. User clicks settings on SCREEN-board
2. System checks user role → if not admin, STATE-permission-denied shown
3. SCREEN-settings loads (STATE-loading)
4. User adds, renames, or removes columns; adjusts WIP limits; manages members
5. User clicks "Save"
6. System validates and persists changes (STATE-loading)
7. Returns to SCREEN-board in STATE-success

**Success**: Settings persisted, board reflects changes.

**Failure**: Validation error, network error.

---

## 6. Interaction Patterns

### PATTERN-dragDrop

**Trigger**: User initiates drag on a card element.

**Visual Feedback**:
- Card becomes semi-transparent (approximately 50% opacity)
- Ghost card follows cursor or pointer
- Valid drop zones (columns) highlight with a visible border or background change
- Invalid drop zones (e.g., column at WIP limit) show a rejection indicator

**Result**:
- Card moves to new column
- Position updates optimistically (STATE-success immediately)
- Background sync confirms server update

**Error Handling**:
- If server update fails: card returns to original position, STATE-error shown with retry option
- If target column is at WIP limit: drop is rejected with a visual indication

**Accessibility**:
- Keyboard alternative: Select card with Enter or Space, navigate columns with arrow keys, confirm move with Enter, cancel with Escape

---

### PATTERN-cardCreate

**Trigger**: User clicks the add-card button in a column header.

**Visual Feedback**:
- Form appears in a modal or panel overlay
- First field (title) receives focus automatically
- Validation messages appear inline below each field on blur or submit attempt

**Result**:
- Valid submission: card created in the selected column, overlay closes, SCREEN-board updates
- Invalid submission: form remains open, STATE-field-error shown on invalid fields

**Error Handling**:
- Network error on submit: STATE-error shown in form with retry option
- Required field missing: STATE-field-error on that field with descriptive message

**Accessibility**:
- Tab navigation through all fields; Enter to submit when focus is on submit button; Escape to cancel

---

### PATTERN-filtering

**Trigger**: User opens SCREEN-filter and selects filter criteria.

**Visual Feedback**:
- Active filter chips appear on the filter panel showing selected criteria
- Badge count updates on the filter toggle button indicating number of active filters
- Board view updates immediately on "Apply" or when "live filter" is enabled

**Result**:
- Cards not matching the filter are hidden from view
- Columns with no matching cards display STATE-empty-column
- If all cards are filtered out: STATE-empty-board (filtered empty)

**Error Handling**:
- Network error during filter application: STATE-error, previous filter state preserved

**Accessibility**:
- Full keyboard navigation for all filter controls; clear-focus on each filter control

---

### PATTERN-keyboardNav

**Trigger**: User uses keyboard to navigate the board.

**Keyboard Shortcuts**:
- Arrow keys: Move focus between cards, columns, and buttons
- Enter or Space: Activate focused element (open card, click button)
- Escape: Close open overlay, panel, or modal; cancel current action
- Tab: Move focus forward through interactive elements
- Shift+Tab: Move focus backward through interactive elements
- Ctrl/Cmd + N: Open new card form (SCREEN-createCard)
- Ctrl/Cmd + F: Open filter panel (SCREEN-filter)

**Visual Feedback**:
- Focus is indicated with a visible outline on the focused element

**Accessibility**:
- All interactive elements are reachable and operable via keyboard alone
- Screen reader announcements for state changes and content updates

---

### PATTERN-realTimeUpdates

**Trigger**: Another user or the system makes a change that affects the board.

**Visual Feedback**:
- New cards appear with a subtle highlight animation
- Moved cards animate into their new positions
- Deleted cards fade out
- If a card is updated by another user, its fields refresh in place
- A transient toast or indicator may show "Board updated by [username]"

**Result**:
- Board state remains consistent with server
- User's current interaction (e.g., drag) is not interrupted unless there is a conflict

**Conflict Handling**:
- If a card being dragged is deleted by another user: drag is cancelled, card disappears, STATE-error shown
- If a card's column is deleted while it is displayed: card is placed in the nearest remaining column with notification

**Offline Handling**:
- When connection is lost: STATE-offline shown, board enters read-only cached mode
- When connection restores: board re-fetches and reconciles with server state

---

## 7. State Model

### STATE-empty-board

- **Type**: empty
- **Description**: Board exists but has no cards in any column — first-use or fully cleared state.
- **User Message**: "This board is empty. Create your first card to get started."
- **Indicators**: Empty state illustration or icon, prominent "Create first card" CTA button
- **Allowed Actions**: Create card, open filter panel, open settings (admin)
- **Recovery Action**: Create first card

---

### STATE-empty-column

- **Type**: empty
- **Description**: A specific column has no cards — either naturally empty or all cards were filtered out.
- **User Message**: "No cards in this column." (or "No cards match your filters." if filtered)
- **Indicators**: Column appears with empty background, "Add card" button visible
- **Allowed Actions**: Create card in this column, remove filters
- **Recovery Action**: Create card or clear filters

---

### STATE-loading

- **Type**: loading
- **Description**: Data is being fetched from the server — initial load, card move, filter application, or save operation.
- **User Message**: "Loading..." or operation-specific message (e.g., "Moving card...")
- **Indicators**: Spinner, skeleton screen, or progress indicator; interactive elements disabled
- **Allowed Actions**: Cancel (if operation is abortable), refresh page
- **Blocked Actions**: Submitting forms, initiating drag (while initial load in progress)

---

### STATE-error

- **Type**: error
- **Description**: An unexpected error occurred during an operation (network failure, server error, validation failure).
- **User Message**: "Something went wrong. Please try again." (operation-specific variant: "Failed to move card. Please try again.")
- **Indicators**: Error banner or toast, red accent, clear error description
- **Allowed Actions**: Retry, go back, contact support
- **Recovery Action**: Retry the failed operation

---

### STATE-success

- **Type**: success
- **Description**: An operation completed successfully (card created, card moved, settings saved).
- **User Message**: "[Operation] completed." (e.g., "Card created", "Card moved")
- **Indicators**: Success toast or confirmation message, green or neutral accent, auto-dismiss after short delay
- **Allowed Actions**: Continue, undo (if applicable)
- **Recovery Action**: None required

---

### STATE-offline

- **Type**: offline
- **Description**: Network connection is unavailable. Cached board data is displayed in read-only mode.
- **User Message**: "You're offline. Some features may be unavailable."
- **Indicators**: Offline indicator badge or banner, muted UI, cached data displayed, drag-and-drop disabled
- **Allowed Actions**: View cached board data, open card details (read-only), retry when online
- **Blocked Actions**: Create card, edit card, move card, save settings
- **Recovery Action**: Restore network connection and wait for automatic reconnection

---

### STATE-field-error

- **Type**: error
- **Description**: Form submission failed due to validation errors on specific fields.
- **User Message**: "Please correct the errors below."
- **Indicators**: Inline error message below each invalid field, red accent on invalid fields
- **Allowed Actions**: Correct field values, resubmit form, cancel form
- **Recovery Action**: Fix invalid fields and resubmit

---

### STATE-permission-denied

- **Type**: permission-denied
- **Description**: User does not have permission to access a feature or perform an action.
- **User Message**: "You don't have access to this. Contact your administrator."
- **Indicators**: Locked icon, permission denial message, no interactive elements for restricted feature
- **Allowed Actions**: Go back to previous screen
- **Recovery Action**: Request access from board administrator

---

## 8. Data Contract

### ENTITY-card

```
Fields:
- id: string, readOnly, label "ID"
  - A unique identifier assigned by the system at creation time.
- title: string, required, maxLength 200, label "Title"
  - The card's display name, shown in the card element and detail view.
- description: string, maxLength 5000, label "Description"
  - Extended text content explaining the task or context.
- assignee: ENTITY-user (reference), label "Assigned to"
  - The user responsible for the card. May be empty (unassigned).
- dueDate: date (nullable), label "Due date"
  - Optional deadline. Format: ISO 8601 date (YYYY-MM-DD).
- tags: array of strings, label "Tags"
  - Zero or more categorical labels for cross-column filtering.
- column: ENTITY-column (reference), label "Column"
  - The column (stage) this card currently belongs to.
- position: number, label "Position"
  - Zero-based ordinal indicating card order within the column.
- createdAt: date, readOnly, label "Created"
  - Timestamp of card creation.
- updatedAt: date, readOnly, label "Updated"
  - Timestamp of last modification.
```

**Screen Usage**: SCREEN-board, SCREEN-cardDetail, SCREEN-createCard

**Operations**: Create, Read, Update, Delete

---

### ENTITY-column

```
Fields:
- id: string, readOnly, label "ID"
  - A unique identifier assigned by the system at creation time.
- name: string, required, maxLength 50, label "Name"
  - The column's display name (e.g., "To Do", "In Progress", "Done").
- cardCount: number, readOnly, label "Card count"
  - The current number of cards in this column (computed by system).
- wipLimit: number (nullable), label "WIP limit"
  - Optional maximum number of cards allowed in this column. Null means no limit.
- position: number, label "Position"
  - Zero-based ordinal indicating column order from left to right.
```

**Screen Usage**: SCREEN-board, SCREEN-settings

**Operations**: Create, Read, Update, Delete

---

### ENTITY-board

```
Fields:
- id: string, readOnly, label "ID"
  - A unique identifier for the board.
- name: string, required, maxLength 100, label "Board name"
  - The board's display name shown in the board header.
- columns: array of ENTITY-column, readOnly, label "Columns"
  - All columns belonging to this board (ordered by position).
- members: array of ENTITY-user, readOnly, label "Members"
  - All users who have access to this board.
- createdAt: date, readOnly, label "Created"
- updatedAt: date, readOnly, label "Updated"
```

**Screen Usage**: SCREEN-board, SCREEN-settings

**Operations**: Read, Update

---

### ENTITY-user

```
Fields:
- id: string, readOnly, label "ID"
  - A unique identifier for the user.
- name: string, required, label "Name"
  - The user's display name.
- email: string, required, label "Email"
  - The user's email address (used for identification and assignment).
- avatar: string (URL, nullable), label "Avatar"
  - Optional URL to the user's avatar image.
```

**Screen Usage**: SCREEN-board, SCREEN-cardDetail, SCREEN-createCard, SCREEN-settings

**Operations**: Read

---

### Pagination, Filtering, and Sorting

**Pagination**: Card lists within columns are not paginated in the standard view — all cards in a column are loaded and displayed. If a column exceeds a display threshold (defined by the implementation), it may display a "Show more" affordance to load remaining cards.

**Filtering**: Filters are applied client-side when the full board is loaded, or server-side when the board dataset is large. Filter criteria include: assignee (multi-select), tags (multi-select), due date range (from/to), and full-text search on title and description. Multiple filters are combined with AND logic. Filters can be saved as a named filter preset (out of scope for this sample).

**Sorting**: Within a column, cards are sorted by their `position` field. Users can reorder cards by dragging. The board itself is sorted by column `position` from left to right.

---

## 9. Appendix: Machine-Readable Contract

```json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-board",
      "purpose": "Display the Kanban board with all columns and cards as the primary workspace.",
      "primaryActions": [
        "Open a card by clicking on it",
        "Drag a card to a different column",
        "Create a new card via the column header button",
        "Open the filter panel",
        "Open board settings"
      ],
      "entryConditions": [
        "User is authenticated (ROLE-authenticated or ROLE-admin)",
        "Board data has been successfully loaded from the server"
      ],
      "exitConditions": [
        "User clicks a card → transitions to SCREEN-cardDetail",
        "User clicks the add-card button → transitions to SCREEN-createCard",
        "User clicks the filter toggle → transitions to SCREEN-filter",
        "User clicks settings → transitions to SCREEN-settings"
      ],
      "states": [
        "STATE-empty-board",
        "STATE-empty-column",
        "STATE-loading",
        "STATE-success",
        "STATE-error",
        "STATE-offline"
      ],
      "roleAccess": ["ROLE-authenticated", "ROLE-admin"]
    },
    {
      "id": "SCREEN-cardDetail",
      "purpose": "Show full card details in a panel or overlay, allowing the user to read, edit, comment, and manage the card lifecycle.",
      "primaryActions": [
        "Edit card fields (title, description, assignee, due date, tags)",
        "Delete the card",
        "Move the card to a different column",
        "Close the detail panel and return to the board"
      ],
      "entryConditions": [
        "User clicked a card on SCREEN-board",
        "Card data has been loaded"
      ],
      "exitConditions": [
        "User clicks close or presses Escape → returns to SCREEN-board",
        "User clicks Save after editing → returns to SCREEN-board with updated data",
        "User clicks Delete → card is removed, returns to SCREEN-board"
      ],
      "states": ["STATE-loading", "STATE-success", "STATE-error"],
      "roleAccess": ["ROLE-authenticated", "ROLE-admin"]
    },
    {
      "id": "SCREEN-createCard",
      "purpose": "Display a form for creating a new card in a selected column.",
      "primaryActions": [
        "Enter card title (required)",
        "Enter card description (optional)",
        "Select an assignee (optional)",
        "Set a due date (optional)",
        "Add tags (optional)",
        "Submit the form to create the card",
        "Cancel and return to the board"
      ],
      "entryConditions": [
        "User clicked the add-card button on SCREEN-board",
        "Target column was selected"
      ],
      "exitConditions": [
        "User submits valid form → card created, returns to SCREEN-board in STATE-success",
        "User clicks cancel or presses Escape → returns to SCREEN-board without creating",
        "Validation failure → form remains in STATE-field-error"
      ],
      "states": ["STATE-loading", "STATE-field-error", "STATE-success", "STATE-error"],
      "roleAccess": ["ROLE-authenticated", "ROLE-admin"]
    },
    {
      "id": "SCREEN-filter",
      "purpose": "Display a panel for filtering cards by assignee, tags, due date range, and text search.",
      "primaryActions": [
        "Select one or more assignees to filter by",
        "Select one or more tags to filter by",
        "Set a due date range (from/to)",
        "Enter a text search query",
        "Apply filters (immediately updates the board view)",
        "Clear all filters",
        "Close the filter panel"
      ],
      "entryConditions": [
        "User clicked the filter toggle on SCREEN-board"
      ],
      "exitConditions": [
        "User clicks Apply or Clear → filter applied or removed, returns to SCREEN-board",
        "User clicks close or presses Escape → returns to SCREEN-board without changing filters"
      ],
      "states": ["STATE-loading", "STATE-success"],
      "roleAccess": ["ROLE-authenticated", "ROLE-admin"]
    },
    {
      "id": "SCREEN-settings",
      "purpose": "Display board settings for administrative users, including column management, WIP limits, and membership.",
      "primaryActions": [
        "Add a new column",
        "Rename an existing column",
        "Delete an empty column",
        "Set or update WIP limits per column",
        "Add or remove board members",
        "Change board name",
        "Save changes"
      ],
      "entryConditions": [
        "User is ROLE-admin",
        "User clicked the settings button on SCREEN-board"
      ],
      "exitConditions": [
        "User clicks Save → settings saved, returns to SCREEN-board in STATE-success",
        "User clicks cancel or presses Escape → returns to SCREEN-board without saving"
      ],
      "states": ["STATE-loading", "STATE-success", "STATE-error", "STATE-permission-denied"],
      "roleAccess": ["ROLE-admin"]
    }
  ],
  "states": [
    {
      "id": "STATE-empty-board",
      "type": "empty",
      "description": "Board exists but has no cards in any column — first-use or fully cleared state.",
      "userMessage": "This board is empty. Create your first card to get started.",
      "indicators": ["Empty state illustration or icon", "Prominent Create first card CTA button"],
      "allowedActions": ["Create card", "Open filter panel", "Open settings (admin)"],
      "recoveryAction": "Create first card"
    },
    {
      "id": "STATE-empty-column",
      "type": "empty",
      "description": "A specific column has no cards — either naturally empty or all cards were filtered out.",
      "userMessage": "No cards in this column. (or No cards match your filters. if filtered)",
      "indicators": ["Column appears with empty background", "Add card button visible"],
      "allowedActions": ["Create card in this column", "Remove filters"],
      "recoveryAction": "Create card or clear filters"
    },
    {
      "id": "STATE-loading",
      "type": "loading",
      "description": "Data is being fetched from the server — initial load, card move, filter application, or save operation.",
      "userMessage": "Loading... or operation-specific message (e.g., Moving card...)",
      "indicators": ["Spinner or skeleton screen", "Interactive elements disabled"],
      "allowedActions": ["Cancel (if operation is abortable)", "Refresh page"],
      "blockedActions": ["Submitting forms", "Initiating drag (while initial load in progress)"]
    },
    {
      "id": "STATE-error",
      "type": "error",
      "description": "An unexpected error occurred during an operation (network failure, server error, validation failure).",
      "userMessage": "Something went wrong. Please try again.",
      "indicators": ["Error banner or toast", "Red accent", "Clear error description"],
      "allowedActions": ["Retry", "Go back", "Contact support"],
      "recoveryAction": "Retry the failed operation"
    },
    {
      "id": "STATE-success",
      "type": "success",
      "description": "An operation completed successfully (card created, card moved, settings saved).",
      "userMessage": "[Operation] completed. (e.g., Card created, Card moved)",
      "indicators": ["Success toast or confirmation message", "Green or neutral accent", "Auto-dismiss after short delay"],
      "allowedActions": ["Continue", "Undo (if applicable)"]
    },
    {
      "id": "STATE-offline",
      "type": "offline",
      "description": "Network connection is unavailable. Cached board data is displayed in read-only mode.",
      "userMessage": "You're offline. Some features may be unavailable.",
      "indicators": ["Offline indicator badge or banner", "Muted UI", "Cached data displayed", "Drag-and-drop disabled"],
      "allowedActions": ["View cached board data", "Open card details (read-only)", "Retry when online"],
      "blockedActions": ["Create card", "Edit card", "Move card", "Save settings"],
      "recoveryAction": "Restore network connection and wait for automatic reconnection"
    },
    {
      "id": "STATE-field-error",
      "type": "error",
      "description": "Form submission failed due to validation errors on specific fields.",
      "userMessage": "Please correct the errors below.",
      "indicators": ["Inline error message below each invalid field", "Red accent on invalid fields"],
      "allowedActions": ["Correct field values", "Resubmit form", "Cancel form"],
      "recoveryAction": "Fix invalid fields and resubmit"
    },
    {
      "id": "STATE-permission-denied",
      "type": "permission-denied",
      "description": "User does not have permission to access a feature or perform an action.",
      "userMessage": "You don't have access to this. Contact your administrator.",
      "indicators": ["Locked icon", "Permission denial message", "No interactive elements for restricted feature"],
      "allowedActions": ["Go back to previous screen"],
      "recoveryAction": "Request access from board administrator"
    }
  ],
  "navigation": [
    { "from": "SCREEN-board", "to": "SCREEN-cardDetail", "trigger": "Click card", "condition": "Card selected", "backStack": "Push" },
    { "from": "SCREEN-board", "to": "SCREEN-createCard", "trigger": "Click add-card button", "condition": "Column selected", "backStack": "Modal" },
    { "from": "SCREEN-board", "to": "SCREEN-filter", "trigger": "Click filter toggle", "backStack": "Push" },
    { "from": "SCREEN-board", "to": "SCREEN-settings", "trigger": "Click settings button", "condition": "ROLE-admin", "backStack": "Push" },
    { "from": "SCREEN-cardDetail", "to": "SCREEN-board", "trigger": "Click close / Escape", "backStack": "Pop" },
    { "from": "SCREEN-cardDetail", "to": "SCREEN-board", "trigger": "Save card", "condition": "Card saved", "backStack": "Pop" },
    { "from": "SCREEN-cardDetail", "to": "SCREEN-board", "trigger": "Delete card", "condition": "Card deleted", "backStack": "Pop" },
    { "from": "SCREEN-createCard", "to": "SCREEN-board", "trigger": "Submit valid form", "condition": "Card created", "backStack": "Pop" },
    { "from": "SCREEN-createCard", "to": "SCREEN-board", "trigger": "Click cancel / Escape", "backStack": "Pop" },
    { "from": "SCREEN-filter", "to": "SCREEN-board", "trigger": "Click Apply or Clear", "backStack": "Pop" },
    { "from": "SCREEN-filter", "to": "SCREEN-board", "trigger": "Click close / Escape", "backStack": "Pop" },
    { "from": "SCREEN-settings", "to": "SCREEN-board", "trigger": "Click save", "condition": "Settings saved", "backStack": "Pop" },
    { "from": "SCREEN-settings", "to": "SCREEN-board", "trigger": "Click cancel / Escape", "backStack": "Pop" }
  ],
  "roles": [
    {
      "roleId": "ROLE-authenticated",
      "name": "Authenticated User",
      "description": "A logged-in user who can view, create, and manage cards on boards they have access to.",
      "capabilities": ["View board", "Create card", "Edit card", "Move card (drag-drop)", "Delete card", "Apply filters", "Open settings"],
      "visibleScreens": ["SCREEN-board", "SCREEN-cardDetail", "SCREEN-createCard", "SCREEN-filter", "SCREEN-settings"]
    },
    {
      "roleId": "ROLE-admin",
      "name": "Board Administrator",
      "description": "A privileged user who can manage board settings, column configuration, and membership.",
      "capabilities": ["All ROLE-authenticated capabilities", "Configure columns", "Manage board members", "Set WIP limits", "Delete board"],
      "visibleScreens": ["SCREEN-board", "SCREEN-cardDetail", "SCREEN-createCard", "SCREEN-filter", "SCREEN-settings"]
    }
  ],
  "dataContracts": {
    "card": {
      "entityId": "ENTITY-card",
      "name": "Card",
      "fields": [
        { "name": "id", "label": "ID", "type": "string", "required": false, "readOnly": true },
        { "name": "title", "label": "Title", "type": "string", "constraints": { "maxLength": 200 }, "required": true, "readOnly": false },
        { "name": "description", "label": "Description", "type": "string", "constraints": { "maxLength": 5000 }, "required": false, "readOnly": false },
        { "name": "assignee", "label": "Assigned to", "type": "ENTITY-user", "required": false, "readOnly": false },
        { "name": "dueDate", "label": "Due date", "type": "date", "required": false, "readOnly": false, "format": "YYYY-MM-DD" },
        { "name": "tags", "label": "Tags", "type": "array", "items": { "type": "string" }, "required": false, "readOnly": false },
        { "name": "column", "label": "Column", "type": "ENTITY-column", "required": true, "readOnly": false },
        { "name": "position", "label": "Position", "type": "number", "required": true, "readOnly": false },
        { "name": "createdAt", "label": "Created", "type": "date", "required": false, "readOnly": true },
        { "name": "updatedAt", "label": "Updated", "type": "date", "required": false, "readOnly": true }
      ],
      "screenUsage": ["SCREEN-board", "SCREEN-cardDetail", "SCREEN-createCard"],
      "operations": ["Create", "Read", "Update", "Delete"]
    },
    "column": {
      "entityId": "ENTITY-column",
      "name": "Column",
      "fields": [
        { "name": "id", "label": "ID", "type": "string", "required": false, "readOnly": true },
        { "name": "name", "label": "Name", "type": "string", "constraints": { "maxLength": 50 }, "required": true, "readOnly": false },
        { "name": "cardCount", "label": "Card count", "type": "number", "required": false, "readOnly": true },
        { "name": "wipLimit", "label": "WIP limit", "type": "number", "required": false, "readOnly": false },
        { "name": "position", "label": "Position", "type": "number", "required": true, "readOnly": false }
      ],
      "screenUsage": ["SCREEN-board", "SCREEN-settings"],
      "operations": ["Create", "Read", "Update", "Delete"]
    },
    "board": {
      "entityId": "ENTITY-board",
      "name": "Board",
      "fields": [
        { "name": "id", "label": "ID", "type": "string", "required": false, "readOnly": true },
        { "name": "name", "label": "Board name", "type": "string", "constraints": { "maxLength": 100 }, "required": true, "readOnly": false },
        { "name": "columns", "label": "Columns", "type": "array", "items": { "type": "ENTITY-column" }, "required": false, "readOnly": true },
        { "name": "members", "label": "Members", "type": "array", "items": { "type": "ENTITY-user" }, "required": false, "readOnly": true },
        { "name": "createdAt", "label": "Created", "type": "date", "required": false, "readOnly": true },
        { "name": "updatedAt", "label": "Updated", "type": "date", "required": false, "readOnly": true }
      ],
      "screenUsage": ["SCREEN-board", "SCREEN-settings"],
      "operations": ["Read", "Update"]
    },
    "user": {
      "entityId": "ENTITY-user",
      "name": "User",
      "fields": [
        { "name": "id", "label": "ID", "type": "string", "required": false, "readOnly": true },
        { "name": "name", "label": "Name", "type": "string", "required": true, "readOnly": false },
        { "name": "email", "label": "Email", "type": "string", "required": true, "readOnly": false },
        { "name": "avatar", "label": "Avatar", "type": "string", "required": false, "readOnly": false, "format": "URL" }
      ],
      "screenUsage": ["SCREEN-board", "SCREEN-cardDetail", "SCREEN-createCard", "SCREEN-settings"],
      "operations": ["Read"]
    }
  }
}
```
