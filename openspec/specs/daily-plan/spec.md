# daily-plan Specification

## Purpose

Tells the user each morning which single session to do today and for how long, so that no planning decision is needed.

## Requirements

### Requirement: One recommendation per day
The system SHALL present exactly one recommended session (workout type and duration) as the first thing shown when the app is opened on a day.

#### Scenario: Opening the app in the morning
- **WHEN** the user opens the app on a day with no completed session yet
- **THEN** the home screen shows one recommended workout type, its duration, and a single control to start it

#### Scenario: Recommendation is stable within a day
- **WHEN** the user closes and reopens the app later the same day without completing a session
- **THEN** the same recommendation is shown

### Requirement: Duration progression
The system SHALL recommend 15-minute sessions until two consecutive Monday–Sunday weeks have each reached 5 workout days (10 on-track workouts), and 20-minute sessions from the day after that is achieved, permanently.

#### Scenario: Only one on-track week
- **GIVEN** the previous week had 5 workout days and the current week has 4
- **WHEN** the daily recommendation is produced
- **THEN** the duration is 15 minutes

#### Scenario: Two on-track weeks completed
- **GIVEN** last week had 5 workout days and the user completes the 5th workout day of this week
- **WHEN** the next day's recommendation is produced
- **THEN** the duration is 20 minutes

#### Scenario: Weeks not consecutive
- **GIVEN** a week with 5 workout days, then a week with 4, then a week with 5
- **WHEN** the recommendation is produced
- **THEN** the duration is still 15 minutes

#### Scenario: Duration is kept once earned
- **GIVEN** the user has earned 20 minutes and then has a week with only 3 workout days
- **WHEN** the recommendation is produced
- **THEN** the duration remains 20 minutes

### Requirement: Workout type rotation
The system SHALL choose the recommended type from the six workout types by preferring the type least recently completed, and SHALL NOT recommend a type that shares a primary muscle group with the previous completed session when an alternative exists.

#### Scenario: Never-done types come first
- **GIVEN** the user has never completed Yoga
- **WHEN** the recommendation is produced and no muscle-group conflict exists
- **THEN** a never-completed type is preferred over a recently completed one

#### Scenario: Avoid training the same muscles two days running
- **GIVEN** yesterday's session was Back and Legs
- **WHEN** today's recommendation is produced
- **THEN** the recommended type is not Back and Legs or Chest and Legs

### Requirement: Alternative choice
The system SHALL let the user pick a different workout type than the recommended one before starting.

#### Scenario: User swaps the workout
- **WHEN** the user chooses Yoga instead of the recommended type
- **THEN** the session starts as Yoga with the same duration as recommended

### Requirement: One workout per day
The system SHALL allow one completed workout per day and SHALL show a completed state instead of a recommendation once a session has been completed that day.

#### Scenario: Reopening after finishing
- **GIVEN** the user completed a session earlier today
- **WHEN** the user opens the app
- **THEN** the home screen shows that today is done along with the current streak and week progress
