# morning-nudge Specification

## Purpose
Shows a fresh, varied message each time the app is opened on a day not yet completed, so the landing screen keeps feeling new and nudges the user to start.

## Requirements

### Requirement: Reminder message on open
When the app is opened on a day with no completed session, the system SHALL show one reminder message on the home screen alongside the Start control.

#### Scenario: Opened on a day not yet done
- **WHEN** the user opens the app and today's session is not done
- **THEN** the home screen shows one reminder message and the Start control

#### Scenario: Session already done
- **GIVEN** today's session is completed
- **WHEN** the user opens the app
- **THEN** no reminder message is shown

### Requirement: Fresh message each open
The system SHALL choose a different message for each new open of the app, and SHALL NOT show the same message on two consecutive opens.

#### Scenario: Two consecutive opens
- **WHEN** the user opens the app, closes it, and opens it again
- **THEN** the second message differs from the first

#### Scenario: Stable while visible
- **WHEN** the home screen re-renders without the app being reopened
- **THEN** the displayed message does not change

### Requirement: Shuffled without repeats
The system SHALL present every message in the pool once, in random order, before any message is shown again, and SHALL keep this progress across app restarts.

#### Scenario: Full cycle
- **GIVEN** a pool of N messages
- **WHEN** the app is opened N times
- **THEN** each message was shown exactly once

#### Scenario: Boundary between cycles
- **WHEN** a cycle ends and a new shuffle begins
- **THEN** the first message of the new cycle differs from the last message of the previous one

### Requirement: Discreet message tone
Reminder messages SHALL be short, encouraging, and SHALL NOT contain the words workout, fitness, or gym.

#### Scenario: Pool content
- **WHEN** the message pool is inspected
- **THEN** every message is 120 characters or fewer, and none contains a forbidden word

### Requirement: Works offline and on-device
The reminder behavior SHALL work offline and SHALL keep its state on the device only.

#### Scenario: Airplane mode
- **GIVEN** the app has been loaded once
- **WHEN** the device is offline and the app is opened
- **THEN** a reminder message is shown
