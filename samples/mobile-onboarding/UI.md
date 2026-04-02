# Mobile App Onboarding — UI.md Sample

**Sample Version:** 1.0  
**Standard Version:** 1.0  
**Purpose:** Demonstrate a complete UI.md specification for a mobile app onboarding flow with stepped progression, permission requests, profile creation, and preference configuration.

---

## 1. Product Mental Model

Mobile onboarding is the first extended interaction a user has with the app after installation. It is a linear-but-breakable stepped flow: users progress through a defined sequence of screens (Welcome → Account Type → Profile → Permissions → Preferences → Done), but the flow must handle interruption gracefully — either by resuming where the user left off, or by confirming exit from step 1 if data has been entered.

The core principle is **progressive commitment**: the user is not asked to commit fully to the app until they have completed all setup steps. Permission requests happen mid-flow (not at launch), so users understand the context for each permission before deciding.

Onboarding completes in a single session, but progress is persisted so users who abandon mid-flow can resume without re-entering data.

---

## 2. Users and Roles

### ROLE-newUser

- **Description**: A first-time user who has installed the app and is working through the onboarding flow.
- **Capabilities**: Complete any onboarding step, skip optional steps, go back to previous steps, exit with confirmation on step 1, complete onboarding to become ROLE-authenticated.
- **Visible Screens**: SCREEN-welcome, SCREEN-accountType, SCREEN-profile, SCREEN-permissions, SCREEN-preferences, SCREEN-onboardingDone

### ROLE-authenticated

- **Description**: A user who has completed onboarding and reached the main app.
- **Capabilities**: Access main app content; not visible during onboarding.
- **Visible Screens**: (none during onboarding)

---

## 3. Screen Inventory

### SCREEN-welcome

**Purpose**: Present the app's value proposition and invite the user to begin setup.

**Primary Actions**:
- Tap "Get Started" to advance to account type selection
- Tap "Sign in" to go to existing-account sign-in flow (exits onboarding)

**Entry Conditions**:
- App freshly installed and launched, OR app launched with no persisted onboarding progress

**Exit Conditions**:
- User taps "Get Started" → advance to SCREEN-accountType
- User taps "Sign in" → exit onboarding to sign-in flow
- Back gesture → exit confirmation if in final session, otherwise no-op (first screen)

**States**: STATE-loading (loading brand asset), STATE-offline (network unavailable notice)

---

### SCREEN-accountType

**Purpose**: Let the user identify whether they are setting up a personal or business account. This choice shapes later defaults (e.g., notification preferences, data sharing).

**Primary Actions**:
- Select "Personal" or "Business" account type
- Tap "Next" to advance
- Tap "Back" to return to Welcome
- Tap "Skip" to advance without selecting (optional step)

**Entry Conditions**:
- User arrived from SCREEN-welcome via "Get Started"
- User returned from SCREEN-profile via Back

**Exit Conditions**:
- User selects an account type and taps "Next" → advance to SCREEN-profile
- User taps "Skip" → advance to SCREEN-profile with no account type selected
- User taps "Back" → return to SCREEN-welcome
- Back gesture on this screen → show exit confirmation if any field has been filled; otherwise return to SCREEN-welcome

**States**: STATE-field-selected (account type chosen), STATE-field-error (selection invalid)

---

### SCREEN-profile

**Purpose**: Collect the user's identity information — name, email, and optional avatar — required to personalize the app experience.

**Primary Actions**:
- Enter full name (required)
- Enter email address (required, validated format)
- Select or capture avatar image (optional)
- Tap "Next" to advance
- Tap "Back" to return to SCREEN-accountType

**Entry Conditions**:
- User arrived from SCREEN-accountType via Next or Skip
- User returned from SCREEN-permissions via Back

**Exit Conditions**:
- All required fields valid and "Next" tapped → advance to SCREEN-permissions
- "Back" tapped → return to SCREEN-accountType without losing entered data

**States**: STATE-field-error (name too short, email format invalid), STATE-form-error (multiple required fields empty), STATE-progress-persisted (data saved to local storage mid-field)

---

### SCREEN-permissions

**Purpose**: Request runtime permissions required for core app functionality. Permissions are requested in a logical sequence — camera first, then location, then notifications — so each request has context.

**Primary Actions**:
- Respond to camera permission prompt (grant / deny / permanently deny)
- Respond to location permission prompt (grant / deny / permanently deny)
- Respond to notification permission prompt (grant / deny / permanently deny)
- Tap "Next" to advance (available once all required permissions resolved or skipped by policy)
- Tap "Back" to return to SCREEN-profile
- Tap "Skip All" to advance without granting any permissions (optional, unless blocked by policy)

**Entry Conditions**:
- User arrived from SCREEN-profile via Next

**Exit Conditions**:
- All required permissions resolved (granted, denied, or permanently denied) and "Next" tapped → advance to SCREEN-preferences
- "Skip All" tapped → advance to SCREEN-preferences with no permissions granted
- "Back" tapped → return to SCREEN-profile without losing permission resolution state

**States**: STATE-permission-granted (permission given), STATE-permission-denied (temporary denial, can ask again later), STATE-permission-permanently-denied (user must manually enable in OS settings), STATE-progress-persisted (permission state saved)

---

### SCREEN-preferences

**Purpose**: Allow the user to configure app-level defaults: notification frequency, preferred language, and visual theme.

**Primary Actions**:
- Toggle notification preferences (all / critical only / none)
- Select language (list of supported languages)
- Select theme (light / dark / system)
- Tap "Next" to advance
- Tap "Back" to return to SCREEN-permissions

**Entry Conditions**:
- User arrived from SCREEN-permissions via Next or Skip All

**Exit Conditions**:
- Preferences saved and "Next" tapped → advance to SCREEN-onboardingDone
- "Back" tapped → return to SCREEN-permissions

**States**: STATE-field-error (invalid preference selection), STATE-progress-persisted

---

### SCREEN-onboardingDone

**Purpose**: Confirm successful completion of onboarding and signal that the main app experience is ready.

**Primary Actions**:
- Tap "Enter App" to exit onboarding and reach main app
- View summary of account type, profile, permissions status, and preferences

**Entry Conditions**:
- User arrived from SCREEN-preferences via Next

**Exit Conditions**:
- "Enter App" tapped → exit onboarding, user becomes ROLE-authenticated, main app loads

**States**: STATE-success (onboarding complete)

---

## 4. Navigation Model

### Navigation Graph

```
SCREEN-welcome
  ├── [Get Started] → SCREEN-accountType
  └── [Sign in] → (exit to sign-in flow)

SCREEN-accountType
  ├── [Next] → SCREEN-profile        (if account type selected)
  ├── [Skip] → SCREEN-profile        (account type = none)
  └── [Back] → SCREEN-welcome

SCREEN-profile
  ├── [Next] → SCREEN-permissions    (if required fields valid)
  └── [Back] → SCREEN-accountType

SCREEN-permissions
  ├── [Next] → SCREEN-preferences    (if required permissions resolved)
  ├── [Skip All] → SCREEN-preferences (permissions skipped)
  └── [Back] → SCREEN-profile

SCREEN-preferences
  ├── [Next] → SCREEN-onboardingDone
  └── [Back] → SCREEN-permissions

SCREEN-onboardingDone
  └── [Enter App] → (exit onboarding, main app)
```

### Navigation Rules

| Rule | Description |
|------|-------------|
| Forward via Next only | Progression to a later step requires tapping "Next" (or "Get Started" on Welcome). There is no swipe-forward gesture. |
| Back preserves data | Tapping "Back" returns to the previous screen; all entered data, selections, and permission resolutions are retained. |
| Skip is optional unless required | Account type (Step 1) and permissions (Step 3) can be skipped. Preferences (Step 4) must be set before advancing. |
| Exit confirmation on Step 1 | If the user performs a back gesture or system-gesture back on SCREEN-accountType and any data has been entered (account type selected), a confirmation sheet appears: "Exit setup? Your progress will be saved and you can resume later." Confirm exits to app background; Cancel returns to SCREEN-accountType. |
| Progress persistence | On any screen, if the user backgrounds the app or the process is killed, the current step and all entered data are persisted locally. On next launch, onboarding resumes at the last incomplete step. |
| Offline handling | If the device is offline, the user can still complete profile entry and preferences. Permission requests and final sync happen when connectivity returns. |

### Back-Stack Behavior

Onboarding maintains a linear back stack. There is no cross-screen back navigation except via the explicit Back button or gesture on each screen. The back stack depth equals the step index.

---

## 5. Core User Flows

### Flow: First-Time Complete Onboarding

1. User launches app → SCREEN-welcome displayed
2. User taps "Get Started" → SCREEN-accountType displayed
3. User selects "Personal" account type, taps "Next" → SCREEN-profile displayed
4. User enters name and email (validated), taps "Next" → SCREEN-permissions displayed
5. User grants camera permission, denies location, taps "Next" → SCREEN-preferences displayed
6. User selects language and theme, taps "Next" → SCREEN-onboardingDone displayed
7. User taps "Enter App" → main app loads, onboarding complete

### Flow: Onboarding Abandoned and Resumed

1. User reaches SCREEN-profile, enters name "Kari Nordmann", then backgrounds the app
2. On next launch, onboarding resumes at SCREEN-profile with name field pre-filled
3. User taps "Back" → SCREEN-accountType displayed with previous selection retained

### Flow: Permission Permanently Denied

1. User reaches SCREEN-permissions, denies location permission twice
2. OS marks location as permanently denied → STATE-permission-permanently-denied displayed inline
3. User taps "Next" → location permission skipped, onboarding advances
4. A banner on SCREEN-preferences notes "Location access can be enabled later in Settings"

### Flow: Sign-In Alternative

1. User on SCREEN-welcome taps "Sign in" instead of "Get Started"
2. Onboarding flow exits; sign-in screen is displayed
3. After successful sign-in, the user bypasses onboarding entirely and reaches the main app

---

## 6. Interaction Patterns

### Pattern: Step Progression

- Each step screen has a fixed "Next" button at the bottom of the content area
- "Next" is disabled until all required validations on the current step pass
- A progress indicator (e.g., step dots or a thin progress bar) at the top of the screen shows current position: Step 2 of 5
- There is no swipe-forward gesture; forward progress requires explicit button tap

### Pattern: Permission Request Flow

- On SCREEN-permissions, each permission is presented as its own card with an icon, name, and brief rationale ("Camera access lets you scan documents")
- Tapping a permission card triggers the OS permission dialog
- After the dialog resolves, the card updates to show the granted/denied/permanently-denied state
- If denied, the card shows "You can change this in Settings" with a link to OS settings
- If permanently denied, the card shows a settings shortcut icon and the "Next" button remains disabled until the user either grants the permission or selects "Skip This" on the card

### Pattern: Form Validation

- Field-level validation triggers on blur (when the user leaves a field): invalid email format shows "Enter a valid email address (e.g., name@example.com)" inline below the field
- Form-level validation triggers on "Next" tap if multiple required fields are empty: all empty required fields are highlighted with red borders and a single banner "Please fill in all required fields" appears above the action area
- Valid data is persisted locally after each field blur event, so the user does not lose data if the app is backgrounded

### Pattern: Exit Confirmation

- On SCREEN-accountType only, if the user initiates a back gesture or presses the system back button and the account type has been selected, a bottom sheet appears with two options: "Exit Setup" and "Continue Setup"
- "Exit Setup" backgrounds the app and persists current progress
- "Continue Setup" dismisses the sheet and returns focus to SCREEN-accountType

### Pattern: Offline Behavior

- SCREEN-profile and SCREEN-preferences are fully usable offline (local storage only)
- SCREEN-permissions cannot be fully resolved offline (OS permission APIs require device state), but the UI renders and the user can defer those decisions
- On SCREEN-welcome, if the initial load fails due to network, a banner shows "You're offline. Check your connection and try again."

---

## 7. State Model

### Loading States

**STATE-loading**
- **Description**: Initial app launch, brand asset loading, or async data fetch.
- **Indicators**: Full-screen spinner or brand logo centered with a subtle pulse animation.
- **Allowed Actions**: None — user waits.
- **Blocked Actions**: Any navigation or input is blocked until loading completes.

**STATE-loading-progress**
- **Description**: Progress indicator during onboarding step transitions.
- **Indicators**: Brief (≤300ms) fade transition between screens with a thin progress bar fill animation.
- **Allowed Actions**: None.
- **Blocked Actions**: None — user briefly waits.

### Empty States

**STATE-empty-profile**
- **Description**: Profile screen displayed before any data has been entered.
- **Indicators**: Placeholder text in empty fields ("Your full name", "name@example.com").
- **Allowed Actions**: Field entry.
- **Blocked Actions**: "Next" is disabled.

### Error States

**STATE-field-error**
- **Description**: A single field has failed validation.
- **User Message**: "Enter a valid email address (e.g., name@example.com)"
- **Indicators**: Red border on the invalid field; error message text below the field.
- **Allowed Actions**: Re-enter the field value; tap "Next" is disabled.
- **Blocked Actions**: Cannot advance until field is valid.

**STATE-form-error**
- **Description**: Multiple required fields are empty or invalid on form submission.
- **User Message**: "Please fill in all required fields"
- **Indicators**: Red borders on all invalid/empty required fields; banner above action area.
- **Allowed Actions**: Correct each invalid field.
- **Blocked Actions**: Cannot advance until all required fields are valid.

**STATE-permission-denied**
- **Description**: User denied a runtime permission on SCREEN-permissions (temporary denial — can be requested again).
- **User Message**: "Permission denied. You can try again or skip."
- **Indicators**: Card shows "Denied" status badge in amber; "Try Again" and "Skip" buttons appear on the card.
- **Allowed Actions**: Try again (re-triggers OS dialog), skip (marks as skipped), proceed to Next if other required permissions are resolved.
- **Blocked Actions**: None — denial is not blocking for progression.

**STATE-permission-permanently-denied**
- **Description**: User denied a permission and selected "Don't Ask Again" — OS will not re-prompt.
- **User Message**: "Permission permanently denied. Enable in Settings to use this feature."
- **Indicators**: Card shows "Permanently Denied" status badge in red; shortcut icon to OS Settings app.
- **Allowed Actions**: Open OS Settings; skip this permission; proceed to Next.
- **Blocked Actions**: None — permanent denial is not blocking for progression, but may limit app functionality post-onboarding.

### Success States

**STATE-permission-granted**
- **Description**: User granted a runtime permission on SCREEN-permissions.
- **Indicators**: Card shows "Allowed" status badge in green with a checkmark icon.
- **Allowed Actions**: None — permission is resolved.

**STATE-progress-persisted**
- **Description**: Data has been saved to local storage mid-entry or mid-step.
- **Indicators**: No visible indicator to the user — persistence happens silently.
- **Recovery Action**: On next app launch, if onboarding is incomplete, resume at the last step with all persisted data restored.

**STATE-success**
- **Description**: Onboarding fully completed on SCREEN-onboardingDone.
- **Indicators**: "You're all set!" heading; summary card showing account type, profile name, permissions status, and preferences; "Enter App" button prominently displayed.
- **Allowed Actions**: Tap "Enter App" to exit onboarding.

### Offline States

**STATE-offline**
- **Description**: Network connectivity is unavailable.
- **User Message**: "You're offline. Some features may be limited."
- **Indicators**: Persistent banner at top of screen (amber background) with network-off icon.
- **Allowed Actions**: All onboarding steps that do not require network (profile entry, preferences) remain fully functional.
- **Blocked Actions**: Initial brand asset load (on SCREEN-welcome first launch) requires network; permission resolution requires OS APIs (functions offline but may show stale state).
- **Recovery Action**: Banner dismisses automatically when connectivity is restored.

---

## 8. Data Contract

### Entity: User

User represents the human completing onboarding.

| Field | Label | Type | Constraints | Required | Read Only |
|-------|-------|------|-------------|----------|-----------|
| `name` | Full Name | string | Minimum 2 characters, maximum 100 characters, letters and spaces only | Yes | No |
| `email` | Email Address | string | Valid email format (RFC 5322 simplified); must contain `@` and a domain with at least one `.` after `@` | Yes | No |
| `avatar` | Profile Photo | image (URI or base64) | Maximum 5 MB; JPEG, PNG, or WebP; aspect ratio 1:1 (square crop) | No | No |

### Entity: AccountType

AccountType is a discriminated union representing the user's intended use context.

| Field | Label | Type | Constraints | Required | Read Only |
|-------|-------|------|-------------|----------|-----------|
| `type` | Account Type | enum | One of: `personal`, `business` | No | No |

### Entity: Permissions

Permissions records the user's resolution for each runtime permission requested.

| Field | Label | Type | Constraints | Required | Read Only |
|-------|-------|------|-------------|----------|-----------|
| `camera` | Camera | enum | One of: `granted`, `denied`, `permanently-denied`, `pending` | Yes | No |
| `location` | Location | enum | One of: `granted`, `denied`, `permanently-denied`, `pending` | Yes | No |
| `notifications` | Notifications | enum | One of: `granted`, `denied`, `permanently-denied`, `pending` | Yes | No |

### Entity: Preferences

Preferences holds the user's app-level configuration choices.

| Field | Label | Type | Constraints | Required | Read Only |
|-------|-------|------|-------------|----------|-----------|
| `notifications` | Notification Preference | enum | One of: `all`, `critical-only`, `none` | Yes | No |
| `language` | Language | string | Must be a supported language code (e.g., `en`, `nb`, `sv`) | Yes | No |
| `theme` | Visual Theme | enum | One of: `light`, `dark`, `system` | Yes | No |

### Validation Rules

| Rule | Field | Condition | Error Message |
|------|-------|-----------|---------------|
| Email format | `email` | Does not match email regex | "Enter a valid email address (e.g., name@example.com)" |
| Required field | `name` | Empty or whitespace only | "Full name is required" |
| Name minimum length | `name` | Fewer than 2 characters | "Name must be at least 2 characters" |
| Required field | `email` | Empty | "Email address is required" |
| Required enum | `notifications` (Preferences) | Not one of allowed values | "Select a notification preference" |
| Required enum | `language` | Not in supported list | "Select a language from the list" |
| Required enum | `theme` | Not one of allowed values | "Select a theme" |

---

## 9. Machine-Readable Appendix

```json
{
  "version": "1.0",
  "screens": [
    {
      "id": "SCREEN-welcome",
      "purpose": "Present app value proposition and invite user to begin setup",
      "primaryActions": ["tap-get-started", "tap-sign-in"],
      "entryConditions": ["app-launched-fresh", "no-persisted-progress"],
      "exitConditions": ["get-started-tapped", "sign-in-tapped"],
      "states": ["STATE-loading", "STATE-offline"],
      "roleAccess": ["ROLE-newUser"]
    },
    {
      "id": "SCREEN-accountType",
      "purpose": "Let user identify personal or business account context",
      "primaryActions": ["select-personal", "select-business", "tap-next", "tap-back", "tap-skip"],
      "entryConditions": ["arrived-from-welcome", "returned-from-profile"],
      "exitConditions": ["next-tapped-with-selection", "skip-tapped", "back-tapped"],
      "states": ["STATE-field-selected", "STATE-field-error"],
      "roleAccess": ["ROLE-newUser"]
    },
    {
      "id": "SCREEN-profile",
      "purpose": "Collect user identity: name, email, avatar",
      "primaryActions": ["enter-name", "enter-email", "select-avatar", "tap-next", "tap-back"],
      "entryConditions": ["arrived-from-accountType"],
      "exitConditions": ["next-tapped-valid", "back-tapped"],
      "states": ["STATE-field-error", "STATE-form-error", "STATE-progress-persisted"],
      "roleAccess": ["ROLE-newUser"]
    },
    {
      "id": "SCREEN-permissions",
      "purpose": "Request runtime permissions: camera, location, notifications",
      "primaryActions": ["respond-camera", "respond-location", "respond-notifications", "tap-next", "tap-back", "tap-skip-all"],
      "entryConditions": ["arrived-from-profile"],
      "exitConditions": ["next-tapped-all-resolved", "skip-all-tapped", "back-tapped"],
      "states": ["STATE-permission-granted", "STATE-permission-denied", "STATE-permission-permanently-denied", "STATE-progress-persisted"],
      "roleAccess": ["ROLE-newUser"]
    },
    {
      "id": "SCREEN-preferences",
      "purpose": "Configure notification, language, and theme preferences",
      "primaryActions": ["toggle-notifications", "select-language", "select-theme", "tap-next", "tap-back"],
      "entryConditions": ["arrived-from-permissions"],
      "exitConditions": ["next-tapped", "back-tapped"],
      "states": ["STATE-field-error", "STATE-progress-persisted"],
      "roleAccess": ["ROLE-newUser"]
    },
    {
      "id": "SCREEN-onboardingDone",
      "purpose": "Confirm onboarding completion; signal main app ready",
      "primaryActions": ["tap-enter-app"],
      "entryConditions": ["arrived-from-preferences"],
      "exitConditions": ["enter-app-tapped"],
      "states": ["STATE-success"],
      "roleAccess": ["ROLE-newUser"]
    }
  ],
  "states": [
    { "id": "STATE-loading", "type": "loading", "description": "Initial load or asset fetch", "indicators": ["spinner", "brand-logo-pulse"], "allowedActions": [], "blockedActions": ["all-navigation", "all-input"] },
    { "id": "STATE-loading-progress", "type": "loading", "description": "Progress indicator during onboarding step transitions", "indicators": ["fade-transition", "progress-bar-fill"], "allowedActions": [], "blockedActions": [] },
    { "id": "STATE-offline", "type": "offline", "description": "Network unavailable", "userMessage": "You're offline. Some features may be limited.", "indicators": ["amber-banner-top", "network-off-icon"], "allowedActions": ["all-offline-capable-steps"], "blockedActions": ["welcome-initial-load"] },
    { "id": "STATE-field-selected", "type": "idle", "description": "Account type has been selected", "indicators": ["selected-indicator"], "allowedActions": ["proceed-to-next"], "blockedActions": [] },
    { "id": "STATE-empty-profile", "type": "empty", "description": "Profile screen displayed before any data has been entered", "indicators": ["placeholder-text"], "allowedActions": ["field-entry"], "blockedActions": ["next-button"] },
    { "id": "STATE-field-error", "type": "error", "description": "Single field validation failure", "indicators": ["red-border-field", "error-text-below-field"], "allowedActions": ["re-enter-field"], "blockedActions": ["next-button"] },
    { "id": "STATE-form-error", "type": "error", "description": "Multiple required fields empty or invalid on submit", "userMessage": "Please fill in all required fields", "indicators": ["red-borders-multiple-fields", "banner-above-actions"], "allowedActions": ["correct-each-field"], "blockedActions": ["next-button"] },
    { "id": "STATE-permission-granted", "type": "success", "description": "Permission granted by user", "indicators": ["green-badge", "checkmark-icon"], "allowedActions": [], "blockedActions": [] },
    { "id": "STATE-permission-denied", "type": "error", "description": "User temporarily denied permission", "userMessage": "Permission denied. You can try again or skip.", "indicators": ["amber-denied-badge", "try-again-button", "skip-button"], "allowedActions": ["try-again", "skip"], "blockedActions": [] },
    { "id": "STATE-permission-permanently-denied", "type": "error", "description": "User permanently denied permission; OS will not re-prompt", "userMessage": "Permission permanently denied. Enable in Settings.", "indicators": ["red-permanent-badge", "settings-shortcut-icon"], "allowedActions": ["open-settings", "skip"], "blockedActions": [] },
    { "id": "STATE-progress-persisted", "type": "success", "description": "Step data saved to local storage", "indicators": [], "allowedActions": [], "blockedActions": [], "recoveryAction": "Resume at last step on next launch" },
    { "id": "STATE-success", "type": "success", "description": "Onboarding complete", "userMessage": "You're all set!", "indicators": ["completion-heading", "summary-card", "enter-app-button"], "allowedActions": ["tap-enter-app"], "blockedActions": [] }
  ],
  "navigation": [
    { "from": "SCREEN-welcome", "to": "SCREEN-accountType", "trigger": "get-started-tapped", "backStack": "Push" },
    { "from": "SCREEN-accountType", "to": "SCREEN-profile", "trigger": "next-tapped", "condition": "accountTypeSelected", "backStack": "Push" },
    { "from": "SCREEN-accountType", "to": "SCREEN-profile", "trigger": "skip-tapped", "backStack": "Push" },
    { "from": "SCREEN-accountType", "to": "SCREEN-welcome", "trigger": "back-tapped", "backStack": "Pop" },
    { "from": "SCREEN-profile", "to": "SCREEN-permissions", "trigger": "next-tapped", "condition": "requiredFieldsValid", "backStack": "Push" },
    { "from": "SCREEN-profile", "to": "SCREEN-accountType", "trigger": "back-tapped", "backStack": "Pop" },
    { "from": "SCREEN-permissions", "to": "SCREEN-preferences", "trigger": "next-tapped", "condition": "requiredPermissionsResolved", "backStack": "Push" },
    { "from": "SCREEN-permissions", "to": "SCREEN-preferences", "trigger": "skip-all-tapped", "backStack": "Push" },
    { "from": "SCREEN-permissions", "to": "SCREEN-profile", "trigger": "back-tapped", "backStack": "Pop" },
    { "from": "SCREEN-preferences", "to": "SCREEN-onboardingDone", "trigger": "next-tapped", "backStack": "Push" },
    { "from": "SCREEN-preferences", "to": "SCREEN-permissions", "trigger": "back-tapped", "backStack": "Pop" }
  ],
  "roles": [
    {
      "roleId": "ROLE-newUser",
      "name": "New User",
      "description": "First-time user completing onboarding",
      "capabilities": ["complete-any-step", "skip-optional-steps", "go-back", "exit-with-confirmation-step1"],
      "visibleScreens": ["SCREEN-welcome", "SCREEN-accountType", "SCREEN-profile", "SCREEN-permissions", "SCREEN-preferences", "SCREEN-onboardingDone"],
      "restrictions": ["cannot-access-main-app-until-onboarding-complete"]
    }
  ],
  "dataContracts": {
    "ENTITY-user": {
      "entityId": "ENTITY-user",
      "name": "User",
      "fields": [
        { "name": "name", "label": "Full Name", "type": "string", "constraints": { "minLength": 2, "maxLength": 100, "pattern": "^[a-zA-Z\\s]+$" }, "required": true, "readOnly": false },
        { "name": "email", "label": "Email Address", "type": "string", "constraints": { "format": "email" }, "required": true, "readOnly": false, "format": "name@example.com" },
        { "name": "avatar", "label": "Profile Photo", "type": "image", "constraints": { "maxSizeMB": 5, "formats": ["jpeg", "png", "webp"], "aspectRatio": "1:1" }, "required": false, "readOnly": false }
      ],
      "screenUsage": ["SCREEN-profile", "SCREEN-onboardingDone"],
      "operations": ["Create"]
    },
    "ENTITY-accountType": {
      "entityId": "ENTITY-accountType",
      "name": "AccountType",
      "fields": [
        { "name": "type", "label": "Account Type", "type": "enum", "constraints": { "values": ["personal", "business"] }, "required": false, "readOnly": false }
      ],
      "screenUsage": ["SCREEN-accountType", "SCREEN-onboardingDone"],
      "operations": ["Create"]
    },
    "ENTITY-permissions": {
      "entityId": "ENTITY-permissions",
      "name": "Permissions",
      "fields": [
        { "name": "camera", "label": "Camera", "type": "enum", "constraints": { "values": ["granted", "denied", "permanently-denied", "pending"] }, "required": true, "readOnly": false },
        { "name": "location", "label": "Location", "type": "enum", "constraints": { "values": ["granted", "denied", "permanently-denied", "pending"] }, "required": true, "readOnly": false },
        { "name": "notifications", "label": "Notifications", "type": "enum", "constraints": { "values": ["granted", "denied", "permanently-denied", "pending"] }, "required": true, "readOnly": false }
      ],
      "screenUsage": ["SCREEN-permissions"],
      "operations": ["Create"]
    },
    "ENTITY-preferences": {
      "entityId": "ENTITY-preferences",
      "name": "Preferences",
      "fields": [
        { "name": "notifications", "label": "Notification Preference", "type": "enum", "constraints": { "values": ["all", "critical-only", "none"] }, "required": true, "readOnly": false },
        { "name": "language", "label": "Language", "type": "string", "constraints": { "supportedCodes": ["en", "nb", "sv", "fi", "da"] }, "required": true, "readOnly": false },
        { "name": "theme", "label": "Visual Theme", "type": "enum", "constraints": { "values": ["light", "dark", "system"] }, "required": true, "readOnly": false }
      ],
      "screenUsage": ["SCREEN-preferences", "SCREEN-onboardingDone"],
      "operations": ["Create"]
    }
  }
}
```
