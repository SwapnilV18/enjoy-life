# Spec Delta

## ADDED Requirements

### Requirement: Extra session
After completing a session on a day, the system SHALL allow the user to complete one extra session the same day, and SHALL NOT offer a third.

#### Scenario: Extra offered after the first session
- **GIVEN** the user has completed one session today
- **WHEN** the home screen is shown
- **THEN** a control to start an extra session is offered

#### Scenario: No third session
- **GIVEN** the user has completed two sessions today
- **WHEN** the home screen is shown
- **THEN** no control to start another session is offered

### Requirement: Extra counts as an additional day
Each completed extra session SHALL add one to the week's workout-day count and one to the streak count, in addition to the day's regular session.

#### Scenario: Extra raises the week count
- **GIVEN** 3 workout days this week and an extra completed on one of them
- **WHEN** the home screen is shown
- **THEN** week progress reads 4 of 5 and the five day markers show 4 filled

#### Scenario: Extra raises the streak
- **GIVEN** the streak is 4
- **WHEN** the user completes an extra session today after today's regular session
- **THEN** the streak shows 6

## MODIFIED Requirements

### Requirement: Weekly target
The system SHALL measure progress per calendar week from Monday to Sunday against a target of 5 workout days, counting one regular workout per day plus at most one extra session per day.

#### Scenario: Week progress
- **GIVEN** the user completed workouts on Monday, Tuesday, and Thursday
- **WHEN** the home screen is shown on Friday
- **THEN** week progress reads 3 of 5

#### Scenario: Second session in one day
- **GIVEN** the user already completed a workout today
- **WHEN** the user starts another session
- **THEN** it is recorded as an extra, and a third session that day is not offered

### Requirement: Rest day allowance
A day without a completed workout SHALL NOT break the streak as long as the current Monday–Sunday week can still reach 5 workout days counting extras, so at most two missed days per week are tolerated, plus one more for each extra completed on or before the missed day.

#### Scenario: Missing one day
- **GIVEN** the user missed Wednesday only
- **WHEN** Thursday begins
- **THEN** the streak is unbroken

#### Scenario: Third missed day
- **GIVEN** the user has missed two days this week with no extras and misses a third
- **WHEN** that day ends
- **THEN** the streak resets to 0 because 5 workouts are no longer reachable

#### Scenario: Extra offsets a missed day
- **GIVEN** the user completed an extra on Monday and then misses Wednesday, Thursday and Friday
- **WHEN** Friday ends
- **THEN** the streak is unbroken because the extra offsets one of the three misses

#### Scenario: Extra does not rescue earlier misses
- **GIVEN** the user missed Monday, Tuesday and Wednesday, so the streak was reset
- **WHEN** the user completes an extra on Thursday
- **THEN** the streak is not restored

#### Scenario: Today is not yet missed
- **WHEN** it is today and no workout is done yet
- **THEN** today is not counted as missed until the day ends
