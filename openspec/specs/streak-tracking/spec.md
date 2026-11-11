# streak-tracking Specification

## Purpose

Motivates consistency with a weekly target of five workouts and a streak that tolerates two rest days in each week.

## Requirements

### Requirement: Weekly target
The system SHALL measure progress per calendar week from Monday to Sunday against a target of 5 workout days, counting at most one workout per day.

#### Scenario: Week progress
- **GIVEN** the user completed workouts on Monday, Tuesday, and Thursday
- **WHEN** the home screen is shown on Friday
- **THEN** week progress reads 3 of 5

#### Scenario: Second session in one day
- **GIVEN** the user already completed a workout today
- **WHEN** the user tries to start another session
- **THEN** it is not offered, and the day counts once toward the week and the streak

### Requirement: Rest day allowance
A day without a completed workout SHALL NOT break the streak as long as the current Monday–Sunday week can still reach 5 workout days, so at most two missed days per week are tolerated.

#### Scenario: Missing one day
- **GIVEN** the user missed Wednesday only
- **WHEN** Thursday begins
- **THEN** the streak is unbroken

#### Scenario: Third missed day
- **GIVEN** the user has missed two days this week and misses a third
- **WHEN** that day ends
- **THEN** the streak resets to 0 because 5 workouts are no longer reachable

#### Scenario: Today is not yet missed
- **WHEN** it is today and no workout is done yet
- **THEN** today is not counted as missed until the day ends

### Requirement: Streak count display
The system SHALL show the streak count as the number of workout days in the current unbroken run, together with the week progress, on the home and completion screens.

#### Scenario: Streak increments
- **GIVEN** the streak is 4
- **WHEN** the user completes today's session
- **THEN** the streak shows 5

#### Scenario: Week rollover
- **WHEN** a new Monday begins and the previous week reached 5 workouts
- **THEN** the streak continues and week progress resets to 0 of 5
