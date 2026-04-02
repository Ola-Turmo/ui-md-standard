# Test YAML Appendix

**Version:** 1.0

---

## 1. Product Mental Model

A simple test application with a YAML appendix.

---

## 2. Users and Roles

### ROLE-testUser

- **Description**: A test user for validating YAML appendix support.
- **Capabilities**: View test screen
- **Visible Screens**: SCREEN-testScreen

---

## 3. Screen Inventory

### SCREEN-testScreen

**Purpose**: A test screen to verify YAML appendix validation.

**Primary Actions**:
- View this screen

**Entry Conditions**:
- User is authenticated

**Exit Conditions**:
- User closes the screen

**States**: STATE-success

**Role Access**: ROLE-testUser

---

## 4. Navigation Model

No navigation transitions defined for this simple test.

---

## 5. Core User Flows

### View Test Screen

1. User views SCREEN-testScreen in STATE-success

---

## 6. Interaction Patterns

### PATTERN-viewScreen

- **Trigger**: User opens the screen
- **Result**: Screen displays content in STATE-success

---

## 7. State Model

### STATE-success

- **Type**: success
- **Description**: Screen loaded successfully with content displayed
- **Indicators**: Content is visible
- **Allowed Actions**: Close screen

---

## 8. Data Contract

### ENTITY-testData

- **Entity ID**: ENTITY-testData
- **Fields**:
  - name: string (required)
  - value: number
- **Screen Usage**: SCREEN-testScreen
- **Operations**: Read

---

## 9. Machine-Readable Appendix

```yaml
version: "1.0"
screens:
  - id: SCREEN-testScreen
    purpose: A test screen to verify YAML appendix validation
    primaryActions:
      - View this screen
    entryConditions:
      - User is authenticated
    exitConditions:
      - User closes the screen
    states:
      - STATE-success
    roleAccess:
      - ROLE-testUser
states:
  - id: STATE-success
    type: success
    description: Screen loaded successfully with content displayed
    indicators:
      - Content is visible
    allowedActions:
      - Close screen
    blockedActions: []
    recoveryAction: ""
navigation: []
roles:
  - roleId: ROLE-testUser
    name: Test User
    description: A test user for validating YAML appendix support
    capabilities:
      - View test screen
    visibleScreens:
      - SCREEN-testScreen
    restrictions: []
dataContracts:
  testData:
    entityId: ENTITY-testData
    name: Test Data
    fields:
      - name: name
        label: Name
        type: string
        required: true
        readOnly: false
      - name: value
        label: Value
        type: number
        required: false
        readOnly: false
    screenUsage:
      - SCREEN-testScreen
    operations:
      - Read
```
