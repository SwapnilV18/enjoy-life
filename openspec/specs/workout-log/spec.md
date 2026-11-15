# workout-log Specification

## Purpose
Lets the user look back at when they trained, see the details of any day, and correct session times when they forgot to stop a session.

## Requirements

### Requirement: Calendar of trained days
The system SHALL provide a History screen with a month calendar, weeks starting on Monday, that marks every day with a completed session and marks days with an extra differently, with controls to move to the previous and next month.

#### Scenario: Marked days
- **GIVEN** sessions were completed on the 3rd and 5th, with an extra on the 5th
- **WHEN** the user opens History for that month
- **THEN** the 3rd and 5th are marked, and the 5th is marked as having an extra

#### Scenario: Month navigation
- **WHEN** the user taps the previous-month control
- **THEN** the calendar shows the earlier month with its marked days

#### Scenario: Empty month
- **GIVEN** no sessions in the shown month
- **WHEN** the calendar is shown
- **THEN** no days are marked and the calendar still renders

### Requirement: Day log
Selecting a date SHALL show that day's completed sessions with type, start time, stop time, duration and logged sets.

#### Scenario: Open a trained day
- **WHEN** the user taps a marked date
- **THEN** each session of that day is listed with its type, start and stop times, duration and logged sets

#### Scenario: Open a day without sessions
- **WHEN** the user taps an unmarked date
- **THEN** the screen says no session was logged that day

### Requirement: Edit session times
The user SHALL be able to change the start time and stop time of a completed session, and the system SHALL recalculate its duration and its date, and the streak and week counts SHALL follow.

#### Scenario: Fix a forgotten stop
- **GIVEN** a session shows a stop time hours later than the real end
- **WHEN** the user sets the stop time to the real end and saves
- **THEN** the log shows the new stop time and recalculated duration

#### Scenario: Invalid times refused
- **WHEN** the user enters a stop time that is not after the start time, or is in the future
- **THEN** the change is refused with a message and the session stays unchanged

#### Scenario: Moving to a full day refused
- **GIVEN** a different day already has two sessions
- **WHEN** an edit would move a session onto that day
- **THEN** the change is refused with a message

### Requirement: Finish a forgotten session
When a session was started but never finished, the user SHALL be able to finish it at a stop time they choose, so that it is recorded as completed.

#### Scenario: Left running overnight
- **GIVEN** a session was started yesterday morning and never finished
- **WHEN** the user opens the app and chooses to finish it with a stop time that is after its start and not in the future
- **THEN** the session is recorded as completed with that stop time on its start date
