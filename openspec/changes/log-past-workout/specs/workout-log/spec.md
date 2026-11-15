# Spec Delta

## ADDED Requirements

### Requirement: Log a past workout
From the day log of a past date, or of today, the user SHALL be able to add a completed workout by choosing one of the app's session types, a start time and a duration in minutes, and the system SHALL record it as a completed session on that date.

#### Scenario: Backfill a missed day
- **GIVEN** no session was logged on a past date
- **WHEN** the user opens that date, chooses "Log a workout", selects Chest and Legs, 07:30 and 15 minutes, and saves
- **THEN** that date is marked on the calendar and its day log shows Chest and Legs from 07:30 to 07:45

#### Scenario: Offered types
- **WHEN** the log form is opened
- **THEN** it offers exactly the session types the app provides, with the recommended duration for that date pre-filled and editable

#### Scenario: Default start time
- **WHEN** the log form is opened
- **THEN** the start time is pre-filled with 07:00

### Requirement: Backfilled sessions count like live ones
A backfilled session SHALL count toward the week's workout days, the streak and the extra-session rule exactly as a session recorded live.

#### Scenario: Streak gap filled
- **GIVEN** a streak that was reset because three days were missed in a week
- **WHEN** the user logs a workout on one of those days so that 5 workouts are reachable again
- **THEN** the streak and week progress are recalculated from the full history

#### Scenario: Second session on a day
- **GIVEN** a past date already has one session
- **WHEN** the user logs another on that date
- **THEN** it is shown as the day's extra and counts as one more day

### Requirement: Backfill validation
The system SHALL refuse a backfilled workout whose end would be in the future, whose duration is not between 1 and 180 minutes, or whose date already has two sessions, show a message, and leave the log unchanged.

#### Scenario: Future time
- **WHEN** the user logs a workout for today at a time that has not happened yet
- **THEN** it is refused with a message

#### Scenario: Future date
- **WHEN** the user opens a date after today
- **THEN** no "Log a workout" action is offered

#### Scenario: Full day
- **GIVEN** a date already has two sessions
- **WHEN** the user opens that date
- **THEN** no "Log a workout" action is offered

#### Scenario: Invalid duration
- **WHEN** the user enters 0 or 500 minutes
- **THEN** it is refused with a message
