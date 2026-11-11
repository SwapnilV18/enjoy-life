# workout-session Specification

## Purpose

Runs a workout from start to finish: a highly visible timer, recorded start and stop times, superset display, and logging of weight and reps.

## Requirements

### Requirement: Start and stop recording
The system SHALL record the start time when the user starts a session and the stop time when the user finishes it, and SHALL store both with the session.

#### Scenario: Completed session record
- **WHEN** the user starts and later finishes a session
- **THEN** the stored session contains its type, start time, stop time, and logged sets

### Requirement: Prominent timer
The system SHALL display a large timer that counts down from the session's target duration, and SHALL continue as elapsed overtime after zero.

#### Scenario: Countdown
- **WHEN** a 15-minute session has run for 5 minutes
- **THEN** the timer reads 10:00 remaining in the largest text on screen

#### Scenario: Overtime
- **WHEN** the session passes its target duration
- **THEN** the timer shows the extra time elapsed beyond the target

### Requirement: Timer accuracy while backgrounded
The timer SHALL stay correct when the phone screen locks or the app is backgrounded, and SHALL resume the running session after the app is reloaded.

#### Scenario: Screen locked mid-session
- **WHEN** the user locks the phone for 3 minutes and returns
- **THEN** the timer reflects the real elapsed time

#### Scenario: App reloaded
- **WHEN** the app is closed and reopened during an unfinished session
- **THEN** the session is still running with its original start time

### Requirement: Two exercises at a time
For strength sessions the system SHALL show the current superset pair simultaneously, each with its animation, name, and set fields, and SHALL advance to the next pair when the user chooses.

#### Scenario: Pair displayed
- **WHEN** a pair is current
- **THEN** both exercises are visible together on one screen

#### Scenario: Advance
- **WHEN** the user taps next on the last pair
- **THEN** the finish action is offered

### Requirement: Set logging
Each strength exercise SHALL offer compact weight and reps fields per set, allow adding another set, and pre-fill from the most recent logged values for that exercise.

#### Scenario: Logging a set
- **WHEN** the user enters 20 for weight and 12 for reps
- **THEN** the set is saved with the session

#### Scenario: Pre-fill
- **GIVEN** the user previously logged 20 × 12 for curl
- **WHEN** curl is shown again
- **THEN** the weight and reps fields start at 20 and 12

### Requirement: Finishing and abandoning
A session SHALL count as a completed workout only when the user finishes it; finishing before the target time SHALL be allowed, and a session left unfinished and discarded SHALL NOT count.

#### Scenario: Finish early
- **WHEN** the user finishes at 9 minutes of a 15-minute session
- **THEN** the session is recorded as completed

#### Scenario: Discard
- **WHEN** the user discards a running session
- **THEN** it is not counted and does not affect the streak
