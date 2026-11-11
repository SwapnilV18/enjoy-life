# completion-celebration Specification

## Purpose

Rewards finishing a session with an emotional, animated message that makes the user feel seen.

## Requirements

### Requirement: Celebration message
On finishing a session the system SHALL show a full-screen animation presenting the message "I know how you are feeling…" followed by "SuperStar."

#### Scenario: Finish shows message
- **WHEN** the user finishes a session
- **THEN** an animated screen shows "I know how you are feeling…" and then "SuperStar."

### Requirement: Session summary after celebration
After the animation the system SHALL show the session's duration, start and stop times, and the updated streak and week progress, with a way to return home.

#### Scenario: Summary
- **WHEN** the celebration animation ends
- **THEN** the summary with duration, times, streak, and week progress is visible and a home control is available

### Requirement: Animation respects reduced motion
The celebration SHALL fall back to a non-moving presentation of the same message when the device requests reduced motion.

#### Scenario: Reduced motion
- **GIVEN** the device has reduced motion enabled
- **WHEN** the user finishes a session
- **THEN** the message appears without motion effects
